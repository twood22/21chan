import { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { useChanContext } from '@/hooks/useChanContext';
import { useThread } from '@/hooks/useThread';
import { useBoard } from '@/hooks/useThreads';
import { isValidBoardId } from '@/lib/boards';
import { createPostNumberMap } from '@/lib/postNumber';
import { BoardHeader } from '@/components/chan/BoardHeader';
import { ThreadView } from '@/components/chan/ThreadView';
import { PostForm } from '@/components/chan/PostForm';
import { Skeleton } from '@/components/ui/skeleton';

export default function ThreadPage() {
  const { boardId, threadId } = useParams<{ boardId: string; threadId: string }>();
  const { setCurrentBoard } = useChanContext();
  const isValidBoard = boardId ? isValidBoardId(boardId) : false;
  const board = useBoard(boardId ?? '');
  const { data: thread, isLoading, error } = useThread(threadId ?? '');

  useEffect(() => {
    if (boardId && isValidBoard) {
      setCurrentBoard(boardId);
      return () => setCurrentBoard(null);
    }
  }, [boardId, isValidBoard, setCurrentBoard]);

  useSeoMeta({
    title: thread?.title
      ? `${thread.title} - /${boardId}/ - 21chan`
      : `Thread - /${boardId}/ - 21chan`,
    description: thread?.op.content.slice(0, 160) ?? 'Thread on 21chan',
  });

  // Validate board ID - after all hooks
  if (!boardId || !isValidBoard) {
    return <Navigate to="/" replace />;
  }

  if (!threadId) {
    return <Navigate to={`/${boardId}`} replace />;
  }

  // Create post number map for quote linking
  const postNumberMap = thread
    ? createPostNumberMap(thread.allEvents.map(e => e.id))
    : new Map();

  return (
    <div className="min-h-screen bg-chan-bg font-chan">
      <BoardHeader />

      {/* Board Title */}
      {board && (
        <div className="chan-board-header">
          <h1 className="chan-board-title">
            {board.icon} /{board.id}/ - {board.name}
          </h1>
          <p className="chan-board-subtitle">{board.description}</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4">
        {/* Navigation */}
        <div className="mb-4 text-sm">
          <Link to={`/${boardId}`} className="text-chan-link hover:text-chan-link-hover">
            [Return to Catalog]
          </Link>
        </div>

        {/* Thread Content */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="bg-chan-post-bg border border-chan-post-border p-8 text-center">
              <p className="text-chan-text">Loading thread...</p>
              <p className="text-xs text-chan-text-muted mt-2">
                Waiting for relays to respond
              </p>
            </div>
            <div className="bg-chan-post-bg border border-chan-post-border p-4">
              <div className="flex gap-4">
                <Skeleton className="w-[250px] h-[200px]" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-chan-post-bg border border-chan-post-border p-4 ml-8">
                <Skeleton className="h-3 w-32 mb-2" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-chan-post-bg border border-chan-post-border p-8 text-center">
            <p className="text-chan-text-muted">Failed to load thread</p>
            <p className="text-xs mt-1 text-chan-text-muted">{String(error)}</p>
            <Link
              to={`/${boardId}`}
              className="inline-block mt-4 text-chan-link hover:text-chan-link-hover"
            >
              Return to Catalog
            </Link>
          </div>
        ) : thread ? (
          <>
            <ThreadView
              thread={thread}
              boardId={boardId}
              postNumberMap={postNumberMap}
            />

            {/* Reply Form */}
            <div className="mt-6 border-t border-chan-post-border pt-4">
              <PostForm
                boardId={boardId}
                mode="reply"
                threadId={threadId}
                threadPubkey={thread.op.pubkey}
              />
            </div>
          </>
        ) : (
          <div className="bg-chan-post-bg border border-chan-post-border p-8 text-center">
            <p className="text-chan-text-muted">Thread not found</p>
            <Link
              to={`/${boardId}`}
              className="inline-block mt-4 text-chan-link hover:text-chan-link-hover"
            >
              Return to Catalog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
