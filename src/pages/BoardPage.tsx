import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { useChanContext } from '@/hooks/useChanContext';
import { useThreads, useBoard } from '@/hooks/useThreads';
import { isValidBoardId } from '@/lib/boards';
import { BoardHeader } from '@/components/chan/BoardHeader';
import { BoardCatalog } from '@/components/chan/BoardCatalog';
import { PostForm } from '@/components/chan/PostForm';
import { Skeleton } from '@/components/ui/skeleton';

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { setCurrentBoard } = useChanContext();
  const isValidBoard = boardId ? isValidBoardId(boardId) : false;
  const board = useBoard(boardId ?? '');
  const { data: threads, isLoading, error } = useThreads(boardId ?? '');

  useEffect(() => {
    if (boardId && isValidBoard) {
      setCurrentBoard(boardId);
      return () => setCurrentBoard(null);
    }
  }, [boardId, isValidBoard, setCurrentBoard]);

  useSeoMeta({
    title: board ? `/${board.id}/ - ${board.name} - 21chan` : '21chan',
    description: board?.description ?? 'Bitcoin imageboard',
  });

  // Validate board ID - after all hooks
  if (!boardId || !isValidBoard) {
    return <Navigate to="/" replace />;
  }

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

      <div className="max-w-6xl mx-auto p-4">
        {/* New Thread Form */}
        <div className="mb-6">
          <PostForm boardId={boardId} mode="thread" />
        </div>

        {/* Thread Catalog */}
        <div className="bg-chan-post-bg border border-chan-post-border p-4">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-chan-post-border">
            <h2 className="font-bold text-chan-subject">Catalog</h2>
            <span className="text-xs text-chan-text-muted">
              {threads?.length ?? 0} threads
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="w-[150px] h-[150px] mx-auto" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-chan-text-muted">
              <p>Failed to load threads</p>
              <p className="text-xs mt-1">{String(error)}</p>
            </div>
          ) : threads && threads.length > 0 ? (
            <BoardCatalog threads={threads} boardId={boardId} />
          ) : (
            <div className="text-center py-8 text-chan-text-muted">
              <p>No threads yet</p>
              <p className="text-sm mt-2">Be the first to start a thread!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
