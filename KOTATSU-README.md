# 🦞 Kotatsu Web

**Kotatsu-style manga reader powered by Suwayomi-Server + Tachiyomi extensions.**

Self-hosted on your VPS, read manga through your browser with the beautiful Kotatsu UI.

## What Is This?

- **Kotatsu UI** → The clean, dark, mobile-first manga reader interface from Kotatsu
- **Suwayomi-Server** → Backend that runs Tachiyomi/Mihon extensions (thousands of manga sources)
- **Web-based** → Access from any browser, phone or desktop

## Quick Start

### Docker (Recommended)

```bash
git clone https://github.com/YOUR_USERNAME/kotatsu-web.git
cd kotatsu-web
docker compose up -d --build
```

Open `http://your-server-ip:4567`

### Railway

1. Fork this repo
2. Create new project on [Railway](https://railway.app)
3. Connect your GitHub repo
4. Deploy — Railway auto-detects the Dockerfile

### VPS (Ubuntu/Debian)

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/kotatsu-web/master/deploy/install-vps.sh | bash
```

### Standalone JAR Bundle

Requires: Node.js 24+, pnpm, Java 21+

```bash
./deploy/build-jar-bundle.sh
cd dist-bundle
./run.sh
```

## Kotatsu UI Components

| Component | Description |
|-----------|-------------|
| `KotatsuBottomNav` | 4-tab bottom navigation (Shelf/Explore/History/More) |
| `KotatsuMangaCard` | Library grid cards with covers, unread badges |
| `KotatsuMangaHeader` | Blurred cover manga detail page header |
| `KotatsuChapterItem` | Chapter list with reading progress bars |
| `KotatsuHistoryItem` | Timeline-style reading history |
| `KotatsuSearchBar` | Rounded search bar with global search |
| `KotatsuFilterChips` | Filter chips (On device, New chapters, Completed) |
| `KotatsuContinueFab` | Floating "Continue reading" button |
| `KotatsuMangaBottomBar` | Manga detail bottom action bar |
| `KotatsuMore` | Kotatsu-styled settings/more page |
| `KotatsuTheme` | Full MUI dark theme with Kotatsu colors |
| `KotatsuScreenLayout` | Screen wrapper with search + filters |

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, MUI v9, Apollo GraphQL
- **Backend:** Suwayomi-Server (Java), GraphQL API
- **Extensions:** Tachiyomi/Mihon compatible
- **Deployment:** Docker, Railway, standalone JAR

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4567` | Server port |
| `TZ` | `UTC` | Timezone |
| `JAVA_OPTS` | `-Xmx512m` | JVM options |

## Development

```bash
# Install deps (requires Node.js 24+)
pnpm install

# Dev server (connects to Suwayomi at localhost:4567)
pnpm dev

# Build
pnpm build
```

## License

MPL-2.0 — Same as Suwayomi-WebUI
