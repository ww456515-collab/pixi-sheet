# PixiSheet 开发路线图 (Development Roadmap)

本项目旨在构建一个基于 Web (PixiJS) 的高性能电子表格编辑器。以下是参考 Excel 核心功能整理的详细开发清单，按优先级和功能模块划分。

## ✅ 第一阶段：核心基础 (Core Foundation) - [进行中]
构建电子表格的骨架，实现最基本的数据展示和交互。

- [x] **网格渲染 (Grid Rendering)**
    - [x] 基于 PixiJS 的高性能网格绘制
    - [x] 虚拟滚动 (Virtual Scrolling) 支持大数据量
    - [x] 行号与列标 (Headers)
- [x] **基本交互 (Basic Interaction)**
    - [x] 单元格选择 (单选、区域选择)
    - [x] 行/列 调整大小 (Resizing)
    - [x] 键盘导航 (方向键移动)
- [x] **数据编辑 (Data Editing)**
    - [x] 双击进入编辑模式
    - [x] 基础文本输入与保存
- [x] **行列操作 (Row/Col Operations)**
    - [x] 插入行/列
    - [x] 删除行/列
    - [x] 隐藏/显示行列 (基础支持)
- [x] **基础样式 (Basic Styling)**
    - [x] 单元格合并 (Merge Cells)
    - [x] 文本对齐 (左/中/右)

---

## 🚀 第二阶段：样式与格式化 (Styling & Formatting)
丰富单元格的表现力，使其看起来更像一个现代电子表格。

- [ ] **字体样式 (Font Styles)**
    - [ ] 字体加粗 (Bold)、斜体 (Italic)、下划线 (Underline)
    - [ ] 字体颜色 (Font Color)
    - [ ] 字体大小与字体家族 (Font Size & Family)
- [ ] **单元格外观 (Cell Appearance)**
    - [ ] 背景填充色 (Fill Color)
    - [ ] 边框设置 (Borders - 上下左右、粗细、颜色)
- [ ] **文本排版 (Text Layout)**
    - [ ] 垂直对齐 (顶部/居中/底部)
    - [ ] 文本自动换行 (Text Wrapping)
    - [ ] 文本溢出处理 (Clip/Overflow)
- [ ] **数据格式化 (Number Formatting)**
    - [ ] 纯文本 (Text)
    - [ ] 数值 (Number - 小数位数控制)
    - [ ] 货币 (Currency)
    - [ ] 百分比 (Percentage)
    - [ ] 日期/时间 (Date/Time)

---

## 🧠 第三阶段：公式与计算 (Formulas & Calculation)
电子表格的核心灵魂，实现数据联动与计算。

- [ ] **公式引擎 (Formula Engine)**
    - [ ] 词法分析与解析器 (Parser)
    - [ ] 依赖图构建 (Dependency Graph) 用于自动重算
    - [ ] 循环引用检测
- [ ] **基础运算**
    - [ ] 四则运算 (+, -, *, /)
    - [ ] 比较运算符 (>, <, =, <>)
- [ ] **内置函数库 (Function Library)**
    - [ ] 统计函数: `SUM`, `AVERAGE`, `COUNT`, `MAX`, `MIN`
    - [ ] 逻辑函数: `IF`, `AND`, `OR`
    - [ ] 查找引用: `VLOOKUP`, `INDEX`, `MATCH`
    - [ ] 文本函数: `CONCATENATE`, `LEFT`, `RIGHT`
- [ ] **引用支持**
    - [ ] 相对引用 (A1)
    - [ ] 绝对引用 ($A$1)
    - [ ] 跨表引用 (Sheet2!A1)

---

## 🛠️ 第四阶段：数据管理与操作 (Data Management)
提升处理数据的效率。

- [ ] **剪贴板操作 (Clipboard)**
    - [ ] 复制/粘贴 (内部数据结构)
    - [ ] 与系统剪贴板互通 (支持从 Excel/网页 复制粘贴文本)
- [ ] **历史记录 (History)**
    - [ ] 撤销 (Undo) / 重做 (Redo) 栈管理
- [ ] **排序与筛选 (Sort & Filter)**
    - [ ] 升序/降序排列
    - [ ] 自动筛选器 (Filter UI)
- [ ] **查找与替换 (Find & Replace)**
    - [ ] 全局搜索与高亮
    - [ ] 批量替换
- [ ] **数据验证 (Data Validation)**
    - [ ] 下拉列表 (Dropdown List)
    - [ ] 数据类型限制 (仅数字、日期等)

---

## 👁️ 第五阶段：视图与工作表 (View & Worksheets)
增强整体布局和多表管理能力。

- [ ] **冻结窗格 (Freeze Panes)**
    - [ ] 冻结首行/首列
    - [ ] 冻结任意区域
- [ ] **多工作表 (Multi-Sheets)**
    - [ ] 底部 Sheet 标签页栏
    - [ ] 新建、重命名、删除、移动工作表
- [ ] **缩放 (Zoom)**
    - [ ] 画布缩放支持

---

## 📊 第六阶段：高级功能 (Advanced Features)
向专业级软件靠拢。

- [ ] **图表 (Charts)**
    - [ ] 柱状图、折线图、饼图 (集成 Chart.js 或 ECharts)
- [ ] **图片与形状 (Images & Shapes)**
    - [ ] 插入图片 (支持缩放、拖拽)
    - [ ] 插入基本形状
- [ ] **条件格式 (Conditional Formatting)**
    - [ ] 数据条、色阶
    - [ ] 基于规则的高亮 (如：大于 100 标红)
- [ ] **导入导出 (Import/Export)**
    - [ ] 导出为 JSON
    - [ ] 导出为 CSV/XLSX (使用 SheetJS)
    - [ ] 导入 Excel 文件

---

## ⚙️ 系统架构优化 (Infrastructure)
- [ ] **性能优化**：针对百万级单元格的渲染与内存优化
- [ ] **协同编辑 (Collaboration)**：基于 WebSocket + CRDT (Yjs) 的多人实时协作 [远期目标]
- [ ] **移动端适配**：触摸事件支持
