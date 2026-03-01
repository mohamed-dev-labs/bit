import fs from 'fs';
import path from 'path';

export class MemoryManager {
    constructor() {
        this.memoryPath = path.join(process.cwd(), 'config', 'long-term-memory.json');
        this.init();
    }

    init() {
        if (!fs.existsSync(path.dirname(this.memoryPath))) {
            fs.mkdirSync(path.dirname(this.memoryPath), { recursive: true });
        }
        if (!fs.existsSync(this.memoryPath)) {
            fs.writeFileSync(this.memoryPath, JSON.stringify({ conversations: [], knowledge_base: {} }, null, 2));
        }
    }

    save(entry) {
        const data = JSON.parse(fs.readFileSync(this.memoryPath, 'utf-8'));
        data.conversations.push({
            timestamp: new Date().toISOString(),
            ...entry
        });
        // Keep only last 100 entries for efficiency
        if (data.conversations.length > 100) data.conversations.shift();
        fs.writeFileSync(this.memoryPath, JSON.stringify(data, null, 2));
    }

    recall() {
        const data = JSON.parse(fs.readFileSync(this.memoryPath, 'utf-8'));
        return data.conversations;
    }

    updateKnowledge(key, value) {
        const data = JSON.parse(fs.readFileSync(this.memoryPath, 'utf-8'));
        data.knowledge_base[key] = value;
        fs.writeFileSync(this.memoryPath, JSON.stringify(data, null, 2));
    }

    getKnowledge(key) {
        const data = JSON.parse(fs.readFileSync(this.memoryPath, 'utf-8'));
        return data.knowledge_base[key];
    }
}
