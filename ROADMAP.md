# TrenchSniper OS Roadmap

Features mapped against Proxima.tools capabilities.

## ✅ IMPLEMENTED (v0.1.0)

| Feature | Status | Notes |
|---------|--------|-------|
| Token Launch on PumpFun | ✅ | IPFS metadata, bonding curve |
| PumpFun Trading | ✅ | Buy/sell with slippage |
| Raydium AMM Trading | ✅ | Pool discovery + swaps |
| Meteora DLMM | ✅ | Concentrated liquidity |
| Smart Router | ✅ | Auto-routing, migration detection |
| Multi-Wallet | ✅ | HD generation, encryption |
| Jito Bundles | ✅ | MEV protection |
| Telegram Bot | ✅ | Alerts, control, portfolio |
| Auto-Sniper | ✅ | Mempool monitoring, rules |
| Web UI Dashboard | ✅ | Vite + React, dark mode |
| Strategy Configs | ✅ | Aggressive/Balanced/Conservative |

---

## 🚧 IN PROGRESS / PLANNED

### 🔥 CRITICAL - Live Settings Panel

| Feature | Proxima Equivalent | Status | Spec |
|---------|-------------------|--------|------|
| **Sell** | 🟪 Sell | ✅ | Basic sell (exists in core) |
| **Auto-Sell** | 🟪 Auto-Sell | ❌ | Triggered sell on % targets |
| **Sell ALL** | 🟪 Sell ALL | ❌ | Emergency exit all positions |
| **Auto-Sell Engine** | 🟦 Auto-Sell on Launch | ❌ | TP/SL automation post-launch |
| **P&L Cards** | 🟪 P&L Cards | ❌ | Realized/unrealized tracking |

### 🛡️ SAFETY & PROTECTION

| Feature | Proxima Equivalent | Status | Spec |
|---------|-------------------|--------|------|
| **Sniper Guard** | 🟦 Sniper Guard | ❌ | Launch protection (SEE BELOW) |
| **Shield** | 🟧 Shield | ❌ | Honeypot/rug detection |

### 💰 REVENUE & SUPPLY MANAGEMENT

| Feature | Proxima Equivalent | Status | Spec |
|---------|-------------------|--------|------|
| **Claim Creator Fees** | 🟪 Claim Creator Fees | ❌ | Collect bonding curve fees |
| **Send Tokens** | 🟪 Send Tokens | ❌ | Airdrop/transfers |
| **Burn Supply** | 🟪 Burn Supply | ❌ | Token burning |
| **Buyback** | 🟪 Buyback | ❌ | Treasury buyback |
| **Lock Supply** | 🟪 Lock Supply (Streamflow) | ❌ | LP token locking |
| **Withdraw** | 🟪 Withdraw | ❌ | Wallet fund extraction |

### 🔄 UPDATES & MARKETING

| Feature | Proxima Equivalent | Status | Spec |
|---------|-------------------|--------|------|
| **Update DexScreener** | 🟪 Update DexScreener | ❌ | Refresh metadata |
| **Wallet Activity Gen** | Generate Activity | ❌ | Fake tx history for stealth |

### 🟢 NICE-TO-HAVE

| Feature | Proxima Equivalent | Status | Notes |
|---------|-------------------|--------|-------|
| **Referral System** | 🟩 Referral | ❌ | Affiliate tracking |
| **Account Statistics** | 🟩 Account Statistics | ❌ | Analytics dashboard |
| **Archived Launches** | ⬜️ Archived / Deleted | ❌ | Archive management |

---

## 📋 Detailed Feature Specs

### Sniper Guard 🛡️

**Purpose:** Launch protection against sniper bots

**How it works:**
- Monitors external SOL buys during launch phase
- Tracks only wallets NOT in launch plan
- Triggers action when threshold exceeded

**Configuration:**
- **Max External SOL:** Threshold for trigger (e.g., 4 SOL)
- **Trigger Modes:**
  - `STOP_BUYING` - Pause launch wallet buys
  - `EMERGENCY_EXIT` - Sell all positions (panic button)
- **Dev Wallet Protection:** Exclude dev wallet from Sell All
- **Whitelist:** Addresses that don't count as "external" (dev, funder, MEV, holders)

**Notes:**
- Only monitors - doesn't block protocol-level transactions
- Reacts within execution layer only
- All actions logged to launch activity

### Auto-Sell 💰

**Purpose:** Automated position management

**Triggers:**
- Take Profit: Sell when price reaches X% gain
- Stop Loss: Sell when price drops Y% from entry
- Time-based: Sell after Z minutes

**Configuration:**
```yaml
auto_sell:
  take_profit: 200        # % gain to trigger
  stop_loss: -50          # % drop to trigger
  trailing_stop: 10       # % trailing from peak
  time_limit: 3600        # seconds
  partial_sells:          # DCA out
    - { at: 100, pct: 25 }
    - { at: 300, pct: 50 }
```

### Sell ALL 🚨

**Purpose:** Emergency exit everything

**Behavior:**
- Execute sell across ALL wallet positions
- Sells token for SOL
- Can exclude specific wallets (dev, treasury)
- Irreversible once triggered

### P&L Cards 📊

**Purpose:** Track trading performance

**Data Points:**
- Realized P&L (completed trades)
- Unrealized P&L (open positions)
- Entry price vs current price
- Total SOL spent vs SOL received
- % gain/loss per token
- Aggregate portfolio view

### Creator Fee Claim 💵

**Purpose:** Collect bonding curve fees

**What:**
- Claim fees earned from bonding curve trades
- Available after migration to Raydium
- Requires creator wallet signature

### Token Transfers 📤

**Purpose:** Distribute tokens

**Operations:**
- Send tokens to specified addresses
- Batch transfers (airdrops)
- Dev wallet exclusion options

### Supply Burn 🔥

**Purpose:** Reduce token supply

**Operations:**
- Burn tokens from wallet
- Burn LP tokens
- Permanent removal from circulation

### Buyback 🔄

**Purpose:** Treasury token purchase

**Configuration:**
- Source wallet (treasury)
- Target token
- Buy amount/budget
- Slippage tolerance

### LP Token Lock 🔒

**Purpose:** Lock liquidity via Streamflow

**Integration:**
- Streamflow protocol
- Vest or lock LP tokens
- Time-based unlock schedule

---

## 📊 Feature Coverage

```
Core Trading:      ████████████████████ 100%
Token Launch:      ███████████████████░ 90%  (Sniper Guard needed)
Wallet Mgmt:       █████████████████░░░ 80%  (Withdraw, transfers)
Live Settings:     ███████████████░░░░░ 75%  (Auto-sell, P&L missing)
Safety Features:   ████████░░░░░░░░░░░░ 40%  (Shield, Sniper Guard)
Revenue Features:  ██████░░░░░░░░░░░░░░ 30%  (Fees, buyback, burn)
Supply Mgmt:       ████████░░░░░░░░░░░░ 40%  (Lock, burn, transfers)
```

---

## 🎯 v0.2.0 Sprint Plan

**Phase 1 - Live Controls (Week 1):**
1. Auto-Sell engine (TP/SL)
2. Sell ALL functionality
3. P&L tracking/cards

**Phase 2 - Safety (Week 1-2):**
4. Sniper Guard implementation
5. Shield/honeypot detection

**Phase 3 - Revenue (Week 2):**
6. Creator fee claiming
7. Token transfers
8. Supply burn

**Phase 4 - Advanced (Week 2-3):**
9. LP token locking
10. Buyback functionality
11. DexScreener updates

---

## 🤝 Contributing

Priority features need implementation:
- Auto-Sell engine (scheduled/async)
- Sniper Guard monitoring
- P&L calculation engine
- Shield/honeypot detection

See individual spec sections above for requirements.

---

*Last updated: 2026-02-07*
