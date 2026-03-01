import { BaseAgent } from './BaseAgent.js';
import chalk from 'chalk';
import { MemoryManager } from '../utils/MemoryManager.js';

export class AgentCommander extends BaseAgent {
    constructor(config) {
        super(config);
        this.robots = new Map();
        this.memory = new MemoryManager();
        this.name = "Deep Inspire AI Agent Commander (Slime Agent Edition)";
        this.version = "V5.6 (The Codex Engine)";
    }

    registerRobot(name, robotInstance) {
        this.robots.set(name, robotInstance);
    }

    async delegateTask(taskDescription) {
        console.log(chalk.bold.green(`\n[${this.name}] [${this.version}]`));
        
        const pastContext = this.memory.recall().slice(-5).map(c => c.task).join(' | ');
        if (pastContext) {
            console.log(chalk.gray(`[Memory Recall] Context found: ${pastContext.substring(0, 100)}...`));
        }

        console.log(chalk.cyan(`[Thinking Architecture] Analyzing Mission: "${taskDescription}"`));
        
        // Planning for CodexBot Integration
        const planningPrompt = `
        You are the Strategic Commander (Slime Agent).
        Mission Goal: "${taskDescription}"
        Past Context: ${pastContext}
        Available Sub-Agents: ${Array.from(this.robots.keys()).join(', ')}.
        
        Goal: If the task is coding-related, use "CodexBot" (3x Power) as the primary executor.
        CodexBot can call sub-agents like CodeGenerator, ReviewBot, SecurityBot, and ArchitectBot.
        
        Return a JSON execution plan:
        {
          "steps": [
            {
              "agent": "AgentName", 
              "task": "detailed instruction", 
              "subAgents": ["AgentName1", "AgentName2"] // Optional, only for CodexBot
            }
          ],
          "reasoning": "Strategic explanation"
        }
        Return ONLY valid JSON.
        `;
        
        try {
            const planResponse = await this.chat(planningPrompt);
            const plan = JSON.parse(planResponse.replace(/```json|```/g, '').trim());
            
            console.log(chalk.blue(`[Commander Reasoning] ${plan.reasoning}`));
            console.log(chalk.magenta(`[Workflow Map] ${plan.steps.length} stages identified.`));

            this.memory.save({ task: taskDescription, plan: plan.steps });
            
            let finalResults = [];
            for (const step of plan.steps) {
                const robot = this.robots.get(step.agent);
                if (robot) {
                    console.log(chalk.magenta(`\n[Orchestration] Deploying ${step.agent} for: ${step.task}`));
                    
                    // Specialized execution for CodexBot with sub-agents
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
            Ensure the report is structured, factual, and highlights the performance of CodexBot if used.
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
