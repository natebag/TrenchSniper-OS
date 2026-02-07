/**
 * Alert Manager for Telegram Bot
 * Handles real-time notifications
 */
import { Bot } from 'grammy';
import { getConfig } from './config.js';

export type AlertType = 
  | 'price_movement'
  | 'migration_detected'
  | 'new_token'
  | 'tx_confirmed'
  | 'stop_loss'
  | 'take_profit';

export interface AlertData {
  type: AlertType;
  token?: string;
  tokenSymbol?: string;
  amount?: string;
  priceChange?: number;
  txHash?: string;
  timestamp: number;
}

export class AlertManager {
  private bot: Bot;
  private subscribers: Map<number, AlertType[]>;

  constructor(bot: Bot) {
    this.bot = bot;
    this.subscribers = new Map();
    this.loadSubscribers();
  }

  private loadSubscribers() {
    const config = getConfig();
    config.adminIds.forEach(id => {
      this.subscribers.set(id, 
        config.features.alerts 
          ? ['price_movement', 'migration_detected', 'new_token', 'tx_confirmed']
          : []
      );
    });
  }

  async subscribe(userId: number, alertTypes: AlertType[]) {
    this.subscribers.set(userId, alertTypes);
    return true;
  }

  async unsubscribe(userId: number, alertType?: AlertType) {
    if (alertType) {
      const current = this.subscribers.get(userId) || [];
      this.subscribers.set(userId, current.filter(t => t !== alertType));
    } else {
      this.subscribers.delete(userId);
    }
    return true;
  }

  async sendAlert(userId: number, alert: AlertData): Promise<boolean> {
    const userAlerts = this.subscribers.get(userId) || [];
    if (!userAlerts.includes(alert.type)) return false;

    const message = this.formatAlert(alert);
    try {
      await this.bot.api.sendMessage(userId, message, { parse_mode: 'HTML' });
      return true;
    } catch (error) {
      console.error(`Failed to send alert to ${userId}:`, error);
      return false;
    }
  }

  async broadcastAlert(alert: AlertData): Promise<number> {
    let sent = 0;
    for (const [userId, alerts] of this.subscribers) {
      if (alerts.includes(alert.type)) {
        const success = await this.sendAlert(userId, alert);
        if (success) sent++;
      }
    }
    return sent;
  }

  private formatAlert(alert: AlertData): string {
    const emoji: Record<AlertType, string> = {
      price_movement: '📈',
      migration_detected: '🚀',
      new_token: '🔥',
      tx_confirmed: '✅',
      stop_loss: '🛑',
      take_profit: '💰',
    };

    let message = `${emoji[alert.type]} <b>${this.getAlertTitle(alert.type)}</b>\n\n`;

    if (alert.token) {
      message += `🪙 Token: <code>${alert.token}</code>\n`;
    }
    if (alert.tokenSymbol) {
      message += `🏷️ Symbol: $${alert.tokenSymbol}\n`;
    }
    if (alert.amount) {
      message += `💵 Amount: ${alert.amount}\n`;
    }
    if (alert.priceChange !== undefined) {
      const sign = alert.priceChange >= 0 ? '+' : '';
      message += `📊 Price Change: ${sign}${alert.priceChange.toFixed(2)}%\n`;
    }
    if (alert.txHash) {
      message += `🔗 TX: <a href="https://solscan.io/tx/${alert.txHash}">View on Solscan</a>\n`;
    }

    message += `\n⏰ ${new Date(alert.timestamp).toLocaleString()}`;
    return message;
  }

  private getAlertTitle(type: AlertType): string {
    const titles: Record<AlertType, string> = {
      price_movement: 'Price Alert',
      migration_detected: 'Migration Alert!',
      new_token: 'New Token Detected',
      tx_confirmed: 'Transaction Confirmed',
      stop_loss: 'Stop Loss Triggered',
      take_profit: 'Take Profit Reached',
    };
    return titles[type];
  }
}
