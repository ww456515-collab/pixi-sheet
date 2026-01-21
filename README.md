# PixiSheet - High Performance Spreadsheet Editor

基于 Pixi.js 开发的高性能 Excel 表格编辑器基础架构。

## 项目特性

- **高性能渲染**: 使用 Pixi.js (WebGL) 进行渲染，支持百万级单元格流畅滚动。
- **无限滚动**: 实现了虚拟滚动 (Virtualization) 机制，只渲染视口可见区域。
- **模块化架构**:
  - `Spreadsheet`: 核心控制器，管理 Pixi 应用和交互。
  - `Grid`: 负责绘制网格线。
  - `CellsLayer`: 负责绘制单元格内容。
  - `ColumnHeaders` / `RowHeaders`: 独立的行列头渲染层。
  - `DataModel`: 数据模型，管理单元格数据。

## 目录结构

```
src/
├── core/
│   ├── Config.ts        # 全局配置 (单元格大小, 颜色等)
│   ├── Spreadsheet.ts   # 主入口类
│   ├── Grid.ts          # 网格渲染
│   ├── CellsLayer.ts    # 单元格内容渲染
│   ├── ColumnHeaders.ts # 列头渲染
│   ├── RowHeaders.ts    # 行头渲染
│   └── DataModel.ts     # 数据管理
├── main.ts              # 应用启动
└── style.css            # 基础样式
```

## 运行项目

1. 安装依赖:
   ```bash
   npm install
   ```

2. 启动开发服务器:
   ```bash
   npm run dev
   ```

3. 构建生产版本:
   ```bash
   npm run build
   ```

## 下一步开发建议

1. **交互增强**: 实现单元格选中、多选、拖拽。
2. **编辑功能**: 集成 DOM Input 元素覆盖在 Canvas 上实现编辑功能。
3. **样式支持**: 扩展 `CellData` 接口支持背景色、字体样式等。
4. **公式引擎**: 集成公式解析库。
