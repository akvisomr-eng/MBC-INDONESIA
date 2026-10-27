# MBC Indonesia — Reader Companion, Ads, and Editorial Research

## Reader-facing AI Companion
- The companion launcher is rendered on the homepage and every article detail page.
- On an article page it receives the article title, summary, available text, category, and source URL as bounded context.
- It supports quick prompts for summary, context, and verification questions, text chat, and browser speech synthesis where supported.
- The chat endpoint uses an OpenAI-compatible provider only when `AI_API_KEY` and `AI_MODEL` are configured in the deployment environment. `AI_BASE_URL` can point to a compatible endpoint.
- Without those values, it returns a clearly limited, rule-based contextual response. It must not claim to have searched the live web or verified facts when it has not.
- This is a reader assistant, not an autonomous publisher or a substitute for editorial verification.

## Editorial research candidate discovery
- `POST /api/editorial-research` is an authorized research-job endpoint. It requires `Authorization: Bearer <EDITORIAL_RESEARCH_TOKEN>` and `TAVILY_API_KEY`.
- It runs three bounded search tracks in parallel: official/primary sources, independent coverage, and open-license/public-domain discovery.
- It returns candidate titles, URLs, snippets, timestamps, and a status that explicitly marks licensing as unverified.
- Results are leads for the newsroom, not republication permission. The route does not automatically copy full articles or publish content.
- To activate, configure `EDITORIAL_RESEARCH_TOKEN` and `TAVILY_API_KEY` in Vercel Preview first, test there, and then create a scheduled or manually triggered authorized job. No credentials are included in the repository, and no live research run is claimed by this code change alone.

## Rights and newsroom review
Before reusing any text, photo, graphic, video, dataset, or audio, staff must record:
1. Original publisher/creator and canonical URL.
2. Exact license or written permission and evidence of the license at the time of collection.
3. Whether commercial reuse is permitted.
4. Whether modification, translation, cropping, or derivative use is permitted.
5. Attribution wording, license link, and any share-alike obligations.
6. Personal-data/privacy, defamation, safety, and public-interest checks.
7. Editor decision and date.

A page being publicly viewable, a search result being accessible, or a source being independent does **not** mean the work is copyright-free. CC BY and CC BY-SA can permit commercial reuse subject to their conditions; CC BY-NC variants prohibit commercial use; CC BY-ND restricts distribution of adaptations. Public-domain status and government open-data terms must be checked for the specific asset and jurisdiction. When rights are unclear, link to or summarize facts in original wording within applicable law rather than copying protected expression, and escalate for legal review where needed.

## Advertising placements
- Clearly labeled promotional cards are present on the homepage and article pages.
- The card opens an inquiry to MBC's WhatsApp contact channel.
- The card is an available advertising slot, not an actual sold campaign. Paid editorial content must be disclosed as sponsored and remain separate from independent newsroom decisions.
- The card currently uses a generic promotion placeholder; it does not yet implement ad inventory, campaign scheduling, billing, impression/click analytics, or automatic creative rotation.

## Production readiness
These changes provide a working UI and API foundation. They do not by themselves activate provider credentials, prove the external research job has run, verify licenses, import the complete legacy site, or establish production readiness. Test in Preview, configure credentials, validate the editor approval flow, and migrate the complete legacy content/media with redirects before switching the official domain.
