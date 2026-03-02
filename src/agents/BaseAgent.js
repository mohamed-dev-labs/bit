import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import chalk from 'chalk';

export class BaseAgent {
    constructor(config) {
        this.config = config;
        this.provider = config.provider || 'openai';
        this.model = config.model;
        this.apiKey = config.apiKey;
        this.history = [];
        this.initClient();
    }

    initClient() {
        const { provider, apiKey } = this;
        
        if (['openai', 'xai', 'deepseek', 'openrouter'].includes(provider)) {
            let baseURL = undefined;
            if (provider === 'xai') baseURL = 'https://api.x.ai/v1';
            if (provider === 'deepseek') baseURL = 'https://api.deepseek.com';
            if (provider === 'openrouter') baseURL = 'https://openrouter.ai/api/v1';

            this.client = new OpenAI({ 
                apiKey: apiKey === 'MANUS_DEFAULT' ? process.env.OPENAI_API_KEY : apiKey,
                baseURL: baseURL
            });
        } else if (provider === 'google') {
            this.client = new GoogleGenerativeAI(apiKey);
        } else if (provider === 'anthropic') {
            this.client = new Anthropic({ apiKey });
        } else if (provider === 'elevenlabs') {
            // Voice processing logic
            this.client = { apiKey };
        }
    }

    async chat(message) {
        const { provider, model, history } = this;
        
        try {
            if (['openai', 'xai', 'deepseek', 'openrouter'].includes(provider)) {
                let defaultModel = 'gpt-4.1-mini';
                if (provider === 'xai') defaultModel = 'grok-beta';
                if (provider === 'deepseek') defaultModel = 'deepseek-chat';
                if (provider === 'openrouter') defaultModel = 'meta-llama/llama-3-70b-instruct';

                const response = await this.client.chat.completions.create({
                    model: model || defaultModel,
                    messages: [...history, { role: 'user', content: message }],
                });
                const reply = response.choices[0].message.content;
                this.history.push({ role: 'user', content: message }, { role: 'assistant', content: reply });
                return reply;
            } else if (provider === 'google') {
                const modelName = model ? (model.startsWith('models/') ? model : `models/${model}`) : 'models/gemini-1.5-flash';
                const genModel = this.client.getGenerativeModel({ model: modelName });
                const result = await genModel.generateContent(message);
                const reply = result.response.text();
                this.history.push({ role: 'user', content: message }, { role: 'assistant', content: reply });
                return reply;
            } else if (provider === 'anthropic') {
                const response = await this.client.messages.create({
                    model: model || 'claude-3-5-sonnet-20241022',
                    max_tokens: 4096,
                    messages: [{ role: 'user', content: message }],
                });
                const reply = response.content[0].text;
                this.history.push({ role: 'user', content: message }, { role: 'assistant', content: reply });
                return reply;
            }
        } catch (error) {
            console.error(chalk.red(`[Error] ${provider} chat failed: ${error.message}`));
            throw error;
        }
    }
}
