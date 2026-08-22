/**
 * 文件夹导入工具
 * 支持 webkitdirectory 文件夹选择、图片文件判断、缩略图生成、localStorage 持久化
 */

export interface ImportedImage {
  id: string;
  name: string;
  url: string;
  folder: string;
  thumbnail?: string;
  size?: number;
  type?: string;
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif', '.heic', '.avif'];

export function isImageFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function getFolderFromPath(webkitRelativePath: string): string {
  if (!webkitRelativePath) return '未分类';
  const parts = webkitRelativePath.split('/');
  if (parts.length <= 1) return '未分类';
  if (parts.length === 2) return parts[0];
  return parts.slice(0, -1).join('/');
}

export function getRootFolderName(webkitRelativePath: string): string {
  if (!webkitRelativePath) return '';
  return webkitRelativePath.split('/')[0] || '';
}

export async function generateThumbnailDataURL(
  file: File,
  maxSize = 400
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(objectUrl); reject(new Error('Cannot get canvas context')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to load image')); };
    img.src = objectUrl;
  });
}

export async function processFolderFiles(
  files: FileList | File[],
  options: { generateThumbnails?: boolean; onProgress?: (current: number, total: number) => void } = {}
): Promise<ImportedImage[]> {
  const { generateThumbnails = true, onProgress } = options;
  const imageFiles = Array.from(files).filter((f) => isImageFile(f.name));
  const result: ImportedImage[] = [];
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const path = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
    const folder = getFolderFromPath(path);
    const id = `${Date.now()}_${i}_${Math.random().toString(36).substring(2, 8)}`;
    const item: ImportedImage = {
      id, name: file.name, url: URL.createObjectURL(file), folder,
      size: file.size, type: file.type,
    };
    if (generateThumbnails) {
      try { item.thumbnail = await generateThumbnailDataURL(file); } catch { /* skip */ }
    }
    result.push(item);
    onProgress?.(i + 1, imageFiles.length);
  }
  return result;
}

const GALLERY_STORAGE_KEY = 'photographer_gallery_user';

export interface StoredGalleryItem {
  id: string;
  name: string;
  folder: string;
  thumbnail: string;
  addedAt: number;
  tags?: string[];
}

export function saveGalleryBatch(items: StoredGalleryItem[]): { success: number; failed: number } {
  let success = 0, failed = 0;
  try {
    const existing = loadUserGallery();
    const merged = [...existing, ...items];
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(merged));
      success = items.length;
    } catch (e) {
      console.warn('Storage quota exceeded, trying incremental save...', e);
      let current = [...existing];
      for (const item of items) {
        try {
          current.push(item);
          localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(current));
          success++;
        } catch { failed++; }
      }
    }
  } catch { failed = items.length; }
  return { success, failed };
}

export function loadUserGallery(): StoredGalleryItem[] {
  try {
    const raw = localStorage.getItem(GALLERY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredGalleryItem[]) : [];
  } catch { return []; }
}

export function deleteUserGalleryItem(id: string): void {
  try {
    const items = loadUserGallery();
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(items.filter((item) => item.id !== id)));
  } catch (e) { console.warn('Failed to delete gallery item:', e); }
}

export function clearUserGallery(): void {
  try { localStorage.removeItem(GALLERY_STORAGE_KEY); } catch (e) { console.warn('Failed to clear gallery:', e); }
}

export function classifyByFolderName(folderName: string): string[] {
  const tags: string[] = [];
  const lower = folderName.toLowerCase();
  const tagMap: Record<string, string> = {
    婚纱: '婚纱', wedding: '婚纱', 写真: '写真', portrait: '写真',
    情侣: '情侣', couple: '情侣', 亲子: '亲子', family: '亲子',
    全家福: '全家福', 商务: '商务形象', business: '商务形象',
    日系: '清新日系', japanese: '清新日系', 复古: '复古胶片', vintage: '复古胶片',
    情绪: '情绪光影', mood: '情绪光影', 韩式: '韩式简约', korean: '韩式简约',
    新中式: '新中式', chinese: '新中式', 电影: '电影感', cinematic: '电影感',
  };
  for (const [key, tag] of Object.entries(tagMap)) {
    if (lower.includes(key.toLowerCase()) && !tags.includes(tag)) tags.push(tag);
  }
  return tags;
}
