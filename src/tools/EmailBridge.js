import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import chalk from 'chalk';

/**
 * Email Bridge for BIT AI Agent
 * Handles Inbound (IMAP) and Outbound (SMTP) email communication.
 */
export class EmailBridge {
    constructor(commander, config) {
        this.commander = commander;
        this.config = config; // Contains userEmail, botEmail, appPassword
        this.isListening = false;
    }

    /**
     * Initialize the Email Listener (IMAP)
     */
    async init() {
        const imapConfig = {
            imap: {
                user: this.config.botEmail,
                password: this.config.appPassword,
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                authTimeout: 3000,
                tlsOptions: { rejectUnauthorized: false }
            }
        };

        try {
            const connection = await imaps.connect(imapConfig);
            console.log(chalk.green(`\n[Email Bridge] Connected to ${this.config.botEmail} (IMAP)`));
            
            await connection.openBox('INBOX');
            this.isListening = true;

            // Check for new messages every 30 seconds
            setInterval(async () => {
                if (!this.isListening) return;
                await this.checkNewEmails(connection);
            }, 30000);

            console.log(chalk.cyan(`[Email Bridge] Monitoring for commands from: ${this.config.userEmail}`));
        } catch (error) {
            console.error(chalk.red(`[Email Bridge Error] Connection failed: ${error.message}`));
        }
    }

    /**
     * Check for unread emails from the authorized user
     */
    async checkNewEmails(connection) {
        const searchCriteria = ['UNSEEN'];
        const fetchOptions = { bodies: ['HEADER', 'TEXT', ''], markSeen: true };

        try {
            const messages = await connection.search(searchCriteria, fetchOptions);
            
            for (const message of messages) {
                const all = message.parts.find(part => part.which === '');
                const mail = await simpleParser(all.body);
                
                const fromEmail = mail.from.value[0].address;
                const subject = mail.subject;
                const body = mail.text;

                // Security Check: Only process emails from the authorized user
                if (fromEmail.toLowerCase() === this.config.userEmail.toLowerCase()) {
                    console.log(chalk.blue(`\n[Email Bridge] New Mission Received: "${subject}"`));
                    this.handleMission(body || subject, fromEmail);
                } else {
                    console.log(chalk.yellow(`[Email Bridge] Ignored email from unauthorized sender: ${fromEmail}`));
                }
            }
        } catch (error) {
            console.error(chalk.red(`[Email Bridge Error] Search failed: ${error.message}`));
        }
    }

    /**
     * Process the mission and send back the report
     */
    async handleMission(task, senderEmail) {
        try {
            console.log(chalk.magenta(`[Email Bridge] Delegating task to Commander...`));
            const result = await this.commander.delegateTask(task);
            
            console.log(chalk.green(`[Email Bridge] Mission complete. Sending report to ${senderEmail}...`));
            await this.sendReport(senderEmail, task, result);
        } catch (error) {
            console.error(chalk.red(`[Email Bridge Error] Mission handling failed: ${error.message}`));
        }
    }

    /**
     * Send the final report via SMTP
     */
    async sendReport(to, originalTask, report) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.config.botEmail,
                pass: this.config.appPassword
            }
        });

        const mailOptions = {
            from: `"BIT Bot" <${this.config.botEmail}>`,
            to: to,
            subject: `✅ Mission Report: ${originalTask.substring(0, 30)}...`,
            html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #238636;">BIT AI Agent</h2>
                    <hr>
                    <p><strong>Original Mission:</strong> ${originalTask}</p>
                    <div style="background: #f6f8fa; padding: 15px; border-radius: 5px; border-left: 5px solid #58a6ff;">
                        <pre style="white-space: pre-wrap;">${report}</pre>
                    </div>
                    <p style="font-size: 0.8em; color: #888; margin-top: 20px;">
                        Sent automatically by BIT Agent Commander v5.9
                    </p>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(chalk.green(`[Email Bridge] Report sent successfully.`));
        } catch (error) {
            console.error(chalk.red(`[Email Bridge Error] SMTP failed: ${error.message}`));
        } finally {
            transporter.close();
        }
    }
}
