/**
 * Shared types for snipe package
 */

import { PublicKey, Keypair } from '@solana/web3.js';

export interface WalletBalance {
  address: string;
  solBalance: number;
  tokenBalance: bigint;
}

export interface TokenPosition {
  mint: PublicKey;
  totalTokens: bigint;
  totalSolInvested: number;
  averagePrice: number;
  currentPrice: number;
  pnlPercent: number;
  walletBalances: WalletBalance[];
}

export interface SnipeEvent {
  type: 'quote' | 'execute' | 'confirm' | 'error';
  wallet?: string;
  data?: any;
  error?: string;
  timestamp: number;
}

export type SnipeEventHandler = (event: SnipeEvent) => void;
