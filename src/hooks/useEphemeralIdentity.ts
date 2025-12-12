import { useChanContext } from './useChanContext';

/**
 * Hook for managing ephemeral (anonymous) identity.
 * Ephemeral keys are stored in sessionStorage and cleared when the tab closes.
 */
export function useEphemeralIdentity() {
  const {
    ephemeralPubkey,
    ephemeralSigner,
    rotateEphemeralIdentity,
    identityMode,
    setIdentityMode,
    isLoggedIn,
  } = useChanContext();

  const isAnonymous = identityMode === 'anon';

  const goAnonymous = () => {
    setIdentityMode('anon');
  };

  const useLoggedInIdentity = () => {
    if (isLoggedIn) {
      setIdentityMode('logged-in');
    }
  };

  return {
    pubkey: ephemeralPubkey,
    signer: ephemeralSigner,
    isAnonymous,
    isLoggedIn,
    rotateIdentity: rotateEphemeralIdentity,
    goAnonymous,
    useLoggedInIdentity,
  };
}
