import blessed from 'blessed';
import chalk from 'chalk';

/**
 * BIT TUI - Professional AI Agent Commander Interface
 * Inspired by Open Code (Open Interpreter) and the provided design template.
 */
export class TUI {
    constructor(config = {}, commander = null) {
        this.config = config;
        this.commander = commander;
        this.screen = blessed.screen({
            smartCSR: true,
            title: 'DEEP INSPIRE - AI AGENT COMMANDER',
            fullUnicode: true,
            dockBorders: true,
            style: {
                bg: '#0d1117' // GitHub Dark Background
            }
        });

        this.initLayout();
        this.setupKeybinds();
    }

    initLayout() {
        // Main Container
        this.mainContainer = blessed.box({
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            style: { bg: '#0d1117' }
        });

        // Header - "DEEP INSPIRE" (Pixel/Retro Style Font Simulation)
        this.header = blessed.box({
            top: 1,
            left: 'center',
            width: '100%',
            height: 5,
            content: '{center}{bold}DEEP INSPIRE{/bold}{/center}',
            tags: true,
            style: {
                fg: '#58a6ff', // Professional Blue
                bold: true
            }
        });

        // Status Indicators (Agent Status & VLS Environment)
        this.statusBox = blessed.box({
            top: 6,
            left: 'center',
            width: '40%',
            height: 3,
            content: '{white-fg}: Agent Status : {/white-fg}{green-fg}Active{/green-fg}\n{white-fg}: VLS Environment : {/white-fg}{green-fg}Running{/green-fg}',
            tags: true,
            style: { fg: '#ffffff' }
        });

        // Left Panel: Active Bots
        this.leftPanel = blessed.box({
            top: 10,
            left: 2,
            width: '25%',
            height: '70%',
            label: ' {yellow-fg}Active Bots{/yellow-fg} ',
            border: { type: 'line' },
            style: {
                border: { fg: '#30363d' },
                label: { bold: true }
            }
        });

        this.botList = blessed.list({
            parent: this.leftPanel,
            top: 1,
            left: 1,
            width: '95%',
            height: '90%',
            items: [
                ' {green-fg}✔{/green-fg} Linux Bot',
                '   {grey-fg}→ Execution Shell{/grey-fg}',
                '',
                ' {white-fg}○{/white-fg} Search Bot',
                '   {grey-fg}→ Research Assistant{/grey-fg}',
                '',
                ' {white-fg}○{/white-fg} Browsing Bot',
                '   {grey-fg}→ Web Interaction Tool{/grey-fg}',
                '',
                ' {white-fg}○{/white-fg} Security Bot',
                '   {grey-fg}→ Threat Monitor{/grey-fg}'
            ],
            tags: true,
            style: {
                selected: { bg: '#161b22' }
            }
        });

        // Center Panel: Agent Execution (Console)
        this.consoleBox = blessed.box({
            top: 10,
            left: '28%',
            width: '44%',
            height: '70%',
            label: ' {green-fg}Agent Execution{/green-fg} ',
            border: { type: 'line' },
            scrollable: true,
            alwaysScroll: true,
            scrollbar: { ch: ' ', inverse: true },
            style: {
                border: { fg: '#30363d' },
                label: { bold: true }
            },
            tags: true
        });

        // Initial Console Content (Simulating the template)
        this.consoleBox.setContent(
            '1. Code Repository Setup\n' +
            '2. Framework Installation\n' +
            '3. Task Automation\n' +
            '4. System Monitoring\n' +
            '5. Secure Sandbox Execution\n\n' +
            '{green-fg}→ Installing Next.js in VLS...{/green-fg}\n' +
            'Fetching installation command...\n\n' +
            'Executing: {bold}npx create-next-app@latest .{/bold}\n\n' +
            '{green-fg}Next.js has been successfully installed!{/green-fg}\n' +
            '{green-fg}Setup Complete.{/green-fg}\n' +
            '█'
        );

        // Right Panel: Tasks
        this.rightPanel = blessed.box({
            top: 10,
            right: 2,
            width: '25%',
            height: '70%',
            label: ' {white-fg}Tasks{/white-fg} ',
            border: { type: 'line' },
            style: {
                border: { fg: '#30363d' },
                label: { bold: true }
            },
            tags: true
        });

        this.taskList = blessed.box({
            parent: this.rightPanel,
            top: 1,
            left: 1,
            width: '95%',
            height: '90%',
            content: 
                '{green-fg}✔{/green-fg} {bold}Linux Bot{/bold}\n' +
                '   Finished: Installed Next.js\n' +
                '   in VLS\n' +
                '   {grey-fg}Task Complete{/grey-fg}\n\n' +
                '{cyan-fg}⟳{/cyan-fg} {bold}Search Bot{/bold}\n' +
                '   Analyzing online sources\n' +
                '   for latest AI research...\n\n' +
                '{cyan-fg}⟳{/cyan-fg} {bold}Browsing Bot{/bold}\n' +
                '   Scraping web pages for\n' +
                '   VLS documentation...\n\n' +
                '{white-fg}○{/white-fg} {bold}Security Bot{/bold}',
            tags: true
        });

        // Bottom Navigation Bar
        this.bottomBar = blessed.box({
            bottom: 4,
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

        // Input Area
        this.inputContainer = blessed.box({
            bottom: 0,
            left: 2,
            width: '96%',
            height: 4,
            border: { type: 'line' },
            style: {
                border: { fg: '#30363d' }
            }
        });

        this.inputLabel = blessed.text({
            parent: this.inputContainer,
            top: 0,
            left: 1,
            content: ' Input command here... ',
            style: { fg: '#8b949e' }
        });

        this.inputBox = blessed.textbox({
            parent: this.inputContainer,
            top: 1,
            left: 1,
            width: '90%',
            height: 1,
            inputOnFocus: true,
            style: {
                fg: '#c9d1d9'
            }
        });

        this.sendButton = blessed.box({
            parent: this.inputContainer,
            top: 0,
            right: 1,
            width: 5,
            height: 2,
            content: ' ➤ ',
            style: {
                fg: '#ffffff',
                bg: '#238636', // Green button like the image
                bold: true
            },
            tags: true
        });

        // Append all to screen
        this.screen.append(this.mainContainer);
        this.mainContainer.append(this.header);
        this.mainContainer.append(this.statusBox);
        this.mainContainer.append(this.leftPanel);
        this.mainContainer.append(this.consoleBox);
        this.mainContainer.append(this.rightPanel);
        this.mainContainer.append(this.bottomBar);
        this.mainContainer.append(this.inputContainer);
    }

    setupKeybinds() {
        this.screen.key(['escape', 'q', 'C-c'], () => {
            return process.exit(0);
        });

        this.inputBox.on('submit', (value) => {
            if (value.trim()) {
                this.log(`{blue-fg}User:{/blue-fg} ${value}`);
                this.processCommand(value);
            }
            this.inputBox.clearValue();
            this.inputBox.focus();
            this.screen.render();
        });

        // Focus input on any key if not focused
        this.screen.on('keypress', () => {
            if (!this.inputBox.focused) {
                this.inputBox.focus();
            }
        });
    }

    async processCommand(cmd) {
        if (!this.commander) {
            this.log(`{red-fg}Error:{/red-fg} Agent Commander not initialized.`);
            return;
        }

        this.statusBox.setContent('{white-fg}: Agent Status : {/white-fg}{yellow-fg}Thinking...{/yellow-fg}\n{white-fg}: VLS Environment : {/white-fg}{green-fg}Running{/green-fg}');
        this.screen.render();

        try {
            // Redirect console.log to our TUI log
            const originalLog = console.log;
            console.log = (...args) => {
                const msg = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
                // Clean chalk codes for blessed tags if necessary, or just wrap
                this.log(`{grey-fg}${msg.replace(/\{/g, '[')}{/grey-fg}`);
            };

            const result = await this.commander.delegateTask(cmd);
            
            console.log = originalLog; // Restore

            this.log(`\n{green-fg}--- Mission Report ---{/green-fg}\n${result}`);
            
            // Update Task List
            const currentTasks = this.taskList.getContent();
            this.taskList.setContent(`{green-fg}✔{/green-fg} {bold}Last Task{/bold}\n   ${cmd.substring(0, 30)}...\n   {grey-fg}Completed{/grey-fg}\n\n` + currentTasks);

        } catch (error) {
            this.log(`{red-fg}Critical Failure:{/red-fg} ${error.message}`);
        } finally {
            this.statusBox.setContent('{white-fg}: Agent Status : {/white-fg}{green-fg}Active{/green-fg}\n{white-fg}: VLS Environment : {/white-fg}{green-fg}Running{/green-fg}');
            this.screen.render();
        }
    }

    log(message) {
        const content = this.consoleBox.getContent();
        const newContent = content + '\n' + message;
        this.consoleBox.setContent(newContent);
        this.consoleBox.setScrollPerc(100);
        this.screen.render();
    }

    render() {
        this.screen.render();
        this.inputBox.focus();
    }
}
