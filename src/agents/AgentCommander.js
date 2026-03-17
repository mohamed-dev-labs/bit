import { BaseAgent } from './BaseAgent.js';
import chalk from 'chalk';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { MemoryManager } from '../utils/MemoryManager.js';

export class AgentCommander extends BaseAgent {
    constructor(config) {
        super(config);
        this.robots = new Map();
        this.memory = new MemoryManager();
        this.name = "BIT AI Agent Commander (Slime Agent Edition)";
        this.version = "V5.9 (The Long-Term Memory & Skills Edition)";
        this.contextSkill = "Adaptive Context Learning: Synthesizing long-term mission goals and user preferences from historical interactions (v5.9).";
        this.learnedSkills = {}; // To store active learned skills in memory for quick access
    }

    async learnFromConversations() {
        console.log(chalk.yellow('[Memory] Analyzing past conversations to learn new skills...'));
        const conversations = this.memory.recallConversations();
        if (conversations.length === 0) {
            console.log(chalk.gray('[Memory] No past conversations to learn from.'));
            return;
        }

        // Use LLM to extract skills from conversations
        const learningPrompt = `
        Analyze the following past conversations and identify any recurring user preferences, successful strategies, common task patterns, or specific knowledge that can be formalized as a 'skill'.
        A skill should be a concise, actionable piece of knowledge that helps the Commander or other agents perform better in future tasks.
        Focus on patterns that appear across multiple conversations or particularly impactful outcomes.
        
        Conversations (last 10 entries for efficiency):
        ${conversations.slice(-10).map(c => `Task: ${c.task}\nPlan: ${JSON.stringify(c.plan)}`).join('\n---\n')}
        
        Return a JSON object where keys are skill names (e.g., "EfficientCodeGeneration", "UserPreferenceForMarkdown") and values are detailed descriptions of the skill, including how it should be applied.
        If no new skills are identified, return an empty JSON object.
        Return ONLY valid JSON.
        `;

        try {
            const skillResponse = await this.chat(learningPrompt);
            const newSkills = JSON.parse(skillResponse.replace(/```json|```/g, '').trim());

            for (const skillName in newSkills) {
                if (Object.prototype.hasOwnProperty.call(newSkills, skillName)) {
                    const skillDefinition = newSkills[skillName];
                    this.memory.learnSkill(skillName, skillDefinition);
                    this.learnedSkills[skillName] = skillDefinition; // Update in-memory cache
                    console.log(chalk.green(`[Memory] Learned new skill: ${skillName}`));
                }
            }
        } catch (error) {
            console.error(chalk.red(`[Memory] Error learning skills from conversations: ${error.message}`));
        }
    }

    // Method to load all skills from memory at startup or when needed
    async loadSkills() {
        console.log(chalk.yellow('[Memory] Loading all learned skills...'));
        this.learnedSkills = this.memory.recallAllSkills();
        console.log(chalk.gray(`[Memory] Loaded ${Object.keys(this.learnedSkills).length} skills.`));
    }

    registerRobot(name, robotInstance) {
        this.robots.set(name, robotInstance);
    }

    async ensureTools(requiredTools) {
        console.log(chalk.yellow(\"[Tooling] Checking for required tools...\"));
        const missingTools = requiredTools.filter(tool => {
            try {
                require.resolve(tool);
                return false;
            } catch (e) {
                return true;
            }
        });

        if (missingTools.length > 0) {
            console.log(chalk.cyan(`[Tooling] Installing missing tools: ${missingTools.join(\", \_)}`));
            try {
                const { execSync } = require(\"child_process\");
                execSync(`npm install ${missingTools.join(\" \")}`, { stdio: \"inherit\" });
                console.log(chalk.green(\"[Tooling] All required tools are now installed.\"));
            } catch (error) {
                console.error(chalk.red(`[Tooling] Failed to install tools: ${error.message}`));
                throw new Error(`Failed to install required tools: ${missingTools.join(\", \_)}`);
            }
        }
    }

    async delegateTask(taskDescription) {
        console.log(chalk.bold.green(`\n[${this.name}] [${this.version}]`));
        console.log(chalk.gray(`[Commander Skill] ${this.contextSkill}`));
        await this.loadSkills(); // Load skills at the beginning of each delegation
        // Example: Ensure a tool is available if the task requires it
        // await this.ensureTools(["some-npm-package"]);
        const pastContext = this.memory.recallConversations().slice(-5).map(c => c.task).join(' | ');
        const activeSkills = Object.keys(this.learnedSkills).map(name => `${name}: ${this.learnedSkills[name]}`).join('\n');
        if (pastContext) {
            console.log(chalk.gray(`[Memory Recall] Context found: ${pastContext.substring(0, 100)}...`));
        }

        console.log(chalk.cyan(`[Thinking Architecture] Analyzing Mission: "${taskDescription}"`));
        const naturalNetworkContext = this.memory.buildNaturalNetworkContext(taskDescription);
        console.log(chalk.gray(`[Natural Network] Context built: ${JSON.stringify(naturalNetworkContext).substring(0, 100)}...`));
        
        const planningPrompt = `
        You are the Strategic Commander (Slime Agent).
        Current Skill: ${this.contextSkill}\n        Learned Skills: ${activeSkills || 'None'}
        Mission Goal: "${taskDescription}"
        Past Context: ${pastContext}
        Natural Network Context: ${JSON.stringify(naturalNetworkContext)}
        Available Sub-Agents: ${Array.from(this.robots.keys()).join(', ')}.
        
        Goal: If the task is coding-related, use "CodexBot" (3x Power). 
        If it involves images, use "VisionBot" or "ImageGenBot".
        
        Return a JSON execution plan:
        {
          "steps": [
            {
              "agent": "AgentName", 
              "task": "detailed instruction", 
              "subAgents": ["AgentName1", "AgentName2"] // Optional
            }
          ],
          "reasoning": "Strategic explanation based on current context and skill"
        }
        Return ONLY valid JSON.
        `;
        
        try {
            const planResponse = await this.chat(planningPrompt);
            const plan = JSON.parse(planResponse.replace(/```json|```/g, '').trim());
            
            console.log(chalk.blue(`[Commander Reasoning] ${plan.reasoning}`));
            console.log(chalk.magenta(`[Workflow Map] ${plan.steps.length} stages identified.`));

            this.memory.saveConversation({ task: taskDescription, plan: plan.steps });
            await this.learnFromConversations(); // Trigger skill learning after each mission
                       
            let finalResults = [];
            for (const step of plan.steps) {
                const robot = this.robots.get(step.agent);
                if (robot) {
                    console.log(chalk.magenta(`\n[Orchestration] Deploying ${step.agent} for: ${step.task}`));
                    
                    let result;
                    if (step.agent === 'CodexBot' && step.subAgents) {
                        const subRobots = step.subAgents.map(name => this.robots.get(name)).filter(r => r);
                        result = await robot.execute(step.task, subRobots);
                    } else {
                        result = await robot.execute(step.task);
                    }
                    
                    finalResults.push(`### [Report from ${step.agent}]\n${result}`);
                }
            }

            const synthesisPrompt = `
            Compile a comprehensive and professional mission report based on these individual robot results:
            ${finalResults.join('\n\n')}
            
            Original Mission: ${taskDescription}
            Ensure the report is structured, factual, and reflects the Commander's adaptive learning skill.
            `;
            return await this.chat(synthesisPrompt);

        } catch (error) {
            console.log(chalk.yellow(`[Commander] Advanced planning encountered an issue. Falling back to sequential execution.`));
            const decisionPrompt = `Select the single best robot for: "${taskDescription}" from: ${Array.from(this.robots.keys()).join(', ')}. Return ONLY the robot name.`;
            const selectedRobotName = await this.chat(decisionPrompt);
            const robot = this.robots.get(selectedRobotName.trim()) || this.robots.get('ResearcherBot');
            return await robot.execute(taskDescription);
        }
    }
}
