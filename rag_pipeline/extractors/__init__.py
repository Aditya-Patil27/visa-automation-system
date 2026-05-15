"""
Visa requirement extractors for embassy websites.
Handles parsing of visa requirements from various embassy sources.
"""

from .extractor import CountryVisaExtractor
from .targets import EmbassyTarget, TargetRegistry

__all__ = ["CountryVisaExtractor", "EmbassyTarget", "TargetRegistry"]