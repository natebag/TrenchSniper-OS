# TrenchSniper OS 🎯

**Open-source alternative to Proxima.tools for Solana token launching and sniping.**

> Democratize the trenches. Free the tools.

## Overview

TrenchSniper OS provides professional-grade token launching, sniping, and trading tools for the Solana ecosystem - **completely free and open source**.

While paid tools like Proxima charge hundreds per month for access, TrenchSniper OS puts the same capabilities in everyone's hands.

## Features

### ✅ Completed
- **Token Creation**: Launch tokens on PumpFun with metadata upload
- **PumpFun Trading**: Buy/sell on bonding curves
- **Raydium Trading**: AMM pool swaps with quote calculation
- **Meteora DLMM**: Concentrated liquidity pool trading
- **Smart Router**: Auto-route to best DEX with migration detection
- **Strategy Configs**: Pre-built aggressive/balanced/conservative strategies
- **Wallet Management**: HD generation, AES-256 encryption, batch operations
- **Jito Bundles**: MEV protection through Jito bundle builder
- **Multi-Wallet**: Coordinated sniping across multiple wallets
- **CLI**: Full command-line interface

### 📋 Planned
- Web UI dashboard
- Telegram bot interface
- Portfolio analytics

## Quick Start

```bash
# Clone and install
git clone https://github.com/natebag/TrenchSniper-OS.git
cd TrenchSniper-OS
pnpm install
pnpm build
```

### Configuration

Copy the example config and edit with your settings:

```bash
cp trench.example.yaml trench.yaml
```

```yaml
# trench.yaml
rpc:
  mainnet: "https://your-rpc-endpoint.com"

wallets:
  main: "/path/to/keypair.json"
  snipe:
    - "/path/to/wallet1.json"
    - "/path/to/wallet2.json"

strategy: balanced  # aggressive | balanced | conservative
```

### CLI Usage

```bash
# Snipe a token on PumpFun
pnpm cli snipe <TOKEN_MINT> --amount 0.1 --slippage 100

# Snipe with multiple wallets
pnpm cli snipe <TOKEN_MINT> --amount 0.1 --wallets 3

# Snipe with Jito MEV protection
pnpm cli snipe <TOKEN_MINT> --amount 0.1 --jito --tip 10000

# Exit a position (sell tokens)
pnpm cli exit <TOKEN_MINT> --percent 100

# Generate new wallets
pnpm cli wallet --generate 5
```

## New Features

### 🚀 Token Creation on PumpFun

```typescript
import { createToken, TokenCreator } from '@trenchsniper/core';

const result = await createToken(connection, {
  wallet,
  metadata: {
    name: 'My Token',
    symbol: 'MTK',
    description: 'A cool token',
    twitter: '@mytoken',
    telegram: 't.me/mytoken',
    website: 'https://mytoken.com',
  },
});

console.log('Token created:', result.mint.toString());
```

### 🔄 Smart Router with Migration Detection

```typescript
import { SmartRouter, router } from '@trenchsniper/core';

// Auto-detect best DEX
const bestDex = await router.getBestDex(connection, tokenMint);

// Detect if token migrated from PumpFun to Raydium
const migration = await router.detectPoolMigration(connection, tokenMint);
if (migration.migrated) {
  console.log(`Migrated from ${migration.from} to ${migration.to}`);
}

// Get best quote across all DEXs
const quote = await router.getBestQuote(connection, {
  inputMint: SOL_MINT,
  outputMint: tokenMint,
  amount: 1_000_000_000, // 1 SOL in lamports
  slippageBps: 100,
});
```

### 📊 Multi-DEX Trading

```typescript
import { raydium, meteora } from '@trenchsniper/core';

// Raydium AMM swap
const rayQuote = await raydium.getQuote(connection, params);
const rayResult = await raydium.swap(connection, { wallet, quote: rayQuote });

// Meteora DLMM swap
const metQuote = await meteora.getQuote(connection, params);
const metResult = await meteora.swap(connection, { wallet, quote: metQuote });
```

### 📋 Strategy Configs

Pre-built strategies in `packages/cli/src/strategies/`:

| Strategy | Risk | Buy Size | Take Profit | Stop Loss |
|----------|------|----------|-------------|-----------|
| Aggressive | High | 0.5 SOL | 2x | 50% |
| Balanced | Medium | 0.25 SOL | 1.75x | 40% |
| Conservative | Low | 0.1 SOL | 1.5x | 30% |

```typescript
import { loadStrategyByName } from '@trenchsniper/cli/strategies';

const strategy = loadStrategyByName('aggressive');
console.log(strategy.autoSell.takeProfitMultiplier); // 2.0
```

## Architecture

```
TrenchSniper-OS/
├── packages/
│   ├── core/           # Core trading modules
│   │   └── src/
│   │       ├── wallet/    # Wallet generation & management
│   │       ├── trading/   # Trading types
│   │       └── snipe/
│   │           ├── pumpfun.ts  # PumpFun bonding curve
│   │           ├── create.ts   # Token creation
│   │           ├── raydium.ts  # Raydium AMM
│   │           ├── meteora.ts  # Meteora DLMM
│   │           └── router.ts   # Smart router
│   │
│   ├── snipe/          # Sniping engine
│   │   └── src/
│   │       ├── sniper.ts  # TokenSniper class
│   │       └── jito.ts    # Jito bundle builder
│   │
│   └── cli/            # Command line interface
│       └── src/
│           ├── commands/     # CLI commands
│           └── strategies/   # Strategy configs
│
└── trench.example.yaml # Example configuration
```

## Packages

### @trenchsniper/core

Core trading functionality:

```typescript
import { 
  // PumpFun
  PumpFunClient,
  buy, sell, isOnPumpFun,
  
  // Token Creation
  TokenCreator, createToken, uploadMetadata,
  
  // Raydium
  raydium,
  
  // Meteora
  meteora,
  
  // Smart Router
  router, SmartRouter,
} from '@trenchsniper/core';
```

### @trenchsniper/snipe

High-level sniping engine with multi-wallet coordination and Jito support.

### @trenchsniper/cli

Full CLI with strategy support.

## Contributing

This is an open-source project. Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Disclaimer

This software is for educational purposes. Use at your own risk. Always DYOR before trading.

## License

MIT - Free for everyone.

---

**Powered by the BagBros collective** 🤖💼
