import blessed from 'blessed';
import chalk from 'chalk';

export class TUI {
    constructor(config = {}) {
        this.config = config;
        this.screen = blessed.screen({
            smartCSR: true,
            title: 'DEEP INSPIRE - AI AGENT COMMANDER',
            fullUnicode: true,
            dockBorders: true
        });

        this.initLayout();
        this.setupKeybinds();
    }

    initLayout() {
        // Deep Dark Background for the whole screen
        this.screen.style.bg = '#0d1117';

        // Header - "DEEP INSPIRE" (Blue/Cyan Gradient Look)
        this.header = blessed.box({
            top: 0,
            left: 'center',
            width: '100%',
            height: 5,
            content: '{center}{bold}DEEP INSPIRE{/bold}{/center}',
            tags: true,
            style: {
                fg: '#58a6ff', // Light Blue like the image
                bold: true
            }
        });

        // Status Indicators
        this.statusBox = blessed.box({
            top: 5,
            left: 'center',
            width: '80%',
            height: 3,
            content: '{white-fg}: Agent Status : {/white-fg}{green-fg}Active{/green-fg}\n{white-fg}: VLS Environment : {/white-fg}{green-fg}Running{/green-fg}',
            tags: true,
            style: { fg: '#ffffff' }
        });

        // Left Panel: Active Bots (Yellow Header)
        this.leftPanel = blessed.list({
            top: 8,
            left: 2,
            width: '25%',
            height: '65%',
            label: ' {yellow-fg}Active Bots{/yellow-fg} ',
            border: { type: 'line' },
            style: {
                border: { fg: '#30363d' }, // Dark border
                label: { bold: true }
            },
            items: [
                ' {green-fg}✔{/green-fg} Linux Bot',
                ' {white-fg}→ Execution Shell{/white-fg}',
                ' {yellow-fg}○{/yellow-fg} Search Bot',
                ' {white-fg}→ Research Assistant{/white-fg}',
                ' {yellow-fg}○{/yellow-fg} Browsing Bot',
                ' {white-fg}→ Web Interaction Tool{/white-fg}',
                ' {yellow-fg}○{/yellow-fg} Security Bot',
                ' {white-fg}→ Threat Monitor{/white-fg}'
            ],
            tags: true
        });

        // Center Panel: Console/Execution (Green Header)
        this.consoleBox = blessed.box({
            top: 8,
            left: '28%',
            width: '44%',
            height: '65%',
            label: ' {green-fg}Agent Execution{/green-fg} ',
            border: { type: 'line' },
            scrollable: true,
            alwaysScroll: true,
            scrollbar: { ch: ' ', inverse: true },
            style: {
                border: { fg: '#30363d' },
                label: { bold: true }
            },
            content: '1. Code Repository Setup\n2. Framework Installation\n3. Task Automation\n4. System Monitoring\n5. Secure Sandbox Execution\n\n{green-fg}→ Installing Next.js in VLS...{/green-fg}\nFetching installation command...\n\nExecuting: {bold}npx create-next-app@latest .{/bold}\n\n{green-fg}Next.js has been successfully installed!{/green-fg}\n{green-fg}Setup Complete.{/green-fg}\n█',
            tags: true
        });

        // Right Panel: Tasks (Orange/Yellow Header)
        this.rightPanel = blessed.box({
            top: 8,
            right: 2,
            width: '25%',
            height: '65%',
            label: ' {orange-fg}Tasks{/orange-fg} ',
            border: { type: 'line' },
            style: {
                border: { fg: '#30363d' },
                label: { bold: true }
            },
            content: '{green-fg}✔{/green-fg} {bold}Linux Bot{/bold}\n   Finished: Installed Next.js\n   in VLS\n   Task Complete\n\n{blue-fg}⚙{/blue-fg} {bold}Search Bot{/bold}\n   Analyzing online sources\n   for latest AI research...\n\n{blue-fg}⚙{/blue-fg} {bold}Browsing Bot{/bold}\n   Scraping web pages for\n   VLS documentation...\n\n{white-fg}○{/white-fg} {bold}Security Bot{/bold}',
            tags: true
        });

        // Bottom Bar (Buttons/Tabs) - Professional Dark Look
        this.bottomBar = blessed.box({
            bottom: 3,
            left: 2,
            width: '96%',
            height: 3,
            content: ' {green-fg}[ Agent ]{/green-fg}   [ Models settings ]   [ Skills ] ',
            tags: true,
            style: {
                fg: '#8b949e',
                bg: '#161b22'
            }
        });

        // Input Box
        this.inputBox = blessed.textbox({
            bottom: 0,
            left: 2,
            width: '96%',
            height: 3,
            label: ' Input command here... ',
            border: { type: 'line' },
            inputOnFocus: true,
            style: {
                border: { fg: '#30363d' },
                fg: '#c9d1d9'
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
