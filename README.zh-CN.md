<h1 align="center">🏞️ Diorama Journey</h1>
<p align="center"><strong>用微型 3D 世界讲述一个完整的故事。</strong><br>一个贯穿始终的元素 · 相互连接的章节 · 配音视频与配套演示文稿</p>
<p align="center"><a href="README.md">English</a> · 简体中文</p>
<p align="center">
  <a href="https://github.com/nocoo/diorama-journey/actions/workflows/ci.yml"><img src="https://github.com/nocoo/diorama-journey/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <img src="https://img.shields.io/badge/Agent-Skill-748967" alt="Agent Skill" />
  <img src="https://img.shields.io/badge/Remotion-4.0-0B84F3?logo=remotion&logoColor=white" alt="Remotion 4" />
  <img src="https://img.shields.io/badge/Three.js-3D-333333?logo=threedotjs&logoColor=white" alt="Three.js" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/Skill_code-MIT-668B70" alt="MIT skill 代码" /></a>
</p>

<p align="center"><img src="docs/images/example.jpg" width="960" alt="一盏琥珀色小灯穿过由拱门、树木和石板小路构成的原创微型岛屿" /></p>
<p align="center"><a href="https://nocoo.github.io/diorama-journey/">打开在线示例</a> · <a href="https://github.com/nocoo/diorama-journey/releases/latest">下载完整制作文件</a></p>

## 这是什么

Diorama Journey 是一个开源 Agent Skill，将大纲、报告、课程、流程或项目材料，组织成穿越微型 3D 世界的配音故事。一个角色、物件或信号沿着连贯的路径经过各个章节，通过建筑和实际动作解释内容。

仓库包含可运行的 React / Three.js / Remotion 模板、制作流程和导出工具。输入可以来自任何用户提供的材料，运行不依赖个人工作目录、某个产品仓库或特定发布平台。

原创示例 **A small idea, shared** 让一盏小灯依次经过起点、瞭望台、工坊、桥梁和花园。全片 68.1 秒，1920 × 1080、30 fps，配有英文旁白和程序合成的原创音乐。

## 输出内容

| 交付物 | 包含内容 |
| --- | --- |
| 完整视频 | 完成音频处理的 H.264 / AAC MP4，以及 SRT 字幕 |
| 章节切片 | 每章独立 MP4、精确到帧的边界，以及从零开始计时的章节字幕 |
| 配音 | 逐章 MP3、句子时间信息、缓存签名，以及完整独立 WAV / MP3 人声轨道 |
| 配乐 | 与故事时间轴匹配的原创合成 WAV / MP3 |
| 图片 | 干净封面、章节关键帧、幻灯片 PNG 和故事板 |
| 演示文稿 | **PPTX、PDF、ODP**，PPTX / ODP 内含原生演讲备注 |
| 审片网站 | 成片播放、实时 3D 动画、章节跳转和文件下载 |
| 制作过程 | 简报、源码快照、阶段检查点、渲染记录、验证报告和带校验值的 ZIP |

幻灯片使用完整画面的关键帧图片，以保留视频构图。演讲备注可编辑；画面中的 3D 对象和标题文字并不是独立的可编辑形状。

## 安装

使用 [skills CLI](https://skills.sh/)：

```sh
npx skills add nocoo/diorama-journey
```

也可以将整个仓库克隆到 Agent 支持的 skill 目录。以 Codex 为例：

```sh
git clone https://github.com/nocoo/diorama-journey.git ~/.agents/skills/diorama-journey
```

其他支持 [Agent Skills 格式](https://agentskills.io/)的 Agent 可以使用同一套 `SKILL.md`、`scripts/`、`references/` 和 `assets/`。执行制作流程需要 Agent 能够读写本地文件并运行命令。

## 交给 Agent 制作

```text
使用 $diorama-journey，把这份流程说明做成 90 秒的微型 3D 视频。
用一个包裹贯穿整个系统，使用中文旁白，输出完整视频、章节切片、
PowerPoint、PDF、演讲备注和制作归档。
```

```text
使用 $diorama-journey，把这份阶段总结组织成一个有配音的视觉旅程。
用一粒种子贯穿各章，成果描述以提供的材料为依据，
最后的幻灯片要适合现场演讲。
```

Agent 会组织故事、实现各章的 3D 动作、生成配音、检查关键帧和转场，再导出完整交付物。模板是起点：修改文字并不会自动创造新的场景动作。

## 自己运行示例

| 依赖 | 用途 |
| --- | --- |
| React + Remotion | 画面组合、逐帧时间轴、播放和视频渲染 |
| Three.js + React Three Fiber | 3D 几何、材质、灯光和镜头运动 |
| Node.js + TypeScript + Vite | 构建工具和审片网站 |
| 支持 WebGL 的 Chrome / Chromium | 浏览器渲染；可由 Remotion 安装 |
| FFmpeg / ffprobe | 音频处理、逐章切片和媒体校验 |
| Python + uv | 按固定版本管理媒体脚本依赖 |
| edge-tts | 通过微软在线语音服务生成新旁白 |
| python-pptx、odfpy、ReportLab、Pillow、pypdf | 演示文稿导出与读取校验 |
| NumPy | 合成原创配乐，无需接入音乐服务 |

渲染内置示例无需模型 API、3D 素材市场或托管账户。使用已有配音或其他语音服务时，需调整配音脚本，并保留[相同的输出约定](references/production.md)。

准备 Node.js 22.12+、Python 3.11+、[uv](https://docs.astral.sh/uv/)、FFmpeg，以及支持 WebGL 的 Chrome。媒体脚本使用 uv 管理的 Python 3.12。先检查环境并创建独立制作目录：

```sh
git clone https://github.com/nocoo/diorama-journey.git
cd diorama-journey
python3 scripts/doctor.py
python3 scripts/create_project.py my-story --output ../productions
```

进入命令输出的制作目录：

```sh
npm ci
npm run voice
npm run sound
npm run dev
```

打开 **http://127.0.0.1:7410**。示例带有缓存配音，文字不变时无需再次请求语音服务。首次下载依赖和浏览器仍需网络；新增旁白通过 `edge-tts` 调用微软在线语音服务，当前实现无需 Azure Key。

修改并检查故事后，执行：

```sh
npm run stills
npm run poster
npm run sample
npm run render
npm run verify
npm run build
npm run review -- http://127.0.0.1:7410/
npm run archive
```

新增文字需要额外字形时执行 `npm run fonts`。只更新演示文稿或章节切片，可分别执行 `npm run slides`、`npm run clips`。`CHROME_PATH` 指定浏览器，`RENDER_CONCURRENCY=1` 可降低渲染并发。完整顺序见[制作说明](references/production.md)。

网站部署到子目录时，构建前设置 `BASE_PATH=/your-path/`。可选的 `VITE_SKILL_URL` 和 `VITE_RELEASE_URL` 用于添加仓库与归档链接。

## 公开项目参考

<p align="center"><img src="docs/images/raven-reference.jpg" width="960" alt="公开项目 Raven 的视频画面：信使带着一封信穿过微型建筑世界" /></p>

公开项目 [Raven](https://github.com/nocoo/raven) 的成片展示了相同的叙事方法：信使和信件贯穿整个旅程。这张参考图放在模板之外；默认示例、源码和导出文件均采用通用故事。

## 仓库结构

```text
SKILL.md                  Agent 制作流程与关键约束
agents/openai.yaml        可选的 Codex 展示元数据
scripts/                  环境检查与制作目录创建
references/               叙事、美术、渲染与交付约定
assets/starter/           可运行的 3D 故事与导出工具
docs/images/              通用示例与公开项目参考图
```

[交付物说明](references/deliverables.md)列出了每种文件的位置和归档规则。完整制作放在独立目录中，成片和大型归档通过 Release 分发。

## 开发与验证

```sh
python3 -m unittest discover -s tests
cd assets/starter
npm ci
npm run typecheck
npm test
python3 -m unittest discover -s tests -p 'test_*.py'
npm run build
```

CI 检查独立模板创建、时间轴约定、TypeScript、网站构建、Linux WebGL 渲染，以及幻灯片和备注的导出读取。发布示例还会执行完整渲染和验证。已测试环境与验收范围见[验证记录](docs/validation.md)。

## 许可证

Skill 指令、原创示例代码和辅助脚本使用 [MIT](LICENSE)。依赖保留各自条款，其中包括 **Remotion License**；字体使用 SIL OFL。详见[第三方材料说明](THIRD_PARTY_NOTICES.md)。
