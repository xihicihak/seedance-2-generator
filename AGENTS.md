# 系统级存储与开发运行规范 · 实用标准版

本项目及后续所有项目管理、环境搭建、依赖构建和代码编写，严格遵守以下磁盘与存储管理规范：

## 1. 严格分区存储原则（大容量文件一律落入 D 盘）
- **项目代码区**：所有 Git 代码仓库、新项目根目录一律存放在 `D:\Workspace\`（严禁在 C 盘根目录或用户文档中存放项目源码）。
  - 当前项目根路径：`D:\Workspace\seedance-2-generator\`
- **开发工具与环境**：所有语言运行时（Node.js、Python、Go 等环境）及外部 CLI 工具统一安置在 `D:\DevTools\`（Node 路径：`D:\DevTools\node\`）。
- **依赖包全局缓存**：所有包管理器的全局下载缓存与模块存储必须重定向至 D 盘：
  - `npm config set prefix "D:\DevTools\npm_global"`
  - `npm config set cache "D:\Cache\npm_cache"`
- **AI 模型与超大产物**：Wan 2.2、ComfyUI 模型检查点及超大视频生成产物（单个体积大于 100MB），严禁写入 C 盘，优先使用 `D:\Models\` 或已授权的 5TB 谷歌云盘（Google Drive 挂载路径）。

## 2. 系统保留豁免原则（保护底层通信与轻量配置）
- **允许轻量级配置文件**：允许读取并正常维护 `C:\Users\<用户名>\` 目录下的系统级轻量纯文本配置（包括 `.gitconfig`、`.npmrc`、`.ssh\` 秘钥与 IDE 基础会话配置）。
- **允许系统临时通信**：允许系统调用标准的 Windows 临时目录（`AppData\Local\Temp`）进行进程通信与临时交换，无需强行重定向底层系统变量。

## 3. 当前项目架构与任务基准
- **项目品牌**：PornMake（Wan 2.2 Studio）
- **核心定位**：底层基于阿里 Wan 2.2 视频大模型（14B T2V / I2V）的商业级 AI 视频生成平台。
- **UI 风格**：深邃黑金赛博风，全站保持唯一专属顶栏 `<Navbar />`（严禁出现旧模板与多导航重叠）。
- **算力接入**：通过环境变量 `COMFYUI_API_URL` 对接 Wan 2.2 ComfyUI GPU 算力集群，`/api/generate` 负责下发与结果轮询。

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
