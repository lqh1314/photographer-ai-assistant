/**
 * AI 图片分析引擎
 * 清晰度检测（拉普拉斯方差）、曝光分析（直方图）、对比度分析、dHash 感知哈希去重
 */
export interface PhotoAnalysisResult {
  sharpness: number;
  exposure: { score: number; label: string; overexposedRatio: number; underexposedRatio: number; };
  contrast: number;
  totalScore: number;
  category: 'recommend' | 'backup' | 'alternative' | 'eliminate';
  reason: string;
  usage: string[];
  dHash: string;
  isDuplicate?: boolean;
  duplicateGroupId?: string;
}

export function loadImageToCanvas(src: string | File, maxSize = 1200): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxSize) { height = Math.round((height * maxSize) / width); width = maxSize; }
      else if (height > maxSize) { width = Math.round((width * maxSize) / height); height = maxSize; }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Cannot get canvas context')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src instanceof File ? URL.createObjectURL(src) : src;
  });
}

function calcSharpness(ctx: CanvasRenderingContext2D, w: number, h: number): number {
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const step = Math.max(1, Math.floor(Math.min(w, h) / 200));
  const gray: number[] = [];
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) {
    const i = (y * w + x) * 4;
    gray.push(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
  }
  const gw = Math.floor(w / step), gh = Math.floor(h / step);
  const laplacian: number[] = [];
  for (let y = 1; y < gh - 1; y++) for (let x = 1; x < gw - 1; x++) {
    const idx = y * gw + x;
    laplacian.push(gray[idx - gw] + gray[idx + gw] + gray[idx - 1] + gray[idx + 1] - 4 * gray[idx]);
  }
  const mean = laplacian.reduce((a, b) => a + b, 0) / laplacian.length;
  const variance = laplacian.reduce((a, b) => a + (b - mean) ** 2, 0) / laplacian.length;
  return Math.min(100, Math.max(0, (variance / 500) * 100));
}

function calcExposure(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const d = ctx.getImageData(0, 0, w, h).data;
  const step = 4 * Math.max(1, Math.floor((w * h) / 50000));
  let overexposed = 0, underexposed = 0, total = 0, sumBrightness = 0;
  for (let i = 0; i < d.length; i += step) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    total++; sumBrightness += lum;
    if (lum > 245) overexposed++;
    if (lum < 10) underexposed++;
  }
  const avgBrightness = sumBrightness / total;
  const overRatio = overexposed / total, underRatio = underexposed / total;
  let score = 100, label = '曝光正常';
  if (overRatio > 0.1) { score -= overRatio * 200; label = '过曝'; }
  else if (underRatio > 0.15) { score -= underRatio * 150; label = '欠曝'; }
  score -= (Math.abs(avgBrightness - 128) / 128) * 30;
  return { score: Math.min(100, Math.max(0, score)), label, overexposedRatio: overRatio, underexposedRatio: underRatio, avgBrightness };
}

function calcContrast(ctx: CanvasRenderingContext2D, w: number, h: number): number {
  const d = ctx.getImageData(0, 0, w, h).data;
  const step = 4 * Math.max(1, Math.floor((w * h) / 50000));
  const values: number[] = [];
  for (let i = 0; i < d.length; i += step) values.push(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
  if (stdDev >= 40 && stdDev <= 70) return 100;
  if (stdDev < 40) return Math.max(0, (stdDev / 40) * 100);
  return Math.max(0, 100 - (stdDev - 70) * 1.5);
}

function generateDHash(ctx: CanvasRenderingContext2D): string {
  const hashSize = 9;
  const tmp = document.createElement('canvas');
  tmp.width = hashSize; tmp.height = hashSize - 1;
  const tmpCtx = tmp.getContext('2d')!;
  tmpCtx.drawImage(ctx.canvas, 0, 0, hashSize, hashSize - 1);
  const d = tmpCtx.getImageData(0, 0, hashSize, hashSize - 1).data;
  const gray: number[] = [];
  for (let i = 0; i < d.length; i += 4) gray.push(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
  let hash = '';
  for (let y = 0; y < hashSize - 1; y++) for (let x = 0; x < hashSize - 1; x++) {
    const idx = y * hashSize + x;
    hash += gray[idx] > gray[idx + 1] ? '1' : '0';
  }
  return hash;
}

export function hammingDistance(hash1: string, hash2: string): number {
  let dist = 0;
  for (let i = 0; i < hash1.length; i++) if (hash1[i] !== hash2[i]) dist++;
  return dist;
}

export function detectDuplicates(photos: { id: string; dHash: string; totalScore: number; category: string }[]): Map<string, string> {
  const result = new Map<string, string>();
  const assigned = new Set<string>();
  for (let i = 0; i < photos.length; i++) {
    if (assigned.has(photos[i].id)) continue;
    result.set(photos[i].id, photos[i].id); assigned.add(photos[i].id);
    for (let j = i + 1; j < photos.length; j++) {
      if (assigned.has(photos[j].id)) continue;
      if (hammingDistance(photos[i].dHash, photos[j].dHash) <= 5) { result.set(photos[j].id, photos[i].id); assigned.add(photos[j].id); }
    }
  }
  return result;
}

export function analyzePhoto(canvas: HTMLCanvasElement): PhotoAnalysisResult {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width, h = canvas.height;
  const sharpness = calcSharpness(ctx, w, h);
  const exposure = calcExposure(ctx, w, h);
  const contrast = calcContrast(ctx, w, h);
  const dHash = generateDHash(ctx);
  const totalScore = Math.round(sharpness * 0.5 + exposure.score * 0.3 + contrast * 0.2);
  let category: PhotoAnalysisResult['category'], reason = '';
  const usage: string[] = [];
  if (sharpness < 25) { category = 'eliminate'; reason = '画面模糊，对焦不准确，建议淘汰'; }
  else if (exposure.score < 30) { category = 'eliminate'; reason = exposure.label === '过曝' ? '高光溢出，细节丢失严重' : '严重欠曝，暗部细节不足'; }
  else if (totalScore >= 80) { category = 'recommend'; reason = '对焦清晰，曝光准确，对比度佳，适合精修主推'; usage.push('封面', '九宫格', '放大'); }
  else if (totalScore >= 60) { category = 'backup'; reason = '技术质量良好，可作为套系保底'; usage.push('九宫格', '相册'); }
  else if (totalScore >= 40) { category = 'alternative'; reason = '存在轻微技术瑕疵，可作为备选'; usage.push('相册'); }
  else { category = 'eliminate'; reason = '综合质量较低，建议淘汰'; }
  return { sharpness: Math.round(sharpness), exposure: { score: Math.round(exposure.score), label: exposure.label, overexposedRatio: exposure.overexposedRatio, underexposedRatio: exposure.underexposedRatio }, contrast: Math.round(contrast), totalScore, category, reason, usage, dHash };
}
