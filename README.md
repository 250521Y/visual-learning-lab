# Visual Learning Lab — 可视化交互学习实验室

一个独立开发的《可视化导论》双语课程网站。通过**知识结构可视化、理论实验交互化、学习过程反馈化**，形成“导航 → 理论 → 实验 → 验证 → 反馈”的学习闭环。无后端、无账号、无远程数据服务。

[![CI](https://github.com/250521Y/visual-learning-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/250521Y/visual-learning-lab/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An interactive, bilingual introduction to data visualization, built with Vue 3 and D3. Includes a knowledge map, hands-on labs, a code playground, and local learning progress.

## 开源与贡献

项目原创代码、文档和教学模拟数据使用 [MIT 许可证](LICENSE)，允许使用、修改和再分发，须保留版权与许可声明。第三方依赖和引用资料保留各自的权利与许可证，见 [参考资料](docs/REFERENCES.md)。

欢迎提交 [Issue](https://github.com/250521Y/visual-learning-lab/issues) 和 Pull Request，参与方式见 [贡献指南](CONTRIBUTING.md)。仓库只包含源码、测试和文档；课程报告、演示视频及本地部署地址未纳入。

## 运行

需要 Node.js 22.12+（或 24 LTS）。

```bash
git clone https://github.com/250521Y/visual-learning-lab.git
cd visual-learning-lab
npm ci
npm run dev
```

打开终端输出的 Local 地址。若默认 5173 被占用，Vite 会选择其他端口。

```bash
npm test             # 数据、图谱、双语结构、拟合和真实进度测试
npm run build        # 生成 dist/
npm run build:baota  # 构建并整理到上级 deployment/baota/，附宝塔说明与校验清单
npm run preview      # 预览生产构建，默认 4173
```

浏览器集成测试使用本机 Chrome，不会自动下载浏览器。先运行开发服务，再指定其地址：

```powershell
$env:TEST_URL = 'http://127.0.0.1:5174/'
npm run test:browser
npm run test:a11y
```

Linux 环境可安装 Google Chrome，或将测试中的 `channel: 'chrome'` 改为已安装的 Chromium。测试会重置**其独立测试浏览器**的站点记录，不影响日常浏览器。

工作台 HTTP 兼容性回归：先启动构建文件的静态服务，再运行以下命令。测试把本机测试域名映射到 127.0.0.1，验证真实的非安全 HTTP 环境；不关闭浏览器安全策略。

```powershell
$env:TEST_ROOT = '..\deployment\baota'
$env:TEST_PREFIX = '/'
$env:TEST_PORT = '4180'
node tests/serve-build.mjs
# 在另一个终端执行：
npm run test:playground-http
```

运行标识使用 `crypto.getRandomValues` 的安全随机字节，兼容普通 HTTP 域名。接口完全缺失时显示可恢复的双语错误，不以弱随机数替代安全校验。

## 页面与功能

| 页面 | 真实功能 |
| --- | --- |
| 首页 `#/` | 五章学习路径、六个实验入口、零起点真实进度与继续学习 |
| 知识地图 `#/map` | 41 个真实课程节点；Force、拖拽、缩放、平移、搜索、章节筛选、关联高亮、可访问目录 |
| 章节 `#/lessons/:chapter/:topic` | 五章 30 节原创双语讲解；目标、概念、原理、案例、代码、误区、思考、对应内嵌实验 |
| 实验室 `#/labs` | 流水线、图表对比、色彩、拟合、时序联动、结构与坐标六个实验 |
| 工作台 `#/playground` | CodeMirror 6、五个可修改 D3 示例、独立 iframe、错误与超时反馈、重建、复制、可调高度 |
| 学习中心 `#/learning` | 10 道预测与验证挑战、正确性判断与解析、阅读热力格、章节进度、复习入口、最近记录、清除数据 |
| 关于 `#/about` | 三项创新、原创说明、数据来源、理论与课程参考资料 |

## 教学实验

- 流水线：90 条原始模拟记录 → 清洗 86 条 → 小时派生 → 分数筛选 → 章节/日期分组 → 均值/总和/中位数/计数 → 柱或点图；每阶段可审计表格。
- 图表对比：根据类别比较、时间变化、两个定量变量的关联选择合法图形；位置、长度、面积、明度对比；零基线与标签纠错。
- 色彩：HSL、三类色板、同数据配色对比、WCAG 亮度对比度、Machado 近似色觉模拟。
- 拟合：QR 最小二乘，1–10 阶，确定性噪声，20 训练点与 31 独立验证点，RMSE，对称对数/线性坐标。
- 时序：UTC 日期闭区间、D3 Brush、日/周/月、日历联动、焦点/悬停联动、共享统计、选区缩放与空状态。
- 结构：树层级间距、双高斯标量场等值阈值、螺旋周期、持久身份 Data-Join、DIKW 层级。

所有实验控件驱动实际计算；没有随机成绩或占位页面。模拟数据 CSV 见 `public/data/`，可用 `npm run data:export` 重建。

## 架构与主要文件

```text
src/
  components/       # 图标、参数滑块、D3 图表、内嵌实验、挑战
  pages/            # 七个一级页面
  labs/             # 六个按需加载的完整实验
  data/course.js    # 五章双语核心概念、目标与基础案例
  data/lessons/     # 按章组织的深入讲解、三步案例和代码说明
  data/lessonDetails.js # 概念对照表与 D3 官方延伸阅读
  data/knowledge.js # 图谱节点、先修、包含和关联
  data/quizzes.js   # 十道双语挑战与解析
  data/examples.js  # 五个工作台示例
  composables/useProgress.js # 进度、历史、本地存储
  utils/data.js     # 确定性数据、清洗聚合、QR 拟合、色彩计算
  i18n/index.js     # zh-CN / en-US、双语资源访问、偏好保存
  router/index.js   # 懒加载 + Hash Router
  styles/theme.css  # 薄荷绿/藕粉/暖白设计系统与四档响应式
tests/              # 数值与状态测试、浏览器功能与无障碍检查
docs/               # 架构、验收、部署、课程演示脚本
scripts/build-baota.mjs # 生成可上传的静态目录、部署说明与文件校验值
```

Vue 3 Composition API + Vue Router + Vite + D3 v7 + SVG + CodeMirror 6。CSS 原生实现，无大型 UI 框架。双语资源与数据位于同一个结构化对象中，避免翻译缺项。语言切换不重建当前实验。

## 部署

默认 `base: './'`，构建产物可放在普通服务器根路径或子目录。路由使用 `#`，刷新章节页不会向静态服务器请求不存在的课程路径。

**GitHub Pages（可选）**：在仓库 Settings → Pages → Source 中选择 GitHub Actions，然后在 Actions → Deploy Visual Learning Lab to Pages → Run workflow 手动发布。开源源码不依赖启用 Pages。已包含 `.github/workflows/pages.yml`，自动以仓库名称设置资源 base。用户名主页仓库（`name.github.io`）请将工作流的 `VITE_BASE` 改为 `/`。每次推送及 Pull Request 由独立的 CI 工作流运行测试与构建。

如项目保留在其他仓库的子目录中，需在工作流中为安装/测试/构建增加正确的 `working-directory`，并将 artifact 路径改为 `visual-learning-lab/dist`。

**Nginx**：上传 `dist/` 内容，参考 `docs/nginx.conf.example`。运行服务必须使用 HTTP(S)，不要直接双击 `dist/index.html`。

**宝塔面板**：执行 `npm run build:baota`，上传上级 `deployment/baota/` 内的全部内容到网站根目录，默认文档使用 `index.html`。已构建文件无需在服务器安装 Node.js、PHP 或数据库；Hash 路由不需要额外伪静态。完整操作见 `docs/BAOTA_DEPLOYMENT.md`。

交付目录分为 `visual-learning-lab/` 源码、`deployment/` 部署文件与说明、`packages/` 压缩包。`dist/`、`node_modules/`、`test-results/` 为生成目录，源码压缩包不包含它们。目录说明见 `docs/DELIVERY.md`。

GitHub 仓库按上述源码结构组织；宝塔交付目录和压缩包仅在本地生成，不纳入版本管理。

## 进度规则与限制

章节完成度 = 阅读确认比例 × 50% + 关联实验完成比例 × 25% + 两道挑战通过比例 × 25%。五章平均为总体进度。打开页面只记录最近位置，不自动完成阅读。实验需操作参数并确认核对结果。挑战可重试，曾通过的记录保留，同时保存最后一次结果与尝试次数。

本地记录不跨设备同步。模拟色觉结果不是个体诊断。代码沙箱不提供恶意同步无限循环的硬隔离与强制终止；详见工作台说明和 `docs/ARCHITECTURE.md`。浏览器自动化不等于真实手机和所有屏幕阅读器的人工验证。具体已执行检查见 `docs/VALIDATION.md`。

## 课程来源与原创性

知识范围参考 [老师公开课程](https://cinger007.github.io/vis/) 和任务书。初次网页访问工具不可读，后续已通过直接访问成功读取首页及五章页面，并对照公开小节扩充五章 30 个知识单元。每节增加深入解释、三步案例、代码说明和参考对应，另含 9 张概念对照表。未使用原站源码，未批量复制文字、图片或代码。图形由 D3/SVG 独立制作。理论来源在网站与 `docs/REFERENCES.md` 中注明，内容对应见 `docs/CONTENT_GUIDE.md`。
