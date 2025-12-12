import type { ThreadData } from '@/hooks/useThread';
import { PostCard } from './PostCard';

interface ThreadViewProps {
  thread: ThreadData;
  boardId: string;
  postNumberMap: Map<string, string>;
}

export function ThreadView({ thread, boardId, postNumberMap }: ThreadViewProps) {
  const { op, title, imageUrl, imageDimensions, replies } = thread;

  return (
    <div className="space-y-2">
      {/* OP Post */}
      <PostCard
        event={op}
        isOP={true}
        title={title}
        imageUrl={imageUrl}
        imageDimensions={imageDimensions}
        boardId={boardId}
        postNumberMap={postNumberMap}
      />

      {/* Replies */}
      {replies.length > 0 && (
        <div className="chan-replies space-y-2">
          {replies.map((reply) => {
            // Extract image from reply if present
            const imeta = reply.tags.find(([name]) => name === 'imeta');
            let replyImageUrl: string | null = null;
            let replyImageDims: { width: number; height: number } | null = null;

            if (imeta) {
              for (const part of imeta.slice(1)) {
                if (part.startsWith('url ')) {
                  replyImageUrl = part.slice(4);
                } else if (part.startsWith('dim ')) {
                  const dims = part.slice(4).split('x');
                  if (dims.length === 2) {
                    replyImageDims = {
                      width: parseInt(dims[0], 10),
                      height: parseInt(dims[1], 10),
                    };
                  }
                }
              }
            }

            return (
              <PostCard
                key={reply.id}
                event={reply}
                isOP={false}
                imageUrl={replyImageUrl}
                imageDimensions={replyImageDims}
                boardId={boardId}
                postNumberMap={postNumberMap}
              />
            );
          })}
        </div>
      )}

      {replies.length === 0 && (
        <div className="text-center py-4 text-chan-text-muted text-sm">
          No replies yet. Be the first to reply!
        </div>
      )}
    </div>
  );
}
