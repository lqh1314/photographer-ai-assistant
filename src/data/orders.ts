export type OrderStatus = 'deposit_paid' | 'shooting' | 'selecting' | 'retouching' | 'delivered' | 'completed';
export interface Order {
  id: string;
  customerName: string;
  packageName: string;
  amount: number;
  deposit: number;
  balance: number;
  status: OrderStatus;
  shootDate: string;
  createdAt: string;
  retouchCount?: number;
}
export const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; color: string }> = {
  deposit_paid: { label: '已付定金', color: 'bg-yellow-100 text-yellow-800' },
  shooting: { label: '待拍摄', color: 'bg-blue-100 text-blue-800' },
  selecting: { label: '选片中', color: 'bg-purple-100 text-purple-800' },
  retouching: { label: '精修中', color: 'bg-indigo-100 text-indigo-800' },
  delivered: { label: '已交付', color: 'bg-green-100 text-green-800' },
  completed: { label: '已完成', color: 'bg-gray-100 text-gray-600' },
};
export const MOCK_ORDERS: Order[] = [
  { id: 'ord-1', customerName: '林小雨', packageName: '日系清新写真', amount: 1299, deposit: 500, balance: 799, status: 'retouching', shootDate: '2026-08-10', createdAt: '2026-08-01', retouchCount: 25 },
  { id: 'ord-2', customerName: '赵小美', packageName: '日系清新写真', amount: 1299, deposit: 500, balance: 799, status: 'selecting', shootDate: '2026-08-18', createdAt: '2026-08-05' },
  { id: 'ord-3', customerName: '刘同学', packageName: '轻写真体验套系', amount: 699, deposit: 300, balance: 399, status: 'delivered', shootDate: '2026-08-05', createdAt: '2026-07-28', retouchCount: 15 },
  { id: 'ord-4', customerName: '周女士', packageName: '情侣/婚纱轻旅拍', amount: 3999, deposit: 1000, balance: 2999, status: 'shooting', shootDate: '2026-09-05', createdAt: '2026-08-15' },
  { id: 'ord-5', customerName: '吴先生', packageName: '商务形象/团队照', amount: 899, deposit: 400, balance: 499, status: 'deposit_paid', shootDate: '2026-09-10', createdAt: '2026-08-20' },
  { id: 'ord-6', customerName: '孙女士', packageName: '全家福/亲子套系', amount: 1599, deposit: 600, balance: 999, status: 'completed', shootDate: '2026-07-20', createdAt: '2026-07-10', retouchCount: 20 },
];
