# AGENTS.md — 情侣点菜应用开发指南

## 项目概述

这是一个私人情侣生活 H5 应用——"今晚想吃什么 ❤️"。
女朋友在手机微信中浏览男友会做的菜，选择今晚想吃的；男友下班前查看菜单和自动生成的食材采购清单。

**这不是商业外卖平台**，是温馨的私人生活工具。

## 技术栈

- **框架**: React 19 + Vite 8
- **语言**: JavaScript（不使用 TypeScript）
- **样式**: 纯 CSS（CSS Modules）
- **数据**: localStorage（第一阶段）
- **路由**: 基于 hash 的简易路由（自行实现，无需 react-router）
- **后端**: 无（第一阶段）
- **目标平台**: iPhone + 微信内置浏览器

## 目录结构

```
couple-menu/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── images/dishes/        # 菜品图片
├── src/
│   ├── main.jsx              # 入口
│   ├── App.jsx               # 根组件 + 路由
│   ├── index.css             # 全局样式 + CSS 变量
│   ├── components/           # UI 组件
│   │   ├── common/           # 通用组件（按钮、卡片壳、空状态等）
│   │   ├── dish/             # 菜品相关组件（菜品卡片、菜品列表、分类标签）
│   │   ├── tonight/          # 今晚菜单相关组件
│   │   └── recommend/        # 随机推荐组件
│   ├── pages/                # 页面级组件
│   ├── data/                 # 初始菜品数据、常量定义
│   ├── services/             # localStorage 操作封装
│   ├── styles/               # 全局样式模块
│   └── utils/                # 工具函数
└── AGENTS.md
```

## 编码约定

### 文件命名
- 组件文件：`PascalCase.jsx` + `PascalCase.module.css`
- 工具/服务文件：`camelCase.js`
- 常量/数据文件：`camelCase.js`

### 组件规范
- 使用函数式组件 + Hooks
- 使用 CSS Modules 做样式隔离
- Props 解构写在参数位置
- 每个组件一个文件，同目录下配对 CSS Module

### 样式规范
- 设计变量统一定义在 `src/index.css` 的 `:root` 中
- 圆角默认 16px（卡片）、24px（按钮）、999px（标签）
- 主色调：暖粉 `#FF6B8A`，辅助色：浅粉 `#FFF0F3`
- 间距系统：4px 基础单元（4/8/12/16/20/24/32/48）
- 移动端优先，断点 768px

### 文案风格
- 生活化、亲切、温暖
- 不要使用商业/外卖术语（购物车→今晚菜单，订单→菜单，提交订单→就吃这些 ❤️）
- 适当使用 emoji 增加趣味，但不过度

### 数据约定
- localStorage key 统一用 `coupleMenu_` 前缀
- 日期格式使用 `YYYY-MM-DD`
- ID 生成使用 `Date.now().toString(36) + Math.random().toString(36).slice(2)`

## 微信 H5 适配注意事项

- viewport 使用 `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`
- 安全区域使用 `env(safe-area-inset-bottom)` 处理 iPhone 底部
- 图片使用 webp 格式优先，降级 jpg
- 避免使用 `:hover` 作为唯一交互反馈，配合 `:active` 使用
- 底部固定栏需要考虑虚拟键盘弹出时的行为
