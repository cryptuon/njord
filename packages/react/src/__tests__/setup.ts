import { vi } from "vitest";
import { Keypair, PublicKey } from "@solana/web3.js";

// Mock @solana/wallet-adapter-react
vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: vi.fn(() => ({
    publicKey: null,
    connected: false,
    connecting: false,
    disconnecting: false,
    wallet: null,
    wallets: [],
    select: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    sendTransaction: vi.fn(),
    signTransaction: vi.fn(),
    signAllTransactions: vi.fn(),
    signMessage: vi.fn(),
  })),
  useConnection: vi.fn(() => ({
    connection: {
      getAccountInfo: vi.fn().mockResolvedValue(null),
      getBalance: vi.fn().mockResolvedValue(1000000000),
      getLatestBlockhash: vi.fn().mockResolvedValue({
        blockhash: "mock-blockhash",
        lastValidBlockHeight: 1000,
      }),
    },
  })),
}));

// Mock @njord/sdk
vi.mock("@njord/sdk", () => ({
  NjordClient: vi.fn().mockImplementation(() => ({
    deriveProtocolConfigPda: vi.fn(() => Keypair.generate().publicKey),
    deriveCampaignPda: vi.fn(() => Keypair.generate().publicKey),
    deriveAffiliateProfilePda: vi.fn(() => Keypair.generate().publicKey),
  })),
  NJORD_PROGRAM_ID: "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
  AffiliateTier: {
    New: 0,
    Verified: 1,
    Trusted: 2,
    Elite: 3,
  },
  BridgeTier: {
    Bronze: 0,
    Silver: 1,
    Gold: 2,
    Platinum: 3,
  },
  CommissionType: {
    Percentage: 0,
    Flat: 1,
    Tiered: 2,
  },
  AttributionStatus: {
    Pending: 0,
    Challenged: 1,
    Settled: 2,
    Rejected: 3,
    Refunded: 4,
  },
  ChallengeStatus: {
    Pending: 0,
    EvidenceSubmitted: 1,
    Resolved: 2,
    Expired: 3,
  },
}));

// Mock localStorage with actual storage behavior
const localStorageStore: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key];
  }),
  clear: vi.fn(() => {
    Object.keys(localStorageStore).forEach((key) => {
      delete localStorageStore[key];
    });
  }),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock fetch
global.fetch = vi.fn();

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  // Clear localStorage store
  Object.keys(localStorageStore).forEach((key) => {
    delete localStorageStore[key];
  });
});
