---
plan: 05-scraper
phase: 02
objective: Web scraping pipeline for extracting visa requirements from embassy websites
wave: 1
depends_on: null
requirements_addressed: [REQ-20, NFR-03]
files_modified:
  - rag_pipeline/scraper.py
  - rag_pipeline/extractors/
  - backend/app/routes.py
autonomous: false
---

# Plan 05-scraper: Embassy Website Scraping Pipeline

## Context

Phase 02 adds automated data scraping from embassy websites to keep the knowledge base updated. This plan builds the core scraping infrastructure using Python with BeautifulSoup/Playwright for web extraction.

## Tasks

### Task 5.1: Create scraper base infrastructure

<read_first>
- rag_pipeline/pipeline.py
</read_first>

<action>
1. Create rag_pipeline/scraper.py with base scraper class
2. Include rate limiting (respect robots.txt, delay between requests)
3. Add retry logic with exponential backoff (max 3 retries)
4. Add user-agent rotation to avoid blocking
5. Implement logging for all scraping operations
6. Create error handling for common issues (403, 404, timeout)
</action>

<acceptance_criteria>
- rag_pipeline/scraper.py contains Scraper base class
- Scraper has rate_limit() method with configurable delay
- Scraper has retry() decorator with exponential backoff
- Scraper has fetch() method that handles errors gracefully
- Logging configured with structured output
</acceptance_criteria>

### Task 5.2: Implement visa requirement extractors

<read_first>
- rag_pipeline/scraper.py
</read_first>

<action>
1. Create rag_pipeline/extractors/__init__.py
2. Implement CountryVisaExtractor class with methods:
   - extract_documents() - parse required documents list
   - extract_visa_types() - parse visa type categories
   - extract_fees() - parse fee information
   - extract_timelines() - parse processing timeframes
   - extract_addresses() - parse embassy addresses
3. Implement base selectors for common embassy sites:
   - UK visa UKVAC (https://www.gov.uk/apply-uk-visa)
   - Schengen visa (https://www.schengenvisainfo.com)
   - US visa (https://travel.state.gov)
4. Handle dynamic content (JavaScript-rendered pages) using Playwright
</action>

<acceptance_criteria>
- rag_pipeline/extractors/__init__.py exports CountryVisaExtractor
- CountryVisaExtractor has extract_documents() method
- CountryVisaExtractor has extract_visa_types() method
- Extractor returns structured dict with country, visa_type, documents, processing_time
- Playwright integration for JS-rendered pages
</acceptance_criteria>

### Task 5.3: Create target embassy configurations

<read_first>
- rag_pipeline/extractors/__init__.py
- backend/app/rag.py
</read_first>

<action>
1. Create rag_pipeline/extractors/targets.py with EmbassyTarget configs:
   - UK Embassy target (gov.uk visa section)
   - USA Embassy target (travel.state.gov)
   - Schengen target (schengenvisainfo.com)
   - Australia Embassy target (immi.homeaffairs.gov.au)
2. Each target includes:
   - base_url
   - selectors for documents, fees, timelines
   - CSS selectors or XPath for each data field
   - authentication if required
3. Add target registry for easy addition of new embassies
</action>

<acceptance_criteria>
- rag_pipeline/extractors/targets.py exists
- UK Embassy target defined with base_url matching gov.uk
- USA Embassy target defined with base_url matching travel.state.gov
- Each target has select() method returning structured visa data
- Target registry allows iterating all configured embassies
</acceptance_criteria>

### Task 5.4: Integrate scraper with FAISS indexer

<read_first>
- backend/app/rag.py
- rag_pipeline/pipeline.py
</read_first>

<action>
1. Create rag_pipeline/indexer.py that:
   - Runs scraper for configured targets
   - Normalizes extracted data to FAISS-compatible format
   - Adds metadata (source_url, country, visa_type, extraction_date)
   - Calls index_documents() to update FAISS index
2. Create rag_pipeline/update_knowledge_base.py CLI script:
   - Accepts --target flag for single embassy or --all for all
   - Logs extraction statistics
   - Handles partial failures gracefully
3. Hook into backend startup for automatic periodic updates
</action>

<acceptance_criteria>
- rag_pipeline/indexer.py exists with KnowledgeBaseIndexer class
- KnowledgeBaseIndexer.index() method updates FAISS index
- CLI script rag_pipeline/update_knowledge_base.py is executable
- update_knowledge_base.py --all updates all configured embassies
- Statistics logged: documents extracted, errors, duration
</acceptance_criteria>

### Task 5.5: Document scraping architecture

<read_first>
- rag_pipeline/scraper.py
- rag_pipeline/extractors/targets.py
</read_first>

<action>
Create rag_pipeline/README.md documenting:
1. Architecture overview with diagram
2. Target configuration format
3. Adding new embassy targets
4. Rate limiting and etiquette guidelines
5. Error handling procedures
6. Testing locally
</action>

<acceptance_criteria>
- rag_pipeline/README.md exists
- README documents Scraper class usage
- README explains how to add new embassy targets
- README includes rate limiting best practices
- README has example CLI commands
</acceptance_criteria>

## Verification

- Scraper handles rate limiting correctly
- Extractors return structured data
- FAISS index updates with new data
- CLI runs without errors

## Must-Haves (Goal Verification)

- Embassy websites can be scraped for visa requirements
- Data is normalized and stored in MongoDB
- FAISS index is updated with new content
- Scraping logs are maintained