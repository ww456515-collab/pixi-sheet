# PixiSheet 项目开发计划文档

## 1. 项目概述

### 1.1 项目背景与目标
**PixiSheet** 旨在构建一个基于 Web 技术的**高性能在线电子表格应用**。
传统 DOM 架构的电子表格在处理大数据量（>10万行）时存在严重的性能瓶颈。本项目利用 **Pixi.js (WebGL)** 引擎的渲染能力，结合虚拟滚动技术，实现百万级单元格的流畅浏览与编辑。
目标是将当前的渲染引擎原型，发展成为一个具备**用户管理**、**在线协作**、**数据持久化**及**企业级管理**功能的全栈应用。

### 1.2 核心功能说明
*   **高性能表格编辑**: 支持海量数据的秒级加载与流畅滚动。
*   **在线协作**: 多人实时协同编辑（类似 Google Sheets）。
*   **数据处理**: 支持复杂公式计算、筛选、排序。
*   **格式兼容**: 完美兼容 Excel (.xlsx) 文件的导入导出。

### 1.3 技术栈选择
*   **前端**:
    *   **核心渲染**: Pixi.js v8 (WebGL)
    *   **UI 框架**: React / Vue3 (用于菜单、弹窗等 DOM 界面)
    *   **语言**: TypeScript
    *   **构建**: Vite
*   **后端**:
    *   **服务框架**: Node.js (NestJS) 或 Go (Gin)
    *   **实时通信**: WebSocket (Socket.io)
    *   **协同算法**: OT (Operational Transformation) 或 CRDT
*   **数据存储**:
    *   **主数据库**: PostgreSQL (存储用户、权限、元数据)
    *   **文档存储**: MongoDB (存储表格 JSON 数据)
    *   **缓存/队列**: Redis (协同编辑缓存、任务队列)

---

## 2. 详细功能模块清单

### 2.1 用户管理模块
*   **用户认证**:
    *   注册/登录 (账号密码、OAuth2/GitHub/Google 登录)。
    *   密码找回与重置 (邮件服务)。
    *   JWT Token 鉴权机制。
*   **权限管理系统 (RBAC)**:
    *   角色: 系统管理员、普通用户、访客。
    *   文档权限: 拥有者、编辑者、查看者。
    *   支持文件夹级别的权限继承。
*   **个人资料管理**:
    *   头像上传、昵称修改。
    *   用户偏好设置 (语言、主题)。

### 2.2 核心业务模块 (Spreadsheet Engine)
*   **主要功能实现**:
    *   **Canvas 交互**: 单元格选中、拖拽填充、行列调整 (已部分实现)。
    *   **富文本编辑**: 字体、颜色、边框、背景色。
    *   **公式引擎**: 集成公式解析器 (如 Hyperformula)，支持 SUM, AVERAGE, VLOOKUP 等常用函数。
    *   **对象插入**: 图片、图表 (ECharts/Chart.js 覆盖层)。
*   **数据处理逻辑**:
    *   **协同编辑**: 基于 OT 算法的冲突解决，实现毫秒级同步。
    *   **虚拟化模型**: 仅加载视口数据，后端分块传输。
*   **业务规则引擎**:
    *   数据验证 (下拉列表、数字范围)。
    *   条件格式 (基于规则的高亮)。

### 2.3 数据管理模块
*   **数据库设计**:
    *   用户表、工作空间表、文件元数据表。
    *   版本历史表 (用于撤销/重做和历史版本回滚)。
*   **数据导入导出**:
    *   **导入**: 解析 .xlsx / .csv 文件并转换为 PixiSheet 数据模型 (使用 ExcelJS)。
    *   **导出**: 将当前状态生成 Excel 文件下载。
    *   **打印**: 生成 PDF 或打印预览。
*   **数据备份恢复**:
    *   每日自动快照。
    *   用户手动创建版本还原点。

### 2.4 系统管理模块
*   **配置管理**:
    *   系统全局参数配置 (上传限制、最大行列数)。
    *   公告发布系统。
*   **日志监控**:
    *   操作日志 (审计追踪)。
    *   性能监控 (接口响应时间、WebSocket 连接数)。
*   **系统维护**:
    *   服务状态检查。
    *   缓存清理工具。

---

## 3. 开发计划

### 3.1 各模块优先级排序
1.  **P0 - 核心编辑器完善**: 交互增强 (选区、输入)、公式引擎、基础样式。
2.  **P0 - 后端基础**: 数据库搭建、API 框架、WebSocket 服务。
3.  **P1 - 用户与权限**: 登录注册、文件列表、文件保存。
4.  **P1 - 导入导出**: Excel 兼容性。
5.  **P2 - 实时协同**: 多人光标、操作同步。
6.  **P3 - 系统管理与运维**: 监控、备份。

### 3.2 预计开发周期 (估算)
*   **阶段一: 单机编辑器完善 (1个月)**
    *   完善 Pixi 渲染层，接入公式库，实现本地 Excel 导入导出。
*   **阶段二: 全栈应用 MVP (1.5个月)**
    *   NestJS 后端搭建，用户登录，文件云端存储 (CRUD)。
*   **阶段三: 协同与优化 (2个月)**
    *   WebSocket 改造，接入 OT 算法，性能调优。

### 3.3 里程碑节点
*   **M1**: 能够打开本地 Excel 文件并流畅浏览编辑 (纯前端版)。
*   **M2**: 用户可以登录系统，创建并保存表格到服务器。
*   **M3**: 两个用户打开同一个链接，可以看到对方的操作 (协同版 Beta)。

---

## 4. 技术实现细节

### 4.1 架构设计图
```mermaid
graph TD
    Client[浏览器 (Pixi.js + React)] -->|HTTP/REST| API_Gateway[API 网关 (Nginx)]
    Client -->|WebSocket| WS_Service[协同服务 (Socket.io)]
    
    API_Gateway --> Auth_Service[认证服务]
    API_Gateway --> File_Service[文件管理服务]
    API_Gateway --> Calc_Service[计算服务 (Worker)]
    
    WS_Service --> Redis[Redis (Pub/Sub + 缓存)]
    
    File_Service --> DB_Meta[(PostgreSQL - 元数据)]
    File_Service --> DB_Data[(MongoDB - 表格内容)]
    
    File_Service --> OSS[对象存储 (附件/图片)]
```

### 4.2 API 接口规范 (示例)
*   `POST /api/v1/auth/login`: 用户登录
*   `GET /api/v1/sheets`: 获取文件列表
*   `GET /api/v1/sheets/:id`: 获取特定表格元数据
*   `POST /api/v1/sheets/:id/snapshot`: 保存表格快照
*   `POST /api/v1/files/import`: 上传 Excel 并转换

### 4.3 数据库 ER 图 (概念)
*   **Users**: `id`, `username`, `password_hash`, `email`, `created_at`
*   **Workspaces**: `id`, `owner_id`, `name`
*   **Sheets**: `id`, `workspace_id`, `title`, `data_ref_id`, `updated_at`
*   **SheetData (Mongo)**: `{ _id, cells: { "r1_c1": { v: 1, s: {...} } }, merges: [...] }`
*   **Permissions**: `sheet_id`, `user_id`, `role` (read/write/admin)

---

## 5. 测试计划

### 5.1 单元测试覆盖率要求
*   **核心逻辑 (DataModel, Formula)**: 覆盖率 > 90%。
*   **工具函数 (Utils)**: 覆盖率 100%。
*   **后端 Service**: 覆盖率 > 80%。
*   使用 Jest 作为测试框架。

### 5.2 集成测试方案
*   **API 测试**: 使用 Postman/Supertest 测试所有 REST 接口。
*   **协同测试**: 模拟多客户端连接 WebSocket，验证操作一致性。

### 5.3 性能测试指标
*   **首屏加载**: < 1.5秒 (打开 1MB 数据的文件)。
*   **滚动帧率**: 保持 60fps (100万行数据)。
*   **协同延迟**: < 100ms。
*   **最大并发**: 单实例支持 1000+ 在线连接。

---

## 6. 部署方案

### 6.1 环境要求
*   **OS**: Linux (Ubuntu 20.04+)
*   **Runtime**: Node.js 18+ / Docker
*   **Database**: PostgreSQL 14+, MongoDB 5+, Redis 6+

### 6.2 部署流程
1.  **CI/CD**: 代码提交 GitLab/GitHub -> Jenkins/Actions 构建 Docker 镜像。
2.  **编排**: 使用 Docker Compose 或 Kubernetes (K8s) 部署服务。
3.  **反向代理**: Nginx 配置 SSL 证书与负载均衡。

### 6.3 运维监控
*   **日志**: ELK Stack (Elasticsearch, Logstash, Kibana) 收集日志。
*   **监控**: Prometheus + Grafana 监控服务器资源与业务指标。
*   **报警**: 钉钉/邮件报警 (服务宕机、CPU > 80%)。
