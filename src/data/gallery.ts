export interface GalleryItem {
  id: string; title: string; type: string; style: string;
  location: string; url: string; tags: string[]; description: string;
}
export const STYLE_TAGS = ['全部', '清新日系', '复古胶片', '情绪光影', '韩式简约', '新中式', '电影感', '街拍', '黑白'];
export const SHOOT_TYPES = [
  { value: 'all', label: '全部类型' }, { value: 'wedding', label: '婚纱' },
  { value: 'portrait', label: '写真' }, { value: 'couple', label: '情侣' },
  { value: 'family', label: '亲子' }, { value: 'business', label: '商务' },
];
export const MOCK_GALLERY: GalleryItem[] = [
  { id: 'g1', title: '春日樱花物语', type: 'portrait', style: '清新日系', location: '杭州太子湾', url: 'https://picsum.photos/seed/gallery1/800/1000', tags: ['清新日系', '樱花', '外景'], description: '春日午后，樱花树下的温柔瞬间' },
  { id: 'g2', title: '老城胶片记忆', type: 'portrait', style: '复古胶片', location: '上海武康路', url: 'https://picsum.photos/seed/gallery2/800/1000', tags: ['复古胶片', '街拍', '城市'], description: 'Classic Chrome 滤镜下的老上海' },
  { id: 'g3', title: '暮色中的你', type: 'couple', style: '情绪光影', location: '厦门海边', url: 'https://picsum.photos/seed/gallery3/800/1000', tags: ['情绪光影', '海边', '情侣'], description: '日落 golden hour 的浪漫' },
  { id: 'g4', title: '极简韩式婚纱', type: 'wedding', style: '韩式简约', location: '首尔studio', url: 'https://picsum.photos/seed/gallery4/800/1000', tags: ['韩式简约', '婚纱', '棚拍'], description: '简约高级感，光影勾勒轮廓' },
  { id: 'g5', title: '新中式国风', type: 'portrait', style: '新中式', location: '苏州园林', url: 'https://picsum.photos/seed/gallery5/800/1000', tags: ['新中式', '园林', '国风'], description: '亭台楼阁间的东方韵味' },
  { id: 'g6', title: '城市电影感', type: 'couple', style: '电影感', location: '重庆夜景', url: 'https://picsum.photos/seed/gallery6/800/1000', tags: ['电影感', '夜景', '城市'], description: '霓虹灯下的故事感' },
  { id: 'g7', title: '黑白人像', type: 'portrait', style: '黑白', location: '工作室', url: 'https://picsum.photos/seed/gallery7/800/1000', tags: ['黑白', '人像', '棚拍'], description: 'Acros 黑白胶片质感' },
  { id: 'g8', title: '街头漫步', type: 'portrait', style: '街拍', location: '成都太古里', url: 'https://picsum.photos/seed/gallery8/800/1000', tags: ['街拍', '城市', '日常'], description: '自然随性的街头记录' },
  { id: 'g9', title: '亲子时光', type: 'family', style: '清新日系', location: '公园', url: 'https://picsum.photos/seed/gallery9/800/1000', tags: ['清新日系', '亲子', '户外'], description: '阳光下的温馨互动' },
  { id: 'g10', title: '商务精英', type: 'business', style: '韩式简约', location: 'CBD写字楼', url: 'https://picsum.photos/seed/gallery10/800/1000', tags: ['韩式简约', '商务', '形象照'], description: '专业自信的商务形象' },
  { id: 'g11', title: '森系婚纱', type: 'wedding', style: '情绪光影', location: '北海道', url: 'https://picsum.photos/seed/gallery11/800/1000', tags: ['情绪光影', '婚纱', '森系'], description: '森林深处的誓言' },
  { id: 'g12', title: '复古港风', type: 'portrait', style: '复古胶片', location: '香港', url: 'https://picsum.photos/seed/gallery12/800/1000', tags: ['复古胶片', '港风', '夜景'], description: '90年代港片质感' },
];
