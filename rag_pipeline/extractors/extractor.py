"""
Country-specific visa requirement extractors.
Parses visa requirements, documents, fees, and timelines from embassy websites.
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)


@dataclass
class VisaData:
    """Structured visa data extracted from embassy websites."""
    country: str
    visa_type: str
    documents: List[str]
    fees: Optional[str] = None
    processing_time: Optional[str] = None
    addresses: List[str] = None
    requirements: List[str] = None
    eligibility: List[str] = None
    source_url: str = ""
    extraction_date: str = ""
    
    def __post_init__(self):
        if self.addresses is None:
            self.addresses = []
        if self.requirements is None:
            self.requirements = []
        if self.eligibility is None:
            self.eligibility = []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for indexing."""
        return {
            "country": self.country,
            "visa_type": self.visa_type,
            "documents": self.documents,
            "fees": self.fees,
            "processing_time": self.processing_time,
            "addresses": self.addresses,
            "requirements": self.requirements,
            "eligibility": self.eligibility,
            "source_url": self.source_url,
            "extraction_date": self.extraction_date
        }
    
    def to_text(self) -> str:
        """Convert to text for FAISS indexing."""
        text_parts = [
            f"Country: {self.country}",
            f"Visa Type: {self.visa_type}",
        ]
        
        if self.documents:
            text_parts.append(f"Required Documents: {', '.join(self.documents)}")
        if self.fees:
            text_parts.append(f"Fees: {self.fees}")
        if self.processing_time:
            text_parts.append(f"Processing Time: {self.processing_time}")
        if self.requirements:
            text_parts.append(f"Requirements: {', '.join(self.requirements)}")
        if self.eligibility:
            text_parts.append(f"Eligibility: {', '.join(self.eligibility)}")
        
        return "\n".join(text_parts)


class CountryVisaExtractor:
    """
    Base class for extracting visa requirements from embassy websites.
    Handles common parsing patterns and provides structured data extraction.
    """
    
    def __init__(self, country: str, visa_types: Optional[List[str]] = None):
        """
        Initialize the extractor.
        
        Args:
            country: Country name (e.g., "United Kingdom")
            visa_types: List of visa types to extract (e.g., ["tourist", "work", "student"])
        """
        self.country = country
        self.visa_types = visa_types or []
        self.logger = logging.getLogger(f"{__name__}.{country}")
    
    def extract_documents(self, soup: BeautifulSoup) -> List[str]:
        """
        Extract required documents list from parsed HTML.
        
        Args:
            soup: BeautifulSoup object with parsed HTML
            
        Returns:
            List of required document names
        """
        documents = []
        
        # Common selectors for documents sections
        selectors = [
            "ul.documents-list li",
            ".required-documents li",
            "[data-section='documents'] li",
            ".document-list li",
            "ul li",
        ]
        
        for selector in selectors:
            elements = soup.select(selector)
            if elements:
                documents = [el.get_text(strip=True) for el in elements if el.get_text(strip=True)]
                if documents:
                    break
        
        return documents
    
    def extract_visa_types(self, soup: BeautifulSoup) -> List[str]:
        """
        Extract visa type categories from parsed HTML.
        
        Args:
            soup: BeautifulSoup object with parsed HTML
            
        Returns:
            List of visa type names
        """
        visa_types = []
        
        # Common selectors for visa types
        selectors = [
            ".visa-types li",
            "[data-section='visa-types'] li",
            ".type-list li",
            "select[name='visa_type'] option",
        ]
        
        for selector in selectors:
            elements = soup.select(selector)
            if elements:
                visa_types = [el.get_text(strip=True) for el in elements if el.get_text(strip=True)]
                if visa_types:
                    break
        
        return list(set(visa_types))  # Remove duplicates
    
    def extract_fees(self, soup: BeautifulSoup) -> Optional[str]:
        """
        Extract fee information from parsed HTML.
        
        Args:
            soup: BeautifulSoup object with parsed HTML
            
        Returns:
            Fee information as string or None
        """
        fee_selectors = [
            ".fees",
            "[data-section='fees']",
            ".fee-information",
            ".cost",
        ]
        
        for selector in fee_selectors:
            element = soup.select_one(selector)
            if element:
                fee_text = element.get_text(strip=True)
                if fee_text:
                    return fee_text
        
        return None
    
    def extract_timelines(self, soup: BeautifulSoup) -> Optional[str]:
        """
        Extract processing timeline from parsed HTML.
        
        Args:
            soup: BeautifulSoup object with parsed HTML
            
        Returns:
            Processing time as string or None
        """
        timeline_selectors = [
            ".processing-time",
            "[data-section='processing-time']",
            ".timeline",
            ".processing",
            ".duration",
        ]
        
        for selector in timeline_selectors:
            element = soup.select_one(selector)
            if element:
                timeline_text = element.get_text(strip=True)
                if timeline_text:
                    return timeline_text
        
        return None
    
    def extract_addresses(self, soup: BeautifulSoup) -> List[str]:
        """
        Extract embassy address information from parsed HTML.
        
        Args:
            soup: BeautifulSoup object with parsed HTML
            
        Returns:
            List of address strings
        """
        addresses = []
        
        address_selectors = [
            ".address",
            "[data-section='address']",
            ".location",
            ".contact-address",
        ]
        
        for selector in address_selectors:
            elements = soup.select(selector)
            for element in elements:
                address_text = element.get_text(strip=True)
                if address_text and len(address_text) > 10:
                    addresses.append(address_text)
        
        return addresses
    
    def extract(self, soup: BeautifulSoup, visa_type: str = "general") -> VisaData:
        """
        Extract all visa data from parsed HTML.
        
        Args:
            soup: BeautifulSoup object with parsed HTML
            visa_type: Type of visa being extracted
            
        Returns:
            VisaData object with extracted information
        """
        return VisaData(
            country=self.country,
            visa_type=visa_type,
            documents=self.extract_documents(soup),
            fees=self.extract_fees(soup),
            processing_time=self.extract_timelines(soup),
            addresses=self.extract_addresses(soup),
            source_url="",
            extraction_date=""
        )
    
    def extract_with_playwright(self, url: str) -> Optional[BeautifulSoup]:
        """
        Extract visa data from JavaScript-rendered pages using Playwright.
        
        Args:
            url: URL to scrape
            
        Returns:
            BeautifulSoup object or None if extraction fails
        """
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            self.logger.warning("Playwright not installed, using requests fallback")
            return None
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            try:
                page.goto(url, wait_until="networkidle", timeout=30000)
                content = page.content()
                browser.close()
                return BeautifulSoup(content, "html.parser")
            except Exception as e:
                self.logger.error(f"Playwright extraction failed for {url}: {e}")
                browser.close()
                return None