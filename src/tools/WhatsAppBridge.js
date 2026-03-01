import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import chalk from 'chalk';
import inquirer from 'inquirer';

export class WhatsAppBridge {
    constructor(commander) {
        this.commander = commander;
        this.client = null;
    }

    async init() {
        console.log(chalk.blue('\n[WhatsAppBridge] Starting Setup...'));
        
        const { phoneNumber } = await inquirer.prompt([
            {
                type: 'input',
                name: 'phoneNumber',
                message: 'Enter your WhatsApp Phone Number (with country code, e.g., 2010...):',
                validate: (value) => value.length > 5 || 'Please enter a valid phone number'
            }
        ]);

        console.log(chalk.cyan(`\n[WhatsAppBridge] Initializing for ${phoneNumber}...`));

        this.client = new Client({
            authStrategy: new LocalAuth({ clientId: phoneNumber }),
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        this.client.on('qr', (qr) => {
            console.log(chalk.yellow('\n--- ACTION REQUIRED ---'));
            console.log(chalk.cyan('Scan this QR code with your WhatsApp to link Deep Inspire:'));
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            console.log(chalk.green(`\n✅ WhatsApp Bridge is ONLINE for ${phoneNumber}!`));
        });

        this.client.on('message', async (msg) => {
            if (msg.body.toLowerCase().startsWith('run deep inspire')) {
                const task = msg.body.replace(/run deep inspire/i, '').trim();
                console.log(chalk.magenta(`[WhatsApp] Received Task: ${task}`));
                
                msg.reply('🤖 Deep Inspire (Slime Agent) is processing your request...');
                try {
                    const result = await this.commander.delegateTask(task);
                    msg.reply(`✅ Mission Report:\n\n${result}`);
                } catch (error) {
                    msg.reply(`❌ Mission Failed: ${error.message}`);
                }
            }
        });

        await this.client.initialize();
    }
}
