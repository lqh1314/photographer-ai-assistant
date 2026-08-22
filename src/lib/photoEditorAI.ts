/**
 * AI 智能修图引擎
 * 一键增强、智能美颜（双边滤波磨皮）、场景识别增强、暗通道去雾、双边滤波降噪、人像光效
 */
function clamp(v: number): number { return v < 0 ? 0 : v > 255 ? 255 : v; }
function getImageData(canvas: HTMLCanvasElement): ImageData { return canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height); }
function putImageData(canvas: HTMLCanvasElement, imgData: ImageData) { const ctx = canvas.getContext('2d')!; canvas.width = imgData.width; canvas.height = imgData.height; ctx.putImageData(imgData, 0, 0); }
function copyCanvas(src: HTMLCanvasElement): HTMLCanvasElement { const dst = document.createElement('canvas'); dst.width = src.width; dst.height = src.height; dst.getContext('2d')!.drawImage(src, 0, 0); return dst; }

function autoLevels(imgData: ImageData): boolean {
  const d = imgData.data; const hist: number[][] = [[], [], []];
  for (let c = 0; c < 3; c++) hist[c] = new Array(256).fill(0);
  for (let i = 0; i < d.length; i += 4) { hist[0][d[i]]++; hist[1][d[i+1]]++; hist[2][d[i+2]]++; }
  const total = d.length / 4; let changed = false;
  for (let c = 0; c < 3; c++) {
    let lo = 0, hi = 255, acc = 0;
    for (let v = 0; v < 256; v++) { acc += hist[c][v]; if (acc >= total * 0.005) { lo = v; break; } }
    acc = 0;
    for (let v = 0; v < 256; v++) { acc += hist[c][v]; if (acc >= total * 0.995) { hi = v; break; } }
    if (hi > lo) { const scale = 235 / (hi - lo), offset = 10 - lo * scale; for (let i = c; i < d.length; i += 4) d[i] = clamp(d[i] * scale + offset); changed = true; }
  }
  return changed;
}

function autoWhiteBalance(imgData: ImageData): boolean {
  const d = imgData.data; let rSum = 0, gSum = 0, bSum = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) { rSum += d[i]; gSum += d[i+1]; bSum += d[i+2]; n++; }
  const gray = (rSum + gSum + bSum) / (3 * n);
  const rGain = Math.min(1.3, gray / (rSum / n)), gGain = Math.min(1.3, gray / (gSum / n)), bGain = Math.min(1.3, gray / (bSum / n));
  if (Math.abs(rGain - 1) < 0.02 && Math.abs(gGain - 1) < 0.02 && Math.abs(bGain - 1) < 0.02) return false;
  for (let i = 0; i < d.length; i += 4) { d[i] = clamp(d[i] * rGain); d[i+1] = clamp(d[i+1] * gGain); d[i+2] = clamp(d[i+2] * bGain); }
  return true;
}

function autoContrast(imgData: ImageData): boolean {
  const d = imgData.data; const hist = new Array(256).fill(0);
  for (let i = 0; i < d.length; i += 4) hist[Math.round(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2])]++;
  const total = d.length / 4; let lo = 0, hi = 255, acc = 0;
  for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= total*0.005) { lo = v; break; } }
  acc = 0;
  for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= total*0.995) { hi = v; break; } }
  if (hi - lo < 10) return false;
  const scale = 255 / (hi - lo), offset = -lo * scale;
  for (let i = 0; i < d.length; i += 4) { d[i] = clamp(d[i]*scale+offset); d[i+1] = clamp(d[i+1]*scale+offset); d[i+2] = clamp(d[i+2]*scale+offset); }
  return true;
}

function smartSaturation(imgData: ImageData): boolean {
  const d = imgData.data; let totalSat = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]/255, g = d[i+1]/255, b = d[i+2]/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b), l = (max+min)/2;
    if (max !== min) { totalSat += l > 0.5 ? (max-min)/(2-max-min) : (max-min)/(max+min); n++; }
  }
  if (n > 0 && totalSat / n < 0.3) {
    for (let i = 0; i < d.length; i += 4) { const gray = 0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; d[i]=clamp(gray+(d[i]-gray)*1.15); d[i+1]=clamp(gray+(d[i+1]-gray)*1.15); d[i+2]=clamp(gray+(d[i+2]-gray)*1.15); }
    return true;
  }
  return false;
}

function usmSharpen(imgData: ImageData, amount: number, radius: number): void {
  const w = imgData.width, h = imgData.height;
  const src = new Uint8ClampedArray(imgData.data), d = imgData.data;
  const r = Math.max(1, Math.round(radius));
  for (let y = r; y < h-r; y++) for (let x = r; x < w-r; x++) for (let c = 0; c < 3; c++) {
    const i = (y*w+x)*4+c; let sum = 0, count = 0;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { sum += src[((y+dy)*w+(x+dx))*4+c]; count++; }
    d[i] = clamp(src[i] + amount * (src[i] - sum/count));
  }
}

export function enhanceAuto(src: HTMLCanvasElement, dst: HTMLCanvasElement): string[] {
  const tmp = copyCanvas(src); const imgData = getImageData(tmp); const applied: string[] = [];
  if (autoLevels(imgData)) applied.push('自动色阶');
  if (autoWhiteBalance(imgData)) applied.push('白平衡校正');
  if (autoContrast(imgData)) applied.push('自动对比度');
  if (smartSaturation(imgData)) applied.push('智能饱和度');
  usmSharpen(imgData, 0.3, 2); applied.push('清晰度提升');
  putImageData(dst, imgData); return applied;
}

function rgbToYCbCr(r: number, g: number, b: number): [number, number, number] {
  return [0.299*r+0.587*g+0.114*b, 128-0.169*r-0.331*g+0.5*b, 128+0.5*r-0.419*g-0.081*b];
}

function detectSkinMask(imgData: ImageData): Uint8Array {
  const d = imgData.data, w = imgData.width, h = imgData.height;
  const mask = new Uint8Array(w*h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y*w+x)*4, r = d[i], g = d[i+1], b = d[i+2];
    const [, cb, cr] = rgbToYCbCr(r, g, b);
    if (cb >= 77 && cb <= 128 && cr >= 133 && cr <= 173 && r > 95 && g > 40 && b > 20 && r > g && r > b) mask[y*w+x] = 1;
  }
  return mask;
}

function bilateralFilter(imgData: ImageData, mask: Uint8Array | null, sigmaSpace: number, sigmaColor: number, strength: number): void {
  const w = imgData.width, h = imgData.height;
  const src = new Uint8ClampedArray(imgData.data), d = imgData.data;
  const radius = Math.ceil(sigmaSpace * 1.5);
  const ts2 = 2*sigmaSpace*sigmaSpace, tc2 = 2*sigmaColor*sigmaColor;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const idx = y*w+x; if (mask && !mask[idx]) continue;
    const i = idx*4; let rS=0,gS=0,bS=0,wS=0;
    const r0=src[i],g0=src[i+1],b0=src[i+2];
    for (let dy=-radius; dy<=radius; dy++) { const ny=y+dy; if(ny<0||ny>=h) continue;
      for (let dx=-radius; dx<=radius; dx++) { const nx=x+dx; if(nx<0||nx>=w) continue;
        if(mask&&!mask[ny*w+nx]) continue;
        const ni=(ny*w+nx)*4;
        const wgt=Math.exp(-(dx*dx+dy*dy)/ts2)*Math.exp(-((r0-src[ni])**2+(g0-src[ni+1])**2+(b0-src[ni+2])**2)/tc2);
        rS+=src[ni]*wgt; gS+=src[ni+1]*wgt; bS+=src[ni+2]*wgt; wS+=wgt;
      }
    }
    if (wS > 0) { const s = strength/100; d[i]=clamp(r0+(rS/wS-r0)*s); d[i+1]=clamp(g0+(gS/wS-g0)*s); d[i+2]=clamp(b0+(bS/wS-b0)*s); }
  }
}

function medianFilter(imgData: ImageData, mask: Uint8Array | null, size: number, strength: number): void {
  const w = imgData.width, h = imgData.height;
  const src = new Uint8ClampedArray(imgData.data), d = imgData.data;
  const r = Math.floor(size/2), s = strength/100;
  for (let y=r; y<h-r; y++) for (let x=r; x<w-r; x++) {
    const idx=y*w+x; if(mask&&!mask[idx]) continue;
    const i=idx*4;
    for (let c=0;c<3;c++) { const vals:number[]=[];
      for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++) vals.push(src[((y+dy)*w+(x+dx))*4+c]);
      vals.sort((a,b)=>a-b); d[i+c]=clamp(src[i+c]+(vals[Math.floor(vals.length/2)]-src[i+c])*s*0.5);
    }
  }
}

export function beautifySkin(src: HTMLCanvasElement, dst: HTMLCanvasElement, intensity: number = 70): { applied: string[]; skinPixels: number } {
  const tmp = copyCanvas(src); const imgData = getImageData(tmp);
  const w = imgData.width, h = imgData.height, d = imgData.data;
  const mask = detectSkinMask(imgData);
  const skinPixels = mask.reduce((a,b)=>a+b,0);
  const applied: string[] = [];
  if (skinPixels === 0) { putImageData(dst, imgData); return { applied: ['未检测到肤色区域'], skinPixels: 0 }; }
  bilateralFilter(imgData, mask, 5, 30, intensity); applied.push('智能磨皮');
  medianFilter(imgData, mask, 3, intensity*0.6); applied.push('瑕疵淡化');
  const br = 5+(intensity/100)*5;
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) { const idx=y*w+x; if(!mask[idx]) continue;
    const i=idx*4; d[i]=clamp(d[i]+br); d[i+1]=clamp(d[i+1]+br); d[i+2]=clamp(d[i+2]+br);
    const gray=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];
    d[i]=clamp(gray+(d[i]-gray)*0.95); d[i+1]=clamp(gray+(d[i+1]-gray)*0.95); d[i+2]=clamp(gray+(d[i+2]-gray)*0.95);
  }
  applied.push('肤色提亮');
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) { const i=(y*w+x)*4;
    const r=d[i],g=d[i+1],b=d[i+2], lum=0.299*r+0.587*g+0.114*b;
    const max=Math.max(r,g,b),min=Math.min(r,g,b), sat=max===0?0:(max-min)/max;
    if(lum>180&&sat<0.15){d[i]=clamp(r+10);d[i+1]=clamp(g+10);d[i+2]=clamp(b+10);
      const gray=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];
      d[i]=clamp(gray+(d[i]-gray)*0.85);d[i+1]=clamp(gray+(d[i+1]-gray)*0.85);d[i+2]=clamp(gray+(d[i+2]-gray)*0.85);}
  }
  applied.push('眼齿美白');
  putImageData(dst, imgData); return { applied, skinPixels };
}

export type SceneType = 'night'|'landscape'|'portrait'|'backlit'|'flat'|'general';

function calcEdgeDensity(imgData: ImageData): number {
  const w=imgData.width,h=imgData.height,d=imgData.data;
  const step=4*Math.max(1,Math.floor((w*h)/30000)); let ec=0,total=0;
  for(let y=1;y<h-1;y+=Math.max(1,Math.floor(step/4/w))) for(let x=1;x<w-1;x+=Math.max(1,Math.floor(step/4))){
    const i=(y*w+x)*4;
    const gx=-d[i-w*4-4]+d[i-w*4+4]-2*d[i-4]+2*d[i+4]-d[i+w*4-4]+d[i+w*4+4];
    const gy=-d[i-w*4-4]-2*d[i-w*4]-d[i-w*4+4]+d[i+w*4-4]+2*d[i+w*4]+d[i+w*4+4];
    if(Math.sqrt(gx*gx+gy*gy)>100) ec++; total++;
  }
  return total>0?ec/total:0;
}

export function enhanceScene(src: HTMLCanvasElement, dst: HTMLCanvasElement): { scene: SceneType; label: string; applied: string[] } {
  const tmp=copyCanvas(src); const imgData=getImageData(tmp); const d=imgData.data;
  const w=imgData.width,h=imgData.height;
  let sumLum=0,sumSat=0,darkC=0,brightC=0,n=0;
  for(let i=0;i<d.length;i+=80){const r=d[i],g=d[i+1],b=d[i+2];const lum=0.299*r+0.587*g+0.114*b;
    const max=Math.max(r,g,b),min=Math.min(r,g,b);sumLum+=lum;sumSat+=max===0?0:(max-min)/max;
    if(lum<50)darkC++;if(lum>200)brightC++;n++;}
  const avgLum=sumLum/n,avgSat=sumSat/n,darkR=darkC/n,brightR=brightC/n;
  const edgeD=calcEdgeDensity(imgData);
  const mask=detectSkinMask(imgData); const skinR=mask.reduce((a,b)=>a+b,0)/(w*h);
  let scene:SceneType,label:string;
  if(avgLum<70){scene='night';label='夜景/暗光';}
  else if(skinR>0.15){scene='portrait';label='人像';}
  else if(brightR>0.3&&darkR>0.3){scene='backlit';label='逆光/高反差';}
  else if(avgSat>0.4&&edgeD>0.08){scene='landscape';label='风光';}
  else{let v=0;for(let i=0;i<d.length;i+=80){const lum=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];v+=(lum-avgLum)**2;}
    if(Math.sqrt(v/n)<40){scene='flat';label='平淡/灰蒙';}else{scene='general';label='通用';}}
  const applied:string[]=[];
  switch(scene){
    case 'night':
      for(let i=0;i<d.length;i+=4){const lum=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];if(lum<128){const f=1+(1-lum/128)*0.4;d[i]=clamp(d[i]*f);d[i+1]=clamp(d[i+1]*f);d[i+2]=clamp(d[i+2]*f);}}
      applied.push('阴影提亮');
      for(let i=0;i<d.length;i+=4){d[i]=clamp((d[i]-128)*1.15+128);d[i+1]=clamp((d[i+1]-128)*1.15+128);d[i+2]=clamp((d[i+2]-128)*1.15+128);}
      applied.push('对比度提升'); bilateralFilter(imgData,null,3,20,50); applied.push('降噪');
      for(let i=0;i<d.length;i+=4){d[i]+=8;d[i+2]-=5;} applied.push('暖色调'); break;
    case 'landscape':
      for(let i=0;i<d.length;i+=4){d[i]=clamp((d[i]-128)*1.2+128);d[i+1]=clamp((d[i+1]-128)*1.2+128);d[i+2]=clamp((d[i+2]-128)*1.2+128);}
      applied.push('对比度提升');
      for(let i=0;i<d.length;i+=4){const gr=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];d[i]=clamp(gr+(d[i]-gr)*1.2);d[i+1]=clamp(gr+(d[i+1]-gr)*1.2);d[i+2]=clamp(gr+(d[i+2]-gr)*1.2);}
      applied.push('饱和度提升'); usmSharpen(imgData,0.4,2); applied.push('清晰度');
      for(let i=0;i<d.length;i+=4){d[i+2]=clamp(d[i+2]*1.08);d[i+1]=clamp(d[i+1]*1.05);} applied.push('蓝绿增强'); break;
    case 'portrait':
      for(let i=0;i<d.length;i+=4){d[i]=clamp(d[i]+10);d[i+1]=clamp(d[i+1]+8);d[i+2]=clamp(d[i+2]+6);} applied.push('提亮');
      for(let i=0;i<d.length;i+=4){d[i]=clamp((d[i]-128)*1.1+128);d[i+1]=clamp((d[i+1]-128)*1.1+128);d[i+2]=clamp((d[i+2]-128)*1.1+128);}
      applied.push('柔和对比'); for(let i=0;i<d.length;i+=4){d[i]+=5;d[i+2]-=3;} applied.push('暖肤调');
      bilateralFilter(imgData,mask,4,25,30); applied.push('轻微磨皮'); break;
    case 'backlit':
      for(let i=0;i<d.length;i+=4){const lum=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];
        if(lum<128){const f=1+(1-lum/128)*0.5;d[i]=clamp(d[i]*f);d[i+1]=clamp(d[i+1]*f);d[i+2]=clamp(d[i+2]*f);}
        else{const f=1-((lum-128)/127)*0.25;d[i]=clamp(d[i]*f);d[i+1]=clamp(d[i+1]*f);d[i+2]=clamp(d[i+2]*f);}}
      applied.push('阴影提亮/高光压暗');
      for(let i=0;i<d.length;i+=4){d[i]=clamp((d[i]-128)*0.9+128);d[i+1]=clamp((d[i+1]-128)*0.9+128);d[i+2]=clamp((d[i+2]-128)*0.9+128);}
      applied.push('降低反差'); break;
    case 'flat':
      autoLevels(imgData);autoContrast(imgData);applied.push('自动色阶');
      for(let i=0;i<d.length;i+=4){d[i]=clamp((d[i]-128)*1.3+128);d[i+1]=clamp((d[i+1]-128)*1.3+128);d[i+2]=clamp((d[i+2]-128)*1.3+128);}
      applied.push('对比度提升'); usmSharpen(imgData,0.35,2); applied.push('清晰度');
      for(let i=0;i<d.length;i+=4){const gr=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];d[i]=clamp(gr+(d[i]-gr)*1.15);d[i+1]=clamp(gr+(d[i+1]-gr)*1.15);d[i+2]=clamp(gr+(d[i+2]-gr)*1.15);}
      applied.push('饱和度提升'); break;
    default: enhanceAuto(tmp,dst); return {scene:'general',label:'通用',applied:['自动增强']};
  }
  putImageData(dst,imgData); return {scene,label,applied};
}

export function dehaze(src: HTMLCanvasElement, dst: HTMLCanvasElement, intensity: number = 80): string[] {
  const tmp=copyCanvas(src); const imgData=getImageData(tmp);
  const w=imgData.width,h=imgData.height,d=imgData.data; const applied:string[]=[];
  const ps=15,hp=7; const dc=new Float32Array(w*h);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){let mv=255;
    for(let dy=-hp;dy<=hp;dy+=2) for(let dx=-hp;dx<=hp;dx+=2){const nx=Math.min(w-1,Math.max(0,x+dx)),ny=Math.min(h-1,Math.max(0,y+dy));const i=(ny*w+nx)*4;mv=Math.min(mv,d[i],d[i+1],d[i+2]);}
    dc[y*w+x]=mv;}
  const nb=Math.max(1,Math.floor(w*h*0.001));
  const idx=Array.from(dc.keys()).sort((a,b)=>dc[b]-dc[a]);
  let aR=0,aG=0,aB=0;
  for(let k=0;k<nb;k++){const i=idx[k]*4;if(d[i]+d[i+1]+d[i+2]>aR+aG+aB){aR=d[i];aG=d[i+1];aB=d[i+2];}}
  aR=Math.max(aR,1);aG=Math.max(aG,1);aB=Math.max(aB,1);
  const omega=0.7*(intensity/100);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){const i=(y*w+x)*4;
    const t=Math.max(0.1,((1-omega*dc[y*w+x]/aR)+(1-omega*dc[y*w+x]/aG)+(1-omega*dc[y*w+x]/aB))/3);
    d[i]=clamp((d[i]-aR)/t+aR);d[i+1]=clamp((d[i+1]-aG)/t+aG);d[i+2]=clamp((d[i+2]-aB)/t+aB);}
  applied.push('暗通道去雾');
  for(let i=0;i<d.length;i+=4){d[i]=clamp((d[i]-128)*1.1+128);d[i+1]=clamp((d[i+1]-128)*1.1+128);d[i+2]=clamp((d[i+2]-128)*1.1+128);}
  for(let i=0;i<d.length;i+=4){const gr=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];d[i]=clamp(gr+(d[i]-gr)*1.1);d[i+1]=clamp(gr+(d[i+1]-gr)*1.1);d[i+2]=clamp(gr+(d[i+2]-gr)*1.1);}
  applied.push('饱和度提升');
  putImageData(dst,imgData); return applied;
}

export function denoise(src: HTMLCanvasElement, dst: HTMLCanvasElement, intensity: number = 60): string[] {
  const tmp=copyCanvas(src); const imgData=getImageData(tmp);
  const w=imgData.width,h=imgData.height,d=imgData.data; const applied:string[]=[];
  let ns=0,cnt=0;
  for(let y=1;y<h-1;y+=3) for(let x=1;x<w-1;x+=3){const i=(y*w+x)*4;ns+=Math.abs(d[i-w*4]+d[i+w*4]+d[i-4]+d[i+4]-4*d[i]);cnt++;}
  const sc=Math.min(50,Math.max(15,ns/cnt*0.8));
  const yc=new Float32Array(d.length);
  for(let i=0;i<d.length;i+=4){const[y,cb,cr]=rgbToYCbCr(d[i],d[i+1],d[i+2]);yc[i]=y;yc[i+1]=cb;yc[i+2]=cr;}
  const cbB=new Float32Array(w*h),crB=new Float32Array(w*h);
  for(let y=1;y<h-1;y++) for(let x=1;x<w-1;x++){let cs=0,crs=0,n=0;
    for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){const id=(y+dy)*w+(x+dx);cs+=yc[id*4+1];crs+=yc[id*4+2];n++;}
    cbB[y*w+x]=cs/n;crB[y*w+x]=crs/n;}
  const cs2=intensity/100;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){const id=y*w+x;yc[id*4+1]=yc[id*4+1]*(1-cs2)+cbB[id]*cs2;yc[id*4+2]=yc[id*4+2]*(1-cs2)+crB[id]*cs2;}
  applied.push('色度降噪');
  for(let i=0;i<d.length;i+=4){const y=yc[i],cb=yc[i+1],cr=yc[i+2];d[i]=clamp(y+1.402*(cr-128));d[i+1]=clamp(y-0.344*(cb-128)-0.714*(cr-128));d[i+2]=clamp(y+1.772*(cb-128));}
  bilateralFilter(imgData,null,3,sc,intensity*0.7); applied.push('亮度边缘保留降噪');
  putImageData(dst,imgData); return applied;
}

export function portraitLighting(src: HTMLCanvasElement, dst: HTMLCanvasElement): { success: boolean; applied: string[] } {
  const tmp=copyCanvas(src); const imgData=getImageData(tmp);
  const w=imgData.width,h=imgData.height,d=imgData.data;
  const mask=detectSkinMask(imgData); const sc=mask.reduce((a,b)=>a+b,0);
  if(sc<w*h*0.05){putImageData(dst,imgData);return{success:false,applied:['未检测到人像']};}
  let sx=0,sy=0; for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(mask[y*w+x]){sx+=x;sy+=y;}
  const cx=sx/sc,cy=sy/sc; const applied:string[]=[];
  const md=Math.sqrt(Math.max(cx*cx,(w-cx)**2)+Math.max(cy*cy,(h-cy)**2));
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){const i=(y*w+x)*4;const dist=Math.sqrt((x-cx)**2+(y-cy)**2);const ratio=dist/md;
    if(ratio<0.4){const br=(1-ratio/0.4)*18;d[i]=clamp(d[i]+br);d[i+1]=clamp(d[i+1]+br);d[i+2]=clamp(d[i+2]+br);}
    else{const dk=Math.min(1,(ratio-0.4)/0.6)*25;d[i]=clamp(d[i]-dk);d[i+1]=clamp(d[i+1]-dk);d[i+2]=clamp(d[i+2]-dk);}}
  applied.push('面部聚光');
  usmSharpen(imgData,0.25,1); applied.push('面部清晰度');
  for(let i=0;i<d.length;i+=4){d[i]=clamp(d[i]+6);d[i+2]=clamp(d[i+2]-4);} applied.push('柔和暖调');
  const ctx=dst.getContext('2d')!; putImageData(dst,imgData);
  const vcx=w/2,vcy=h/2,vm=Math.sqrt(vcx*vcx+vcy*vcy);
  const grad=ctx.createRadialGradient(vcx,vcy,vm*0.35,vcx,vcy,vm);
  grad.addColorStop(0,'rgba(0,0,0,0)');grad.addColorStop(1,'rgba(0,0,0,0.35)');
  ctx.fillStyle=grad;ctx.fillRect(0,0,w,h); applied.push('自然暗角');
  return{success:true,applied};
}
