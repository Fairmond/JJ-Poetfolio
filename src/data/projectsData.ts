import { ProjectItem, ContactInfo } from '../types';

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'lifa-livefor',
    title: '理法 LIVEFOR',
    subtitle: '品牌设计 · UX&UI设计 · 官网搭建',
    category: '品牌设计 · UX&UI设计 · 官网搭建',
    status: 'view',
    statusText: '► 浏览',
    description: '理法 LIVEFOR 品牌全案设计与官方网站数字化体验搭建。在该项目中，我主导了完整的品牌设计工作：涵盖品牌核心理念梳理、中英文 Logo 标志设计与全套 VI 视觉识别规范制定，确立了以极简纯粹的黑白灰为基石、配合点睛活力红的品牌色彩与视觉调性；同时深度负责了后续的 UX&UI 交互系统设计与前台高保真响应式官网构建，实现了从品牌从无到有的视觉创建到线上数字化门户落地的完整闭环。',
    tags: ['Brand Identity', 'Logo & VI System', 'UX/UI Design', 'Web Architecture', 'Design System'],
    bannerBg: 'from-amber-900/80 via-neutral-900 to-black',
    deliverables: [
      '品牌设计工作：Logo 标志设计、品牌理念提炼、中英文字形与全套 VI 视觉识别规范推演',
      '视觉与色彩系统：确立品牌核心色盘、排版字阶准则与包装/印刷物料延展视觉规范',
      '体验与交互设计：跨端 UX 用户体验旅程规划、高保真 UI 界面系统与响应式组件库搭建',
      '数字化全端落地：响应式 Web 官方门户全流程构建、微交互与动效细节实现'
    ],
    videoUrl: '/demo_video.mp4',
    websiteUrl: 'https://livefor.2371402599.workers.dev/'
  },
  {
    id: 'coach-app',
    title: 'Coach',
    subtitle: '品牌重塑 · UX&UI设计 · 官网搭建',
    category: '品牌重塑 · UX&UI设计 · 官网搭建',
    status: 'view',
    statusText: '► 浏览',
    description: '专业教练与技能成长平台体验设计。负责了品牌视觉微调、全链路设计系统搭建及数字化门户构建，旨在通过直观的数据可视化、智能日程匹配与人文关怀布局，提升学习者与导师之间的协同效率。',
    tags: ['Brand Touchpoints', 'Product Design', 'UI Systems', 'User Research', 'EdTech'],
    bannerBg: 'from-blue-900/80 via-slate-900 to-zinc-950',
    deliverables: [
      '品牌触点与视觉重塑：统一跨终端品牌资产与调性准则',
      '全链路用户体验旅程地图 (CJM) 与服务蓝图推演',
      '跨终端组件库 (Design System) 与数据看板交互体验'
    ],
    videoUrl: '/demo_video.mp4'
  },
  {
    id: 'ai-agent-lab',
    title: 'AI Agent 数字探索',
    subtitle: '品牌概念 · 智能交互 · 极简产品',
    category: '品牌概念 · 智能交互 · AI应用',
    status: 'planning',
    statusText: '☕ 筹划中',
    isBlurred: true,
    description: '正在筹备中的下一代个人 AI Agent 协同助手。主导了从品牌概念定义、拟物/流光视觉风格推演到自然交互范式的探索，结合自然语言推演与极简工作流，目前处于原型验证与视觉推敲阶段。',
    tags: ['Brand Concept', 'AI Agent', 'LLM Interaction', 'Next-Gen UX'],
    bannerBg: 'from-emerald-900/80 via-teal-950 to-neutral-950',
    deliverables: [
      '品牌概念定义与未来感科技调性确立',
      'Agent 交互范式探索与多模态工作流原型',
      '极简暗黑/温润浅色 UI 尝试与状态微反馈'
    ]
  }
];

export const CONTACT_DATA: ContactInfo = {
  wechatId: 'junjun_damowang',
  wechatQrLabel: '菌菌大魔王 (微信扫码添加)',
  phoneNumber: '+86 188-8888-8888',
  email: 'junjun_product@163.com'
};
