export interface ShootPlan {
  id: string; shootType: string; style: string; title: string;
  description: string; locations: { name: string; time: string; note: string }[];
  outfits: { description: string; color: string }[];
  props: string[]; schedule: { time: string; activity: string }[];
  tips: string[]; weatherPlan: string;
}
export const SHOOT_TYPES = [
  { value: 'portrait', label: '个人写真' }, { value: 'wedding', label: '婚纱/情侣' },
  { value: 'family', label: '亲子/全家福' }, { value: 'business', label: '商务形象' },
  { value: 'maternity', label: '孕妇照' },
];
export const STYLE_OPTIONS = [
  { value: 'japanese', label: '清新日系' }, { value: 'film', label: '复古胶片' },
  { value: 'cinematic', label: '电影感' }, { value: 'korean', label: '韩式简约' },
  { value: 'chinese', label: '新中式' }, { value: 'emotional', label: '情绪光影' },
];
export const PLAN_TEMPLATES: Record<string, Record<string, ShootPlan>> = {
  portrait: {
    japanese: { id: 'pl-p-j', shootType: 'portrait', style: 'japanese', title: '日系清新写真方案', description: '以自然光为主，捕捉清新自然的生活感', locations: [{ name: '公园/植物园', time: '07:00-09:00', note: '晨光柔和，逆光拍摄' }, { name: '咖啡馆', time: '09:30-11:00', note: '室内自然光，生活感' }, { name: '街道/小巷', time: '15:00-17:00', note: '侧逆光，黄金时刻' }], outfits: [{ description: '白色棉麻连衣裙', color: '白色/米色' }, { description: '浅蓝牛仔+白T', color: '浅蓝/白色' }], props: ['草帽', '透明雨伞', '花束', '帆布包', '书本'], schedule: [{ time: '06:30', activity: '化妆造型' }, { time: '07:00', activity: '公园外景' }, { time: '09:30', activity: '咖啡馆' }, { time: '12:00', activity: '午餐休息' }, { time: '15:00', activity: '街道拍摄' }, { time: '17:30', activity: '收工' }], tips: ['妆面以清透裸妆为主', '避免浓妆和夸张配饰', '动作以自然走动、回头、微笑为主'], weatherPlan: '雨天改至咖啡馆+室内棚拍，或改期' },
    film: { id: 'pl-p-f', shootType: 'portrait', style: 'film', title: '复古胶片写真方案', description: 'Classic Chrome 色调，复古质感', locations: [{ name: '老城区/弄堂', time: '15:00-17:00', note: '侧光，建筑阴影' }, { name: '复古餐厅', time: '17:30-18:30', note: '暖光室内' }, { name: '天桥/地下通道', time: '19:00-20:00', note: '霓虹灯光' }], outfits: [{ description: '格纹西装/复古连衣裙', color: '棕色/墨绿/酒红' }, { description: '牛仔外套+白裙', color: '牛仔蓝/白色' }], props: ['胶片相机', '复古墨镜', '耳机', '报纸', '玻璃瓶汽水'], schedule: [{ time: '14:00', activity: '化妆造型' }, { time: '15:00', activity: '老城区' }, { time: '17:30', activity: '复古餐厅' }, { time: '19:00', activity: '夜景' }, { time: '20:30', activity: '收工' }], tips: ['动作可以大膽随性', '利用光影对比', '表情可以酷一点'], weatherPlan: '阴天反而更有胶片感，正常拍摄' },
  },
  wedding: {
    cinematic: { id: 'pl-w-c', shootType: 'wedding', style: 'cinematic', title: '电影感婚纱方案', description: '宽画幅叙事感，光影层次丰富', locations: [{ name: '海边/湖边', time: '16:00-18:00', note: '日落黄金时刻' }, { name: '城市天台', time: '18:30-19:30', note: '蓝调时刻' }, { name: '复古建筑', time: '10:00-12:00', note: '建筑光影' }], outfits: [{ description: '缎面主婚纱', color: '象牙白' }, { description: '黑色礼服', color: '黑色' }, { description: '轻婚纱/便装', color: '白色/米色' }], props: ['头纱', '手捧花', '戒指', '蜡烛', '复古车'], schedule: [{ time: '08:00', activity: '化妆' }, { time: '10:00', activity: '建筑场景' }, { time: '12:00', activity: '午餐休息' }, { time: '16:00', activity: '海边日落' }, { time: '18:30', activity: '蓝调夜景' }, { time: '20:00', activity: '收工' }], tips: ['多拍背影和侧脸', '利用头纱制造动感', '抓拍互动瞬间'], weatherPlan: '雨天改至室内建筑或改期' },
  },
};
