import { chromium, Browser, Page, BrowserContext } from 'playwright';

// 初始化浏览器和页面
async function initializeBrowser(): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
    console.log('正在初始化浏览器...');
    const browser = await chromium.launch({ 
        headless: false, // 设置为false以便观察执行过程
        slowMo: 1000 // 每个操作之间延迟1秒
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    return { browser, context, page };
}

// 导航到百度首页
async function navigateToBaidu(page: Page): Promise<void> {
    console.log('导航到百度首页...');
    await page.goto('https://www.baidu.com/');
    await page.waitForLoadState('networkidle');
}

// 点击搜索框
async function clickSearchBox(page: Page): Promise<void> {
    console.log('点击搜索框...');
    // 基于新录制工作流，使用AI聊天搜索框，使用更精确的定位策略
    await page.locator('textarea.chat-input-textarea.chat-input-scroll-style[id="chat-textarea"]').first().click();
    await page.waitForTimeout(500);
}

// 输入搜索内容
async function inputSearchTerm(page: Page, searchTerm: string): Promise<void> {
    console.log(`输入搜索内容: ${searchTerm}`);
    // 基于新录制工作流，使用AI聊天搜索框的textarea，使用更精确的定位策略
    await page.locator('textarea.chat-input-textarea.chat-input-scroll-style[id="chat-textarea"]').first().fill(searchTerm);
    await page.waitForTimeout(500);
}

// 执行搜索（按Enter或点击搜索按钮）
async function performSearch(page: Page): Promise<void> {
    console.log('执行搜索...');
    // 基于新录制工作流，在AI聊天搜索框中按Enter键触发搜索
    // 使用更精确的定位策略避免strict mode violation
    await page.locator('textarea.chat-input-textarea.chat-input-scroll-style[id="chat-textarea"]').first().press('Enter');
    await page.waitForLoadState('networkidle');
}

// 点击搜索结果中的Playwright官网链接
async function clickPlaywrightResult(page: Page): Promise<Page> {
    console.log('点击Playwright官网链接...');
    
    // 等待搜索结果加载
    await page.waitForLoadState('networkidle');
    
    try {
        // 根据录制工作流的DOM结构，寻找包含"Playwright官网"文本的span，然后找到对应的链接
        console.log('寻找包含"Playwright官网"的搜索结果...');
        
        // 等待搜索结果容器加载
        await page.waitForTimeout(3000); // 增加等待时间
        
        // 方法1: 根据你提供的选择器关系寻找
        try {
            // 先找到包含"Playwright官网"文本的span元素
            console.log('尝试寻找包含"Playwright官网"的span元素...');
            
            // 更精确的方式：使用XPath寻找包含特定文本的span
            const spanElements = page.locator('//span[contains(@class, "cosc-source-text") and contains(text(), "Playwright")]');
            const spanCount = await spanElements.count();
            console.log(`找到 ${spanCount} 个匹配的span元素`);
            
            if (spanCount > 0) {
                // 获取第一个匹配的span元素
                const targetSpan = spanElements.first();
                
                // 方法A: 根据DOM结构向上查找到搜索结果容器，然后查找标题链接
                const searchResultItem = targetSpan.locator('xpath=ancestor::*[contains(@id, "")]').first();
                
                // 尝试多种可能的标题链接选择器
                const possibleLinkSelectors = [
                    '.title-wrapper_6E6PV h3 a',
                    'h3 a',
                    '.title-wrapper h3 a',
                    '[class*="title"] a',
                    'a[href*="playwright"]'
                ];
                
                for (const linkSelector of possibleLinkSelectors) {
                    try {
                        const titleLink = searchResultItem.locator(linkSelector).first();
                        await titleLink.waitFor({ timeout: 1000 });
                        console.log(`使用选择器 ${linkSelector} 找到标题链接`);
                        
                        const [newPage] = await Promise.all([
                            page.context().waitForEvent('page'),
                            titleLink.click()
                        ]);
                        
                        await newPage.waitForLoadState('networkidle');
                        console.log('成功点击链接并打开新页面');
                        return newPage;
                        
                    } catch (linkError) {
                        console.log(`选择器 ${linkSelector} 未找到链接，继续尝试...`);
                        continue;
                    }
                }
                
                // 方法B: 如果上面的方法失败，尝试从span向上查找整个搜索结果项，然后找任何链接
                console.log('尝试从span元素向上查找整个搜索结果项...');
                const resultContainer = targetSpan.locator('xpath=ancestor::*[position()=5]').first(); // 向上查找5层
                const anyLink = resultContainer.locator('a').first();
                
                await anyLink.waitFor({ timeout: 2000 });
                console.log('找到搜索结果项中的链接');
                
                const [newPage] = await Promise.all([
                    page.context().waitForEvent('page'),
                    anyLink.click()
                ]);
                
                await newPage.waitForLoadState('networkidle');
                return newPage;
            }
            
        } catch (spanError) {
            console.log('方法1失败，尝试方法2...', String(spanError));
            
            // 方法2: 使用更通用的方式寻找包含Playwright的链接
            const playwrightLinks = page.locator('a').filter({ hasText: /playwright/i });
            const linkCount = await playwrightLinks.count();
            console.log(`找到 ${linkCount} 个包含playwright的链接`);
            
            if (linkCount > 0) {
                console.log('点击第一个Playwright相关链接...');
                const [newPage] = await Promise.all([
                    page.context().waitForEvent('page'),
                    playwrightLinks.first().click()
                ]);
                
                await newPage.waitForLoadState('networkidle');
                return newPage;
            }
        }
        
        // 方法3: 备用方案 - 直接导航到Playwright官网
        console.log('所有方法都失败，直接导航到Playwright官网...');
        await page.goto('https://playwright.dev/');
        await page.waitForLoadState('networkidle');
        return page;
        
    } catch (error) {
        console.log('搜索结果处理失败，直接导航到Playwright官网...', error);
        await page.goto('https://playwright.dev/');
        await page.waitForLoadState('networkidle');
        return page;
    }
}

// 在Playwright官网点击"Get started"
async function clickGetStarted(page: Page): Promise<void> {
    console.log('点击Get started按钮...');
    
    // 根据录制的工作流，使用更精确的选择器
    // 录制中使用的选择器是：a.getStarted_Sjon[href="/docs/intro"]
    try {
        // 方法1: 使用录制工作流中的精确选择器
        await page.locator('a.getStarted_Sjon[href="/docs/intro"]').click();
        console.log('使用精确选择器成功点击Get started');
    } catch (error) {
        console.log('精确选择器失败，尝试备用方法...');
        // 方法2: 使用文本匹配
        await page.locator('text="Get started"').first().click();
        console.log('使用文本匹配成功点击Get started');
    }
    
    await page.waitForLoadState('networkidle');
}

// 主执行函数
async function runWorkflow(): Promise<void> {
    let browser: Browser | null = null;
    
    try {
        // 初始化浏览器
        const { browser: browserInstance, context, page } = await initializeBrowser();
        browser = browserInstance;
        
        // 执行工作流步骤
        await navigateToBaidu(page);
        await clickSearchBox(page);
        await inputSearchTerm(page, 'playwright官网');
        await performSearch(page);
        
        // 点击搜索结果并获取新页面
        const playwrightPage = await clickPlaywrightResult(page);
        
        // 在新页面中点击Get started
        await clickGetStarted(playwrightPage);
        
        console.log('工作流执行完成！');
        
        // 等待一段时间以便观察结果
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('工作流执行出错:', error);
    } finally {
        // 清理资源
        if (browser) {
            await browser.close();
        }
    }
}

// 错误处理包装函数
async function safeRunWorkflow(): Promise<void> {
    try {
        await runWorkflow();
    } catch (error) {
        console.error('执行工作流时发生错误:', error);
        if (typeof process !== 'undefined') {
            process.exit(1);
        }
    }
}

// 主入口点
async function main(): Promise<void> {
    console.log('开始执行Playwright工作流...');
    await safeRunWorkflow();
}

// 立即执行
main().catch(console.error);

// 导出函数以供其他模块使用
export {
    initializeBrowser,
    navigateToBaidu,
    clickSearchBox,
    inputSearchTerm,
    performSearch,
    clickPlaywrightResult,
    clickGetStarted,
    runWorkflow,
    safeRunWorkflow
};