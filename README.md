# goat-gideon 🐐

Criminal Minds Across the Eras — an episode explorer for rewatches. Live at https://criminal-minds.inevitable.fyi

A static, no-build rewatch companion, sibling of [moose-and-squirrel](https://github.com/jhgaylor/moose-and-squirrel)
(the Supernatural one). An interactive era chart (showrunners, network/format, BAU roster, major arcs, serial-arc
UnSubs, recurring characters) sits on top of all 364 episodes — the CBS run and *Evolution* — and everything on it
is a filter.

## Run
```
python3 -m http.server 8766    # then open http://localhost:8766
```

## Features
- Interactive era chart. Click to filter; shift-click to combine.
- Filters: seasons, curated "vibes" (serial-arc episodes, two-parters, gut-punches, extra disturbing, team-member-in-danger,
  milestones, character spotlights…), guest character (from TVmaze guest-cast credits), min rating, sort, watched state.
- Full-text search across title, summary, and guest cast.
- Episode modal with "what's going on this season" context, guest cast, next-episode nav.
- Watched tracking (localStorage), 🎲 Surprise me, shareable filter URLs, mobile filter drawer.

## Data
- `data/episodes.json` — from TVmaze show 81 (`data/fetch_cast.py` regenerates guest cast; `build_cast.py` compacts it).
- `data/eras.js` — the chart. Edit to tweak eras. Categories are declared in `ERA_CATS`.
- `data/tags.js` — hand-curated episode vibes. Add/adjust freely.

## Deploy
Container: `ghcr.io/jhgaylor/goat-gideon` (nginx, port 8080), built by `.github/workflows/build.yml` on push to `main`,
which then pins the new `sha-*` tag into `k8s/deployment.yaml`. home-cloud's Flux reconciles `k8s/` to the URL above.

## Analytics
PostHog (project "criminal-minds.inevitable.fyi", US cloud). Autocapture off; pageviews plus explicit explorer events.
