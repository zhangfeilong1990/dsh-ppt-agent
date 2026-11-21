---
name: ppt-logic
description: 基于分层素材结构，决定正文页的总结与 Insight 形态，生成带证据引用的页序列大纲。
whenToUse: 当素材已按板块整理并确认，需要确定总结/Insight 形态、分配页数与页序时使用。
---

# PPT 逻辑框架（Logic）

## 职责边界

决定**正文讲什么、分几个板块、总结和 Insight 放在哪、按什么顺序展开**。不选版式，不做视觉，不改写素材原文。

## 输入

`ppt-intake` 产出的分层结构：`summary`、`sections`、`items`、`notes`、`insight`、`gaps`。

## 输入校验

进入页序设计前，先校验项目符号稿：

1. **层级缩进**：`■` 顶格；`•` 4 空格；`-` 6 空格；`·` 8 空格。
2. **备注与 Insight 例外**：`◇ 备注` 和 `→ Insight` 页下的 `-` 用 4 空格、`·` 用 6 空格，不要求先有 `•`。
3. **归属**：每个 `•` 必须挂在最近的 `■` 或 `※` 下；每个 `-` 必须挂在最近的 `•` 下（备注/Insight 页除外）。
4. **样式标记**：`{{字号|#RRGGBB|b}}`；字号 6–96，颜色为 6 位十六进制，`b` 表示加粗；空标记或未知项视为错误。
5. **素材 ID**：`#M-xxx` 必须存在于素材台账；不存在的报错。
6. **最低要求**：全文至少一个 `■`；没有任何 `•` 时给出警告。

校验有错误时，退回 `ppt-intake` 修正，不进入页序设计。可执行工作区的 `validate_outline.py` 得到同样结果。

## 第一步：先问三件事

进入页序设计前，先向用户确认：

1. **正文页要不要总结？**
   - `none`：不要总结
   - `sentence`：只要一句总结句
   - `box`：要总结框（规格待定，默认按 gene 的 16pt / 22mm 高）
2. **正文最下面要不要 Insight 句？**
   - `none`：不要
   - `line`：一行 Insight 句
   - `box`：独立浅灰底框
3. **正文分多个板块时，板块要不要总结句？**
   - `none`：板块不写总结
   - `selected`：只给重点板块写
   - `all`：每个板块都写

用户可以只给部分答案；未回答的项按 `none` 处理，并在输出中标注“未指定，按 none”。

## 第二步：判定正文页数与大/小报告

1. **先读稿子顶部的「◆ 任务简报」**：里面有正文页数就按它定 `scale`，不再按素材量自动升级。
2. 简报里没有页数时，才问用户「正文计划几页」。
3. 正文 1–2 页 → `small`（无封面目录，附件可选）。
4. 正文超过 2 页 → `large`（封面+目录+正文+附件可选）。
5. 用户也没给页数时，按板块数量和素材密度给一个建议页数，并说明依据。

## 第三步：逐页写论点

每个页面条目必须包含：

| 字段 | 含义 |
|---|---|
| `seq` | 页码顺序 |
| `role` | `cover` / `toc` / `content` / `appendix` |
| `argument` | 这一页的核心论点，一句话，优先写成行动标题 |
| `evidence_ids` | 支撑论点的素材条目 ID |
| `page_intent` | `展示结论` / `对比` / `数据叙事` / `罗列要点` / `案例` |
| `source_notes` | 页面上的来源/口径/缺口提示 |

正文页额外字段：

| 字段 | 含义 |
|---|---|
| `summary` | 正文页总结，按 `summary_style` 填写；`none` 时留空 |
| `sections` | 正文板块列表，每个板块含 `title`、`argument`、`evidence_ids`、`section_summary` |
| `insight_line` | 最下面 Insight 句，按 `insight_style` 填写；`none` 时留空 |
| `insight_evidence_ids` | Insight 的依据素材 ID |

规则：

1. **一页一论点**：一页只承担一个核心结论；两个结论就拆两页。
2. **论点可回指**：`argument` 中的事实性表述必须能在 `evidence_ids` 找到支撑；找不到的标注「待确认」。
3. **板块级总结按策略**：`selected` 时只给承担核心结论的板块写；`all` 时每个板块都写一句。
4. **附件对应正文**：附件页加 `explains` 字段，写明它解释正文的哪个板块。

## Insight 规则

- **个数不固定**：整体可以只给一条；正文分多个主要板块时，每个板块可各有一条。
- **位置不固定**：大报告可以单独成页；也可以放在正文页最下面一行，或作为页内一个模块。
- **标识统一**：项目符号稿用 `→`，版式层用 `insight` 槽位。
- 输出 `insight_scope: overall | per_section | none`，并在 `pages[].insight_line` 或 `sections[].insight` 中给出。

## 版式约束（传给 layout）

- 页码位于右上角，**与正文标题文字水平居中对齐**；实现方式：页码行中心与标题行中心同高。
- 正文页的总结框、Insight 行、板块总结句的具体字号与高度待定，先按 gene 默认值，用户调整后写入 gene。

## 输出格式

```yaml
report_type: 产品发布解读
scale: small
skeleton_id: 产品发布解读-单页正文+附件详解-v1
summary_style: box
insight_style: line
section_summary_policy: none
page_number_alignment: title_horizontal_center
pages:
  - seq: 1
    role: content
    argument: "……"
    evidence_ids: [M-001, M-002]
    page_intent: 展示结论
    summary: "……"
    sections:
      - title: 昆仑平台
        argument: "……"
        evidence_ids: [M-003, M-004]
        section_summary: ""
      - title: 昆仑超级增程
        argument: "……"
        evidence_ids: [M-005, M-006]
        section_summary: ""
    insight_line: "……"
    insight_evidence_ids: [M-010]
    source_notes: ["年份待确认（G-001）"]
  - seq: 2
    role: appendix
    explains: 昆仑平台
    argument: "……"
    evidence_ids: [M-003, M-004]
    page_intent: 罗列要点
    source_notes: []
```

## 交互协议

1. 先问第一步的三件事和正文页数，再出大纲。
2. 以「页码 → 论点 → 板块 → 证据」的表格展示，请用户确认。
3. 用户调整时只改被指出的页或板块，不重做整份大纲。
4. 用户确认后才交给 `ppt-layout`。
