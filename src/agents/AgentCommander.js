import { BaseAgent } from './BaseAgent.js';
import chalk from 'chalk';
import { MemoryManager } from '../utils/MemoryManager.js';

export class AgentCommander extends BaseAgent {
    constructor(config) {
        super(config);
        this.robots = new Map();
        this.memory = new MemoryManager();
        this.name = "Deep Inspire AI Agent Commander (Slime Agent Edition)";
        this.version = "V5.8 (The Multi-Provider & Vision Edition)";
        this.contextSkill = "Adaptive Context Learning: Synthesizing long-term mission goals and user preferences from historical interactions (v5.8).";
    }

    registerRobot(name, robotInstance) {
        this.robots.set(name, robotInstance);
    }

    async delegateTask(taskDescription) {
        console.log(chalk.bold.green(`\n[${this.name}] [${this.version}]`));
        console.log(chalk.gray(`[Commander Skill] ${this.contextSkill}`));
        
        const pastContext = this.memory.recall().slice(-5).map(c => c.task).join(' | ');
        if (pastContext) {
            console.log(chalk.gray(`[Memory Recall] Context found: ${pastContext.substring(0, 100)}...`));
        }

        console.log(chalk.cyan(`[Thinking Architecture] Analyzing Mission: "${taskDescription}"`));
        
        const planningPrompt = `
        You are the Strategic Commander (Slime Agent).
        Current Skill: ${this.contextSkill}
        Mission Goal: "${taskDescription}"
        Past Context: ${pastContext}
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

            this.memory.save({ task: taskDescription, plan: plan.steps });
            
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
