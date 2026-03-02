#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { AgentCommander } from './agents/AgentCommander.js';
import { SpecializedRobot, ROBOT_DEFINITIONS } from './agents/SpecializedRobots.js';
import { WhatsAppBridge } from './tools/WhatsAppBridge.js';
import { TelegramBridge } from './tools/TelegramBridge.js';
import { TUI } from './utils/TUI.js';

const program = new Command();
const CONFIG_PATH = path.join(process.cwd(), 'config', 'user-config.json');

program
    .name('deep-inspire')
    .description('Deep Inspire AI Agent Commander (Slime Agent Edition) v5.8')
    .version('5.8.0');

async function installROIC() {
    console.log(chalk.yellow('\n[Dependency] Installing ROIC (Deep-Deep Hyper Edition) as a default dependency...'));
    try {
        const roicPath = path.join(process.cwd(), 'deps', 'roic');
        if (!fs.existsSync(path.dirname(roicPath))) {
            fs.mkdirSync(path.dirname(roicPath), { recursive: true });
        }
        console.log(chalk.cyan('🚀 Cloning ROIC from GitHub...'));
        execSync('gh repo clone mohamed-dev-labs/roic deps/roic -- --force', { stdio: 'inherit' });
        console.log(chalk.cyan('📦 Installing ROIC dependencies...'));
        execSync('cd deps/roic && npm install && npm link', { stdio: 'inherit' });
        console.log(chalk.green('✅ ROIC installed and linked successfully!'));
    } catch (error) {
        console.log(chalk.red(`⚠️ ROIC installation skipped or failed: ${error.message}`));
    }
}

program
    .command('setup')
    .description('Initialize Commander, Local Models, ROIC, and API Keys')
    .action(async () => {
        console.log(chalk.bold.blue('\n--- Deep Inspire Robots v5.8.0 Setup ---'));
        await installROIC();

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'provider',
                message: 'Select Strategic AI Provider:',
                choices: ['google', 'openai', 'anthropic', 'xai', 'deepseek', 'openrouter', 'elevenlabs'],
            },
            {
                type: 'input',
                name: 'apiKey',
                message: 'Enter your AI API Key:',
                default: 'MANUS_DEFAULT'
            },
            {
                type: 'input',
                name: 'model',
                message: 'Enter Model Name (optional):',
                default: (ans) => {
                    if (ans.provider === 'google') return 'gemini-1.5-flash';
                    if (ans.provider === 'xai') return 'grok-beta';
                    if (ans.provider === 'deepseek') return 'deepseek-chat';
                    if (ans.provider === 'openrouter') return 'meta-llama/llama-3-70b-instruct';
                    return 'gpt-4.1-mini';
                },
            },
            {
                type: 'confirm',
                name: 'setupLocal',
                message: 'Would you like to setup local models (Ollama)?',
                default: false
            }
        ]);

        if (answers.setupLocal) {
            const localAnswers = await inquirer.prompt([
                {
                    type: 'checkbox',
                    name: 'families',
                    message: 'Select Model Families to install:',
                    choices: ['Qwen Coder', 'Llama Family', 'Mistral Family', 'DeepSeek Family', 'Qwen Family']
                },
                {
                    type: 'list',
                    name: 'params',
                    message: 'Select Parameter Size:',
                    choices: ['1.5B', '3B', '7B', '8B', '14B', '32B', '70B']
                }
            ]);
            answers.localModels = localAnswers;
        }

        if (!fs.existsSync(path.dirname(CONFIG_PATH))) {
            fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
        }
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(answers, null, 2));
        console.log(chalk.green('\n✅ System Initialized! Use "deep-inspire gui" to start the interface.'));
    });

program
    .command('gui')
    .description('Start the Deep Inspire Graphical Terminal Interface (TUI)')
    .action(() => {
        if (!fs.existsSync(CONFIG_PATH)) {
            console.log(chalk.red('❌ Error: Configuration not found. Run "deep-inspire setup".'));
            return;
        }
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        const gui = new TUI(config);
        gui.render();
    });

program
    .command('run')
    .description('Execute a mission through the CLI')
    .argument('<task...>', 'Task description')
    .action(async (taskArray) => {
        const task = taskArray.join(' ');
        if (!fs.existsSync(CONFIG_PATH)) {
            console.log(chalk.red('❌ Error: Configuration not found. Run "deep-inspire setup".'));
            return;
        }
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        const commander = new AgentCommander(config);
        ROBOT_DEFINITIONS.forEach(def => {
            commander.registerRobot(def.name, new SpecializedRobot(config, def.name, def.expertise, def.layer));
        });
        console.log(chalk.blue(`\n🚀 Deploying Mission: ${task}`));
        try {
            const result = await commander.delegateTask(task);
            console.log(chalk.green('\n--- Mission Report ---'));
            console.log(result);
        } catch (error) {
            console.log(chalk.red('\n❌ Critical Failure:'), error.message);
        }
    });

program
    .command('whatsapp')
    .description('Start the WhatsApp Bridge')
    .action(async () => {
        const { phone } = await inquirer.prompt([{ type: 'input', name: 'phone', message: 'Enter your WhatsApp number:' }]);
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        const commander = new AgentCommander(config);
        ROBOT_DEFINITIONS.forEach(def => {
            commander.registerRobot(def.name, new SpecializedRobot(config, def.name, def.expertise, def.layer));
        });
        const bridge = new WhatsAppBridge(commander);
        await bridge.init();
    });

program
    .command('telegram')
    .description('Start the Telegram Bridge')
    .action(async () => {
        const { token } = await inquirer.prompt([{ type: 'input', name: 'token', message: 'Enter your Telegram Bot Token:' }]);
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        const commander = new AgentCommander(config);
        ROBOT_DEFINITIONS.forEach(def => {
            commander.registerRobot(def.name, new SpecializedRobot(config, def.name, def.expertise, def.layer));
        });
        const bridge = new TelegramBridge(commander, token);
        bridge.init();
    });

program.parse(process.argv);
