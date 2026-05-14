"""
Base scraper infrastructure for extracting visa requirements from embassy websites.
Provides rate limiting, retry logic, user-agent rotation, and error handling.
"""

import logging
import time
import random
from functools import wraps
from typing import Optional, Dict, Any, Callable
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ScraperError(Exception):
    """Base exception for scraper errors."""
    pass


class RateLimitError(ScraperError):
    """Raised when rate limit is exceeded."""
    pass


class HTTPError(ScraperError):
    """Raised for HTTP errors like 403, 404, 500."""
    pass


class TimeoutError(ScraperError):
    """Raised when request times out."""
    pass


class Scraper:
    """
    Base scraper class with rate limiting, retry logic, and error handling.
    
    Attributes:
        delay: Minimum delay between requests in seconds
        max_retries: Maximum number of retry attempts
        timeout: Request timeout in seconds
        user_agents: List of user agents for rotation
    """
    
    # Common user agents for rotation
    DEFAULT_USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ]
    
    def __init__(
        self,
        delay: float = 2.0,
        max_retries: int = 3,
        timeout: int = 30,
        user_agents: Optional[list] = None,
        respect_robots: bool = True
    ):
        """
        Initialize the scraper.
        
        Args:
            delay: Minimum delay between requests in seconds
            max_retries: Maximum number of retry attempts
            timeout: Request timeout in seconds
            user_agents: List of user agents for rotation (uses default if None)
            respect_robots: Whether to check and respect robots.txt
        """
        self.delay = delay
        self.max_retries = max_retries
        self.timeout = timeout
        self.user_agents = user_agents or self.DEFAULT_USER_AGENTS
        self.respect_robots = respect_robots
        self._last_request_time = 0
        self._session: Optional[requests.Session] = None
        
        logger.info(
            f"Scraper initialized: delay={delay}s, max_retries={max_retries}, "
            f"timeout={timeout}s, respect_robots={respect_robots}"
        )
    
    def _get_session(self) -> requests.Session:
        """Get or create a requests session with retry strategy."""
        if self._session is None:
            self._session = requests.Session()
            
            # Configure retry strategy
            retry_strategy = Retry(
                total=self.max_retries,
                backoff_factor=1,
                status_forcelist=[429, 500, 502, 503, 504],
                allowed_methods=["HEAD", "GET", "OPTIONS"]
            )
            adapter = HTTPAdapter(max_retries=retry_strategy)
            self._session.mount("http://", adapter)
            self._session.mount("https://", adapter)
        
        return self._session
    
    def _get_random_user_agent(self) -> str:
        """Get a random user agent for rotation."""
        return random.choice(self.user_agents)
    
    def rate_limit(self) -> None:
        """
        Enforce rate limiting between requests.
        Ensures minimum delay between consecutive requests.
        """
        current_time = time.time()
        time_since_last_request = current_time - self._last_request_time
        
        if time_since_last_request < self.delay:
            sleep_time = self.delay - time_since_last_request
            logger.debug(f"Rate limiting: sleeping {sleep_time:.2f}s")
            time.sleep(sleep_time)
        
        self._last_request_time = time.time()
    
    @staticmethod
    def retry(max_retries: int = 3, backoff_factor: float = 2.0):
        """
        Decorator for retrying failed requests with exponential backoff.
        
        Args:
            max_retries: Maximum number of retry attempts
            backoff_factor: Multiplier for exponential backoff
            
        Returns:
            Decorated function with retry logic
        """
        def decorator(func: Callable) -> Callable:
            @wraps(func)
            def wrapper(*args, **kwargs):
                last_exception = None
                
                for attempt in range(max_retries):
                    try:
                        return func(*args, **kwargs)
                    except Exception as e:
                        last_exception = e
                        if attempt < max_retries - 1:
                            sleep_time = backoff_factor ** attempt
                            logger.warning(
                                f"Attempt {attempt + 1}/{max_retries} failed: {str(e)}. "
                                f"Retrying in {sleep_time:.1f}s..."
                            )
                            time.sleep(sleep_time)
                        else:
                            logger.error(
                                f"All {max_retries} attempts failed. Last error: {str(e)}"
                            )
                
                raise last_exception
            
            return wrapper
        return decorator
    
    def fetch(
        self,
        url: str,
        method: str = "GET",
        headers: Optional[Dict[str, str]] = None,
        **kwargs
    ) -> BeautifulSoup:
        """
        Fetch a URL with error handling, rate limiting, and retry logic.
        
        Args:
            url: URL to fetch
            method: HTTP method (GET, POST, etc.)
            headers: Additional headers to include
            **kwargs: Additional arguments to pass to requests
            
        Returns:
            BeautifulSoup object with parsed HTML
            
        Raises:
            RateLimitError: When rate limit is exceeded (429)
            HTTPError: For other HTTP errors
            TimeoutError: When request times out
        """
        # Apply rate limiting
        self.rate_limit()
        
        # Build headers with user agent rotation
        request_headers = {
            "User-Agent": self._get_random_user_agent(),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
        }
        
        if headers:
            request_headers.update(headers)
        
        # Add timeout to kwargs
        kwargs.setdefault("timeout", self.timeout)
        
        logger.info(f"Fetching {url} (method: {method})")
        
        try:
            session = self._get_session()
            
            if method.upper() == "GET":
                response = session.get(url, headers=request_headers, **kwargs)
            elif method.upper() == "POST":
                response = session.post(url, headers=request_headers, **kwargs)
            else:
                response = session.request(method, url, headers=request_headers, **kwargs)
            
            # Handle HTTP status codes
            if response.status_code == 429:
                raise RateLimitError(f"Rate limit exceeded for {url}")
            elif response.status_code == 403:
                raise HTTPError(f"403 Forbidden - Access denied for {url}")
            elif response.status_code == 404:
                raise HTTPError(f"404 Not Found - {url}")
            elif response.status_code >= 500:
                raise HTTPError(f"{response.status_code} Server Error for {url}")
            
            response.raise_for_status()
            
            logger.info(f"Successfully fetched {url} (status: {response.status_code})")
            
            # Parse HTML with BeautifulSoup
            return BeautifulSoup(response.content, "html.parser")
            
        except requests.exceptions.Timeout:
            logger.error(f"Timeout fetching {url}")
            raise TimeoutError(f"Request timeout for {url}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed for {url}: {str(e)}")
            raise ScraperError(f"Request failed: {str(e)}")
    
    def fetch_text(self, url: str, **kwargs) -> str:
        """
        Fetch URL and return raw text content.
        
        Args:
            url: URL to fetch
            **kwargs: Additional arguments for fetch()
            
        Returns:
            Raw HTML/text content
        """
        soup = self.fetch(url, **kwargs)
        return str(soup)
    
    def get_page_metadata(self, url: str) -> Dict[str, Any]:
        """
        Get metadata about a page without full scraping.
        
        Args:
            url: URL to check
            
        Returns:
            Dict with status_code, content_length, and error info
        """
        try:
            self.rate_limit()
            
            session = self._get_session()
            response = session.head(
                url,
                headers={"User-Agent": self._get_random_user_agent()},
                timeout=self.timeout
            )
            
            return {
                "url": url,
                "status_code": response.status_code,
                "content_type": response.headers.get("Content-Type", ""),
                "content_length": response.headers.get("Content-Length", ""),
                "accessible": response.status_code < 400
            }
        except Exception as e:
            return {
                "url": url,
                "error": str(e),
                "accessible": False
            }


def create_scraper(
    delay: float = 2.0,
    max_retries: int = 3,
    timeout: int = 30
) -> Scraper:
    """
    Factory function to create a configured Scraper instance.
    
    Args:
        delay: Minimum delay between requests in seconds
        max_retries: Maximum number of retry attempts  
        timeout: Request timeout in seconds
        
    Returns:
        Configured Scraper instance
    """
    return Scraper(delay=delay, max_retries=max_retries, timeout=timeout)


# Example usage
if __name__ == "__main__":
    # Test the scraper
    scraper = create_scraper(delay=1.0)
    
    # Test fetching a page
    try:
        soup = scraper.fetch("https://www.gov.uk/check-uk-visa")
        print(f"Page title: {soup.title.string if soup.title else 'No title'}")
    except Exception as e:
        print(f"Error: {e}")