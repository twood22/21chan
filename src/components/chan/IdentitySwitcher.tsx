import { useState } from 'react';
import { useChanContext } from '@/hooks/useChanContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLoginActions } from '@/hooks/useLoginActions';
import { useAuthor } from '@/hooks/useAuthor';
import { eventIdToPostNumber } from '@/lib/postNumber';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, UserX, RefreshCw, LogIn, LogOut } from 'lucide-react';
import LoginDialog from '@/components/auth/LoginDialog';

export function IdentitySwitcher() {
  const { user } = useCurrentUser();
  const {
    identityMode,
    setIdentityMode,
    ephemeralPubkey,
    rotateEphemeralIdentity,
    getActivePubkey,
  } = useChanContext();
  const { logout } = useLoginActions();

  // Fetch logged-in user's profile
  const { data: authorData } = useAuthor(user?.pubkey);
  const displayName = authorData?.metadata?.name || authorData?.metadata?.display_name;

  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const activePubkey = getActivePubkey();
  const shortPubkey = activePubkey ? eventIdToPostNumber(activePubkey) : '????????';

  const isAnon = identityMode === 'anon';

  const handleLogout = async () => {
    await logout();
    setIdentityMode('anon');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-xs text-chan-link hover:text-chan-link-hover outline-none">
        {isAnon ? (
          <>
            <UserX className="w-3 h-3" />
            <span>Anon</span>
          </>
        ) : (
          <>
            <User className="w-3 h-3" />
            <span>{displayName || `ID: ${shortPubkey}`}</span>
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="bg-chan-post-bg border-chan-post-border">
        <DropdownMenuLabel className="text-xs text-chan-text-muted">
          Posting Identity
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-chan-post-border" />

        <DropdownMenuItem
          onClick={() => setIdentityMode('anon')}
          className={`text-xs cursor-pointer ${isAnon ? 'bg-chan-bg-alt' : ''}`}
        >
          <UserX className="w-3 h-3 mr-2" />
          <div>
            <div className="font-medium">Anonymous</div>
            <div className="text-chan-text-muted text-[10px]">
              ID: {ephemeralPubkey ? eventIdToPostNumber(ephemeralPubkey) : '...'}
            </div>
          </div>
        </DropdownMenuItem>

        {user && (
          <DropdownMenuItem
            onClick={() => setIdentityMode('logged-in')}
            className={`text-xs cursor-pointer ${!isAnon ? 'bg-chan-bg-alt' : ''}`}
          >
            <User className="w-3 h-3 mr-2" />
            <div>
              <div className="font-medium">{displayName || 'Logged In'}</div>
              <div className="text-chan-text-muted text-[10px]">
                ID: {eventIdToPostNumber(user.pubkey)}
              </div>
            </div>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="bg-chan-post-border" />

        <DropdownMenuItem
          onClick={rotateEphemeralIdentity}
          className="text-xs cursor-pointer"
        >
          <RefreshCw className="w-3 h-3 mr-2" />
          New Anon Identity
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-chan-post-border" />

        {user ? (
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-xs cursor-pointer text-red-600"
          >
            <LogOut className="w-3 h-3 mr-2" />
            Log out {displayName ? `@${displayName}` : ''}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => setShowLoginDialog(true)}
            className="text-xs cursor-pointer"
          >
            <LogIn className="w-3 h-3 mr-2" />
            Log in with Nostr
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>

      {/* Login Dialog */}
      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onLogin={() => {
          setShowLoginDialog(false);
          setIdentityMode('logged-in');
        }}
      />
    </DropdownMenu>
  );
}
