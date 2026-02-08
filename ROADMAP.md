# TrenchSniper OS Roadmap

Features mapped against Proxima.tools capabilities.

## ✅ IMPLEMENTED (v0.2.0) - COMPLETE

| Category | Feature | Status | Notes |
|----------|---------|--------|-------|
| **Trading** | PumpFun Bonding Curve | ✅ | Buy/sell, migration detection |
| **Trading** | Raydium AMM | ✅ | Pool discovery, swaps |
| **Trading** | Meteora DLMM | ✅ | Concentrated liquidity |
| **Trading** | Smart Router | ✅ | Auto-routing, DEX selection |
| **Trading** | Jito Bundles | ✅ | MEV protection |
| **Launch** | Token Creation | ✅ | PumpFun deployment, IPFS metadata |
| **Wallet** | HD Generation | ✅ | Mnemonic-based |
| **Wallet** | Encryption | ✅ | AES-256-GCM + Argon2id |
| **Wallet** | Batch Operations | ✅ | Multi-wallet coordination |
| **Sniper** | Token Sniper | ✅ | Multi-wallet sniping |
| **Sniper** | Auto-Sniper | ✅ | Mempool monitoring |
| **Sniper** | Auto-Sell Engine | ✅ | TP/SL/Trailing/Time-based/DCA |
| **Sniper** | Sell ALL | ✅ | Emergency exit all positions |
| **Protection** | Sniper Guard | ✅ | Launch protection, thresholds, whitelist |
| **Protection** | Shield | ✅ | Honeypot detection, risk scoring |
| **P&L** | Calculator | ✅ | Realized/unrealized tracking |
| **P&L** | Tracker | ✅ | Position summaries, portfolio reports |
| **Revenue** | Creator Fees | ✅ | Bonding curve fee claiming |
| **Revenue** | Transfers | ✅ | Single + batch (airdrops) |
| **Revenue** | Buyback | ✅ | Treasury purchases, DCA scheduling |
| **UI/Bot** | Telegram Bot | ✅ | Alerts, control, portfolio |
| **UI/Bot** | Web UI | ✅ | Vite + React dashboard |
| **UI/Bot** | CLI | ✅ | Full command-line interface |
| **Config** | Strategies | ✅ | aggressive/balanced/conservative |

---

## 🚧 REMAINING FEATURES

### 🟡 HIGH VALUE - Easy Wins

| Feature | Proxima | Status | Why Build? |
|---------|---------|--------|-----------|
| **Burn Supply** | 🟪 Burn Supply | ❌ | Token burning for supply reduction |
| **Withdraw** | 🟪 Withdraw | ❌ | Extract SOL from wallets |
| **Update DexScreener** | 🟪 Update DexScreener | ❌ | Refresh metadata on DexScreener |

### 🔵 MEDIUM VALUE

| Feature | Proxima | Status | Why Build? |
|---------|---------|--------|-----------|
| **Lock Supply (Streamflow)** | 🟪 Lock Supply | ❌ | Lock LP tokens for trust |
| **Wallet Activity Gen** | Generate Activity | ❌ | Fake tx history for stealth |
| **P&L Cards Display** | P&L Cards | ❌ | Pretty formatted P&L UI |

### 🟢 NICE-TO-HAVE

| Feature | Proxima | Status | Why Build? |
|---------|---------|--------|-----------|
| **Referral System** | 🟩 Referral | ❌ | Affiliate/referral tracking |
| **Account Statistics** | 🟩 Account Statistics | ❌ | Analytics dashboard |
| **Archived Launches** | ⬜️ Archived | ❌ | Archive management |

---

## 📊 Feature Coverage (Current)

```
Core Trading:      ████████████████████ 100% ✅
Token Launch:      ████████████████████ 100% ✅
Wallet Mgmt:       ████████████████████ 100% ✅
Auto-Trading:      ████████████████████ 100% ✅
Safety Features:   ████████████████████ 100% ✅
P&L Tracking:      ████████████████████ 100% ✅
Revenue Features:  ████████████████████ 100% ✅
UI/Bot:            ████████████████████ 100% ✅

Supply Mgmt:       ████████████████░░░░ 80% (missing: Burn, Lock)
Withdrawals:       ████████████░░░░░░░░ 60% (missing: Withdraw)
Marketing:         ██████████░░░░░░░░░░ 50% (missing: DexScreener, Activity Gen)
Referrals:         ████░░░░░░░░░░░░░░░░ 20% (missing: Full system)

OVERALL:           ██████████████████░░ 90%
```

---

## 🎯 v0.3.0 Roadmap (Optional)

### Quick Wins (1-2 days)
1. **Burn Supply** - Token burning module
2. **Withdraw** - SOL extraction from wallets
3. **Update DexScreener** - API integration for metadata refresh

### Medium Effort (3-5 days)
4. **LP Token Lock** - Streamflow integration
5. **Wallet Activity Generator** - Create fake tx history
6. **P&L Cards UI** - Pretty formatted displays

### Future (When Needed)
7. **Referral System** - Full affiliate tracking
8. **Account Statistics** - Analytics dashboard
9. **Archived Launches** - Archive management

---

## 📋 Feature Reference

### Burn Supply 🔥
**Purpose:** Reduce token supply permanently
**Operations:**
- Burn tokens from wallet holdings
- Burn LP tokens
- Permanent removal from circulation
**Spec:** Standard SPL token burn instruction

### Withdraw 💸
**Purpose:** Extract SOL from sniper wallets
**Operations:**
- Transfer SOL from wallet to destination
- Batch withdrawal across wallets
- Keep minimum balance for rent exemption
**Spec:** System transfer instruction

### Update DexScreener 🔄
**Purpose:** Refresh token metadata on DexScreener
**API:** DexScreener API endpoints
**Operations:**
- Upload logo/icon
- Update description
- Refresh social links
**Spec:** Requires API key and token ownership

### Lock Supply (Streamflow) 🔒
**Purpose:** Lock LP tokens for investor confidence
**Protocol:** Streamflow
**Operations:**
- Lock LP tokens for X days
- Time-based unlock schedule
- Emergency unlock (with penalty)
**Spec:** Streamflow contract integration

### Wallet Activity Generator 👻
**Purpose:** Make wallet look established/human
**Operations:**
- Generate small SOL transfers
- Create token swap history
- Spread across time period
**Spec:** Configurable tx count, amounts, time range

---

## ✅ COMPLETE - What's Live Now

TrenchSniper OS v0.2.0 is **production-ready**:

✅ **Trading** - Full DEX support (PumpFun, Raydium, Meteora)
✅ **Sniping** - Memepool monitoring, auto-buy, auto-sell
✅ **Protection** - Sniper Guard, Shield honeypot detection
✅ **Safety** - Stop loss, take profit, trailing stops, emergency exit
✅ **P&L** - Realized/unrealized tracking, portfolio reports
✅ **Revenue** - Creator fees, transfers, buyback
✅ **UI/Bot** - Web dashboard, Telegram bot, CLI

**Repo:** https://github.com/natebag/TrenchSniper-OS

---

*Last updated: 2026-02-07*
