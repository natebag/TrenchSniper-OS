/**
 * TrenchSniper OS CLI
 * Command-line interface for token sniping operations
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig } from './config.js';
import { snipeCommand } from './commands/snipe.js';
import { launchCommand } from './commands/launch.js';
import { exitCommand } from './commands/exit.js';
import { walletCommand } from './commands/wallet.js';

const VERSION = '0.0.1';

const program = new Command();

program
  .name('trench')
  .description(chalk.cyan('🎯 TrenchSniper OS - Solana Token Sniper'))
  .version(VERSION)
  .option('-c, --config <path>', 'Path to config file', 'trench.yaml')
  .option('-v, --verbose', 'Enable verbose logging', false);

// Snipe command - buy tokens on PumpFun
program
  .command('snipe <mint>')
  .description('Snipe a token on PumpFun bonding curve')
  .option('-a, --amount <sol>', 'Amount of SOL to spend', '0.1')
  .option('-s, --slippage <bps>', 'Slippage in basis points', '100')
  .option('-w, --wallets <count>', 'Number of wallets to use', '1')
  .option('--jito', 'Use Jito bundles for MEV protection', false)
  .option('--tip <lamports>', 'Jito tip amount in lamports', '10000')
  .action(async (mint, options) => {
    const config = await loadConfig(program.opts().config);
    await snipeCommand(mint, { ...options, config });
  });

// Launch command - create new token on PumpFun
program
  .command('launch')
  .description('Launch a new token on PumpFun')
  .option('-n, --name <name>', 'Token name')
  .option('-s, --symbol <symbol>', 'Token symbol')
  .option('-d, --description <desc>', 'Token description')
  .option('-i, --image <path>', 'Path to token image')
  .option('--dev-buy <sol>', 'Dev buy amount in SOL', '0')
  .action(async (options) => {
    const config = await loadConfig(program.opts().config);
    await launchCommand({ ...options, config });
  });

// Exit command - sell all or partial position
program
  .command('exit <mint>')
  .description('Exit a token position')
  .option('-p, --percent <pct>', 'Percentage to sell (1-100)', '100')
  .option('-w, --wallets <indices>', 'Specific wallet indices to exit', 'all')
  .option('--jito', 'Use Jito bundles', false)
  .action(async (mint, options) => {
    const config = await loadConfig(program.opts().config);
    await exitCommand(mint, { ...options, config });
  });

// Wallet command - manage wallets
program
  .command('wallet')
  .description('Wallet management commands')
  .option('-g, --generate <count>', 'Generate new wallets')
  .option('-l, --list', 'List all wallets')
  .option('-b, --balance', 'Show wallet balances')
  .option('-f, --fund <amount>', 'Fund wallets with SOL')
  .option('--collect', 'Collect all SOL to main wallet')
  .action(async (options) => {
    const config = await loadConfig(program.opts().config);
    await walletCommand({ ...options, config });
  });

// Parse and execute
program.parse();
