# Visual Learning Lab 宝塔部署说明

## 上传哪个文件夹

上传 `deployment/baota/` **里面的全部文件和文件夹**。网站目录最终应为：

```text
/www/wwwroot/你的域名/
├── index.html
├── favicon.svg
├── assets/                 # 已编译的脚本和样式
└── data/                   # 教学模拟 CSV 数据
```

也可以上传 `packages/Visual-Learning-Lab-dist.zip` 并在网站根目录解压。压缩包第一层就是 `index.html`，没有额外的 dist 或 baota 外层目录。

这是已经构建好的静态网站。服务器使用 Nginx 或 Apache 提供文件即可，无需 Node.js 常驻服务、PHP、数据库或在服务器执行 npm install。

## 宝塔操作步骤

1. 在宝塔“网站”中添加站点，填写自己的域名，运行环境选“纯静态”，数据库不创建。面板部分版本把此入口放在“PHP 项目”分类中。
2. 打开该站点的网站根目录，例如 `/www/wwwroot/你的域名/`。如已有其他网站文件，先备份，再上传本项目文件。
3. 上传并解压上述部署压缩包，或上传 baota 目录内的全部内容。确认 `index.html` 与 `assets`、`data` 位于同一层。
4. 在站点“默认文档”中将 `index.html` 放在优先位置，确保打开域名时加载本项目入口。
5. 域名解析到服务器、访问端口可用后，打开 `https://你的域名/`（未配置证书时先使用 HTTP）。页面跳转形如 `/#/lessons/1`。这是 Hash 路由，不需要添加 Vue history 模式的伪静态规则。
6. 检查首页、知识图谱、实验室和代码工作台，再刷新章节页面，确认内容仍能加载。随后可通过宝塔为该站点配置 HTTPS。

新域名下的学习记录从零开始，这是浏览器按站点分别保存 localStorage 的正常表现。

## 更新与子目录

修改源码后，在 `visual-learning-lab/` 运行 `npm run build:baota`，会重新生成 `dist/` 和 `deployment/baota/`。此命令覆盖本机生成的 baota 文件夹；请在源码中修改内容。重新上传新版本全部文件，确认运行正常后再处理服务器上的旧版本资源。

资源地址采用 `./`，也支持将网站放在 `/visual-learning-lab/` 子目录。此时访问地址为 `https://你的域名/visual-learning-lab/#/`，须保留 URL 中目录后的斜杠。

可选 Nginx 示例见同目录的 `baota-nginx.conf.example`；默认宝塔静态站点配置即可运行。需要调整缓存时，仅将相应 location 片段合并到已有站点配置，不要覆盖宝塔维护的整个 server 块或 SSL 配置。

## 常见情况

| 现象 | 检查方法 |
| --- | --- |
| 仍显示宝塔默认页面 | 检查 index.html 是否放在正确站点目录，默认文档优先级是否正确，刷新浏览器缓存 |
| 首页空白、脚本 404 | 确保 assets 完整上传，不能只上传 index.html；使用 HTTP(S) 打开 |
| 章节刷新 404 | 使用本项目提供的 `/#/lessons/...` 地址，保留 #，不需要把课程路径配置为服务器目录 |
| 图表正常但学习进度不同 | 学习记录按浏览器与域名保存；本地预览进度不会自动迁移到新域名 |
| 旧版本运行代码时报 crypto.randomUUID 错误 | 更新至修复版部署包，覆盖 index.html 和全部 assets 后强制刷新；新版本已兼容普通 HTTP 域名 |

本次交付经过本地静态 HTTP 服务验证；未连接你的宝塔面板或执行线上发布。

代码工作台已覆盖非安全 HTTP 域名环境的实际运行检查；运行标识使用 getRandomValues，不依赖 randomUUID。更新时应同时上传入口文件与新脚本，避免浏览器或站点缓存继续引用旧版本。

操作入口参考：[宝塔创建站点](https://docs.bt.cn/user-guide/site/php/create-web/)、[宝塔默认文档](https://docs.bt.cn/user-guide/site/php/site-config/default_index/)。
