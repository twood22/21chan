# 21chan

**Bitcoin-Focused Imageboard on Nostr**

21chan is a decentralized imageboard inspired by classic chan culture, built on the Nostr protocol. Anonymous by default, censorship-resistant, and integrated with Lightning for tips.

## Features

- **Classic Chan Aesthetic**: Familiar 4chan-style interface with the tan/blue color scheme
- **12 Boards**: /btc/, /ln/, /b/, /pol/, /x/, /fit/, /biz/, /lit/, /g/, /mu/, /tv/, /v/
- **Anonymous by Default**: Posts use ephemeral keys - no identity required
- **Optional Identity**: Log in with Nostr extension or nsec to use your identity
- **Image Posting**: Required for thread OPs, optional for replies (via Blossom)
- **Greentext**: Classic `>greentext` formatting support
- **Lightning Zaps**: Tip posts with Bitcoin via Lightning Network
- **Cross-Client Compatible**: Posts are Kind 1 notes visible in Primal, Damus, Snort, etc.
- **Decentralized**: All content lives on Nostr relays, not a central server

## Tech Stack

- **React 18** + TypeScript + Vite
- **TailwindCSS** with custom chan theme
- **Nostrify** for Nostr protocol
- **Blossom** for image uploads
- **shadcn/ui** components

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## How It Works

### Events

- **Thread OPs**: Kind 1 notes with `#21chan-{board}` hashtag and `subject` tag
- **Replies**: Kind 1 notes with NIP-10 threading tags (`e` tags with `root`/`reply` markers)
- **Images**: NIP-92 `imeta` tags + image URL in content for universal rendering

### Boards

Each board maps to a hashtag:

| Board | Name | Hashtag |
|-------|------|---------|
| /btc/ | Bitcoin | #21chan-btc |
| /ln/ | Lightning | #21chan-ln |
| /b/ | Random | #21chan-b |
| /pol/ | Politically Incorrect | #21chan-pol |
| /x/ | Paranormal | #21chan-x |
| ... | ... | ... |

### Identity Modes

1. **Anonymous (default)**: Uses ephemeral keys generated per session
2. **Logged In**: Uses your Nostr identity via NIP-07 extension or nsec

## Project Structure

```
src/
├── components/chan/     # Chan-specific components
│   ├── BoardHeader.tsx
│   ├── BoardCatalog.tsx
│   ├── ThreadCard.tsx
│   ├── ThreadView.tsx
│   ├── PostCard.tsx
│   ├── PostForm.tsx
│   └── ...
├── contexts/
│   └── ChanContext.tsx  # Identity mode, ephemeral keys
├── hooks/
│   ├── useThreads.ts    # Fetch threads for a board
│   ├── useThread.ts     # Fetch single thread with replies
│   ├── useCreateThread.ts
│   └── ...
├── lib/
│   ├── boards.ts        # Board configuration
│   ├── greentext.ts     # Greentext parsing
│   └── postNumber.ts    # Event ID to short number
├── pages/
│   ├── HomePage.tsx     # Board index
│   ├── BoardPage.tsx    # Catalog view
│   └── ThreadPage.tsx   # Thread view
└── styles/
    └── chan-theme.css   # 4chan color palette
```

## Deployment

Build and deploy to any static host:

```bash
npm run build
# Deploy dist/ folder to Vercel, Netlify, GitHub Pages, etc.
```

## Contributing

PRs welcome! This is an open source project.

## Built With

21chan is built on [MKStack](https://github.com/soapbox-pub/mkstack) - a complete framework for building Nostr clients with React, TailwindCSS, and Nostrify. MKStack provides the authentication, relay management, zaps, file uploads, and UI components that power this app.

If you want to build your own Nostr application, check out MKStack:

```bash
npm install -g @getstacks/stacks
stacks mkstack
```

## License

MIT

---

*Built on Nostr. Powered by Bitcoin. Made with [MKStack](https://github.com/soapbox-pub/mkstack).*
