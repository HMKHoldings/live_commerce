# Instagram follower statistics

The creator profile now reads follower totals through the server-side Instagram Business Discovery API. It does not scrape profile pages or estimate follower counts. Other platform cards show an unavailable state until their integrations exist.

## Configuration

Add these to `.env.server` and restart the backend:

```dotenv
INSTAGRAM_GRAPH_VERSION=<supported version selected for your Meta app>
INSTAGRAM_BUSINESS_ACCOUNT_ID=<Instagram professional account ID used for discovery>
INSTAGRAM_ACCESS_TOKEN=<authorized Facebook Login access token>
```

Use Meta's Facebook Login integration and the permissions required by Business Discovery. This integration reads supported professional accounts by username; it is not a universal lookup for private or personal accounts. Keep tokens server-side. Never put them in `VITE_` settings or commit `.env.server`.

References:
- https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/business_discovery/
- https://www.postman.com/meta/instagram/folder/u4g5a2a/instagram-api-with-facebook-login
- https://github.com/facebook/facebook-nodejs-business-sdk/blob/main/src/objects/ig-user.js

## Behavior

Enter a username such as `@example` in the Instagram field. The frontend waits 800ms after editing, requests `POST /api/creator/social/instagram`, and displays the current follower total. Invalid names, missing configuration, and provider failures have distinct states. Changing the name removes the previous result immediately.

Requests require a creator session and CSRF token. Results are cached for 15 minutes. Counts are stored as daily Seoul-time snapshots per creator and Instagram account ID, so two different accounts never share growth history.

Growth is `(current - baseline) / baseline * 100`. The baseline is the most recent saved measurement at least 30 days old; its date is shown. With no baseline, or a zero baseline, the UI shows that comparison data is being collected. There is no retroactive history from a username alone.

Snapshots are collected when the profile is viewed or refreshed; there is currently no scheduled background collector. API tests use mocked provider responses. Live Meta verification requires valid app credentials and a supported test account.
