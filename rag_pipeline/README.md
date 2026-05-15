# Embassy Scraping Pipeline

Automated scraping system for extracting visa requirements from embassy websites.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Embassy Scraping Pipeline                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌─────────────────┐    ┌───────────────┐ │
│  │   Scraper    │───▶│   Extractors    │───▶│    Indexer    │ │
│  │   (base)     │    │ (per-country)   │    │  (FAISS/MDB)  │ │
│  └──────────────┘    └─────────────────┘    └───────────────┘ │
│         │                   │                      │          │
│         ▼                   ▼                      ▼          │
│  ┌──────────────┐    ┌─────────────────┐    ┌───────────────┐ │
│  │ Rate Limit   │    │ Embassy Targets  │    │ Update CLI   │ │
│  │ Retry Logic │    │ (UK, US, etc.)  │    │ (scheduled) │ │
│  │ UA Rotation │    └─────────────────┘    └───────────────┘ │
│  └──────────────┘                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### Scraper (`scraper.py`)
Base scraper class with:
- **Rate limiting**: Configurable delay between requests
- **Retry logic**: Exponential backoff with max 3 retries
- **User-agent rotation**: Random rotation to avoid blocking
- **Error handling**: Custom exceptions for 403, 404, 429, timeouts

### Extractors (`extractors/`)
Per-country extractors that parse visa data:
- `CountryVisaExtractor`: Base extractor class
- `targets.py`: Embassy target configurations

### Indexer (`indexer.py`)
- Integrates with FAISS vector store
- Normalizes scraped data
- Adds metadata (source, country, visa type, date)

## Usage

### List Available Targets
```bash
python rag_pipeline/update_knowledge_base.py --list-targets
```

### Scrape Single Target
```bash
python rag_pipeline/update_knowledge_base.py --target uk_embassy
python rag_pipeline/update_knowledge_base.py --target usa_embassy
```

### Scrape All Targets
```bash
python rag_pipeline/update_knowledge_base.py --all
```

## Adding New Embassy Targets

1. Create a new `EmbassyTarget` in `extractors/targets.py`:
```python
MY_COUNTRY_EMBASSY = EmbassyTarget(
    name="My Country Embassy",
    country="My Country",
    base_url="https://example.com/visa",
    uses_js=True,  # Set True if site requires JavaScript
    selectors={
        "documents": ".required-docs li",
        "fees": ".fee-info",
        "processing_time": ".processing",
        "addresses": ".address",
    }
)
```

2. Register it in the registry:
```python
DEFAULT_REGISTRY.register(MY_COUNTRY_EMBASSY)
```

## Rate Limiting

- Default delay: 2 seconds between requests
- Respects robots.txt when enabled
- Exponential backoff on failures (1s, 2s, 4s)

**Best Practices:**
- Always respect `robots.txt`
- Use minimum 1-2 second delays
- Rotate user agents
- Monitor for rate limit responses (429)

## Error Handling

The system handles:
- `RateLimitError` (429): Wait and retry
- `HTTPError` (403, 404, 5xx): Retry with backoff
- `TimeoutError`: Retry up to 3 times
- Network errors: Retry with backoff

## Testing Locally

```bash
# Test scraper
cd rag_pipeline
python scraper.py

# Test extractor
python -c "from extractors import CountryVisaExtractor; print('OK')"

# Test full pipeline
python update_knowledge_base.py --list-targets
```