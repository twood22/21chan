import { Link } from 'react-router-dom';
import { BOARDS } from '@/lib/boards';
import { IdentitySwitcher } from './IdentitySwitcher';

export function BoardHeader() {
  return (
    <header className="bg-chan-header-bg border-b border-chan-header-border">
      {/* Top Navigation */}
      <nav className="chan-nav flex items-center justify-between">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-chan-text-muted">[</span>
          {BOARDS.map((board, index) => (
            <span key={board.id}>
              <Link
                to={`/${board.id}`}
                className="text-chan-link hover:text-chan-link-hover"
                title={board.name}
              >
                {board.id}
              </Link>
              {index < BOARDS.length - 1 && (
                <span className="text-chan-text-muted"> / </span>
              )}
            </span>
          ))}
          <span className="text-chan-text-muted">]</span>
        </div>

        <div className="flex items-center gap-4">
          <IdentitySwitcher />
          <Link
            to="/"
            className="text-chan-link hover:text-chan-link-hover text-xs"
          >
            [Home]
          </Link>
        </div>
      </nav>

      {/* Site Title Bar */}
      <div className="text-center py-1 border-t border-chan-header-border">
        <Link to="/" className="text-chan-btc font-bold text-lg hover:text-chan-btc-dark">
          21chan
        </Link>
        <span className="text-chan-text-muted text-xs ml-2">
          Bitcoin Imageboard
        </span>
      </div>
    </header>
  );
}
