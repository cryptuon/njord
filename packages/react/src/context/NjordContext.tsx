import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { Connection } from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { NjordClient, NJORD_PROGRAM_ID } from "@njord/sdk";

export interface NjordContextState {
  client: NjordClient | null;
  isConnected: boolean;
  isInitialized: boolean;
  programId: string;
  indexerUrl?: string;
}

const NjordContext = createContext<NjordContextState | null>(null);

export interface NjordProviderProps {
  children: ReactNode;
  programId?: string;
  indexerUrl?: string;
}

export function NjordProvider({
  children,
  programId = NJORD_PROGRAM_ID,
  indexerUrl,
}: NjordProviderProps) {
  const { connection } = useConnection();
  const wallet = useWallet();

  const client = useMemo(() => {
    if (!connection) return null;

    return new NjordClient({
      connection,
      wallet: wallet.connected ? wallet : undefined,
      programId,
    });
  }, [connection, wallet, wallet.connected, programId]);

  const value: NjordContextState = useMemo(
    () => ({
      client,
      isConnected: wallet.connected,
      isInitialized: !!client,
      programId,
      indexerUrl,
    }),
    [client, wallet.connected, programId, indexerUrl]
  );

  return (
    <NjordContext.Provider value={value}>{children}</NjordContext.Provider>
  );
}

export function useNjordContext(): NjordContextState {
  const context = useContext(NjordContext);
  if (!context) {
    throw new Error("useNjordContext must be used within a NjordProvider");
  }
  return context;
}

export function useNjordClient(): NjordClient {
  const { client } = useNjordContext();
  if (!client) {
    throw new Error("NjordClient not initialized. Ensure wallet is connected.");
  }
  return client;
}
