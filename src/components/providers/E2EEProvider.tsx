"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { E2EEKeyPair, fetchMyPrivateKey, fetchPublicKey, generateAndUploadKeys } from '@/utils/crypto';

interface E2EEContextType {
  keyPair: E2EEKeyPair | null;
  isLoadingKeys: boolean;
}

const E2EEContext = createContext<E2EEContextType>({ keyPair: null, isLoadingKeys: true });

export const useE2EE = () => useContext(E2EEContext);

export function E2EEProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [keyPair, setKeyPair] = useState<E2EEKeyPair | null>(null);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);

  useEffect(() => {
    async function initKeys() {
      if (isLoading) return; // Wait for auth to resolve
      if (!user) {
        setKeyPair(null);
        setIsLoadingKeys(false);
        return;
      }

      setIsLoadingKeys(true);

      // Try to fetch existing keys
      const pubKey = await fetchPublicKey(user.id);
      const privKey = await fetchMyPrivateKey(user.id);

      if (pubKey && privKey) {
        setKeyPair({ publicKey: pubKey, privateKey: privKey });
      } else {
        // Generate and upload new keys
        const newPair = await generateAndUploadKeys(user.id);
        if (newPair) {
          setKeyPair(newPair);
        } else {
          console.error("Failed to initialize E2EE keys");
        }
      }

      setIsLoadingKeys(false);
    }

    initKeys();
  }, [user, isLoading]);

  return (
    <E2EEContext.Provider value={{ keyPair, isLoadingKeys }}>
      {children}
    </E2EEContext.Provider>
  );
}
