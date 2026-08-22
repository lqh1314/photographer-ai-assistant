/** 角色权限定义 */

export type Permission =
  | 'dashboard.view'
  | 'bookings.manage'
  | 'customers.manage'
  | 'orders.manage'
  | 'gallery.manage'
  | 'photo.select'
  | 'photo.edit'
  | 'plans.manage'
  | 'settings.manage'
  | 'faq.manage'
  | 'copywriting.generate';

export interface RoleDef {
  id: string;
  name: string;
  description: string;
  password: string;
  color: string;
  permissions: Permission[];
  isSystem?: boolean;
}

export const ALL_PERMISSIONS: { key: Permission; label: string; group: string }[] = [
  { key: 'dashboard.view', label: '查看工作台', group: '数据' },
  { key: 'bookings.manage', label: '档期管理', group: '业务' },
  { key: 'customers.manage', label: '客户管理', group: '业务' },
  { key: 'orders.manage', label: '订单管理', group: '业务' },
  { key: 'gallery.manage', label: '客片管理', group: '内容' },
  { key: 'photo.select', label: 'AI 选片', group: '工具' },
  { key: 'photo.edit', label: 'AI 修图', group: '工具' },
  { key: 'plans.manage', label: '拍摄方案', group: '内容' },
  { key: 'faq.manage', label: 'FAQ 管理', group: '内容' },
  { key: 'copywriting.generate', label: '营销文案', group: '内容' },
  { key: 'settings.manage', label: '系统设置', group: '系统' },
];

export const DEFAULT_ROLES: RoleDef[] = [
  {
    id: 'admin',
    name: '管理员',
    description: '拥有所有权限，可管理角色和系统设置',
    password: 'admin',
    color: 'bg-red-500',
    permissions: ALL_PERMISSIONS.map((p) => p.key),
    isSystem: true,
  },
  {
    id: 'photographer',
    name: '摄影师',
    description: '摄影师主账号，可管理业务和使用工具',
    password: '1234',
    color: 'bg-blue-500',
    permissions: [
      'dashboard.view', 'bookings.manage', 'customers.manage', 'orders.manage',
      'gallery.manage', 'photo.select', 'photo.edit', 'plans.manage',
      'faq.manage', 'copywriting.generate',
    ],
    isSystem: true,
  },
  {
    id: 'assistant',
    name: '修图助理',
    description: '仅可使用选片和修图工具',
    password: 'assistant',
    color: 'bg-purple-500',
    permissions: ['photo.select', 'photo.edit', 'gallery.manage'],
    isSystem: true,
  },
  {
    id: 'customer',
    name: '客户',
    description: '客户视角，可浏览客片、咨询、预约',
    password: '',
    color: 'bg-green-500',
    permissions: ['gallery.manage', 'photo.select', 'photo.edit', 'plans.manage'],
    isSystem: true,
  },
];
