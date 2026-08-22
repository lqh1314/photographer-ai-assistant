import { useState, useRef, useMemo, useEffect } from 'react';
import { Upload, FolderOpen, Trash2, Search, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { MOCK_GALLERY, STYLE_TAGS, SHOOT_TYPES, type GalleryItem } from '@/data/gallery';
import { processFolderFiles, loadUserGallery, saveGalleryBatch, deleteUserGalleryItem, classifyByFolderName, type StoredGalleryItem } from '@/lib/folderImport';
export default function GalleryPage() {
  const [styleFilter, setStyleFilter] = useState('全部');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [userItems, setUserItems] = useState<StoredGalleryItem[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setUserItems(loadUserGallery()); }, []);
  const filteredGallery = useMemo(() => MOCK_GALLERY.filter((item) => {
    if (styleFilter !== '全部' && item.style !== styleFilter) return false;
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (search && !item.title.includes(search) && !item.tags.some((t) => t.includes(search))) return false;
    return true;
  }), [styleFilter, typeFilter, search]);
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImporting(true); setImportProgress({ current: 0, total: files.length });
    try {
      const images = await processFolderFiles(files, { generateThumbnails: true, onProgress: (c, t) => setImportProgress({ current: c, total: t }) });
      if (images.length === 0) { toast.error('未找到图片文件'); return; }
      const stored: StoredGalleryItem[] = images.map((img) => ({ id: img.id, name: img.name, folder: img.folder, thumbnail: img.thumbnail || img.url, addedAt: Date.now(), tags: classifyByFolderName(img.folder) }));
      const { success, failed } = saveGalleryBatch(stored);
      setUserItems(loadUserGallery());
      if (failed > 0) toast.warning(`导入 ${success} 张，${failed} 张因存储空间不足失败`);
      else toast.success(`成功导入 ${success} 张图片`);
    } catch { toast.error('导入失败'); } finally { setImporting(false); setImportProgress({ current: 0, total: 0 }); }
  };
  const handleDeleteUserItem = (id: string) => { deleteUserGalleryItem(id); setUserItems(loadUserGallery()); toast.success('已删除'); };
  const userFolders = useMemo(() => Array.from(new Set(userItems.map((i) => i.folder))), [userItems]);
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold">客片展示厅</h1><p className="text-muted-foreground">浏览作品集，或导入自己的文件夹</p></div>
      <div className="mb-6 flex flex-wrap gap-3">
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <input ref={folderInputRef} type="file" /* @ts-expect-error webkitdirectory */ webkitdirectory="" directory="" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <Button onClick={() => fileInputRef.current?.click()} disabled={importing}><Upload className="mr-2 h-4 w-4" /> 选择图片</Button>
        <Button variant="outline" onClick={() => folderInputRef.current?.click()} disabled={importing}><FolderOpen className="mr-2 h-4 w-4" /> 导入文件夹</Button>
        {importing && <div className="flex items-center gap-2 text-sm text-muted-foreground">正在导入 {importProgress.current}/{importProgress.total}...</div>}
      </div>
      {userItems.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">我的导入 ({userItems.length})</h2>
          {userFolders.map((folder) => (
            <div key={folder} className="mb-6">
              <div className="mb-2 flex items-center gap-2"><FolderOpen className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{folder}</span><Badge variant="secondary">{userItems.filter((i) => i.folder === folder).length}</Badge></div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {userItems.filter((i) => i.folder === folder).map((item) => (
                  <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                    <img src={item.thumbnail} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                    <button onClick={() => handleDeleteUserItem(item.id)} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"><Trash2 className="h-3 w-3" /></button>
                    {item.tags && item.tags.length > 0 && <div className="absolute bottom-1 left-1 flex flex-wrap gap-0.5">{item.tags.slice(0, 1).map((tag) => <span key={tag} className="rounded bg-black/60 px-1 text-[10px] text-white">{tag}</span>)}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">{STYLE_TAGS.map((tag) => <Button key={tag} variant={styleFilter === tag ? 'default' : 'outline'} size="sm" onClick={() => setStyleFilter(tag)}>{tag}</Button>)}</div>
        <div className="flex flex-wrap items-center gap-3">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">{SHOOT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
          <div className="relative flex-1 max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索客片..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
        </div>
      </div>
      {filteredGallery.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground"><ImageIcon className="mb-3 h-12 w-12" /><p>没有找到匹配的客片</p></div>
      ) : (
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {filteredGallery.map((item) => (
            <div key={item.id} className="group relative mb-3 cursor-pointer break-inside-avoid overflow-hidden rounded-lg bg-muted" onClick={() => setLightbox(item)}>
              <img src={item.url} alt={item.title} loading="lazy" className="w-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 transition-opacity group-hover:opacity-100"><div className="text-sm font-medium">{item.title}</div><div className="text-xs text-white/80">{item.style} · {item.location}</div></div>
              <Badge className="absolute left-2 top-2 bg-black/50 text-white hover:bg-black/50">{item.style}</Badge>
            </div>
          ))}
        </div>
      )}
      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>{lightbox?.title}</DialogTitle></DialogHeader>
          {lightbox && (
            <div>
              <img src={lightbox.url} alt={lightbox.title} className="w-full rounded-lg" />
              <div className="mt-3 space-y-2 text-sm">
                <p><span className="text-muted-foreground">风格：</span>{lightbox.style}</p>
                <p><span className="text-muted-foreground">地点：</span>{lightbox.location}</p>
                <p><span className="text-muted-foreground">描述：</span>{lightbox.description}</p>
                <div className="flex flex-wrap gap-1">{lightbox.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
