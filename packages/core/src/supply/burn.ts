/**
 * Burn Supply Module - Token burning for supply reduction
 */
import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createBurnInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

export interface BurnConfig {
  tokenMint: string;
  amount: bigint;
  ownerWallet: string; // Must hold the tokens
  confirm?: boolean; // Wait for confirmation
}

export interface BurnResult {
  success: boolean;
  txSignature?: string;
  tokenMint: string;
  amountBurned: bigint;
  owner: string;
  newSupply?: bigint;
  error?: string;
}

export interface BurnSummary {
  totalBurned: bigint;
  burnCount: number;
  burns: BurnResult[];
}

/**
 * Burn tokens from wallet
 * Permanently removes from circulation
 */
export async function burnTokens(
  connection: Connection,
  config: BurnConfig,
  signer: any
): Promise<BurnResult> {
  try {
    const owner = new PublicKey(config.ownerWallet);
    const mint = new PublicKey(config.tokenMint);

    // Get token account
    const tokenAccount = await getAssociatedTokenAddress(mint, owner);

    // Check balance
    try {
      const balance = await connection.getTokenAccountBalance(tokenAccount);
      if (BigInt(balance.value.amount) < config.amount) {
        return {
          success: false,
          tokenMint: config.tokenMint,
          amountBurned: BigInt(0),
          owner: config.ownerWallet,
          error: `Insufficient balance: have ${balance.value.amount}, need ${config.amount}`,
        };
      }
    } catch {
      return {
        success: false,
        tokenMint: config.tokenMint,
        amountBurned: BigInt(0),
        owner: config.ownerWallet,
        error: 'Token account not found',
      };
    }

    // Create burn instruction
    const tx = new Transaction().add(
      createBurnInstruction(
        tokenAccount,
        mint,
        owner,
        config.amount,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Send transaction
    const signature = await sendAndConfirmTransaction(connection, tx, [signer], {
      commitment: 'confirmed',
    });

    // Get new supply
    let newSupply: bigint | undefined;
    try {
      const mintInfo = await connection.getParsedAccountInfo(mint);
      if (mintInfo.value && 'parsed' in mintInfo.value.data) {
        newSupply = BigInt(mintInfo.value.data.parsed.info.supply);
      }
    } catch {
      // Ignore
    }

    return {
      success: true,
      txSignature: signature,
      tokenMint: config.tokenMint,
      amountBurned: config.amount,
      owner: config.ownerWallet,
      newSupply,
    };
  } catch (error: any) {
    return {
      success: false,
      tokenMint: config.tokenMint,
      amountBurned: BigInt(0),
      owner: config.ownerWallet,
      error: error.message || 'Burn failed',
    };
  }
}

/**
 * Burn LP tokens
 * Removes liquidity from circulation
 */
export async function burnLPTokens(
  connection: Connection,
  lpTokenMint: string,
  amount: bigint,
  ownerWallet: string,
  signer: any
): Promise<BurnResult> {
  return burnTokens(connection, {
    tokenMint: lpTokenMint,
    amount,
    ownerWallet,
  }, signer);
}

/**
 * Batch burn tokens from multiple sources
 */
export async function batchBurn(
  connection: Connection,
  burns: BurnConfig[],
  signer: any
): Promise<BurnSummary> {
  const results: BurnResult[] = [];
  let totalBurned = BigInt(0);

  for (const burn of burns) {
    const result = await burnTokens(connection, burn, signer);
    results.push(result);

    if (result.success) {
      totalBurned += result.amountBurned;
    }
  }

  return {
    totalBurned,
    burnCount: results.filter(r => r.success).length,
    burns: results,
  };
}

/**
 * Calculate burn percentage
 */
export function calculateBurnPercent(totalSupply: bigint, burned: bigint): number {
  if (totalSupply === BigInt(0)) return 0;
  return Number((burned * BigInt(10000)) / totalSupply) / 100;
}

/**
 * Format burn result
 */
export function formatBurnResult(result: BurnResult): string {
  if (result.success) {
    let msg = `🔥 Burn Successful\n` +
      `Amount: ${result.amountBurned.toString()}\n` +
      `Owner: ${result.owner.slice(0, 6)}...${result.owner.slice(-4)}\n` +
      `TX: ${result.txSignature?.slice(0, 16)}...`;

    if (result.newSupply !== undefined) {
      msg += `\nNew Supply: ${result.newSupply.toString()}`;
    }

    return msg;
  }
  return `❌ Burn Failed: ${result.error}`;
}

/**
 * Format burn summary
 */
export function formatBurnSummary(summary: BurnSummary): string {
  const success = summary.burns.filter(b => b.success).length;
  const rate = (success / summary.burns.length * 100).toFixed(1);

  return `🔥 Burn Summary\n` +
    `Total: ${summary.burnCount} successful\n` +
    `Success Rate: ${rate}%\n` +
    `Total Burned: ${summary.totalBurned.toString()}`;
}
