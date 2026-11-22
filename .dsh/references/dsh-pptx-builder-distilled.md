# dsh-pptx-builder 蒸馏笔记

来源：`dsh-pptx-builder` 1.1.0，MIT，作者 dsh-pptx-builder contributors。
特点：不依赖 Office，自己写 ZIP + OOXML，每次调用后文件仍有效。

## 能力

### 10 个模板

| 模板 | 布局 |
|---|---|
| `title` | 超大居中标题 + 副标题 + 右下汇报人，页码关 |
| `section` | 居中分隔页 |
| `content` | 居中标题 + 定宽正文列 |
| `split-left` / `split-right` | 一半图片、一半标题与正文，各自在自己的区域里居中 |
| `chart` | 顶部标题与结论句，下方留给图表 |
| `code` | 顶部标题与副标题，下方留给代码卡 |
| `math` | 顶部标题，下方留给公式 |
| `closing` | 居中结束页 |
| `blank` | 纯背景 |

共性：**每个模板把自己的内容在自己的区域里几何居中**，不靠眼调。

### 5 套 pastel 调色板

`sand`（默认）、`mint`、`lavender`、`sky`、`rose`。每套定义背景、正文墨色、次要灰、强调色、图表系列色。

### 元素与坐标

- 坐标单位：英寸，原点左上；16:9 为 13.333×7.5。
- 字号单位：pt。
- 颜色：`#RRGGBB`、基本色名，或调色板关键字 `ink` / `muted` / `accent` / `background`。
- 每个元素有 id，`pptx_inspect` 看、`pptx_update_element` 改、`pptx_remove` 删。

### 图表

`pptx_add_chart` 接收数据而非代码：`categories` + `series`，支持 bar/stacked/line/area/pie/donut。
Python + Pillow 渲染成 1800×1000 PNG 后嵌入，自带网格、轴标签、图例、数值标签、来源脚注。

### 代码卡

深色圆角卡片，语法高亮、行号、文件名头、语言标签、高亮行。语言：python/javascript/typescript/json/bash/sql/text。
约束：单行 ≤90 字符，片段 ≤60 行。

### 公式

LaTeX 自研排版，不装 TeX；输出 300dpi 透明 PNG。
支持分数、根、上下标、积分求和、矩阵、cases/aligned、希腊字母、`\mathbb`/`\mathcal`/`\mathbf`、重音、关系符、`\text{}`。
关键结果 40–56pt，次要 28–32pt；超长公式拆页而不是缩字。

## 对我们怎么用

1. **导出后端**：画布的 `{text, layout, size}` 可以映射成 `pptx_create` + `pptx_add_slide` + `pptx_add_text` + `pptx_add_chart`，省掉自己写 OOXML。
2. **模板参考**：它的 10 个模板与我们母题库一一对应，可作为 `ppt-layout` 的槽位参考。
3. **公式与代码**：需要放公式或代码卡时，直接调它的工具，不用另找库。
4. **看效果**：`pptx_gallery({style:'features'})` 生成模板总览，`showcase` 生成商务示例。

## 与我们自研导出的关系

| 场景 | 用哪个 |
|---|---|
| 画布对象已排好，要精确还原坐标 | `render_canvas_pptx.py`（按 x/y/w/h 写） |
| 要模板化、要公式/代码卡/调色板 | `dsh-pptx-builder` 的 `pptx_*` |
| 要设计级成稿、20 范本 | `dsh-ppt` |
| 要严格门禁与原生图表 | `dsh-ppt-studio` |

## 卸载影响

- 蒸馏笔记是文件，卸载不丢。
- 卸载后失去 `pptx_*` 工具，上面第 1–4 条用法失效。
- 如果只保留“规则与素材”，可以卸载；如果要继续用这些工具导出，保留。
