# Chaos Testing

Robustness tests for the Feature Suggestion Platform.

## Setup

```bash
pip install -r requirements.txt
```

## Usage

```bash
python chaos_test.py --base-url http://localhost:3000/api --concurrency 50
```

## Scenarios

1. Flood creation - hundreds of concurrent feature creates
2. Duplicate upvote - same email upvoting same feature in parallel
3. Upvote nonexistent feature - random/invalid UUIDs
4. Invalid payloads - missing fields, malformed data, XSS, SQL injection
5. Race condition upvote_count - concurrent upvotes from different users
6. Extreme pagination - edge case page/limit values
7. Malformed headers - wrong content-type, non-JSON body
8. Bizarre emails - valid but unusual email formats
9. Stress test listing - 1000+ features with concurrent reads
10. Cache consistency - create/upvote/verify cache invalidation
