import { TUI } from './src/utils/TUI.js';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'config', 'user-config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

// Mock Commander that simulates real thinking and robot deployment
const mockCommander = {
    delegateTask: async (task) => {
        console.log("{cyan-fg}[Commander]{/cyan-fg} Analyzing Mission: \"" + task + "\"");
        await new Promise(r => setTimeout(r, 1000));
        console.log("{magenta-fg}[Orchestration]{/magenta-fg} Deploying Linux Bot for execution...");
        await new Promise(r => setTimeout(r, 1000));
        console.log("{green-fg}[Linux Bot]{/green-fg} Executing shell commands in VLS...");
        await new Promise(r => setTimeout(r, 1000));
        return "Mission Accomplished: Task \"" + task + "\" executed successfully in the sandbox environment.";
    }
};

const gui = new TUI(config, mockCommander);
gui.render();

// Simulate user inputting a command after 1 second
setTimeout(async () => {
    const testCommand = "Install and configure Next.js project";
    gui.log("{blue-fg}User:{/blue-fg} " + testCommand);
    await gui.processCommand(testCommand);
    gui.screen.render();
}, 1000);

// Keep alive to see the result, then exit
setTimeout(() => {
    process.exit(0);
}, 8000);
