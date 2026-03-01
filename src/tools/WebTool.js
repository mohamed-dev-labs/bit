import puppeteer from 'puppeteer';
import chalk from 'chalk';

export class WebTool {
    static async search(query) {
        console.log(chalk.yellow(`\n[WebTool] 🔍 Searching: "${query}"`));
        try {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            return await this.browse(searchUrl, true);
        } catch (error) {
            return `Search failed: ${error.message}`;
        }
    }

    static async browse(url, isSearch = false) {
        console.log(chalk.blue(`[WebTool] 🌐 Opening Browser (VISIBLE MODE) for: ${url}`));
        
        // Integration with Chrome DevTools Protocol concepts
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: { width: 1280, height: 800 },
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--window-size=1280,800',
                '--remote-debugging-port=9222' // For Chrome DevTools MCP integration
            ]
        });
        
        const page = await browser.newPage();
        try {
            // Enable Chrome DevTools Protocol features if needed
            const client = await page.target().createCDTSession();
            await client.send('Network.enable');
            await client.send('Page.enable');

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

            let content;
            if (isSearch) {
                content = await page.evaluate(() => {
                    const results = [];
                    document.querySelectorAll('div.g').forEach(el => {
                        const title = el.querySelector('h3')?.innerText;
                        const link = el.querySelector('a')?.href;
                        const snippet = el.querySelector('.VwiC3b')?.innerText;
                        if (title && link) results.push({ title, link, snippet });
                    });
                    return JSON.stringify(results.slice(0, 5), null, 2);
                });
            } else {
                content = await page.evaluate(() => {
                    return document.body.innerText.split('\n')
                        .filter(line => line.trim().length > 20)
                        .slice(0, 150)
                        .join('\n');
                });
            }

            await new Promise(resolve => setTimeout(resolve, 8000));
            await browser.close();
            return content || "No content could be extracted.";
        } catch (error) {
            if (browser) await browser.close();
            return `Browsing failed: ${error.message}`;
        }
    }
}
