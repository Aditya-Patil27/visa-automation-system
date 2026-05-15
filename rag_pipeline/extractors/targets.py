"""
Embassy target configurations for visa requirement scraping.
Defines selectors and extraction patterns for each target embassy website.
"""

from typing import Dict, List, Optional, Callable
from dataclasses import dataclass
from bs4 import BeautifulSoup
import logging
from .extractor import CountryVisaExtractor, VisaData

logger = logging.getLogger(__name__)


@dataclass
class EmbassyTarget:
    """
    Configuration for scraping a specific embassy website.
    
    Attributes:
        name: Display name of the embassy
        country: Country name
        base_url: Base URL for the visa section
        selectors: CSS selectors for extracting data fields
        requires_auth: Whether the site requires authentication
        uses_js: Whether the site uses JavaScript rendering
        extractor_class: Custom extractor class to use
    """
    name: str
    country: str
    base_url: str
    selectors: Dict[str, str]
    requires_auth: bool = False
    uses_js: bool = False
    extractor_class: Optional[type] = None
    
    def __post_init__(self):
        if self.extractor_class is None:
            self.extractor_class = CountryVisaExtractor


class TargetRegistry:
    """
    Registry for managing embassy target configurations.
    Provides methods for adding, retrieving, and iterating targets.
    """
    
    def __init__(self):
        self._targets: Dict[str, EmbassyTarget] = {}
        self._by_country: Dict[str, EmbassyTarget] = {}
    
    def register(self, target: EmbassyTarget) -> None:
        """Register an embassy target."""
        self._targets[target.name.lower().replace(" ", "_")] = target
        self._by_country[target.country.lower()] = target
        logger.info(f"Registered target: {target.name} ({target.country})")
    
    def get(self, name: str) -> Optional[EmbassyTarget]:
        """Get a target by name."""
        return self._targets.get(name.lower().replace(" ", "_"))
    
    def get_by_country(self, country: str) -> Optional[EmbassyTarget]:
        """Get a target by country name."""
        return self._by_country.get(country.lower())
    
    def list_all(self) -> List[EmbassyTarget]:
        """List all registered targets."""
        return list(self._targets.values())
    
    def __iter__(self):
        return iter(self._targets.values())
    
    def __len__(self):
        return len(self._targets)


# Pre-configured embassy targets

UK_EMBASSY = EmbassyTarget(
    name="UK Embassy",
    country="United Kingdom",
    base_url="https://www.gov.uk/apply-uk-visa",
    uses_js=False,
    selectors={
        "documents": "ul.list-dot li",
        "fees": ".govuk-body",
        "processing_time": ".time",
        "addresses": ".address",
    }
)

USA_EMBASSY = EmbassyTarget(
    name="USA Embassy",
    country="United States",
    base_url="https://travel.state.gov/content/travel/en/us-visas.html",
    uses_js=True,
    selectors={
        "documents": ".visa-required-documents li",
        "fees": ".fee-table",
        "processing_time": ".processing-time",
        "addresses": ".contact-info",
    }
)

SCHENGEN_EMBASSY = EmbassyTarget(
    name="Schengen Embassy",
    country="Schengen Area",
    base_url="https://www.schengenvisainfo.com",
    uses_js=True,
    selectors={
        "documents": ".required-documents ul li",
        "fees": ".visa-fee",
        "processing_time": ".processing-time-frame",
        "addresses": ".embassy-address",
    }
)

AUSTRALIA_EMBASSY = EmbassyTarget(
    name="Australia Embassy",
    country="Australia",
    base_url="https://immi.homeaffairs.gov.au/visas",
    uses_js=True,
    selectors={
        "documents": ".document-list li",
        "fees": ".visa-cost",
        "processing_time": ".processing-times",
        "addresses": ".office-address",
    }
)


# Default registry with all configured targets
DEFAULT_REGISTRY = TargetRegistry()
DEFAULT_REGISTRY.register(UK_EMBASSY)
DEFAULT_REGISTRY.register(USA_EMBASSY)
DEFAULT_REGISTRY.register(SCHENGEN_EMBASSY)
DEFAULT_REGISTRY.register(AUSTRALIA_EMBASSY)


def create_default_registry() -> TargetRegistry:
    """Create and populate a registry with default embassy targets."""
    return DEFAULT_REGISTRY


def scrape_target(target: EmbassyTarget, scraper) -> List[VisaData]:
    """
    Scrape visa data from an embassy target.
    
    Args:
        target: EmbassyTarget configuration
        scraper: Scraper instance to use
        
    Returns:
        List of VisaData objects
    """
    try:
        logger.info(f"Scraping {target.name} at {target.base_url}")
        
        # Fetch the page
        if target.uses_js:
            from bs4 import BeautifulSoup
            extractor = target.extractor_class(target.country)
            soup = extractor.extract_with_playwright(target.base_url)
            if soup is None:
                logger.warning(f"Playwright extraction failed for {target.name}")
                return []
        else:
            soup = scraper.fetch(target.base_url)
        
        # Extract data using target-specific selectors
        visa_data = []
        
        # Create extractor with country-specific configuration
        class DynamicExtractor(target.extractor_class):
            def __init__(self):
                super().__init__(target.country)
                self.selectors = target.selectors
            
            def extract_documents(self, soup):
                selector = self.selectors.get("documents", "ul li")
                elements = soup.select(selector)
                return [el.get_text(strip=True) for el in elements if el.get_text(strip=True)]
            
            def extract_fees(self, soup):
                selector = self.selectors.get("fees")
                if selector:
                    element = soup.select_one(selector)
                    if element:
                        return element.get_text(strip=True)
                return None
            
            def extract_timelines(self, soup):
                selector = self.selectors.get("processing_time")
                if selector:
                    element = soup.select_one(selector)
                    if element:
                        return element.get_text(strip=True)
                return None
        
        extractor = DynamicExtractor()
        data = extractor.extract(soup)
        data.source_url = target.base_url
        
        # Get extraction date
        from datetime import datetime
        data.extraction_date = datetime.now().isoformat()
        
        visa_data.append(data)
        logger.info(f"Extracted {len(visa_data)} records from {target.name}")
        
        return visa_data
        
    except Exception as e:
        logger.error(f"Error scraping {target.name}: {e}")
        return []