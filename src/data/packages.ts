export interface Package {
  id: string; name: string; type: string; price: number; originalPrice?: number;
  duration: string; retouchedCount: number; originalCount: string;
  locations: number; outfits: number; features: string[]; description: string;
  cover: string; popular?: boolean;
}
export const PACKAGES: Package[] = [
  { id: 'pkg-1', name: '轻写真体验套系', type: 'portrait', price: 699, originalPrice: 999, duration: '2小时', retouchedCount: 15, originalCount: '80张以上', locations: 1, outfits: 1, features: ['室内棚拍或城市街拍', '专业灯光', '简妆造型', '9张精修预告', '网盘交付'], description: '适合个人写真、形象照、生日纪念，轻量高效', cover: 'https://picsum.photos/seed/portrait1/600/400' },
  { id: 'pkg-2', name: '日系清新写真', type: 'portrait', price: 1299, duration: '4小时', retouchedCount: 25, originalCount: '200张以上', locations: 2, outfits: 2, features: ['外景+室内', '全程跟妆', '风格参考定制', '富士胶片模拟调色', '相册排版'], description: '自然清新风格，记录真实情绪', cover: 'https://picsum.photos/seed/portrait2/600/400', popular: true },
  { id: 'pkg-3', name: '情侣/婚纱轻旅拍', type: 'wedding', price: 3999, originalPrice: 5999, duration: '1天', retouchedCount: 50, originalCount: '500张以上', locations: 3, outfits: 3, features: ['城市旅拍或目的地旅拍', '双机位', '全程跟妆', '电影感调色', '30寸放大画框', '精装相册'], description: '电影感叙事拍摄，定格爱情故事', cover: 'https://picsum.photos/seed/wedding1/600/400', popular: true },
  { id: 'pkg-4', name: '全家福/亲子套系', type: 'family', price: 1599, duration: '3小时', retouchedCount: 20, originalCount: '150张以上', locations: 1, outfits: 2, features: ['棚拍或家居场景', '儿童引导师', '温馨自然风格', '全家福放大', '亲子装建议'], description: '温馨记录家庭成长瞬间', cover: 'https://picsum.photos/seed/family1/600/400' },
  { id: 'pkg-5', name: '商务形象/团队照', type: 'business', price: 899, duration: '1.5小时', retouchedCount: 10, originalCount: '60张以上', locations: 1, outfits: 1, features: ['专业棚拍灯光', '职业形象指导', '商务精修', '团队合影', '多尺寸交付'], description: '专业商务形象，提升个人品牌', cover: 'https://picsum.photos/seed/business1/600/400' },
];
export const PACKAGE_SHOOT_TYPES = [
  { value: 'portrait', label: '个人写真' }, { value: 'wedding', label: '婚纱/情侣' },
  { value: 'family', label: '亲子/全家福' }, { value: 'business', label: '商务形象' },
  { value: 'event', label: '活动跟拍' }, { value: 'product', label: '产品拍摄' },
];
