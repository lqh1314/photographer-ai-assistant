import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload, Download, RotateCcw, Loader2, Wand2, Sparkles,
  Sun, Droplets, Wind, UserCircle, Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  applyEdits, DEFAULT_PARAMS, FUJIFILM_FILTERS,
  type EditParams, type FujifilmFilter,
} from '@/lib/photoEditor';
import {
  enhanceAuto, beautifySkin, enhanceScene, dehaze, denoise, portraitLighting,
} from '@/lib/photoEditorAI';
import { loadImageToCanvas } from '@/lib/imageAnalysis';
import { MOCK_PUT_IMAGE_DATA } from '@/data/putimagedata';

const AI_FUNCTIONS = [
  { id: 'enhance', label: '一键增强', icon: Wand2, desc: '自动色阶+白平衡+清晰度' },
  { id: 'beauty', label: '智能美颜', icon: UserCircle, desc: '磨皮+去瑕疵+提亮' },
  { id: 'scene', label: '场景增强', icon: Sun, desc: '识别场景智能优化' },
  { id: 'dehaze', label: 'AI 去雾', icon: Droplets, desc: '暗通道先验去雾' },
  { id: 'denoise', label: '智能降噪', icon: Wind, desc: '双边滤波降噪' },
  { id: 'lighting', label: '人像光效', icon: Sparkles, desc: '面部聚光+暗角' },
];

const SLIDER_CONFIG: { key: keyof EditParams; label: string; min: number; max: number; unit?: string }[] = [
  { key: 'exposure', label: '曝光', min: -100, max: 100 },
  { key: 'brightness', label: '亮度', min: -100, max: 100 },
  { key: 'contrast', label: '对比度', min: -100, max: 100 },
  { key: 'highlights', label: '高光', min: -100, max: 100 },
  { key: 'shadows', label: '阴影', min: -100, max: 100 },
  { key: 'saturation', label: '饱和度', min: -100, max: 100 },
  { key: 'temperature', label: '色温', min: -100, max: 100 },
  { key: 'tint', label: '色调', min: -100, max: 100 },
  { key: 'sharpness', label: '锐化', min: 0, max: 100 },
  { key: 'vignette', label: '暗角', min: 0, max: 100 },
  { key: 'grain', label: '颗粒', min: 0, max: 100 },
];

export default function PhotoEditPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [params, setParams] = useState<EditParams>(DEFAULT_PARAMS);
  const [filter, setFilter] = useState<FujifilmFilter>('none');
  const [aiIntensity, setAiIntensity] = useState(70);
  const [processing, setProcessing] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<string[]>([]);
  const [showOriginal, setShowOriginal] = useState(false);
  const [comparePos, setComparePos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const srcCanvasRef = useRef<HTMLCanvasElement>(null);
  const dstCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingSrcRef = useRef<HTMLCanvasElement | null>(null);

  // 渲染编辑结果
  const render = useCallback(() => {
    if (!srcCanvasRef.current || !dstCanvasRef.current) return;
    if (srcCanvasRef.current.width === 0) return;
    applyEdits(srcCanvasRef.current, dstCanvasRef.current, params, filter);
  }, [params, filter]);

  useEffect(() => {
    if (imageSrc && pendingSrcRef.current && srcCanvasRef.current) {
      const pending = pendingSrcRef.current;
      srcCanvasRef.current.width = pending.width;
      srcCanvasRef.current.height = pending.height;
      srcCanvasRef.current.getContext('2d')!.drawImage(pending, 0, 0);
      pendingSrcRef.current = null;
    }
    if (imageSrc) render();
  }, [render, imageSrc]);

  const commitImage = (canvas: HTMLCanvasElement, url: string) => {
    pendingSrcRef.current = canvas;
    setImageSrc(url);
    setParams(DEFAULT_PARAMS);
    setFilter('none');
    setAiResults([]);
  };

  const loadImage = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const srcCanvas = document.createElement('canvas');
      const maxSize = 1600;
      let w = img.width, h = img.height;
      if (w > h && w > maxSize) { h = Math.round(h * maxSize / w); w = maxSize; }
      else if (h > maxSize) { w = Math.round(w * maxSize / h); h = maxSize; }
      srcCanvas.width = w; srcCanvas.height = h;
      srcCanvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      commitImage(srcCanvas, url);
      toast.success('图片已加载');
    };
    img.src = url;
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadImage(file);
  };

  const loadDemoImage = async () => {
    try {
      const demoUrl = MOCK_PUT_IMAGE_DATA[1].url;
      const loaded = await loadImageToCanvas(demoUrl, 1600);
      commitImage(loaded, demoUrl);
      toast.success('示例图片已加载');
    } catch {
      toast.error('示例图片加载失败，请检查网络后重试');
    }
  };

  const runAI = async (funcId: string) => {
    if (!srcCanvasRef.current || !dstCanvasRef.current) return;
    setProcessing(funcId);
    try {
      await new Promise((r) => setTimeout(r, 50));
      let results: string[] = [];
      switch (funcId) {
        case 'enhance':
          results = enhanceAuto(srcCanvasRef.current, dstCanvasRef.current);
          break;
        case 'beauty':
          const b = beautifySkin(srcCanvasRef.current, dstCanvasRef.current, aiIntensity);
          results = b.applied;
          break;
        case 'scene':
          const s = enhanceScene(srcCanvasRef.current, dstCanvasRef.current);
          results = [`识别场景：${s.label}`, ...s.applied];
          break;
        case 'dehaze':
          results = dehaze(srcCanvasRef.current, dstCanvasRef.current, aiIntensity);
          break;
        case 'denoise':
          results = denoise(srcCanvasRef.current, dstCanvasRef.current, aiIntensity);
          break;
        case 'lighting':
          const l = portraitLighting(srcCanvasRef.current, dstCanvasRef.current);
          results = l.success ? l.applied : ['未检测到人像，请使用含人脸的图片'];
          break;
      }
      // 将 AI 处理结果作为新的源图
      const newSrc = document.createElement('canvas');
      newSrc.width = dstCanvasRef.current.width;
      newSrc.height = dstCanvasRef.current.height;
      newSrc.getContext('2d')!.drawImage(dstCanvasRef.current, 0, 0);
      srcCanvasRef.current.width = newSrc.width;
      srcCanvasRef.current.height = newSrc.height;
      srcCanvasRef.current.getContext('2d')!.drawImage(newSrc, 0, 0);
      setParams(DEFAULT_PARAMS);
      setFilter('none');
      setAiResults((prev) => [...results, ...prev].slice(0, 20));
      toast.success(`${AI_FUNCTIONS.find((f) => f.id === funcId)?.label} 完成`);
    } catch (e) {
      toast.error('处理失败，请重试');
    } finally {
      setProcessing(null);
    }
  };

  const reset = () => {
    setParams(DEFAULT_PARAMS);
    setFilter('none');
    setAiResults([]);
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        if (!srcCanvasRef.current) return;
        const ctx = srcCanvasRef.current.getContext('2d')!;
        ctx.clearRect(0, 0, srcCanvasRef.current.width, srcCanvasRef.current.height);
        ctx.drawImage(img, 0, 0, srcCanvasRef.current.width, srcCanvasRef.current.height);
        render();
      };
      img.src = imageSrc;
    }
  };

  const exportImage = (format: 'jpeg' | 'png') => {
    if (!dstCanvasRef.current) return;
    const url = dstCanvasRef.current.toDataURL(`image/${format}`, format === 'jpeg' ? 0.92 : undefined);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edited_${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
    a.click();
    toast.success('图片已导出');
  };

  const handleSliderChange = (key: keyof EditParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI 修图工坊</h1>
        <p className="text-muted-foreground">6 大 AI 修图功能 · 12 种富士胶片模拟滤镜 · 专业手动调整</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Canvas area */}
        <div>
          {!imageSrc ? (
            <div
              className={`flex min-h-[500px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-medium">拖拽图片到这里，或点击上传</p>
              <p className="mb-4 text-sm text-muted-foreground">支持 JPG / PNG / WebP，建议不超过 1600px</p>
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); loadDemoImage(); }}>
                加载示例图片
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-1.5 h-3.5 w-3.5" /> 换图
                </Button>
                <Button variant="outline" size="sm" onClick={reset}>
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> 重置
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportImage('jpeg')}>
                  <Download className="mr-1.5 h-3.5 w-3.5" /> 导出 JPG
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportImage('png')}>
                  <Download className="mr-1.5 h-3.5 w-3.5" /> 导出 PNG
                </Button>
                <Button
                  variant="outline" size="sm"
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onMouseLeave={() => setShowOriginal(false)}
                >
                  按住查看原图
                </Button>
              </div>

              <div
                ref={containerRef}
                className="relative overflow-hidden rounded-xl border bg-[repeating-conic-gradient(#f0f0f0_0%_25%,#fff_0%_50%)] bg-[length:20px_20px]"
                style={{ maxHeight: '70vh' }}
              >
                <canvas ref={srcCanvasRef} className="hidden" />
                <canvas
                  ref={dstCanvasRef}
                  className="mx-auto block max-h-[70vh] max-w-full"
                  style={{ display: showOriginal ? 'none' : 'block' }}
                />
                {showOriginal && (
                  <canvas
                    ref={(el) => {
                      if (el && srcCanvasRef.current) {
                        el.width = srcCanvasRef.current.width;
                        el.height = srcCanvasRef.current.height;
                        el.getContext('2d')!.drawImage(srcCanvasRef.current, 0, 0);
                      }
                    }}
                    className="mx-auto block max-h-[70vh] max-w-full"
                  />
                )}
              </div>

              {aiResults.length > 0 && (
                <Card>
                  <CardContent className="p-3">
                    <div className="mb-1 text-xs font-medium text-muted-foreground">AI 处理记录</div>
                    <div className="flex flex-wrap gap-1">
                      {aiResults.map((r, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">{r}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Control panel */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-3 text-sm font-semibold">AI 智能修图</h3>
              <div className="mb-3">
                <label className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>AI 强度</span>
                  <span>{aiIntensity}%</span>
                </label>
                <input
                  type="range" min={10} max={100} value={aiIntensity}
                  onChange={(e) => setAiIntensity(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {AI_FUNCTIONS.map((func) => (
                  <Button
                    key={func.id}
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-start gap-0.5 h-auto py-2"
                    disabled={!imageSrc || processing !== null}
                    onClick={() => runAI(func.id)}
                  >
                    {processing === func.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <func.icon className="h-4 w-4" />
                    )}
                    <span className="text-xs font-medium">{func.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Tabs defaultValue="filters">
                <TabsList className="w-full">
                  <TabsTrigger value="filters" className="flex-1">富士滤镜</TabsTrigger>
                  <TabsTrigger value="adjust" className="flex-1">手动调整</TabsTrigger>
                </TabsList>

                <TabsContent value="filters" className="mt-3">
                  <div className="grid grid-cols-3 gap-1.5">
                    {FUJIFILM_FILTERS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`rounded-md border p-2 text-center transition-colors ${
                          filter === f.value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'hover:bg-accent'
                        }`}
                        title={f.description}
                      >
                        <div className="text-[11px] font-medium leading-tight">{f.label}</div>
                      </button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="adjust" className="mt-3 space-y-3">
                  {SLIDER_CONFIG.map((cfg) => (
                    <div key={cfg.key}>
                      <label className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{cfg.label}</span>
                        <span className="font-mono">{params[cfg.key]}</span>
                      </label>
                      <input
                        type="range"
                        min={cfg.min}
                        max={cfg.max}
                        value={params[cfg.key]}
                        onChange={(e) => handleSliderChange(cfg.key, Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  ))}
                  <Separator />
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setParams(DEFAULT_PARAMS)}>
                    <RotateCcw className="mr-1.5 h-3 w-3" /> 重置调整
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
