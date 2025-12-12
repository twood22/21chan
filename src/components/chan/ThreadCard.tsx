import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { ExternalLink } from 'lucide-react';
import type { ThreadWithMeta } from '@/hooks/useThreads';

interface ThreadCardProps {
  thread: ThreadWithMeta;
  boardId: string;
}

export function ThreadCard({ thread, boardId }: ThreadCardProps) {
  const { event, title, imageUrl, replyCount } = thread;
  const excerpt = event.content.slice(0, 150);

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

  return (
    <Link
      to={`/${boardId}/thread/${event.id}`}
      className="chan-catalog-thread hover:bg-chan-bg-alt transition-colors"
    >
      {/* Thumbnail */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title || 'Thread image'}
          className="chan-catalog-thumb mx-auto"
          loading="lazy"
        />
      ) : (
        <div className="w-[150px] h-[150px] mx-auto bg-chan-bg-alt flex items-center justify-center text-chan-text-muted text-xs">
          No image
        </div>
      )}

      {/* Stats */}
      <div className="chan-catalog-stats mt-1 flex items-center justify-center gap-2">
        <span className="font-bold">R: {replyCount}</span>
        {njumpUrl && (
          <a
            href={`https://primal.net/e/${njumpUrl.split('/').pop()}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-chan-link hover:text-chan-link-hover"
            title="View on Primal"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Title */}
      {title && (
        <div className="font-bold text-chan-subject text-xs mt-1 truncate">
          {title}
        </div>
      )}

      {/* Excerpt */}
      <div className="chan-catalog-excerpt mt-1">
        {excerpt}
        {event.content.length > 150 && '...'}
      </div>
    </Link>
  );
}
