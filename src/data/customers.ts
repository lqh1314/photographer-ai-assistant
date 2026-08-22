export interface Customer {
  id: string;
  name: string;
  phone: string;
  wechat?: string;
  source: string;
  tags: string[];
  totalSpent: number;
  orderCount: number;
  lastContact: string;
  notes?: string;
}
export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: '林小雨', phone: '138****1234', wechat: 'linxy_photo', source: '小红书', tags: ['写真', '日系', '复购'], totalSpent: 2598, orderCount: 2, lastContact: '2026-08-20', notes: '喜欢清新风格，对色调要求高' },
  { id: 'c2', name: '张先生', phone: '139****5678', wechat: 'zhang_wed', source: '朋友推荐', tags: ['婚纱', '旅拍'], totalSpent: 3999, orderCount: 1, lastContact: '2026-08-21', notes: '预算充足，追求电影感' },
  { id: 'c3', name: '王女士', phone: '137****9012', source: '抖音', tags: ['亲子', '全家福'], totalSpent: 1599, orderCount: 1, lastContact: '2026-08-19', notes: '孩子3岁，需要引导师' },
  { id: 'c4', name: '陈总', phone: '136****3456', wechat: 'chen_biz', source: '美团', tags: ['商务', '团队照'], totalSpent: 899, orderCount: 1, lastContact: '2026-08-22', notes: '公司长期合作意向' },
  { id: 'c5', name: '赵小美', phone: '135****7890', source: '小红书', tags: ['写真', '复古'], totalSpent: 1299, orderCount: 1, lastContact: '2026-08-15', notes: '喜欢港风，已推荐复古胶片套餐' },
];
export const CUSTOMER_SOURCES = ['小红书', '抖音', '朋友推荐', '美团', '微博', '微信公众号', '其他'];
