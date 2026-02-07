# TrenchSniper OS 🎯

**Open-source alternative to Proxima.tools for Solana token launching and sniping.**

> Democratize the trenches. Free the tools.

## Overview

TrenchSniper OS provides professional-grade token launching, sniping, and market making tools for the Solana ecosystem - **completely free and open source**.

While paid tools like Proxima charge hundreds per month for access, TrenchSniper OS puts the same capabilities in everyone's hands.

## Features

### ✅ Completed
- **Wallet Management**: HD generation, AES-256 encryption, batch operations
- **Core Infrastructure**: Multi-wallet coordination, transaction bundling
- **Snipe Module**: PumpFun bonding curve integration

### 🚧 In Progress
- PumpFun sniping engine
- Multi-DEX routing (Jupiter, Raydium, Meteora)
- Jito bundle execution
- CLI commands (snipe, launch, exit)

### 📋 Planned
- Web UI dashboard
- Telegram bot interface
- Allium-powered detection
- Portfolio analytics

## Quick Start

```bash
# Clone and install
git clone https://github.com/natebag/TrenchSniper-OS.git
cd TrenchSniper-OS
pnpm install
pnpm build

# Run CLI
pnpm cli snipe --help
```

## Architecture

```
TrenchSniper-OS/
├── packages/
│   ├── core/       # Wallet, encryption, connections
│   ├── snipe/      # Token sniping, supply control
│   ├── mm/         # Market making (from OrbitMM)
│   ├── cli/        # Command line interface
│   └── ui/         # Web interface (coming soon)
└── docs/          # Documentation
```

## Contributing

This is an open-source project. Contributions welcome!

## License

MIT - Free for everyone.

---

**Powered by the BagBros collective** 🤖💼
