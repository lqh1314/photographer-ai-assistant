export type OrderStatus = 'pending_payment' | 'paid' | 'shooting' | 'selecting' | 'retouching' | 'delivered' | 'completed';
export interface Order {
  id: string; customerName: string; packageName: string; amount: number;
  deposit: number; status: OrderStatus; shootDate: string;
  createdAt: string; retouchCount?: number; extraCount?: number;
}
export const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; color: string }> = {
  pending_payment: { label: '待付定金', color: 'bg-red-100 text-red-800' },
  paid: { label: '已付定金', color: 'bg-yellow-100 text-yellow-800' },
  shooting: { label: '待拍摄', color: 'bg-blue-100 text-blue-800' },
  selecting: { label: '选片中', color: 'bg-purple-100 text-purple-800' },
  retouching: { label: '精修中', color: 'bg-indigo-100 text-indigo-800' },
  delivered: { label: '已交付', color: 'bg-teal-100 text-teal-800' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
};
export const MOCK_ORDERS: Order[] = [
  { id: 'ord-20260820-001', customerName: '林小雨', packageName: '日系清新写真', amount: 1299, deposit: 500, status: 'shooting', shootDate: '2026-08-25', createdAt: '2026-08-20' },
  { id: 'ord-20260821-002', customerName: '张先生&李女士', packageName: '情侣/婚纱轻旅拍', amount: 3999, deposit: 1000, status: 'paid', shootDate: '2026-08-28', createdAt: '2026-08-21' },
  { id: 'ord-20260819-003', customerName: '王女士', packageName: '全家福/亲子套系', amount: 1599, deposit: 500, status: 'shooting', shootDate: '2026-08-30', createdAt: '2026-08-19' },
  { id: 'ord-20260822-004', customerName: '陈总', packageName: '商务形象/团队照', amount: 899, deposit: 300, status: 'pending_payment', shootDate: '2026-09-02', createdAt: '2026-08-22' },
  { id: 'ord-20260810-005', customerName: '赵小姐', packageName: '日系清新写真', amount: 1299, deposit: 1299, status: 'retouching', shootDate: '2026-08-15', createdAt: '2026-08-10', retouchCount: 25, extraCount: 5 },
  { id: 'ord-20260805-006', customerName: '刘先生', packageName: '轻写真体验套系', amount: 699, deposit: 699, status: 'completed', shootDate: '2026-08-08', createdAt: '2026-08-05', retouchCount: 15 },
  { id: 'ord-20260728-007', customerName: '周女士', packageName: '情侣/婚纱轻旅拍', amount: 3999, deposit: 3999, status: 'delivered', shootDate: '2026-08-02', createdAt: '2026-07-28', retouchCount: 50, extraCount: 10 },
];
