import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import chalk from 'chalk';

export class BaseAgent {
    constructor(config) {
        this.config = config;
        this.provider = config.provider || 'google';
        this.model = config.model;
        this.apiKey = config.apiKey;
        this.history = [];
        this.initClient();
    }

    initClient() {
        const { provider, apiKey } = this;
        if (['openai', 'deepseek', 'openrouter'].includes(provider)) {
            this.client = new OpenAI({ apiKey: apiKey === 'MANUS_DEFAULT' ? process.env.OPENAI_API_KEY : apiKey });
        } else if (provider === 'google') {
            this.client = new GoogleGenerativeAI(apiKey === 'MANUS_DEFAULT' ? process.env.GEMINI_API_KEY : apiKey);
        } else if (provider === 'anthropic') {
            this.client = new Anthropic({ apiKey: apiKey === 'MANUS_DEFAULT' ? process.env.ANTHROPIC_API_KEY : apiKey });
        }
    }

    async chat(message) {
        const { provider, model } = this;
        
        try {
            if (['openai', 'deepseek', 'openrouter'].includes(provider)) {
                let defaultModel = 'gpt-4.1-mini';
                if (provider === 'deepseek') defaultModel = 'deepseek-chat';
                if (provider === 'openrouter') defaultModel = 'meta-llama/llama-3-70b-instruct';

                const response = await this.client.chat.completions.create({
                    model: model || defaultModel,
                    messages: [...this.history, { role: 'user', content: message }],
                });
                const reply = response.choices[0].message.content;
                this.history.push({ role: 'user', content: message }, { role: 'assistant', content: reply });
                return reply;
            } else if (provider === 'google') {
                const genModel = this.client.getGenerativeModel({ model: model || 'gemini-1.5-flash' });
                const chat = genModel.startChat({ history: this.history.map(h => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] })) });
                const result = await chat.sendMessage(message);
                const reply = result.response.text();
                this.history.push({ role: 'user', content: message }, { role: 'assistant', content: reply });
                return reply;
            } else if (provider === 'anthropic') {
                const response = await this.client.messages.create({
                    model: model || 'claude-3-5-sonnet-20240620',
                    max_tokens: 4096,
                    messages: [...this.history, { role: 'user', content: message }],
                });
                const reply = response.content[0].text;
                this.history.push({ role: 'user', content: message }, { role: 'assistant', content: reply });
                return reply;
            }
        } catch (error) {
            console.log(chalk.red(`[BaseAgent Error] ${error.message}`));
            throw error;
        }
    }
}
