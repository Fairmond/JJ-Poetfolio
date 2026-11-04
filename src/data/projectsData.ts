import { ProjectItem, ContactInfo } from '../types';

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'lifa-livefor',
    title: '理法 LIVEFOR',
    subtitle: 'UX&UI设计 · 官网搭建',
    category: 'UX&UI设计 · 官网搭建',
    status: 'view',
    statusText: '► 浏览',
    description: '理法 LIVEFOR 品牌官方网站与数字化体验设计。融合了极简律动感与品质生活方式，提供从概念推演、视觉系统搭建到前台响应式全端构建。',
    tags: ['UX/UI Design', 'Web Architecture', 'Brand Identity', 'Interactive Art'],
    bannerBg: 'from-amber-900/80 via-neutral-900 to-black',
    deliverables: [
      '品牌视觉语言与设计系统搭建',
      '高保真响应式 Web 页面全流程构建',
      '微交互与 3D 视觉动效实现'
    ],
    videoUrl: '/demo_video.mp4'
  },
  {
    id: 'coach-app',
    title: 'Coach',
    subtitle: 'UX&UI设计 · 官网搭建',
    category: 'UX&UI设计 · 官网搭建',
    status: 'view',
    statusText: '► 浏览',
    description: '专业教练与技能成长平台体验设计。旨在通过直观的数据可视化、智能日程匹配与人文关怀布局，提升学习者与导师之间的协同效率。',
    tags: ['Product Design', 'UI Systems', 'User Research', 'EdTech'],
    bannerBg: 'from-blue-900/80 via-slate-900 to-zinc-950',
    deliverables: [
      '全链路用户体验旅程地图 (CJM)',
      '跨终端组件库 (Design System)',
      '数据看板与图表交互体验'
    ],
    videoUrl: '/demo_video.mp4'
  },
  {
    id: 'ai-agent-lab',
    title: 'AI Agent 数字探索',
    subtitle: '智能交互 · 极简产品',
    category: 'UX&UI... · AI应用',
    status: 'planning',
    statusText: '☕ 筹划中',
    isBlurred: true,
    description: '正在筹备中的下一代个人 AI Agent 协同助手，结合自然语言推演与极简工作流，目前处于原型验证与视觉推敲阶段。',
    tags: ['AI Agent', 'LLM Interaction', 'Next-Gen UX'],
    bannerBg: 'from-emerald-900/80 via-teal-950 to-neutral-950',
    deliverables: [
      'Agent 交互范式探索',
      '多模态工作流原型',
      '极简暗黑/温润浅色 UI 尝试'
    ]
  }
];

export const CONTACT_DATA: ContactInfo = {
  wechatId: 'junjun_damowang',
  wechatQrLabel: '菌菌大魔王 (微信扫码添加)',
  phoneNumber: '+86 188-8888-8888',
  email: 'junjun_product@163.com'
};
