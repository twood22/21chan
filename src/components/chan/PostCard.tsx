import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { NostrEvent } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';
import { formatPostNumber, eventIdToPostNumber } from '@/lib/postNumber';
import { PostContent } from './PostContent';
import { ImageViewer } from './ImageViewer';
import { TipButton } from './TipButton';
import { useAuthor } from '@/hooks/useAuthor';
import { ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostCardProps {
  event: NostrEvent;
  isOP: boolean;
  title?: string;
  imageUrl?: string | null;
  imageDimensions?: { width: number; height: number } | null;
  boardId: string;
  postNumberMap: Map<string, string>;
}

export function PostCard({
  event,
  isOP,
  title,
  imageUrl,
  imageDimensions,
  boardId,
  postNumberMap,
}: PostCardProps) {
  const [imageExpanded, setImageExpanded] = useState(false);
  const { data: authorData } = useAuthor(event.pubkey);

  const postNumber = formatPostNumber(event.id);
  const shortId = eventIdToPostNumber(event.pubkey);
  const timestamp = new Date(event.created_at * 1000);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  // Generate nevent for external links
  let njumpUrl = '';
  try {
    const nevent = nip19.neventEncode({
      id: event.id,
      author: event.pubkey,
      kind: event.kind,
      relays: ['wss://relay.damus.io', 'wss://relay.primal.net'],
    });
    njumpUrl = `https://njump.me/${nevent}`;
  } catch (e) {
    console.error('Failed to encode nevent:', e, event);
  }

  // Determine display name
  const displayName = authorData?.metadata?.name || `Anon`;
  const isAnon = !authorData?.metadata?.name;

  return (
    <div 
      id={`p${eventIdToPostNumber(event.id)}`}
      className={`chan-post ${isOP ? 'w-full' : ''}`}
    >
      {/* Post Header */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mb-2">
        {/* Subject (OP only) */}
        {isOP && title && (
          <span className="chan-subject">{title}</span>
        )}

        {/* Name */}
        <span className={isAnon ? 'chan-name' : 'chan-name'}>
          {displayName}
        </span>

        {/* Anonymous indicator */}
        {isAnon && (
          <span className="text-chan-text-muted">(ID: {shortId})</span>
        )}

        {/* Timestamp */}
        <span className="text-chan-text-muted" title={timestamp.toLocaleString()}>
          {timeAgo}
        </span>

        {/* Post Number */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(`>>${eventIdToPostNumber(event.id)}`);
          }}
          className="chan-postnum hover:underline"
          title="Click to copy quote"
        >
          {postNumber}
        </button>

        {/* Tip Button */}
        <TipButton event={event} />

        {/* External Link - click-based dropdown with Nostr viewers */}
        {njumpUrl && (
          <DropdownMenu>
            <DropdownMenuTrigger className="text-chan-link hover:text-chan-link-hover inline-flex items-center outline-none">
              <ExternalLink className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-chan-post-bg border-chan-post-border min-w-[120px]">
              <DropdownMenuItem asChild className="text-xs cursor-pointer">
                <a href={njumpUrl} target="_blank" rel="noopener noreferrer">
                  njump.me
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-xs cursor-pointer">
                <a href={`https://primal.net/e/${njumpUrl.split('/').pop()}`} target="_blank" rel="noopener noreferrer">
                  primal.net
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-xs cursor-pointer">
                <a href={`https://snort.social/e/${njumpUrl.split('/').pop()}`} target="_blank" rel="noopener noreferrer">
                  snort.social
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-xs cursor-pointer">
                <a href={`https://coracle.social/${njumpUrl.split('/').pop()}`} target="_blank" rel="noopener noreferrer">
                  coracle.social
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-xs cursor-pointer">
                <a href={`https://nostr.band/?q=${event.id}`} target="_blank" rel="noopener noreferrer">
                  nostr.band
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Post Body */}
      <div className={`flex ${isOP ? 'flex-col sm:flex-row' : ''} gap-4`}>
        {/* Image */}
        {imageUrl && (
          <div className={isOP ? 'flex-shrink-0' : ''}>
            <ImageViewer
              src={imageUrl}
              alt={title || 'Post image'}
              dimensions={imageDimensions}
              expanded={imageExpanded}
              onToggle={() => setImageExpanded(!imageExpanded)}
              isOP={isOP}
            />
          </div>
        )}

        {/* Content */}
        <div className={`text-sm ${isOP ? 'flex-1' : ''}`}>
          <PostContent
            content={event.content}
            postNumberMap={postNumberMap}
            boardId={boardId}
          />
        </div>
      </div>
    </div>
  );
}
