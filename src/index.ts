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
    // 百度首页的搜索框ID是#kw
    await page.locator('#kw').click();
    await page.waitForTimeout(500);
}

// 输入搜索内容
async function inputSearchTerm(page: Page, searchTerm: string): Promise<void> {
    console.log(`输入搜索内容: ${searchTerm}`);
    // 百度首页的搜索框ID是#kw
    await page.locator('#kw').fill(searchTerm);
    await page.waitForTimeout(500);
}

// 执行搜索（点击搜索按钮）
async function performSearch(page: Page): Promise<void> {
    console.log('执行搜索...');
    // 百度首页的"百度一下"按钮ID是#su
    await page.locator('#su').click();
    await page.waitForLoadState('networkidle');
}

// 点击搜索结果中的Playwright官网链接
async function clickPlaywrightResult(page: Page): Promise<Page> {
    console.log('点击Playwright官网链接...');
    
    // 等待搜索结果加载
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    try {
        // 基于rrweb工作流，查找包含"Playwright"的搜索结果链接
        // 优先使用文本匹配方式，更稳定可靠
        console.log('查找包含"Playwright"的搜索结果...');
        
        // 寻找包含"reliable end-to-end testing"或"Playwright"的链接
        const playwrightLink = page.locator('a').filter({ 
            hasText: /Playwright|reliable end-to-end testing/i 
        }).first();
        
        // 等待链接出现并点击，同时监听新页面打开
        const [newPage] = await Promise.all([
            page.context().waitForEvent('page'),
            playwrightLink.click()
        ]);
        
        await newPage.waitForLoadState('networkidle');
        console.log('成功打开Playwright官网新标签页');
        return newPage;
        
    } catch (error) {
        // 备用方案：直接导航到Playwright官网
        console.log('无法通过搜索结果打开，直接导航到Playwright官网...', error);
        await page.goto('https://playwright.dev/');
        await page.waitForLoadState('networkidle');
        return page;
    }
}

// 在Playwright官网点击"Get started"
async function clickGetStarted(page: Page): Promise<void> {
    console.log('点击Get started按钮...');
    
    try {
        // 使用更具体的选择器：页面中部的大按钮（GET STARTED）
        // 方法1: 使用文本"GET STARTED"而不是"Get started"
        await page.getByRole('link', { name: 'GET STARTED' }).click();
        console.log('成功点击GET STARTED按钮');
    } catch (error) {
        console.log('主选择器失败，尝试备用方案...', error);
        // 方法2: 使用class选择器定位首页的大按钮
        await page.locator('a.getStarted_Sjon').click();
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