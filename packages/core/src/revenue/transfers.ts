/**
 * Token Transfers - Send tokens and airdrops
 */
import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

export interface TransferConfig {
  tokenMint: string;
  amount: bigint;
  senderWallet: string; // Private key or signer
  recipientAddress: string;
}

export interface BatchTransferConfig {
  tokenMint: string;
  senderWallet: string;
  recipients: {
    address: string;
    amount: bigint;
  }[];
  skipFailures?: boolean; // Continue if some fail
}

export interface TransferResult {
  success: boolean;
  txSignature?: string;
  from: string;
  to: string;
  amount: bigint;
  fee: number;
  error?: string;
}

export interface BatchTransferResult {
  total: number;
  successful: number;
  failed: number;
  results: TransferResult[];
  totalAmount: bigint;
  totalFees: number;
}

/**
 * Send tokens to single recipient
 */
export async function sendTokens(
  connection: Connection,
  config: TransferConfig,
  signer: any // Keypair or provider
): Promise<TransferResult> {
  try {
    const sender = new PublicKey(config.senderWallet);
    const recipient = new PublicKey(config.recipientAddress);
    const mint = new PublicKey(config.tokenMint);

    // Get token accounts
    const senderATA = await getAssociatedTokenAddress(mint, sender);
    const recipientATA = await getAssociatedTokenAddress(mint, recipient);

    const tx = new Transaction();

    // Check if recipient ATA exists
    const recipientAccount = await connection.getAccountInfo(recipientATA);
    if (!recipientAccount) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          sender,
          recipientATA,
          recipient,
          mint
        )
      );
    }

    // Add transfer
    tx.add(
      createTransferInstruction(
        senderATA,
        recipientATA,
        sender,
        config.amount,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Send transaction
    const signature = await sendAndConfirmTransaction(connection, tx, [signer]);

    return {
      success: true,
      txSignature: signature,
      from: config.senderWallet,
      to: config.recipientAddress,
      amount: config.amount,
      fee: 0.000005, // Approximate
    };
  } catch (error: any) {
    return {
      success: false,
      from: config.senderWallet,
      to: config.recipientAddress,
      amount: config.amount,
      fee: 0,
      error: error.message || 'Transfer failed',
    };
  }
}

/**
 * Batch send tokens (airdrop)
 */
export async function batchSendTokens(
  connection: Connection,
  config: BatchTransferConfig,
  signer: any
): Promise<BatchTransferResult> {
  const results: TransferResult[] = [];
  let totalAmount = BigInt(0);
  let totalFees = 0;

  for (const recipient of config.recipients) {
    const result = await sendTokens(connection, {
      tokenMint: config.tokenMint,
      amount: recipient.amount,
      senderWallet: config.senderWallet,
      recipientAddress: recipient.address,
    }, signer);

    results.push(result);

    if (result.success) {
      totalAmount += recipient.amount;
      totalFees += result.fee;
    } else if (!config.skipFailures) {
      // Stop on first failure
      break;
    }
  }

  const successful = results.filter((r) => r.success).length;

  return {
    total: config.recipients.length,
    successful,
    failed: config.recipients.length - successful,
    results,
    totalAmount,
    totalFees,
  };
}

/**
 * Prepare recipients from CSV format
 * address,amount
 */
export function parseRecipients(csv: string): { address: string; amount: bigint }[] {
  return csv
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [address, amountStr] = line.split(',').map((s) => s.trim());
      return {
        address,
        amount: BigInt(amountStr || '0'),
      };
    })
    .filter((r) => r.address && r.amount > BigInt(0));
}

/**
 * Format recipients for display
 */
export function formatRecipients(recipients: { address: string; amount: bigint }[]): string {
  if (recipients.length === 0) return 'No recipients';

  const total = recipients.reduce((sum, r) => sum + r.amount, BigInt(0));
  const preview = recipients.slice(0, 3);
  const remaining = recipients.length - 3;

  let output = `Recipients: ${recipients.length}\n`;
  output += `Total: ${total.toString()}\n\n`;

  for (const r of preview) {
    output += `${r.address.slice(0, 6)}...${r.address.slice(-4)}: ${r.amount.toString()}\n`;
  }

  if (remaining > 0) {
    output += `... and ${remaining} more`;
  }

  return output;
}

/**
 * Validate address list
 */
export function validateAddresses(addresses: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const addr of addresses) {
    try {
      new PublicKey(addr); // Validates format
      valid.push(addr);
    } catch {
      invalid.push(addr);
    }
  }

  return { valid, invalid };
}

/**
 * Transfer summary
 */
export function formatTransferSummary(result: TransferResult): string {
  if (result.success) {
    return `✅ Sent ${result.amount} tokens\n` +
      `From: ${result.from.slice(0, 6)}...${result.from.slice(-4)}\n` +
      `To: ${result.to.slice(0, 6)}...${result.to.slice(-4)}\n` +
      `Tx: ${result.txSignature?.slice(0, 16)}...\n` +
      `Fee: ${result.fee} SOL`;
  }
  return `❌ Transfer failed: ${result.error}`;
}

/**
 * Batch transfer summary
 */
export function formatBatchSummary(result: BatchTransferResult): string {
  const successRate = (result.successful / result.total * 100).toFixed(1);
  
  return `📦 Batch Transfer Summary\n` +
    `Total: ${result.total}\n` +
    `✅ Success: ${result.successful} (${successRate}%)\n` +
    `❌ Failed: ${result.failed}\n` +
    `💰 Total Sent: ${result.totalAmount.toString()}\n` +
    `💸 Total Fees: ${result.totalFees.toFixed(6)} SOL`;
}
