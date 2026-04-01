<p align="center">
  <picture>
    <img alt="ClawXMemory" src="./image/logo.png" width="65%">
  </picture>
</p>

<p align="center">
  <b>面向长期上下文的多层记忆系统</b>
</p>

<p align="center">
  <a href="../LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
  <a href="https://github.com/OpenBMB/ClawXMemory"><img src="https://img.shields.io/github/stars/OpenBMB/ClawXMemory?style=for-the-badge" alt="Stars"></a>
  <a href="https://github.com/OpenBMB/ClawXMemory/issues"><img src="https://img.shields.io/github/issues/OpenBMB/ClawXMemory?style=for-the-badge" alt="Issues"></a>
  <a href="https://www.npmjs.com/package/openbmb-clawxmemory"><img src="https://img.shields.io/npm/v/openbmb-clawxmemory?style=for-the-badge&logo=npm" alt="npm"></a>
</p>

<p align="center">
  <b>简体中文</b> &nbsp;|&nbsp; <a href="../README.md"><b>English</b></a>
</p>

---

**最新动态** 🔥

- **[2026.04.01]** 🎉 ClawXMemory 正式开源，面向长期上下文的多层记忆系统

---

## 📖 关于 ClawXMemory

ClawXMemory 是一款由清华大学 [THUNLP](https://nlp.csai.tsinghua.edu.cn/)、[OpenBMB](https://www.openbmb.cn/home)、[面壁智能](https://modelbest.cn/)与 [AI9Stars](https://github.com/AI9Stars) 联合研发的记忆系统。

基于 EdgeClaw 内生的长期记忆能力，我们对其记忆机制进行了深度的结构化抽象与系统化扩展，并以插件化的设计模式无缝接入 OpenClaw 生态。ClawXMemory 并非对传统大模型上下文的简单堆砌，而是引入了一套结构化、多层次、可演化的长期记忆体系。在对话交互中，系统会在后台将零散信息逐步沉淀为记忆片段，并向上聚合为「项目记忆」、「时间线记忆」与「用户画像」。在生成回答时，模型将沿着这棵“记忆树”主动进行推理与定位，确保仅将真正有用且高度相关的上下文引入当前对话。

围绕“记住什么、如何组织、以及如何真正用起来”，ClawXMemory 提供了四个核心能力：

- **结构化多层记忆体系**：告别扁平的历史记录。系统将原始对话（L0）逐层抽取与聚合至记忆片段（L1）及宏观记忆（L2），构建可随用户交互持续生长、演化的立体记忆结构。
- **记忆持续沉淀**：系统能够自动感知用户的话题切换，并在用户空闲时触发记忆整理，将原始对话逐步沉淀为更高层级的结构化记忆。
- **模型驱动的选择与推理**：摒弃传统且生硬的向量检索机制。ClawXMemory 赋予模型沿着记忆索引“主动思考”的能力，逐层向下定位与推理所需上下文。
- **记忆管理与可视化**：内置可视化看板（提供画布与列表双视图），让记忆的层级与脉络一目了然。所有数据默认基于本地 SQLite 存储，支持一键导入导出，实现跨设备的无缝状态迁移。




https://github.com/user-attachments/assets/26435229-2e72-4edd-9276-f7d17519cf1c




### ⚙️ 运行机制：ClawXMemory 是如何工作的？

ClawXMemory 的核心运转逻辑可以概括为：分层记忆构建 + 模型驱动选择。它能在无形中将日常对话转化为可用于长期上下文建模的“结构化知识库”。

> [!TIP]
> **举个例子：持续推进长周期任务**
> 
> 当你使用 AI 持续推进一篇论文时，以往的讨论不会随着上下文窗口的刷新而丢失，也不会变成一堆难以关联的文本碎片；相反，它们会被系统自动汇总为该项目的「当前状态」。
> 
> 当你再次询问“我现在推进到哪一步了”时，系统会直接调取这份结构化状态进行精准解答，而非去海量历史记录中“大海捞针”。

#### 1. 多层记忆索引构建

在记忆构建阶段，ClawXMemory 会以对话流为输入，在后台静默完成信息的逐层提炼与结构化归档：

| 记忆层级 | 类型定义 | 核心含义 |
| :--- | :--- | :--- |
| **L2** | **项目记忆** | 按特定主题/任务聚合后的长期宏观记忆 |
| **L2** | **时间记忆** | 按时间线（如按天/周）聚合的周期性记忆 |
| **L1** | **记忆片段** | 针对已闭合话题生成的结构化核心摘要 |
| **L0** | **原始对话** | 最底层的原始对话消息记录 |
| **Global** | **个人画像** | 持续更新的单例全局用户画像记录 |

整个构建过程无需用户手动干预。你只需专注于自然对话与任务推进，短期上下文负责处理当下的多轮问答，而 ClawXMemory 则在后台将这些经历转化为可复用的长期资产。


<p align="center">
  <picture>
    <img alt="build memory index" src="./image/build.png" width=70%>
  </picture>
</p>

#### 2. 模型驱动的记忆选择与推理

传统记忆系统的痛点往往不在于「没有记忆」，而在于「只有检索，缺乏理解」。当用户问出 “我这个项目现在推进到哪一步了？”、“上周那个方案最后是怎么定的？” 或 “你忘了我更偏好中文表达吗？” 这类问题时，真正的技术难点并不在于算出一个高相似度的文本片段，而在于：系统是否知道该去查阅哪部分记忆，以及需要挖掘到什么深度。

ClawXMemory 的破局之道在于变“被动检索”为“主动推理”：它由模型沿着多层记忆结构主动发起探寻。首先从最高维度的「项目记忆」、「时间记忆」或「用户画像」中评估信息相关性；仅当高层信息不足以回答问题时，模型才会继续下钻，定位至更细粒度的「记忆片段」，必要时甚至精准回溯到某一关键的「原始对话」。



<p align="center">
  <picture>
    <img alt="memory selection and inference" src="./image/inference.png" width=50%>
  </picture>
</p>

整个寻址过程，更像是一个人类专家在“沿着记忆脉络逐步推演答案”，而非在数据库中盲目执行 `SELECT *`。最终，进入当前模型生成环节的，不再是“尽可能多塞入的冗长历史”，而是经过层层筛选的精准上下文。简而言之，ClawXMemory 致力于解决的并非 “如何向 Prompt 塞入更多历史”，而是 “如何精准提取并运用真正有价值的长期上下文”。



---

## 快速开始

### 安装

```bash
# 前置条件：已安装 OpenClaw

# 通过 npm 安装（推荐）
npm install -g openbmb-clawxmemory

# 或从 ClawHub 安装
openclaw plugins install clawhub:openbmb-clawxmemory
```

### 启动

```bash
openclaw gateway restart
# ClawXMemory Ready! Dashboard -> http://127.0.0.1:39393/clawxmemory/
```

完成，浏览器访问 http://127.0.0.1:39393/clawxmemory/ 即可看到 ClawXMemory 的 Dashboard。

如果本机的 `39393` 已被占用，请在 OpenClaw 插件配置里显式设置 `uiPort`：

```json
{
  "plugins": {
    "entries": {
      "openbmb-clawxmemory": {
        "config": {
          "uiPort": 40404
        }
      }
    }
  }
}
```

### 开发与调试

如果你需要进行二次开发、插件调试、或离线安装，可以从源码安装：

```bash
git clone https://github.com/OpenBMB/ClawXMemory.git
cd ClawXMemory/clawxmemory
npm install
npm run relink
```

常用开发命令，以下命令都在 `clawxmemory/` 目录执行：

```bash
# 首次把当前仓库链接到本地 OpenClaw
npm run relink

# 修改 src/ 或 ui-source/ 后重建并重新加载
npm run reload
```

### 卸载

如果你想卸载插件并恢复 OpenClaw 原生 memory 接管，可以执行：

```bash
npm run uninstall
```

此外还需要把 OpenClaw 可能残留在磁盘上的扩展目录手动删掉：

```bash
rm -rf ~/.openclaw/extensions/openbmb-clawxmemory
```

### 安装验证

执行以下命令检查插件状态：

```bash
openclaw plugins inspect openbmb-clawxmemory
# 确保输出中包含 "status: loaded"

grep -n '"memory"' ~/.openclaw/openclaw.json
# 确保输出中包含 "openbmb-clawxmemory"

openclaw gateway status
# 确保输出中包含 "service.runtime.status: running"
```

---

### 贡献

您可以通过以下标准流程来贡献：**Fork 本仓库 → 提交 Issue → 发起 Pull Request (PR)**。

如果您觉得本项目对您的研究有所帮助，欢迎点亮一颗 ⭐ 来支持我们！

---

## 📮 联系我们

<table>
  <tr>
    <td>📋 <b>Issues</b></td>
    <td>关于技术问题及功能请求，请使用 <a href="https://github.com/OpenBMB/ClawXMemory/issues">GitHub Issues</a> 功能。</td>
  </tr>
  <tr>
    <td>📧 <b>Email</b></td>
    <td>如果您有任何疑问、反馈或想与我们取得联系，请随时通过电子邮件发送至 <a href="mailto:yanyk.thu@gmail.com">yanyk.thu@gmail.com</a>。</td>
  </tr>
</table>
