export interface Customer {
  id: string; name: string; phone: string; source: string;
  shootType: string; status: string; totalSpent: number;
  lastContact: string; notes?: string; avatar: string;
}
export const CUSTOMER_SOURCES = ['小红书', '抖音', '朋友推荐', '微博', '美团', '老客转介绍'];
export const CUSTOMER_STATUS_MAP: Record<string, string> = {
  consulting: '咨询中', booked: '已预约', completed: '已完成', vip: 'VIP客户',
};
export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: '林小雨', phone: '138****1234', source: '小红书', shootType: '个人写真', status: 'booked', totalSpent: 1299, lastContact: '2026-08-22', notes: '喜欢日系清新，带了参考图', avatar: 'https://picsum.photos/seed/cust1/100/100' },
  { id: 'c2', name: '张先生', phone: '139****5678', source: '朋友推荐', shootType: '婚纱旅拍', status: 'consulting', totalSpent: 0, lastContact: '2026-08-21', notes: '预算5000内，想去厦门', avatar: 'https://picsum.photos/seed/cust2/100/100' },
  { id: 'c3', name: '王女士', phone: '137****9012', source: '抖音', shootType: '亲子照', status: 'booked', totalSpent: 1599, lastContact: '2026-08-20', notes: '一家三口，小孩3岁', avatar: 'https://picsum.photos/seed/cust3/100/100' },
  { id: 'c4', name: '陈总', phone: '136****3456', source: '美团', shootType: '商务形象', status: 'completed', totalSpent: 2697, lastContact: '2026-07-15', notes: '公司长期合作，已拍3次', avatar: 'https://picsum.photos/seed/cust4/100/100' },
  { id: 'c5', name: '赵小姐', phone: '135****7890', source: '小红书', shootType: '个人写真', status: 'vip', totalSpent: 5896, lastContact: '2026-08-18', notes: '老客户，每年都拍生日照', avatar: 'https://picsum.photos/seed/cust5/100/100' },
  { id: 'c6', name: '刘先生', phone: '134****2345', source: '微博', shootType: '情侣写真', status: 'completed', totalSpent: 1299, lastContact: '2026-06-10', notes: '', avatar: 'https://picsum.photos/seed/cust6/100/100' },
];
