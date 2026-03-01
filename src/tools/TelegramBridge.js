import TelegramBot from 'node-telegram-bot-api';
import chalk from 'chalk';
import inquirer from 'inquirer';

export class TelegramBridge {
    constructor(commander, token) {
        this.commander = commander;
        this.token = token;
        this.bot = null;
    }

    async init() {
        if (!this.token) {
            console.log(chalk.yellow('\n[TelegramBridge] No token found.'));
            const { inputToken } = await inquirer.prompt([
                {
                    type: 'password',
                    name: 'inputToken',
                    message: 'Enter your Telegram Bot Token (from BotFather):',
                    validate: (value) => value.length > 10 || 'Please enter a valid token'
                }
            ]);
            this.token = inputToken;
        }

        console.log(chalk.blue('\n[TelegramBridge] Connecting to Telegram...'));
        this.bot = new TelegramBot(this.token, { polling: true });

        this.bot.onText(/\/start/, (msg) => {
            this.bot.sendMessage(msg.chat.id, "🟢 Deep Inspire (Slime Agent) is ONLINE!\n\nI am your Agent Commander. Send me any task, and I will orchestrate my specialized robots.");
        });

        this.bot.on('message', async (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;

            if (text && !text.startsWith('/')) {
                console.log(chalk.magenta(`[Telegram] Received Task: ${text}`));
                this.bot.sendMessage(chatId, "🚀 Commander is analyzing and deploying robots...");
                
                try {
                    const result = await this.commander.delegateTask(text);
                    this.bot.sendMessage(chatId, `✅ Mission Report:\n\n${result}`);
                } catch (error) {
                    this.bot.sendMessage(chatId, `❌ Mission Failed: ${error.message}`);
                }
            }
        });

        console.log(chalk.green('✅ Telegram Bridge is ACTIVE!'));
    }
}
