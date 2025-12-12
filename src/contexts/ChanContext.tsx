import React, { createContext, useCallback, useEffect, useState } from 'react';
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { NSecSigner } from '@nostrify/nostrify';
import type { NostrSigner } from '@nostrify/nostrify';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { BoardConfig } from '@/lib/boards';
import { getBoardById } from '@/lib/boards';

export type IdentityMode = 'anon' | 'logged-in';

export interface ChanContextType {
  identityMode: IdentityMode;
  setIdentityMode: (mode: IdentityMode) => void;
  currentBoard: BoardConfig | null;
  setCurrentBoard: (boardId: string | null) => void;
  ephemeralPubkey: string | null;
  ephemeralSigner: NostrSigner | null;
  getActiveSigner: () => NostrSigner | null;
  getActivePubkey: () => string | null;
  rotateEphemeralIdentity: () => void;
  isLoggedIn: boolean;
}

export const ChanContext = createContext<ChanContextType | null>(null);

const EPHEMERAL_KEY_STORAGE = 'chan:ephemeral-nsec';

interface ChanProviderProps {
  children: React.ReactNode;
}

export function ChanProvider({ children }: ChanProviderProps) {
  const { user } = useCurrentUser();
  const isLoggedIn = !!user;

  const [identityMode, setIdentityMode] = useState<IdentityMode>('anon');
  const [currentBoard, setCurrentBoardState] = useState<BoardConfig | null>(null);
  const [ephemeralSigner, setEphemeralSigner] = useState<NSecSigner | null>(null);
  const [ephemeralPubkey, setEphemeralPubkey] = useState<string | null>(null);

  // Initialize or restore ephemeral identity
  useEffect(() => {
    const storedKey = sessionStorage.getItem(EPHEMERAL_KEY_STORAGE);

    if (storedKey) {
      try {
        const secretKey = hexToBytes(storedKey);
        const pubkey = getPublicKey(secretKey);
        setEphemeralSigner(new NSecSigner(secretKey));
        setEphemeralPubkey(pubkey);
      } catch {
        // Invalid stored key, generate new one
        const secretKey = generateSecretKey();
        const pubkey = getPublicKey(secretKey);
        const secretKeyHex = bytesToHex(secretKey);
        sessionStorage.setItem(EPHEMERAL_KEY_STORAGE, secretKeyHex);
        setEphemeralSigner(new NSecSigner(secretKey));
        setEphemeralPubkey(pubkey);
      }
    } else {
      const secretKey = generateSecretKey();
      const pubkey = getPublicKey(secretKey);
      const secretKeyHex = bytesToHex(secretKey);
      sessionStorage.setItem(EPHEMERAL_KEY_STORAGE, secretKeyHex);
      setEphemeralSigner(new NSecSigner(secretKey));
      setEphemeralPubkey(pubkey);
    }
  }, []);

  const generateNewEphemeralIdentity = useCallback(() => {
    const secretKey = generateSecretKey();
    const pubkey = getPublicKey(secretKey);
    const secretKeyHex = bytesToHex(secretKey);

    sessionStorage.setItem(EPHEMERAL_KEY_STORAGE, secretKeyHex);
    setEphemeralSigner(new NSecSigner(secretKey));
    setEphemeralPubkey(pubkey);
  }, []);

  const rotateEphemeralIdentity = useCallback(() => {
    generateNewEphemeralIdentity();
  }, [generateNewEphemeralIdentity]);

  const setCurrentBoard = useCallback((boardId: string | null) => {
    if (boardId) {
      const board = getBoardById(boardId);
      setCurrentBoardState(board ?? null);
    } else {
      setCurrentBoardState(null);
    }
  }, []);

  const getActiveSigner = useCallback((): NostrSigner | null => {
    if (identityMode === 'logged-in' && user) {
      return user.signer;
    }
    return ephemeralSigner;
  }, [identityMode, user, ephemeralSigner]);

  const getActivePubkey = useCallback((): string | null => {
    if (identityMode === 'logged-in' && user) {
      return user.pubkey;
    }
    return ephemeralPubkey;
  }, [identityMode, user, ephemeralPubkey]);

  const value: ChanContextType = {
    identityMode,
    setIdentityMode,
    currentBoard,
    setCurrentBoard,
    ephemeralPubkey,
    ephemeralSigner,
    getActiveSigner,
    getActivePubkey,
    rotateEphemeralIdentity,
    isLoggedIn,
  };

  return (
    <ChanContext.Provider value={value}>
      {children}
    </ChanContext.Provider>
  );
}
