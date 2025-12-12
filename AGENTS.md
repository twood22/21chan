# 21chan Project Overview

21chan is a Bitcoin-focused imageboard built on Nostr. It provides a classic 4chan-style anonymous posting experience using decentralized Nostr relays.

## Technology Stack

- **React 18.x** with TypeScript
- **TailwindCSS 3.x** with custom chan theme
- **Vite** for build tooling
- **Nostrify** for Nostr protocol
- **shadcn/ui** for base UI components
- **TanStack Query** for data fetching

## Project Structure

```
src/
├── components/chan/     # 21chan-specific components
│   ├── BoardHeader.tsx  # Board navigation
│   ├── BoardCatalog.tsx # Thread grid view
│   ├── ThreadCard.tsx   # Catalog thread thumbnail
│   ├── ThreadView.tsx   # Full thread display
│   ├── PostCard.tsx     # Individual post
│   ├── PostForm.tsx     # New thread/reply form
│   ├── PostContent.tsx  # Greentext rendering
│   ├── ImageViewer.tsx  # Expandable images
│   ├── IdentitySwitcher.tsx # Anon/logged-in toggle
│   └── TipButton.tsx    # Lightning zap button
├── contexts/
│   └── ChanContext.tsx  # Identity mode, ephemeral keys
├── hooks/
│   ├── useThreads.ts    # Fetch Kind 1 threads by hashtag
│   ├── useThread.ts     # Fetch thread with replies
│   ├── useCreateThread.ts # Create threads and replies
│   ├── useChanUploadFile.ts # Image upload with ephemeral signer
│   └── useEphemeralIdentity.ts # Generate anon keys
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

## Nostr Event Structure

### Thread OPs (Kind 1)
```json
{
  "kind": 1,
  "content": "Post text\n\nhttps://blossom.example.com/image.jpg\n\n[/btc/ - 21chan]",
  "tags": [
    ["subject", "Thread Subject"],
    ["imeta", "url https://...", "m image/jpeg"],
    ["t", "21chan-btc"],
    ["client", "21chan"]
  ]
}
```

Note: Content includes image URL and board tag `[/board/ - 21chan]` for visibility in other clients.

### Replies (Kind 1 with NIP-10 threading)
```json
{
  "kind": 1,
  "content": ">greentext\nReply text",
  "tags": [
    ["e", "<thread-id>", "", "root"],
    ["e", "<reply-to-id>", "", "reply"],
    ["p", "<author-pubkey>"],
    ["client", "21chan"]
  ]
}
```

## Board Configuration

Boards are defined in `src/lib/boards.ts`:

| Board | Hashtag | Description |
|-------|---------|-------------|
| /btc/ | #21chan-btc | Bitcoin discussion |
| /ln/ | #21chan-ln | Lightning Network |
| /b/ | #21chan-b | Random (NSFW) |
| /pol/ | #21chan-pol | Politics |
| /x/ | #21chan-x | Paranormal |

## Identity System

1. **Anonymous mode**: Uses ephemeral keys from `ChanContext`
2. **Logged-in mode**: Uses Nostr extension or nsec

The `getActiveSigner()` function in ChanContext returns the appropriate signer.

## Cross-Client Compatibility

Posts are standard Kind 1 notes visible in any Nostr client:
- **Primal**, **Damus**, **Snort**, **Coracle**, etc.
- Replies made from other clients appear in 21chan threads
- External links use `nevent` encoding via njump.me

## Key Files

- `src/contexts/ChanContext.tsx` - Identity state management
- `src/hooks/useCreateThread.ts` - Thread and reply creation
- `src/hooks/useThreads.ts` - Board thread fetching
- `src/styles/chan-theme.css` - 4chan color theme
- `src/lib/boards.ts` - Board definitions
