/**
 * 照片编辑器：基础调整 + 富士胶片模拟滤镜
 * 所有处理通过 Canvas getImageData/putImageData 逐像素实现
 */
export interface EditParams {
  brightness: number; contrast: number; saturation: number;
  temperature: number; tint: number; exposure: number;
  highlights: number; shadows: number; sharpness: number;
  vignette: number; grain: number;
}
export const DEFAULT_PARAMS: EditParams = {
  brightness: 0, contrast: 0, saturation: 0, temperature: 0, tint: 0,
  exposure: 0, highlights: 0, shadows: 0, sharpness: 0, vignette: 0, grain: 0,
};
export type FujifilmFilter = 'none' | 'provia' | 'velvia' | 'astia' | 'classic-chrome'
  | 'pro-neg-hi' | 'pro-neg-std' | 'classic-neg' | 'eterna' | 'eterna-bleach'
  | 'acros' | 'monochrome' | 'sepia';
export interface FujifilmFilterInfo { value: FujifilmFilter; label: string; description: string; }
export const FUJIFILM_FILTERS: FujifilmFilterInfo[] = [
  { value: 'none', label: '原图', description: '不应用滤镜' },
  { value: 'provia', label: 'Provia 标准', description: '自然平衡，通用色彩' },
  { value: 'velvia', label: 'Velvia 鲜艳', description: '高饱和高对比，风光首选' },
  { value: 'astia', label: 'Astia 柔和', description: '柔和暖调，人像柔美' },
  { value: 'classic-chrome', label: 'Classic Chrome', description: '低饱和褪色，纪实街拍' },
  { value: 'pro-neg-hi', label: 'Pro Neg Hi', description: '高对比人像，肤色立体' },
  { value: 'pro-neg-std', label: 'Pro Neg Std', description: '柔和自然，标准人像' },
  { value: 'classic-neg', label: 'Classic Neg', description: '暖高光冷阴影，复古负片' },
  { value: 'eterna', label: 'Eterna 影院', description: '低对比低饱和，电影感' },
  { value: 'eterna-bleach', label: 'Eterna Bleach', description: '高对比极低饱和，银盐质感' },
  { value: 'acros', label: 'Acros 黑白', description: '高对比黑白，细腻颗粒' },
  { value: 'monochrome', label: 'Monochrome', description: '标准黑白' },
  { value: 'sepia', label: 'Sepia 棕褐', description: '暖调棕褐色' },
];

function clamp(v: number): number { return v < 0 ? 0 : v > 255 ? 255 : v; }

function applyFujifilmFilter(r: number, g: number, b: number, filter: FujifilmFilter): [number, number, number] {
  switch (filter) {
    case 'provia': { const c = 1.08; r = (r-128)*c+128; g = (g-128)*c+128; b = (b-128)*c+128; const gray=0.299*r+0.587*g+0.114*b, sat=1.1; return [clamp(gray+(r-gray)*sat), clamp(gray+(g-gray)*sat), clamp(gray+(b-gray)*sat)]; }
    case 'velvia': { const c = 1.25; r = (r-128)*c+128; g = (g-128)*c+128; b = (b-128)*c+128; const gray=0.299*r+0.587*g+0.114*b, sat=1.4; return [clamp(gray+(r-gray)*sat), clamp(gray+(g-gray)*sat*1.05), clamp(gray+(b-gray)*sat*1.08)]; }
    case 'astia': { const c = 0.9; r = (r-128)*c+128; g = (g-128)*c+128; b = (b-128)*c+128; const gray=0.299*r+0.587*g+0.114*b, sat=0.9; return [clamp(gray+(r-gray)*sat+5), clamp(gray+(g-gray)*sat+2), clamp(gray+(b-gray)*sat-5)]; }
    case 'classic-chrome': { const gray=0.299*r+0.587*g+0.114*b, sat=0.75; r=gray+(r-gray)*sat; g=gray+(g-gray)*sat; b=gray+(b-gray)*sat; if(gray<100){g+=8;b+=12;r-=3;} if(gray>180){r+=6;g+=3;b-=6;} return [clamp(r*0.95+12), clamp(g*0.95+12), clamp(b*0.95+12)]; }
    case 'pro-neg-hi': { const c=1.2; r=(r-128)*c+128; g=(g-128)*c+128; b=(b-128)*c+128; r+=4;g+=1;b-=4; const gray=0.299*r+0.587*g+0.114*b, sat=1.05; return [clamp(gray+(r-gray)*sat), clamp(gray+(g-gray)*sat), clamp(gray+(b-gray)*sat)]; }
    case 'pro-neg-std': { const c=0.9; return [clamp((r-128)*c+128+3), clamp((g-128)*c+128+1), clamp((b-128)*c+128-2)]; }
    case 'classic-neg': { const c=1.15; r=(r-128)*c+128; g=(g-128)*c+128; b=(b-128)*c+128; const gray=0.299*r+0.587*g+0.114*b, sat=0.9; r=gray+(r-gray)*sat; g=gray+(g-gray)*sat; b=gray+(b-gray)*sat; if(gray>160){r+=10;g+=4;b-=8;} if(gray<90){r-=5;g+=5;b+=10;} return [clamp(r),clamp(g),clamp(b)]; }
    case 'eterna': { const c=0.8; r=(r-128)*c+128; g=(g-128)*c+128; b=(b-128)*c+128; const gray=0.299*r+0.587*g+0.114*b, sat=0.8; return [clamp(gray+(r-gray)*sat-2), clamp(gray+(g-gray)*sat+4), clamp(gray+(b-gray)*sat+6)]; }
    case 'eterna-bleach': { const c=1.3; r=(r-128)*c+128; g=(g-128)*c+128; b=(b-128)*c+128; const gray=0.299*r+0.587*g+0.114*b, sat=0.5; return [clamp(gray+(r-gray)*sat), clamp(gray+(g-gray)*sat), clamp(gray+(b-gray)*sat)]; }
    case 'acros': { let gray=0.299*r+0.587*g+0.114*b; gray=(gray-128)*1.25+128; return [clamp(gray),clamp(gray),clamp(gray)]; }
    case 'monochrome': { const gray=0.299*r+0.587*g+0.114*b; const v=(gray-128)*1.05+128; return [clamp(v),clamp(v),clamp(v)]; }
    case 'sepia': { const gray=0.299*r+0.587*g+0.114*b; return [clamp(gray*1.07+20), clamp(gray*0.94+10), clamp(gray*0.68)]; }
    default: return [r, g, b];
  }
}

function applySharpen(srcData: ImageData, w: number, h: number, amount: number): ImageData {
  if (amount <= 0) return srcData;
  const dst = new ImageData(new Uint8ClampedArray(srcData.data), w, h);
  const factor = amount / 100 * 0.8;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) for (let c = 0; c < 3; c++) {
    const i = (y * w + x) * 4 + c;
    const lap = srcData.data[i - w * 4] + srcData.data[i + w * 4] + srcData.data[i - 4] + srcData.data[i + 4] - 4 * srcData.data[i];
    dst.data[i] = clamp(srcData.data[i] - factor * lap);
  }
  return dst;
}

export function applyEdits(srcCanvas: HTMLCanvasElement, dstCanvas: HTMLCanvasElement, params: EditParams, filter: FujifilmFilter) {
  const w = srcCanvas.width, h = srcCanvas.height;
  dstCanvas.width = w; dstCanvas.height = h;
  const imgData = srcCanvas.getContext('2d')!.getImageData(0, 0, w, h);
  const d = imgData.data;
  const brightness = params.brightness * 2.55;
  const contrastFactor = (259 * (params.contrast + 255)) / (255 * (259 - params.contrast));
  const exposureFactor = Math.pow(2, params.exposure / 100);
  const tempShift = params.temperature * 0.8, tintShift = params.tint * 0.5;
  const highlightsAdj = params.highlights / 100, shadowsAdj = params.shadows / 100;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i]*exposureFactor+brightness, g = d[i+1]*exposureFactor+brightness, b = d[i+2]*exposureFactor+brightness;
    r = contrastFactor*(r-128)+128; g = contrastFactor*(g-128)+128; b = contrastFactor*(b-128)+128;
    r += tempShift; b -= tempShift; g -= tintShift; b += tintShift;
    const lum = 0.299*r+0.587*g+0.114*b;
    if (lum > 128) { const hi=(lum-128)/127; r+=highlightsAdj*128*hi; g+=highlightsAdj*128*hi; b+=highlightsAdj*128*hi; }
    else { const sh=1-lum/128; r+=shadowsAdj*100*sh; g+=shadowsAdj*100*sh; b+=shadowsAdj*100*sh; }
    const gray = 0.299*r+0.587*g+0.114*b, satFactor = 1+params.saturation/100;
    r = gray+(r-gray)*satFactor; g = gray+(g-gray)*satFactor; b = gray+(b-gray)*satFactor;
    [r, g, b] = applyFujifilmFilter(clamp(r), clamp(g), clamp(b), filter);
    d[i] = clamp(r); d[i+1] = clamp(g); d[i+2] = clamp(b);
  }
  let processed = imgData;
  if (params.sharpness > 0) processed = applySharpen(imgData, w, h, params.sharpness);
  if (params.grain > 0) { const ga = params.grain*0.5; for (let i=0;i<processed.data.length;i+=4){const n=(Math.random()-0.5)*ga; processed.data[i]=clamp(processed.data[i]+n); processed.data[i+1]=clamp(processed.data[i+1]+n); processed.data[i+2]=clamp(processed.data[i+2]+n);} }
  dstCanvas.getContext('2d')!.putImageData(processed, 0, 0);
  if (params.vignette > 0) {
    const cx=w/2, cy=h/2, maxDist=Math.sqrt(cx*cx+cy*cy), vs=params.vignette/100*0.8;
    const grad = dstCanvas.getContext('2d')!.createRadialGradient(cx,cy,maxDist*0.3,cx,cy,maxDist);
    grad.addColorStop(0,'rgba(0,0,0,0)'); grad.addColorStop(1,`rgba(0,0,0,${vs})`);
    dstCanvas.getContext('2d')!.fillStyle=grad; dstCanvas.getContext('2d')!.fillRect(0,0,w,h);
  }
}
