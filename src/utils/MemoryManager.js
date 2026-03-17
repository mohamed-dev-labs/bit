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
            // Initial structure for long-term memory including conversations, knowledge base, and skills
            fs.writeFileSync(this.memoryPath, JSON.stringify({ conversations: [], knowledge_base: {}, skills: {} }, null, 2));
        }
    }

    // Saves a conversation entry to long-term memory
    saveConversation(entry) {
        const data = JSON.parse(fs.readFileSync(this.memoryPath, 'utf-8'));
        data.conversations.push({
            timestamp: new Date().toISOString(),
            ...entry
        });
        // No limit on conversations for permanent memory as requested
        fs.writeFileSync(this.memoryPath, JSON.stringify(data, null, 2));
    }

    // Recalls all stored conversations
    recallConversations() {
        const data = JSON.parse(fs.readFileSync(this.memoryPath, 'utf-8'));
        return data.conversations;
    }

    // Updates a specific knowledge entry
    updateKnowledge(key, value) {
        const data = JSON.parse(fs.readFileSync(this.memoryPath, 'utf-8'));
        data.knowledge_base[key] = value;
        fs.writeFileSync(this.memoryPath, JSON.stringify(data, null, 2));
    }

    // Retrieves a specific knowledge entry
    getKnowledge(key) {
        const data = JSON.parse(fs.readFileSync(this.memoryPath, 'utf-8'));
        return data.knowledge_base[key];
    }

    // Learns and saves a new skill or updates an existing one
    learnSkill(skillName, skillDefinition) {
        const data = JSON.parse(fs.readFileSync(this.memoryPath, 'utf-8'));
        data.skills[skillName] = {
            learnedAt: new Date().toISOString(),
            ...skillDefinition
        };
        fs.writeFileSync(this.memoryPath, JSON.stringify(data, null, 2));
    }

    // Recalls a specific skill
    recallSkill(skillName) {
        const data = JSON.parse(fs.readFileSync(this.memoryPath, 'utf-8'));
        return data.skills[skillName];
    }

    // Recalls all learned skills
    recallAllSkills() {
        const data = JSON.parse(fs.readFileSync(this.memoryPath, 'utf-8'));
        return data.skills;
    }

    // Builds a natural network context from conversations and skills for deeper understanding
    buildNaturalNetworkContext(currentTask) {
        const data = JSON.parse(fs.readFileSync(this.memoryPath, 'utf-8'));
        const conversations = data.conversations;
        const skills = data.skills;
        const knowledgeBase = data.knowledge_base;

        let context = {
            relevantConversations: [],
            relevantSkills: [],
            relevantKnowledge: []
        };

        // Simple keyword matching for now, can be enhanced with embedding/vector search later
        const keywords = currentTask.toLowerCase().split(/\s+/).filter(word => word.length > 2);

        // Find relevant conversations
        conversations.forEach(conv => {
            if (keywords.some(keyword => conv.task.toLowerCase().includes(keyword) || JSON.stringify(conv.plan).toLowerCase().includes(keyword))) {
                context.relevantConversations.push(conv);
            }
        });

        // Find relevant skills
        for (const skillName in skills) {
            if (Object.prototype.hasOwnProperty.call(skills, skillName)) {
                const skill = skills[skillName];
                if (keywords.some(keyword => skillName.toLowerCase().includes(keyword) || skill.description.toLowerCase().includes(keyword))) {
                    context.relevantSkills.push({ name: skillName, ...skill });
                }
            }
        }

        // Find relevant knowledge base entries
        for (const kbKey in knowledgeBase) {
            if (Object.prototype.hasOwnProperty.call(knowledgeBase, kbKey)) {
                const kbEntry = knowledgeBase[kbKey];
                if (keywords.some(keyword => kbKey.toLowerCase().includes(keyword) || JSON.stringify(kbEntry).toLowerCase().includes(keyword))) {
                    context.relevantKnowledge.push({ key: kbKey, value: kbEntry });
                }
            }
        }

        return context;
    }
}
