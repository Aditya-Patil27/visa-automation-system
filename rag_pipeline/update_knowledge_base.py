#!/usr/bin/env python3
"""
CLI script for updating the visa knowledge base.
Scrapes embassy websites and updates the FAISS index.
"""

import argparse
import logging
import sys
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def main():
    parser = argparse.ArgumentParser(
        description="Update visa knowledge base with scraped embassy data"
    )
    
    parser.add_argument(
        "--target",
        type=str,
        help="Specific embassy target to scrape (e.g., 'uk_embassy', 'usa_embassy')"
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Scrape all configured embassy targets"
    )
    parser.add_argument(
        "--list-targets",
        action="store_true",
        help="List all available embassy targets"
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable verbose logging"
    )
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Import here to avoid circular imports
    from indexer import index_target, index_all, KnowledgeBaseIndexer
    from extractors.targets import create_default_registry
    
    if args.list_targets:
        print("Available embassy targets:")
        print("-" * 40)
        registry = create_default_registry()
        for target in registry.list_all():
            print(f"  - {target.name} ({target.country})")
            print(f"    URL: {target.base_url}")
            print(f"    Uses JavaScript: {target.uses_js}")
            print()
        return
    
    if args.target:
        print(f"Scraping target: {args.target}")
        print("-" * 40)
        result = index_target(args.target)
        
        if "error" in result:
            print(f"Error: {result['error']}")
            sys.exit(1)
        
        print(f"Records scraped: {result.get('records_scraped', 0)}")
        print(f"Duration: {result.get('duration', 0):.2f}s")
        if result.get('errors'):
            print(f"Errors: {result['errors']}")
    
    elif args.all:
        print("Scraping all embassy targets")
        print("-" * 40)
        result = index_all()
        
        print(f"\nResults:")
        print(f"  Targets processed: {result['targets_processed']}")
        print(f"  Successful: {result['successful']}")
        print(f"  Failed: {result['failed']}")
        print(f"  Total documents added: {result['total_documents']}")
        print(f"  Total duration: {result['total_duration']:.2f}s")
        
        if result['failed'] > 0:
            sys.exit(1)
    
    else:
        parser.print_help()
        print("\nExamples:")
        print("  python update_knowledge_base.py --list-targets")
        print("  python update_knowledge_base.py --target uk_embassy")
        print("  python update_knowledge_base.py --all")


if __name__ == "__main__":
    main()