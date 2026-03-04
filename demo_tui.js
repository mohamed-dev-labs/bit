import { TUI } from './src/utils/TUI.js';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'config', 'user-config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

// Mock Commander for Demo
const mockCommander = {
    delegateTask: async (task) => {
        return "This is a mock response for the task: " + task;
    }
};

const gui = new TUI(config, mockCommander);
gui.render();

// After 2 seconds, log something to show it works
setTimeout(() => {
    gui.log("{cyan-fg}System:{/cyan-fg} Demo mode active. Interface initialized successfully.");
    gui.log("{green-fg}Agent:{/green-fg} Ready for mission deployment.");
    gui.screen.render();
}, 1000);

// Keep alive for a bit to capture screenshot if needed, then exit
setTimeout(() => {
    process.exit(0);
}, 5000);
