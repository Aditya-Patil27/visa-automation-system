"""
Knowledge base indexer for scraped visa requirements.
Integrates with FAISS vector store and MongoDB for persistence.
"""

import logging
from typing import List, Dict, Optional, Any
from datetime import datetime
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from extractors.extractor import VisaData
from extractors.targets import EmbassyTarget, create_default_registry, scrape_target
from scraper import Scraper

logger = logging.getLogger(__name__)


class KnowledgeBaseIndexer:
    """
    Indexes scraped visa data into FAISS vector store.
    Handles normalization, metadata attachment, and index updates.
    """
    
    def __init__(self, faiss_index_path: str = "faiss_index"):
        """
        Initialize the indexer.
        
        Args:
            faiss_index_path: Path to FAISS index directory
        """
        self.faiss_index_path = faiss_index_path
        self.scraper = Scraper()
        self.registry = create_default_registry()
        self.stats = {
            "total_scraped": 0,
            "documents_added": 0,
            "errors": 0,
            "duration_seconds": 0
        }
    
    def normalize_for_faiss(self, visa_data: VisaData) -> tuple:
        """
        Normalize visa data to FAISS-compatible format.
        
        Args:
            visa_data: VisaData object to normalize
            
        Returns:
            Tuple of (text, metadata)
        """
        # Convert to text for embedding
        text = visa_data.to_text()
        
        # Create metadata for source tracking
        metadata = {
            "country": visa_data.country,
            "visa_type": visa_data.visa_type,
            "source_url": visa_data.source_url,
            "extraction_date": visa_data.extraction_date,
            "type": "scraped"
        }
        
        return text, metadata
    
    def index(self, visa_data_list: List[VisaData]) -> Dict[str, int]:
        """
        Add visa data to FAISS index.
        
        Args:
            visa_data_list: List of VisaData objects to index
            
        Returns:
            Statistics dictionary
        """
        from backend.app.rag import load_vectorstore, Settings
        
        texts = []
        metadatas = []
        
        for data in visa_data_list:
            text, metadata = self.normalize_for_faiss(data)
            texts.append(text)
            metadatas.append(metadata)
        
        if texts:
            vs = load_vectorstore()
            vs.add_texts(texts, metadatas=metadatas)
            vs.save_local(Settings().faiss_index_path)
            
            logger.info(f"Added {len(texts)} documents to FAISS index")
            self.stats["documents_added"] += len(texts)
        
        return self.stats
    
    def scrape_and_index(self, target: EmbassyTarget) -> Dict[str, Any]:
        """
        Scrape data from a target and add to index.
        
        Args:
            target: EmbassyTarget to scrape
            
        Returns:
            Statistics for this scrape operation
        """
        import time
        start_time = time.time()
        
        logger.info(f"Starting scrape and index for {target.name}")
        
        # Scrape the target
        visa_data_list = scrape_target(target, self.scraper)
        
        # Index scraped data
        if visa_data_list:
            self.index(visa_data_list)
            self.stats["total_scraped"] += len(visa_data_list)
        
        # Record duration
        self.stats["duration_seconds"] += time.time() - start_time
        
        return {
            "target": target.name,
            "records_scraped": len(visa_data_list),
            "duration": time.time() - start_time,
            "errors": self.stats["errors"]
        }
    
    def scrape_all_and_index(self) -> Dict[str, Any]:
        """
        Scrape all configured targets and index to FAISS.
        
        Returns:
            Aggregated statistics
        """
        import time
        start_time = time.time()
        
        logger.info("Starting scrape of all embassy targets")
        
        results = []
        for target in self.registry.list_all():
            try:
                result = self.scrape_and_index(target)
                results.append(result)
            except Exception as e:
                logger.error(f"Failed to scrape {target.name}: {e}")
                self.stats["errors"] += 1
                results.append({
                    "target": target.name,
                    "error": str(e)
                })
        
        total_time = time.time() - start_time
        
        return {
            "targets_processed": len(results),
            "successful": sum(1 for r in results if "error" not in r),
            "failed": sum(1 for r in results if "error" in r),
            "total_documents": self.stats["documents_added"],
            "total_duration": total_time
        }


def index_target(target_name: str) -> Dict[str, Any]:
    """
    Index visa data from a specific target.
    
    Args:
        target_name: Name of the target to index
        
    Returns:
        Statistics dictionary
    """
    registry = create_default_registry()
    target = registry.get(target_name)
    
    if not target:
        logger.error(f"Target not found: {target_name}")
        return {"error": f"Target not found: {target_name}"}
    
    indexer = KnowledgeBaseIndexer()
    return indexer.scrape_and_index(target)


def index_all() -> Dict[str, Any]:
    """Index all configured embassy targets."""
    indexer = KnowledgeBaseIndexer()
    return indexer.scrape_all_and_index()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Update knowledge base with scraped visa data")
    parser.add_argument("--target", type=str, help="Specific target to scrape (e.g., 'uk_embassy')")
    parser.add_argument("--all", action="store_true", help="Scrape all targets")
    
    args = parser.parse_args()
    
    if args.target:
        result = index_target(args.target)
        print(f"Target: {args.target}")
        print(f"Records scraped: {result.get('records_scraped', 0)}")
        print(f"Duration: {result.get('duration', 0):.2f}s")
    elif args.all:
        result = index_all()
        print(f"Targets processed: {result['targets_processed']}")
        print(f"Successful: {result['successful']}")
        print(f"Failed: {result['failed']}")
        print(f"Total documents added: {result['total_documents']}")
        print(f"Total duration: {result['total_duration']:.2f}s")
    else:
        print("Usage: python indexer.py --target <name> OR --all")