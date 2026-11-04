export interface ArsenalItem {
  id: string;
  name: string;
  category: string;
  proficiency: string;
  skillTitle: string;
  description: string;
  highlightColor: string;
  accentBg: string;
  iconType:
    | 'figma'
    | 'photoshop'
    | 'illustrator'
    | 'pr'
    | 'react'
    | 'framer'
    | 'aistudio'
    | 'cursor'
    | 'vscode'
    | 'python'
    | 'java'
    | 'sql'
    | 'notion';
}

export const ARSENAL_ITEMS: ArsenalItem[] = [
  // --- Row 1: 视觉与交互体验设计 ---
  {
    id: 'figma',
    name: 'Figma',
    category: 'UI/UX 设计',
    proficiency: '核心主力',
    skillTitle: '界面设计 · 交互系统 · 响应式',
    description: '熟练构建跨端 Design System、Variables 变量、Auto Layout 响应式弹性布局与高保真微交互原型。',
    highlightColor: '#F24E1E',
    accentBg: '#FFF1EE',
    iconType: 'figma',
  },
  {
    id: 'photoshop',
    name: 'Photoshop',
    category: '视觉设计',
    proficiency: '熟练精修',
    skillTitle: '图像精修 · 拟物光影 · 贴图',
    description: '擅长视觉合成、拟物光影推敲、实拍材质贴图渲染与全套海报/物料视觉打磨。',
    highlightColor: '#31A8FF',
    accentBg: '#EBF6FF',
    iconType: 'photoshop',
  },
  {
    id: 'illustrator',
    name: 'Illustrator',
    category: '矢量图形',
    proficiency: '标准规范',
    skillTitle: '品牌标识 · 矢量图标 · 规范',
    description: '精通矢量贝塞尔曲线推导、品牌 Logo 规范制图、图标体系与视觉印刷设计。',
    highlightColor: '#FF9A00',
    accentBg: '#FFF7EB',
    iconType: 'illustrator',
  },
  {
    id: 'pr',
    name: 'Premiere Pro',
    category: '影视剪辑',
    proficiency: '精剪卡点',
    skillTitle: '视频剪辑 · 声画调色 · 转场',
    description: '熟练进行产品宣传视频剪辑、多机位音画对齐、Lumetri 电影级色彩调校与视听节奏把控。',
    highlightColor: '#EA77FF',
    accentBg: '#FCF0FF',
    iconType: 'pr',
  },

  // --- Row 2: 现代前端与交互开发 ---
  {
    id: 'react',
    name: 'React',
    category: '前端工程',
    proficiency: '核心主力',
    skillTitle: '组件架构 · Hooks · 现代全栈',
    description: '深度掌握 React 19/18、Hooks 状态管理、组件解耦封装、Tailwind CSS 与高性能响应式工程构建。',
    highlightColor: '#00D8FF',
    accentBg: '#E6FAFF',
    iconType: 'react',
  },
  {
    id: 'framer',
    name: 'Framer',
    category: '交互动效',
    proficiency: '高保真发布',
    skillTitle: '网站搭建 · 物理动效 · 响应式',
    description: '能将设计稿无缝搭建为真实运行的响应式 Web，运用弹簧动效与 3D 视差丰富体验。',
    highlightColor: '#0055FF',
    accentBg: '#EEF4FF',
    iconType: 'framer',
  },
  {
    id: 'google-ai-studio',
    name: 'Google AI Studio',
    category: 'AI 原型与工程',
    proficiency: '前沿探索',
    skillTitle: 'Gemini 生态 · Agent 原型 · 多模态',
    description: '熟练运用 Google AI Studio 调试 Gemini 多模态模型、系统级 Prompt 提示词推演、API 函数调用与全功能 Web 原型极速构建。',
    highlightColor: '#1A73E8',
    accentBg: '#E8F0FE',
    iconType: 'aistudio',
  },
  {
    id: 'vscode',
    name: 'VS Code',
    category: '代码工程',
    proficiency: '日常开发',
    skillTitle: 'Web 前端 · Git 工作流',
    description: '熟悉前端工程化开发、Git 版本协作、组件化抽象与交互原型快速验证。',
    highlightColor: '#007ACC',
    accentBg: '#EFF8FF',
    iconType: 'vscode',
  },

  // --- Row 3: 后端工程、数据分析与产品管理 ---
  {
    id: 'python',
    name: 'Python',
    category: '后端与脚本',
    proficiency: '数据自动化',
    skillTitle: '数据处理 · 自动化脚本 · 爬虫',
    description: '熟练编写数据清洗、自动化运维脚本与网络爬虫，结合轻量框架搭建后端数据与原型接口。',
    highlightColor: '#3776AB',
    accentBg: '#EAF2F8',
    iconType: 'python',
  },
  {
    id: 'java',
    name: 'Java',
    category: '后端工程',
    proficiency: '面向对象',
    skillTitle: '面向对象 · 集合体系 · Spring 架构',
    description: '掌握 Java 面向对象核心思想、常用集合容器、MVC 分层架构与企业级后端业务逻辑推演。',
    highlightColor: '#EA580C',
    accentBg: '#FFF3E8',
    iconType: 'java',
  },
  {
    id: 'sql',
    name: 'SQL',
    category: '数据存储',
    proficiency: '查询与建模',
    skillTitle: '关系型数据库 · 复杂查询 · 索引优化',
    description: '熟练编写多表 JOIN、聚合查询、事务处理，进行规范化表结构设计与查询性能优化。',
    highlightColor: '#00758F',
    accentBg: '#E6F5F8',
    iconType: 'sql',
  },
  {
    id: 'notion',
    name: 'Notion',
    category: '产品管理',
    proficiency: '需求框架',
    skillTitle: 'PRD 文档 · 知识中枢 · 敏捷',
    description: '善于拆解业务逻辑与用户旅程，编写清晰规范的 PRD 需求文档，搭建个人与项目知识库。',
    highlightColor: '#292727',
    accentBg: '#F3F2F0',
    iconType: 'notion',
  },
];
