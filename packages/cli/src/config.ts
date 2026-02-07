/**
 * Config loader for TrenchSniper CLI
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import { Keypair } from '@solana/web3.js';

export interface TrenchConfig {
  rpc: {
    mainnet: string;
    devnet?: string;
  };
  jito?: {
    blockEngine: string;
    tip: number;
  };
  wallets: {
    main: string; // Base58 private key or path to keypair file
    snipe?: string[]; // Additional wallets for multi-wallet sniping
  };
  defaults: {
    slippageBps: number;
    priorityFee: number;
    network: 'mainnet' | 'devnet';
  };
}

const DEFAULT_CONFIG: TrenchConfig = {
  rpc: {
    mainnet: 'https://api.mainnet-beta.solana.com',
    devnet: 'https://api.devnet.solana.com',
  },
  wallets: {
    main: '',
  },
  defaults: {
    slippageBps: 100,
    priorityFee: 5000,
    network: 'mainnet',
  },
};

/**
 * Load config from YAML file
 */
export async function loadConfig(configPath: string): Promise<TrenchConfig> {
  if (!existsSync(configPath)) {
    console.warn(`Config file not found at ${configPath}, using defaults`);
    return DEFAULT_CONFIG;
  }

  try {
    const content = await readFile(configPath, 'utf-8');
    const parsed = parseYaml(content) as Partial<TrenchConfig>;
    
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      rpc: { ...DEFAULT_CONFIG.rpc, ...parsed.rpc },
      wallets: { ...DEFAULT_CONFIG.wallets, ...parsed.wallets },
      defaults: { ...DEFAULT_CONFIG.defaults, ...parsed.defaults },
    };
  } catch (error) {
    console.error(`Error loading config: ${error}`);
    return DEFAULT_CONFIG;
  }
}

/**
 * Load keypair from config
 */
export function loadKeypair(keyOrPath: string): Keypair {
  // Try as base58 first
  try {
    const decoded = Buffer.from(keyOrPath, 'base64');
    if (decoded.length === 64) {
      return Keypair.fromSecretKey(decoded);
    }
  } catch {
    // Not base64
  }

  // Try as JSON array
  try {
    const parsed = JSON.parse(keyOrPath);
    if (Array.isArray(parsed)) {
      return Keypair.fromSecretKey(Uint8Array.from(parsed));
    }
  } catch {
    // Not JSON
  }

  // Try as file path
  try {
    const content = require('fs').readFileSync(keyOrPath, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return Keypair.fromSecretKey(Uint8Array.from(parsed));
    }
  } catch {
    // Not a valid file
  }

  throw new Error(`Unable to load keypair from: ${keyOrPath}`);
}

/**
 * Create example config file
 */
export function getExampleConfig(): string {
  return `# TrenchSniper OS Configuration
# Copy this file to trench.yaml and fill in your values

rpc:
  mainnet: "https://api.mainnet-beta.solana.com"
  # Use a premium RPC for better performance:
  # mainnet: "https://your-rpc-provider.com"

jito:
  blockEngine: "https://mainnet.block-engine.jito.wtf"
  tip: 10000  # Tip in lamports

wallets:
  # Your main wallet - can be base64 key, JSON array, or file path
  main: "/path/to/keypair.json"
  # Additional wallets for multi-wallet sniping
  snipe:
    - "/path/to/wallet1.json"
    - "/path/to/wallet2.json"

defaults:
  slippageBps: 100      # 1% slippage
  priorityFee: 5000     # Priority fee in lamports
  network: mainnet      # mainnet or devnet
`;
}
