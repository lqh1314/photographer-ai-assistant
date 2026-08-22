import { useState, useRef, useCallback } from 'react';
import { Upload, FolderOpen, Play, Download, Trash2, Loader2, CheckCircle, AlertCircle, Star, Copy, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { loadImageToCanvas, analyzePhoto, detectDuplicates, type PhotoAnalysisResult } from '@/lib/imageAnalysis';
import { processFolderFiles, type ImportedImage } from '@/lib/folderImport';
import { MOCK_PUT_IMAGE_DATA } from '@/data/putimagedata';
interface PhotoItem extends ImportedImage { analysis?: PhotoAnalysisResult; }
const CATEGORY_CONFIG = {
  recommend: { label: '精修主推', color: 'bg-green-500', icon: Star, desc: '技术质量优秀，建议精修' },
  backup: { label: '套系保底', color: 'bg-blue-500', icon: CheckCircle, desc: '质量良好，可作为保底' },
  alternative: { label: '备选', color: 'bg-yellow-500', icon: Copy, desc: '存在轻微瑕疵' },
  eliminate: { label: '建议淘汰', color: 'bg-red-500', icon: AlertCircle, desc: '技术问题明显' },
};
export default function PhotoSelectPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const folders = Array.from(new Set(photos.map((p) => p.folder)));
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const images = await processFolderFiles(files, { generateThumbnails: false });
    if (images.length === 0) { toast.error('未找到图片文件'); return; }
    setPhotos((prev) => [...prev, ...images]);
    toast.success(`已添加 ${images.length} 张图片`);
  }, []);
  const loadDemo = () => {
    setPhotos(MOCK_PUT_IMAGE_DATA.map((d) => ({ id: d.id, name: d.name, url: d.url, folder: '示例图片' })));
    toast.success('已加载示例图片');
  };
  const analyzeAll = async () => {
    if (photos.length === 0) return;
    setAnalyzing(true); setProgress({ current: 0, total: photos.length });
    const results: PhotoItem[] = [];
    for (let i = 0; i < photos.length; i++) {
      try { const canvas = await loadImageToCanvas(photos[i].url, 800); results.push({ ...photos[i], analysis: analyzePhoto(canvas) }); }
      catch { results.push({ ...photos[i] }); }
      setProgress({ current: i + 1, total: photos.length });
      if (i % 5 === 4) await new Promise((r) => setTimeout(r, 10));
    }
    const withHash = results.filter((p) => p.analysis);
    const dupMap = detectDuplicates(withHash.map((p) => ({ id: p.id, dHash: p.analysis!.dHash, totalScore: p.analysis!.totalScore, category: p.analysis!.category })));
    const groupBest = new Map<string, string>();
    withHash.forEach((p) => { const gid = dupMap.get(p.id)!; const best = groupBest.get(gid); if (!best || p.analysis!.totalScore > (results.find((r) => r.id === best)?.analysis?.totalScore || 0)) groupBest.set(gid, p.id); });
    setPhotos(results.map((p) => { if (!p.analysis) return p; const gid = dupMap.get(p.id); if (gid && groupBest.get(gid) !== p.id) return { ...p, analysis: { ...p.analysis, isDuplicate: true, duplicateGroupId: gid } }; return p; }));
    setAnalyzing(false); toast.success('分析完成！');
  };
  const clearAll = () => { photos.forEach((p) => { if (p.url.startsWith('blob:')) URL.revokeObjectURL(p.url); }); setPhotos([]); };
  const exportCSV = () => {
    const analyzed = photos.filter((p) => p.analysis);
    if (analyzed.length === 0) { toast.error('没有分析结果可导出'); return; }
    const headers = ['文件名', '文件夹', '等级', '总分', '清晰度', '曝光', '对比度', '推荐理由', '建议用途', '是否重复'];
    const rows = analyzed.map((p) => [p.name, p.folder, CATEGORY_CONFIG[p.analysis!.category].label, p.analysis!.totalScore, p.analysis!.sharpness, p.analysis!.exposure.score, p.analysis!.contrast, p.analysis!.reason, p.analysis!.usage.join('/'), p.analysis!.isDuplicate ? '是' : '否']);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `选片结果_${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success('CSV 已导出');
  };
  const filteredPhotos = photos.filter((p) => { if (selectedFolder !== 'all' && p.folder !== selectedFolder) return false; if (activeTab === 'all') return true; if (activeTab === 'duplicate') return p.analysis?.isDuplicate; return p.analysis?.category === activeTab; });
  const counts = { all: photos.length, recommend: photos.filter((p) => p.analysis?.category === 'recommend').length, backup: photos.filter((p) => p.analysis?.category === 'backup').length, alternative: photos.filter((p) => p.analysis?.category === 'alternative').length, eliminate: photos.filter((p) => p.analysis?.category === 'eliminate').length, duplicate: photos.filter((p) => p.analysis?.isDuplicate).length };
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold">AI 智能选片</h1><p className="text-muted-foreground">上传原片，AI 自动检测清晰度、曝光、构图，智能分级推荐</p></div>
      {photos.length === 0 ? (
        <div className="mb-6 rounded-xl border-2 border-dashed p-12 text-center">
          <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-4 text-muted-foreground">上传照片或导入文件夹开始 AI 选片</p>
          <div className="flex flex-wrap justify-center gap-3">
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            <input ref={folderInputRef} type="file" multiple className="hidden" /* @ts-expect-error webkitdirectory */ webkitdirectory="" directory="" onChange={(e) => handleFiles(e.target.files)} />
            <Button onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> 选择照片</Button>
            <Button variant="outline" onClick={() => folderInputRef.current?.click()}><FolderOpen className="mr-2 h-4 w-4" /> 导入文件夹</Button>
            <Button variant="ghost" onClick={loadDemo}>加载示例图片</Button>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          <input ref={folderInputRef} type="file" multiple className="hidden" /* @ts-expect-error webkitdirectory */ webkitdirectory="" directory="" onChange={(e) => handleFiles(e.target.files)} />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> 添加照片</Button>
          <Button variant="outline" onClick={() => folderInputRef.current?.click()}><FolderOpen className="mr-2 h-4 w-4" /> 添加文件夹</Button>
          <Button onClick={analyzeAll} disabled={analyzing}>{analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}{analyzing ? '分析中...' : '开始 AI 分析'}</Button>
          <Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4" /> 导出 CSV</Button>
          <Button variant="ghost" onClick={clearAll}><Trash2 className="mr-2 h-4 w-4" /> 清空</Button>
          <span className="text-sm text-muted-foreground">共 {photos.length} 张</span>
        </div>
      )}
      {analyzing && <Card className="mb-6"><CardContent className="p-4"><div className="mb-2 flex justify-between text-sm"><span>正在分析图片...</span><span>{progress.current}/{progress.total}</span></div><Progress value={(progress.current / progress.total) * 100} /></CardContent></Card>}
      {folders.length > 1 && <div className="mb-4 flex flex-wrap gap-2"><Button variant={selectedFolder === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedFolder('all')}>全部文件夹</Button>{folders.map((f) => <Button key={f} variant={selectedFolder === f ? 'default' : 'outline'} size="sm" onClick={() => setSelectedFolder(f)}><FolderOpen className="mr-1 h-3 w-3" /> {f}</Button>)}</div>}
      {photos.length > 0 && photos.some((p) => p.analysis) && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6"><TabsList className="flex-wrap"><TabsTrigger value="all">全部 ({counts.all})</TabsTrigger><TabsTrigger value="recommend">精修主推 ({counts.recommend})</TabsTrigger><TabsTrigger value="backup">套系保底 ({counts.backup})</TabsTrigger><TabsTrigger value="alternative">备选 ({counts.alternative})</TabsTrigger><TabsTrigger value="eliminate">建议淘汰 ({counts.eliminate})</TabsTrigger>{counts.duplicate > 0 && <TabsTrigger value="duplicate">重复 ({counts.duplicate})</TabsTrigger>}</TabsList></Tabs>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredPhotos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden">
            <div className="relative aspect-[4/3] bg-muted">
              <img src={photo.thumbnail || photo.url} alt={photo.name} className="h-full w-full object-cover" loading="lazy" />
              {photo.analysis && (<>
                <Badge className={`absolute left-2 top-2 ${CATEGORY_CONFIG[photo.analysis.category].color} border-0 text-white`}>{CATEGORY_CONFIG[photo.analysis.category].label}</Badge>
                {photo.analysis.isDuplicate && <Badge className="absolute right-2 top-2 border-0 bg-orange-500 text-white">重复</Badge>}
                <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs font-bold text-white">{photo.analysis.totalScore}分</div>
              </>)}
            </div>
            <CardContent className="p-3">
              <div className="mb-1 truncate text-sm font-medium" title={photo.name}>{photo.name}</div>
              <div className="mb-2 text-xs text-muted-foreground">{photo.folder}</div>
              {photo.analysis ? (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">清晰度</span><span>{photo.analysis.sharpness}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">曝光</span><span>{photo.analysis.exposure.score} ({photo.analysis.exposure.label})</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">对比度</span><span>{photo.analysis.contrast}</span></div>
                  <p className="mt-1.5 text-muted-foreground">{photo.analysis.reason}</p>
                  {photo.analysis.usage.length > 0 && <div className="flex flex-wrap gap-1 pt-1">{photo.analysis.usage.map((u) => <Badge key={u} variant="secondary" className="text-[10px]">{u}</Badge>)}</div>}
                </div>
              ) : <p className="text-xs text-muted-foreground">等待分析...</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
