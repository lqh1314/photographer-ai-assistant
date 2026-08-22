export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export interface Booking {
  id: string; customerName: string; phone: string; shootType: string;
  packageId?: string; packageName?: string; date: string; timeSlot: string;
  location: string; status: BookingStatus; notes?: string; price?: number; createdAt: string;
}
export const TIME_SLOTS = ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00', '17:00-19:00', '19:00-21:00'];
export const BOOKING_STATUS_MAP: Record<BookingStatus, { label: string; color: string }> = {
  pending: { label: '待确认', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: '已确认', color: 'bg-green-100 text-green-800' },
  completed: { label: '已完成', color: 'bg-blue-100 text-blue-800' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-600' },
};
export const MOCK_BOOKINGS: Booking[] = [
  { id: 'bk-1', customerName: '林小雨', phone: '138****1234', shootType: 'portrait', packageName: '日系清新写真', date: '2026-08-25', timeSlot: '10:00-12:00', location: '西湖外景', status: 'confirmed', price: 1299, notes: '想要樱花感，带浅色裙子', createdAt: '2026-08-20' },
  { id: 'bk-2', customerName: '张先生&李女士', phone: '139****5678', shootType: 'wedding', packageName: '情侣/婚纱轻旅拍', date: '2026-08-28', timeSlot: '15:00-17:00', location: '厦门环岛路', status: 'pending', price: 3999, notes: '日落场景，需要双机位', createdAt: '2026-08-21' },
  { id: 'bk-3', customerName: '王女士', phone: '137****9012', shootType: 'family', packageName: '全家福/亲子套系', date: '2026-08-30', timeSlot: '13:00-15:00', location: '工作室棚拍', status: 'confirmed', price: 1599, notes: '一家三口，小孩3岁', createdAt: '2026-08-19' },
  { id: 'bk-4', customerName: '陈总', phone: '136****3456', shootType: 'business', packageName: '商务形象/团队照', date: '2026-09-02', timeSlot: '08:00-10:00', location: '公司办公室', status: 'pending', price: 899, notes: '5人团队合影+个人形象照', createdAt: '2026-08-22' },
];
export const PREPARATION_CHECKLIST: Record<string, string[]> = {
  portrait: ['拍摄前一天做好皮肤保湿，避免熬夜', '提前准备浅色/纯色内衣（避免透色）', '自带喜欢的配饰：耳环、项链、帽子', '男生提前修剪发型和胡须', '女生可做浅色美甲，更上镜', '带一双舒适的鞋（外景走路多）'],
  wedding: ['提前1个月开始皮肤管理，拍摄前3天密集补水', '新娘提前试妆，准备无痕内衣和胸贴', '新郎修剪发型、胡须，准备黑白袜子各一双', '准备情侣小道具：戒指、手捧花、气球', '外景带好防晒、补妆用品、舒适平底鞋', '拍摄前一晚少喝水，避免浮肿'],
  family: ['全家服装配色协调（建议同色系或对比色）', '避免大logo和复杂图案', '给孩子准备小零食和玩具', '带好孩子常用的水杯、湿巾', '保证孩子拍摄前充足睡眠'],
  business: ['准备1-2套正装（深色西装/职业套装）', '男士：白/浅蓝衬衫，深色领带', '女士：简约职业装，淡妆即可', '提前修剪发型，保持整洁', '提前想好需要的拍摄姿势和用途'],
};
