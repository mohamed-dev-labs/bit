import blessed from 'blessed';
import chalk from 'chalk';

export class TUI {
    constructor() {
        this.screen = blessed.screen({
            smartCSR: true,
            title: 'DEEP INSPIRE - AI AGENT COMMANDER',
            fullUnicode: true
        });

        this.initLayout();
        this.setupKeybinds();
    }

    initLayout() {
        // Header
        this.header = blessed.box({
            top: 0,
            left: 'center',
            width: '100%',
            height: 3,
            content: '{center}{bold}DEEP INSPIRE{/bold}{/center}',
            tags: true,
            style: {
                fg: '#66ccff',
                bold: true
            }
        });

        // Sub-Header (Status)
        this.statusBox = blessed.box({
            top: 3,
            left: 'center',
            width: '100%',
            height: 2,
            content: ' : Agent Status : {green-fg}Active{/green-fg} | : VLS Environment : {green-fg}Running{/green-fg}',
            tags: true,
            style: { fg: '#ffffff' }
        });

        // Left Panel: Active Bots
        this.leftPanel = blessed.list({
            top: 5,
            left: 0,
            width: '25%',
            height: '70%',
            label: ' Active Bots ',
            border: { type: 'line' },
            style: {
                border: { fg: '#333333' },
                label: { fg: '#ffff66', bold: true }
            },
            items: [
                ' {green-fg}✔{/green-fg} Linux Bot',
                ' {yellow-fg}○{/yellow-fg} Search Bot',
                ' {yellow-fg}○{/yellow-fg} Browsing Bot',
                ' {yellow-fg}○{/yellow-fg} Security Bot'
            ],
            tags: true
        });

        // Center Panel: Console/Execution
        this.consoleBox = blessed.box({
            top: 5,
            left: '25%',
            width: '50%',
            height: '70%',
            label: ' Agent Execution ',
            border: { type: 'line' },
            scrollable: true,
            alwaysScroll: true,
            scrollbar: { ch: ' ', inverse: true },
            style: {
                border: { fg: '#333333' },
                label: { fg: '#66ff66', bold: true }
            },
            content: '1. Code Repository Setup\n2. Framework Installation\n3. Task Automation\n4. System Monitoring\n5. Secure Sandbox Execution\n\nInstalling Next.js in VLS...\nFetching installation command...\nExecuting: npx create-next-app@latest .\nNext.js has been successfully installed!\nSetup Complete.',
            tags: true
        });

        // Right Panel: Tasks
        this.rightPanel = blessed.box({
            top: 5,
            right: 0,
            width: '25%',
            height: '70%',
            label: ' Tasks ',
            border: { type: 'line' },
            style: {
                border: { fg: '#333333' },
                label: { fg: '#ffcc66', bold: true }
            },
            content: '{green-fg}✔{/green-fg} Linux Bot\n   Finished: Installed Next.js\n\n{blue-fg}⚙{/blue-fg} Search Bot\n   Analyzing online sources...\n\n{blue-fg}⚙{/blue-fg} Browsing Bot\n   Scraping web pages...',
            tags: true
        });

        // Bottom Bar (Buttons/Tabs)
        this.bottomBar = blessed.box({
            bottom: 3,
            left: 0,
            width: '100%',
            height: 3,
            content: ' [ Agent ]   [ Models settings ]   [ Skills ] ',
            style: {
                fg: '#ffffff',
                bg: '#111111'
            }
        });

        // Input Box
        this.inputBox = blessed.textbox({
            bottom: 0,
            left: 0,
            width: '100%',
            height: 3,
            label: ' Input command here... ',
            border: { type: 'line' },
            inputOnFocus: true,
            style: {
                border: { fg: '#333333' }
            }
        });

        // Add to screen
        this.screen.append(this.header);
        this.screen.append(this.statusBox);
        this.screen.append(this.leftPanel);
        this.screen.append(this.consoleBox);
        this.screen.append(this.rightPanel);
        this.screen.append(this.bottomBar);
        this.screen.append(this.inputBox);
    }

    setupKeybinds() {
        this.screen.key(['escape', 'q', 'C-c'], () => {
            return process.exit(0);
        });

        this.inputBox.on('submit', (value) => {
            this.log(`> ${value}`);
            this.inputBox.clearValue();
            this.inputBox.focus();
            this.screen.render();
        });
    }

    log(message) {
        const lines = this.consoleBox.getContent().split('\n');
        lines.push(message);
        if (lines.length > 50) lines.shift();
        this.consoleBox.setContent(lines.join('\n'));
        this.consoleBox.setScrollPerc(100);
        this.screen.render();
    }

    render() {
        this.screen.render();
        this.inputBox.focus();
    }
}
