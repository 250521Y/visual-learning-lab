# Visual Learning Lab 项目交付

```text
重构课程网站/
├── 交付说明.md
├── visual-learning-lab/              # 可维护的完整源码
│   ├── src/                         # 页面、组件、实验、课程与主题
│   ├── public/                      # 模拟数据和站点图标
│   ├── docs/                        # 架构、内容、部署、测试与演示说明
│   ├── tests/                       # 计算、浏览器与无障碍检查
│   ├── scripts/                     # 数据导出与宝塔构建
│   ├── .github/                     # GitHub Pages 工作流
│   ├── dist/                        # 自动生成的构建结果
│   ├── test-results/                # 自动生成的测试报告和截图
│   ├── node_modules/                # 本机依赖，不必上传或提交
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── README.md
├── deployment/
│   ├── baota/                       # 只含可上传的网站文件
│   │   ├── index.html
│   │   ├── favicon.svg
│   │   ├── assets/
│   │   └── data/
│   ├── 宝塔部署说明.md
│   ├── baota-nginx.conf.example      # 可选缓存配置
│   └── build-info.json               # 构建时间及文件校验值
└── packages/
    ├── Visual-Learning-Lab-source.zip # 干净源码，不含依赖和临时截图
    └── Visual-Learning-Lab-dist.zip   # 宝塔上传包，index.html 位于第一层
```

**直接部署**：使用 `deployment/baota/` 内的全部内容，或将 dist 压缩包上传到宝塔网站根目录并解压。详细步骤见 `deployment/宝塔部署说明.md`。

**继续开发**：在 `visual-learning-lab/` 执行 `npm install`、`npm run dev`。重建宝塔目录执行 `npm run build:baota`。

**课程提交**：源码包包含文档和验证报告；部署包包含运行网站所需的静态资源。两者分开存放，服务器只需要部署包。

生成的 dist、baota、node_modules 和 test-results 不作为手工编辑位置；后续内容与样式统一修改 src，数据资产修改 public。源码维持原项目路径，当前本地预览服务可以继续使用。
