/**
 * TrenchSniper Wallet Generator
 * 
 * Generates Solana keypairs using random generation (default) or HD derivation.
 * Ported from OrbitMM and enhanced for TrenchSniper OS.
 */

import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import {
  GenerateOptions,
  WalletData,
  InvalidMnemonicError,
  InvalidCountError,
  DerivationError,
  MAX_WALLET_COUNT,
  SOLANA_DERIVATION_PATH,
} from './types.js';

/**
 * Generate wallets using random keypairs or HD derivation.
 * 
 * @param options - Generation options
 * @returns Array of generated Keypairs
 * @throws {InvalidMnemonicError} If HD derivation with invalid mnemonic
 * @throws {InvalidCountError} If count < 0 or count > 10000
 */
export function generate(options: GenerateOptions): Keypair[] {
  const { count, derivation = 'random', hdSeed, startIndex = 0 } = options;

  // Validate count
  if (count < 0 || count > MAX_WALLET_COUNT) {
    throw new InvalidCountError(count);
  }

  // Zero count returns empty array (not an error per spec)
  if (count === 0) {
    return [];
  }

  // Route to appropriate generator
  if (derivation === 'hd') {
    if (!hdSeed) {
      throw new InvalidMnemonicError('HD derivation requires a mnemonic seed');
    }
    return generateHD(count, hdSeed, startIndex);
  }

  return generateRandom(count);
}

/**
 * Generate wallets using random keypairs.
 * 
 * @param count - Number of wallets to generate
 * @returns Array of randomly generated Keypairs
 */
export function generateRandom(count: number): Keypair[] {
  if (count < 0 || count > MAX_WALLET_COUNT) {
    throw new InvalidCountError(count);
  }
  
  if (count === 0) {
    return [];
  }

  const wallets: Keypair[] = [];
  for (let i = 0; i < count; i++) {
    wallets.push(Keypair.generate());
  }
  return wallets;
}

/**
 * Generate wallets using HD derivation from a BIP39 mnemonic.
 * Uses Solana's standard derivation path: m/44'/501'/{index}'/0'
 * 
 * @param count - Number of wallets to generate
 * @param mnemonic - BIP39 mnemonic seed phrase
 * @param startIndex - Starting derivation index (default: 0)
 * @returns Array of HD-derived Keypairs
 * @throws {InvalidMnemonicError} If mnemonic is invalid
 * @throws {DerivationError} If derivation fails
 */
export function generateHD(count: number, mnemonic: string, startIndex = 0): Keypair[] {
  if (count < 0 || count > MAX_WALLET_COUNT) {
    throw new InvalidCountError(count);
  }

  if (count === 0) {
    return [];
  }

  // Validate mnemonic
  if (!validateMnemonic(mnemonic)) {
    throw new InvalidMnemonicError();
  }

  // Convert mnemonic to seed
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const wallets: Keypair[] = [];

  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    const path = SOLANA_DERIVATION_PATH(index);
    
    try {
      const derived = derivePath(path, seed.toString('hex'));
      const keypair = Keypair.fromSeed(derived.key);
      wallets.push(keypair);
    } catch (error) {
      throw new DerivationError(path, error as Error);
    }
  }

  return wallets;
}

/**
 * Validate a BIP39 mnemonic.
 * 
 * @param mnemonic - Mnemonic phrase to validate
 * @returns true if valid, false otherwise
 */
export function validateMnemonic(mnemonic: string): boolean {
  if (!mnemonic || typeof mnemonic !== 'string') {
    return false;
  }
  return bip39.validateMnemonic(mnemonic.trim());
}

/**
 * Generate a new random BIP39 mnemonic.
 * 
 * @param strength - 128 for 12 words, 256 for 24 words (default: 128)
 * @returns Generated mnemonic phrase
 */
export function generateMnemonic(strength: 128 | 256 = 128): string {
  return bip39.generateMnemonic(strength);
}

/**
 * Convert a Keypair to WalletData format.
 * 
 * @param keypair - Solana Keypair
 * @param derivationPath - Optional HD derivation path
 * @returns WalletData object
 */
export function keypairToWalletData(keypair: Keypair, derivationPath?: string): WalletData {
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: keypair.secretKey,
    createdAt: Date.now(),
    derivationPath,
  };
}

/**
 * Convert WalletData back to a Keypair.
 * 
 * @param data - WalletData object
 * @returns Solana Keypair
 */
export function walletDataToKeypair(data: WalletData): Keypair {
  return Keypair.fromSecretKey(
    data.secretKey instanceof Uint8Array 
      ? data.secretKey 
      : new Uint8Array(Object.values(data.secretKey))
  );
}

/**
 * Convert array of Keypairs to WalletData array.
 * 
 * @param keypairs - Array of Keypairs
 * @param hdStartIndex - If HD wallets, starting index for derivation paths
 * @returns Array of WalletData objects
 */
export function keypairsToWalletData(
  keypairs: Keypair[], 
  hdStartIndex?: number
): WalletData[] {
  return keypairs.map((kp, idx) => {
    const derivationPath = hdStartIndex !== undefined 
      ? SOLANA_DERIVATION_PATH(hdStartIndex + idx) 
      : undefined;
    return keypairToWalletData(kp, derivationPath);
  });
}
