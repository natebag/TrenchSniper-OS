/**
 * Shield Detector - Honeypot and rug detection
 */
import { Connection, PublicKey } from '@solana/web3.js';
import {
  ShieldCheck,
  RiskFlags,
  TokenSafetyScore,
  HONEYPOT_THRESHOLD,
  WARNING_THRESHOLD,
  SAFE_THRESHOLD,
  RISK_WEIGHTS,
} from './types.js';

export interface TokenAccountInfo {
  mintAuthority: string | null;
  freezeAuthority: string | null;
  supply: bigint;
  decimals: number;
}

export interface MarketInfo {
  liquidityLocked: boolean;
  liquidityUsd: number;
  devWalletHoldings: number; // % of total supply
  topHolderPercent: number; // % held by top 10 wallets
  burnAmount: bigint;
}

export interface FeeInfo {
  buyFee: number; // %
  sellFee: number; // %
  transferFee: number; // %
  isSellDisabled: boolean;
  isTransferDisabled: boolean;
}

/**
 * Check token mint authority
 * Returns risk score 0-25
 */
async function checkMintAuthority(
  tokenInfo: TokenAccountInfo
): Promise<ShieldCheck> {
  const flags: string[] = [];
  let riskScore = 0;

  if (tokenInfo.mintAuthority === null) {
    return {
      pass: true,
      score: 0,
      flags: ['mint_authority_revoked'],
    };
  }

  riskScore += RISK_WEIGHTS.ONEPOINT;
  flags.push('has_mint_authority');

  return {
    pass: false,
    score: riskScore,
    flags,
    details: {
      mintAuthority: tokenInfo.mintAuthority,
    },
  };
}

/**
 * Check freeze authority
 * Returns risk score 0-15
 */
async function checkFreezeAuthority(
  tokenInfo: TokenAccountInfo
): Promise<ShieldCheck> {
  const flags: string[] = [];
  let riskScore = 0;

  if (tokenInfo.freezeAuthority === null) {
    return {
      pass: true,
      score: 0,
      flags: ['freeze_authority_revoked'],
    };
  }

  riskScore += RISK_WEIGHTS.FREEZE;
  flags.push('has_freeze_authority');

  return {
    pass: false,
    score: riskScore,
    flags,
    details: {
      freezeAuthority: tokenInfo.freezeAuthority,
    },
  };
}

/**
 * Check transfer/sell fees
 * Returns risk score 0-30
 */
async function checkFees(feeInfo: FeeInfo): Promise<ShieldCheck> {
  const flags: string[] = [];
  let riskScore = 0;

  if (feeInfo.isSellDisabled) {
    return {
      pass: false,
      score: RISK_WEIGHTS.HONEYPOT,
      flags: ['sell_disabled'],
      details: { reason: 'Cannot sell tokens' },
    };
  }

  if (feeInfo.sellFee > 25) {
    riskScore += RISK_WEIGHTS.HONEYPOT;
    flags.push('extreme_sell_fee');
  } else if (feeInfo.sellFee > 10) {
    riskScore += RISK_WEIGHTS.SEVERE - 10;
    flags.push('high_sell_fee');
  }

  if (feeInfo.buyFee > 10) {
    riskScore += RISK_WEIGHTS.MODERATE;
    flags.push('high_buy_fee');
  }

  if (feeInfo.transferFee > 5) {
    riskScore += RISK_WEIGHTS.SEVERE;
    flags.push('high_transfer_fee');
  }

  if (feeInfo.buyFee !== feeInfo.sellFee) {
    flags.push('asymmetric_fees');
  }

  return {
    pass: riskScore < WARNING_THRESHOLD,
    score: riskScore,
    flags,
    details: {
      buyFee: feeInfo.buyFee,
      sellFee: feeInfo.sellFee,
      transferFee: feeInfo.transferFee,
    },
  };
}

/**
 * Check liquidity status
 * Returns risk score 0-20
 */
async function checkLiquidity(marketInfo: MarketInfo): Promise<ShieldCheck> {
  const flags: string[] = [];
  let riskScore = 0;

  if (!marketInfo.liquidityLocked) {
    riskScore += RISK_WEIGHTS.HIGH;
    flags.push('liquidity_unlocked');
  }

  if (marketInfo.liquidityUsd < 1000) {
    riskScore += RISK_WEIGHTS.SEVERE;
    flags.push('low_liquidity');
  }

  if (marketInfo.liquidityUsd < 10000) {
    riskScore += RISK_WEIGHTS.MODERATE;
    flags.push('limited_liquidity');
  }

  return {
    pass: riskScore < WARNING_THRESHOLD,
    score: riskScore,
    flags,
    details: {
      liquidityUsd: marketInfo.liquidityUsd,
      liquidityLocked: marketInfo.liquidityLocked,
    },
  };
}

/**
 * Check dev and whale holdings
 * Returns risk score 0-15
 */
async function checkHoldings(marketInfo: MarketInfo): Promise<ShieldCheck> {
  const flags: string[] = [];
  let riskScore = 0;

  if (marketInfo.devWalletHoldings > 10) {
    riskScore += RISK_WEIGHTS.HIGH;
    flags.push('dev_holding_excessive');
  } else if (marketInfo.devWalletHoldings > 5) {
    riskScore += RISK_WEIGHTS.MODERATE;
    flags.push('dev_holding_high');
  }

  if (marketInfo.topHolderPercent > 30) {
    riskScore += RISK_WEIGHTS.HIGH;
    flags.push('whale_concentration_high');
  } else if (marketInfo.topHolderPercent > 20) {
    riskScore += RISK_WEIGHTS.MODERATE;
    flags.push('whale_concentration_moderate');
  }

  return {
    pass: riskScore < WARNING_THRESHOLD,
    score: riskScore,
    flags,
    details: {
      devHoldings: marketInfo.devWalletHoldings,
      topHolderPercent: marketInfo.topHolderPercent,
    },
  };
}

/**
 * Run full shield check
 */
export async function runShieldCheck(
  tokenInfo: TokenAccountInfo,
  feeInfo: FeeInfo,
  marketInfo: MarketInfo
): Promise<TokenSafetyScore> {
  const checks = await Promise.all([
    checkMintAuthority(tokenInfo),
    checkFreezeAuthority(tokenInfo),
    checkFees(feeInfo),
    checkLiquidity(marketInfo),
    checkHoldings(marketInfo),
  ]);

  const totalRisk = checks.reduce((sum, c) => sum + c.score, 0);

  const isHoneypot =
    totalRisk >= HONEYPOT_THRESHOLD || checks.some((c) => c.flags.includes('sell_disabled'));
  const isWarning = totalRisk >= WARNING_THRESHOLD && totalRisk < HONEYPOT_THRESHOLD;
  const isSafe = totalRisk < WARNING_THRESHOLD;

  return {
    score: totalRisk,
    passed: isSafe,
    isHoneypot,
    isWarning,
    checks: {
      mintAuthority: checks[0],
      freezeAuthority: checks[1],
      fees: checks[2],
      liquidity: checks[3],
      holdings: checks[4],
    },
    timestamp: Date.now(),
  };
}

/**
 * Quick risk assessment
 */
export function assessRisk(safetyScore: TokenSafetyScore): RiskFlags {
  if (safetyScore.isHoneypot) {
    return {
      risk: 'critical',
      emoji: '🚫',
      message: 'HONEYPOT DETECTED - DO NOT TRADE',
    };
  }

  if (safetyScore.isWarning) {
    return {
      risk: 'warning',
      emoji: '⚠️',
      message: 'RISK DETECTED - PROCEED WITH CAUTION',
    };
  }

  if (safetyScore.score < SAFE_THRESHOLD) {
    return {
      risk: 'safe',
      emoji: '✅',
      message: 'NO SIGNIFICANT RISKS DETECTED',
    };
  }

  return {
    risk: 'low',
    emoji: '✅',
    message: 'MINIMAL RISKS - ACCEPTABLE',
  };
}

/**
 * Format shield report for display
 */
export function formatShieldReport(score: TokenSafetyScore): string {
  const risk = assessRisk(score);
  let report = `${risk.emoji} *SHIELD CHECK: ${risk.message}*

`;

  report += `📊 Risk Score: *${score.score}/100*

`;

  // Failed checks
  const failed = Object.entries(score.checks).filter(([, c]) => !c.pass);
  if (failed.length > 0) {
    report += '*Risk Factors:*\n';
    for (const [, check] of failed) {
      for (const flag of check.flags) {
        report += `• ${flag.replace(/_/g, ' ')} (+${check.score} risk)\n`;
      }
    }
    report += '
';
  }

  // Passed checks
  const passed = Object.entries(score.checks).filter(([, c]) => c.pass);
  if (passed.length > 0) {
    report += '*Verified Safe:*\n';
    for (const [, check] of passed) {
      if (check.flags.length > 0) {
        report += `• ${check.flags[0].replace(/_/g, ' ')}\n`;
      }
    }
    report += '
';
  }

  report += `🕐 Checked: ${new Date(score.timestamp).toISOString()}`;

  return report;
}
