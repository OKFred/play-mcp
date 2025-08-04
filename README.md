# Playwright MCP 工作流自动化

这是一个基于 Playwright 的自动化脚本，将录制的工作流转换为可执行的 TypeScript 函数。

## 项目结构

- `src/index.ts` - 主要的 Playwright 自动化脚本
- `src/recorded_workflow_2025-07-25T16-29-04.json` - 原始录制的工作流
- `package.json` - 项目依赖和脚本配置
- `tsconfig.json` - TypeScript 配置

## 功能模块

脚本包含以下函数模块：

### 核心函数

1. **initializeBrowser()** - 初始化浏览器和页面
2. **navigateToBaidu()** - 导航到百度首页
3. **clickSearchBox()** - 点击搜索框
4. **inputSearchTerm()** - 输入搜索内容
5. **performSearch()** - 执行搜索操作
6. **clickPlaywrightResult()** - 🎯 精确点击搜索结果中的Playwright官网链接
7. **clickGetStarted()** - 在Playwright官网点击"Get started"

### 工作流函数

- **runWorkflow()** - 主执行函数，按顺序调用所有步骤
- **safeRunWorkflow()** - 错误处理包装函数
- **main()** - 入口点函数

## 安装依赖

\`\`\`bash
npm install
npx playwright install chromium
\`\`\`

## 运行脚本

### 直接运行
\`\`\`bash
npx tsx src/index.ts
\`\`\`

### 使用npm脚本
\`\`\`bash
npm start        # 运行脚本
npm run dev      # 监听模式运行
npm test         # 测试运行
\`\`\`

## 脚本特性

- **函数式设计**: 每个步骤都是独立的函数，便于维护和修改
- **精确选择器**: 基于录制工作流的DOM结构，使用XPath和CSS选择器精确定位
- **多层重试机制**: 包含多种备用策略确保脚本稳定运行
- **智能元素定位**: 能够找到包含特定文本的span元素，并定位到对应的链接
- **可观察执行**: 非headless模式，可以观察脚本执行过程
- **TypeScript支持**: 完整的类型支持和现代JavaScript特性

## 核心技术实现

### 精确搜索结果定位

脚本实现了基于DOM结构的精确定位：

1. **文本匹配**: 寻找包含"Playwright官网"的span元素
   ```typescript
   const spanElements = page.locator('//span[contains(@class, "cosc-source-text") and contains(text(), "Playwright")]');
   ```

2. **结构关系**: 根据录制的选择器关系找到对应链接
   ```
   span: #\31 > div > div > div > div:nth-child(4) > div > div > div > a > span
   link: #\31 > div > div > div > div.title-wrapper_6E6PV > div > h3 > a
   ```

3. **多重备用策略**: 
   - 精确CSS选择器匹配
   - XPath元素查找
   - 祖先节点导航
   - 通用文本匹配

### 错误处理和重试

- 多种选择器策略自动切换
- 超时处理和重试机制
- 备用导航方案
- 详细的执行日志

## 执行流程

1. ✅ 打开浏览器并导航到百度
2. ✅ 点击搜索框
3. ✅ 输入"playwright官网"
4. ✅ 执行搜索
5. ✅ 精确定位并点击包含"Playwright官网"的搜索结果
6. ✅ 在新打开的Playwright官网页面点击"Get started"
7. ✅ 完成整个工作流

## 自定义修改

你可以轻松修改各个函数来适应不同的需求：

1. **修改搜索词**: 在 `runWorkflow()` 函数中更改 `inputSearchTerm()` 的参数
2. **添加新步骤**: 创建新的函数并在工作流中调用
3. **修改浏览器设置**: 在 `initializeBrowser()` 函数中调整参数
4. **调整等待时间**: 在各个函数中调整 `waitForTimeout()` 的值

## 技术亮点

### DOM结构分析
脚本能够：
- 解析复杂的DOM结构关系
- 使用XPath进行精确元素定位
- 处理动态生成的搜索结果

### 多策略选择器
- CSS选择器
- XPath表达式
- 文本内容匹配
- 祖先节点查找

### 智能重试机制
- 选择器超时自动切换
- 多种备用定位策略
- 失败时的备用方案

## 注意事项

- 脚本默认使用Chromium浏览器
- 执行速度已设置延迟以便观察
- 包含完整的错误处理和日志输出
- 适合学习和生产环境使用

## 测试结果

✅ 所有步骤执行成功  
✅ 精确点击目标搜索结果  
✅ 成功导航到Playwright文档页面  
✅ 完整的错误处理机制
