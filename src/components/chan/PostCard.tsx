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

        {/* External Link - dropdown with multiple viewers */}
        {njumpUrl && (
          <div className="relative group">
            <button
              className="text-chan-link hover:text-chan-link-hover inline-flex items-center gap-0.5"
              title="View on Nostr"
            >
              <ExternalLink className="w-3 h-3" />
            </button>
            <div className="absolute left-0 top-full mt-1 bg-chan-post-bg border border-chan-post-border shadow-lg rounded text-xs z-50 hidden group-hover:block min-w-[100px]">
              <a
                href={njumpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-2 py-1 hover:bg-chan-bg-alt"
              >
                njump.me
              </a>
              <a
                href={`https://satellite.earth/thread/${event.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-2 py-1 hover:bg-chan-bg-alt"
              >
                satellite.earth
              </a>
              <a
                href={`https://nostr.band/?q=${event.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-2 py-1 hover:bg-chan-bg-alt"
              >
                nostr.band
              </a>
            </div>
          </div>
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
