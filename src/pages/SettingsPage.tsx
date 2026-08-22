import { useState } from 'react';
import {
  Shield, Package as PackageIcon, Palette, Plus, Trash2, Lock,
  Users, X, Edit3, Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRole } from '@/contexts/RoleContext';
import { ALL_PERMISSIONS, type RoleDef, type Permission } from '@/data/roles';
import { PACKAGES, type Package } from '@/data/packages';
import { SHOOT_TYPES, STYLE_OPTIONS } from '@/data/shootPlans';
import { useLocalStorage } from '@/lib/storage';
import { generateId } from '@/lib/utils';

/* ============ 角色管理 ============ */
function RoleManager() {
  const { roles, currentRole, addRole, updateRole, deleteRole } = useRole();
  const [editing, setEditing] = useState<RoleDef | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<RoleDef, 'id'>>({
    name: '', description: '', password: '', color: 'bg-gray-500',
    permissions: [], isSystem: false,
  });

  const startCreate = () => {
    setForm({ name: '', description: '', password: '', color: 'bg-gray-500', permissions: [], isSystem: false });
    setCreating(true);
  };
  const startEdit = (r: RoleDef) => {
    setEditing(r);
    setForm({ name: r.name, description: r.description, password: r.password, color: r.color, permissions: [...r.permissions] });
  };
  const togglePerm = (p: Permission) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(p) ? f.permissions.filter((x) => x !== p) : [...f.permissions, p],
    }));
  };
  const saveCreate = () => {
    if (!form.name) { toast.error('请填写角色名称'); return; }
    addRole(form);
    setCreating(false);
    toast.success('角色已创建');
  };
  const saveEdit = () => {
    if (!editing) return;
    updateRole(editing.id, form);
    setEditing(null);
    toast.success('角色已更新');
  };
  const grouped = ALL_PERMISSIONS.reduce<Record<string, typeof ALL_PERMISSIONS>>((acc, p) => {
    (acc[p.group] = acc[p.group] || []).push(p);
    return acc;
  }, {});

  const RoleForm = () => (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>角色名称</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="如：客服专员" /></div>
        <div><Label>登录密码</Label><Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="留空则无需密码" /></div>
      </div>
      <div><Label>角色描述</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="角色职责说明" /></div>
      <div>
        <Label>标识颜色</Label>
        <div className="mt-1 flex gap-2">
          {['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-gray-500'].map((c) => (
            <button key={c} className={`h-7 w-7 rounded-full ${c} ring-2 ring-offset-2 ${form.color === c ? 'ring-foreground' : 'ring-transparent'}`} onClick={() => setForm({ ...form, color: c })} />
          ))}
        </div>
      </div>
      <div>
        <Label className="mb-2 block">权限配置</Label>
        <div className="space-y-3">
          {Object.entries(grouped).map(([group, perms]) => (
            <div key={group} className="rounded-lg border p-3">
              <div className="mb-2 text-xs font-semibold text-muted-foreground">{group}</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {perms.map((p) => (
                  <label key={p.key} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Switch checked={form.permissions.includes(p.key)} onCheckedChange={() => togglePerm(p.key)} />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">管理系统角色及其权限，控制不同人员可访问的功能模块</p>
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild><Button onClick={startCreate}><Plus className="mr-1 h-4 w-4" /> 新增角色</Button></DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader><DialogTitle>新增角色</DialogTitle></DialogHeader>
            <RoleForm />
            <DialogFooter><Button variant="outline" onClick={() => setCreating(false)}>取消</Button><Button onClick={saveCreate}>创建</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {roles.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${r.color}`} />
                  <span className="font-medium">{r.name}</span>
                  {r.isSystem && <Badge variant="outline" className="text-[10px]">系统</Badge>}
                  {currentRole.id === r.id && <Badge className="bg-green-500 text-[10px] text-white">当前</Badge>}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(r)}><Edit3 className="h-3.5 w-3.5" /></Button>
                  {!r.isSystem && <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => { deleteRole(r.id); toast.success('角色已删除'); }}><Trash2 className="h-3.5 w-3.5" /></Button>}
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {r.permissions.map((p) => {
                  const perm = ALL_PERMISSIONS.find((x) => x.key === p);
                  return <Badge key={p} variant="secondary" className="text-[10px]">{perm?.label || p}</Badge>;
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>编辑角色：{editing?.name}</DialogTitle></DialogHeader>
          <RoleForm />
          <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>取消</Button><Button onClick={saveEdit}>保存</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============ 套餐管理 ============ */
function PackageManager() {
  const [packages, setPackages] = useLocalStorage<Package[]>('app_packages', PACKAGES);
  const [editing, setEditing] = useState<Package | null>(null);
  const [creating, setCreating] = useState(false);
  const emptyPkg: Omit<Package, 'id'> = {
    name: '', type: 'portrait', price: 0, duration: '', retouchedCount: 0,
    originalCount: '', locations: 1, outfits: 1, features: [], description: '',
    cover: 'https://picsum.photos/seed/pkg/600/400',
  };
  const [form, setForm] = useState<Omit<Package, 'id'>>(emptyPkg);
  const [featureInput, setFeatureInput] = useState('');

  const startCreate = () => { setForm(emptyPkg); setFeatureInput(''); setCreating(true); };
  const startEdit = (p: Package) => {
    const { id: _id, ...rest } = p;
    setForm(rest); setFeatureInput(''); setEditing(p);
  };
  const save = () => {
    if (!form.name || form.price <= 0) { toast.error('请填写套餐名称和有效价格'); return; }
    if (editing) {
      setPackages((prev) => prev.map((p) => (p.id === editing.id ? { ...form, id: editing.id } : p)));
      toast.success('套餐已更新');
    } else {
      setPackages((prev) => [...prev, { ...form, id: generateId() }]);
      toast.success('套餐已添加');
    }
    setCreating(false); setEditing(null);
  };
  const remove = (id: string) => { setPackages((prev) => prev.filter((p) => p.id !== id)); toast.success('套餐已删除'); };
  const addFeature = () => { if (featureInput.trim()) { setForm({ ...form, features: [...form.features, featureInput.trim()] }); setFeatureInput(''); } };

  const PkgForm = () => (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>套餐名称</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>拍摄类型</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{SHOOT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>价格（元）</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
        <div><Label>原价（可选）</Label><Input type="number" value={form.originalPrice || ''} onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) || undefined })} /></div>
        <div><Label>拍摄时长</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="如：4小时" /></div>
        <div><Label>精修张数</Label><Input type="number" value={form.retouchedCount} onChange={(e) => setForm({ ...form, retouchedCount: Number(e.target.value) })} /></div>
        <div><Label>原片数量</Label><Input value={form.originalCount} onChange={(e) => setForm({ ...form, originalCount: e.target.value })} placeholder="如：200张以上" /></div>
        <div><Label>场景数</Label><Input type="number" value={form.locations} onChange={(e) => setForm({ ...form, locations: Number(e.target.value) })} /></div>
        <div><Label>服装套数</Label><Input type="number" value={form.outfits} onChange={(e) => setForm({ ...form, outfits: Number(e.target.value) })} /></div>
        <div><Label>封面图URL</Label><Input value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} /></div>
      </div>
      <div><Label>套餐描述</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
      <div>
        <Label>服务亮点</Label>
        <div className="mt-1 flex gap-2">
          <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="输入亮点后回车添加" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
          <Button type="button" variant="outline" onClick={addFeature}>添加</Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {form.features.map((f, i) => (
            <Badge key={i} variant="secondary" className="gap-1 pr-1">
              {f}
              <button className="ml-1 rounded-full hover:bg-destructive/20" onClick={() => setForm({ ...form, features: form.features.filter((_, idx) => idx !== i) })}><X className="h-3 w-3" /></button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">自定义拍摄套餐，增删改后实时生效，客户在首页和预约时可见</p>
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild><Button onClick={startCreate}><Plus className="mr-1 h-4 w-4" /> 新增套餐</Button></DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader><DialogTitle>新增套餐</DialogTitle></DialogHeader>
            <PkgForm />
            <DialogFooter><Button variant="outline" onClick={() => setCreating(false)}>取消</Button><Button onClick={save}>创建</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((p) => (
          <Card key={p.id}>
            <div className="aspect-[3/2] overflow-hidden rounded-t-lg">
              <img src={p.cover} alt={p.name} className="h-full w-full object-cover" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{p.name}</h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-bold text-primary">¥{p.price}</span>
                    {p.originalPrice && <span className="text-xs text-muted-foreground line-through">¥{p.originalPrice}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(p)}><Edit3 className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-muted-foreground">
                <Badge variant="outline">{p.duration}</Badge>
                <Badge variant="outline">{p.retouchedCount}张精修</Badge>
                <Badge variant="outline">{p.outfits}套服装</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>编辑套餐</DialogTitle></DialogHeader>
          <PkgForm />
          <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>取消</Button><Button onClick={save}>保存</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============ 拍摄类型与风格管理 ============ */
function TypeStyleManager() {
  const [customTypes, setCustomTypes] = useLocalStorage<{ value: string; label: string }[]>('app_shoot_types', []);
  const [customStyles, setCustomStyles] = useLocalStorage<{ value: string; label: string }[]>('app_styles', []);
  const [typeInput, setTypeInput] = useState('');
  const [styleInput, setStyleInput] = useState('');

  const allTypes = [...SHOOT_TYPES, ...customTypes];
  const allStyles = [...STYLE_OPTIONS, ...customStyles];

  const addType = () => {
    const label = typeInput.trim();
    if (!label) return;
    const value = `custom_${Date.now()}`;
    setCustomTypes((prev) => [...prev, { value, label }]);
    setTypeInput('');
    toast.success(`已添加类型：${label}`);
  };
  const addStyle = () => {
    const label = styleInput.trim();
    if (!label) return;
    const value = `custom_${Date.now()}`;
    setCustomStyles((prev) => [...prev, { value, label }]);
    setStyleInput('');
    toast.success(`已添加风格：${label}`);
  };
  const removeType = (value: string) => { setCustomTypes((prev) => prev.filter((t) => t.value !== value)); toast.success('类型已删除'); };
  const removeStyle = (value: string) => { setCustomStyles((prev) => prev.filter((s) => s.value !== value)); toast.success('风格已删除'); };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">自定义拍摄类型和风格偏好，新增后可在拍摄方案页面选择。系统内置项不可删除。</p>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Camera className="h-4 w-4" /> 拍摄类型</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={typeInput} onChange={(e) => setTypeInput(e.target.value)} placeholder="如：宠物摄影、毕业季" onKeyDown={(e) => e.key === 'Enter' && addType()} />
              <Button onClick={addType}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTypes.map((t) => {
                const isCustom = customTypes.some((c) => c.value === t.value);
                return (
                  <Badge key={t.value} variant={isCustom ? 'default' : 'outline'} className="gap-1 py-1.5">
                    {t.label}
                    {isCustom && <button className="ml-0.5 rounded-full hover:bg-destructive/30" onClick={() => removeType(t.value)}><X className="h-3 w-3" /></button>}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Palette className="h-4 w-4" /> 风格偏好</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={styleInput} onChange={(e) => setStyleInput(e.target.value)} placeholder="如：赛博朋克、国潮风" onKeyDown={(e) => e.key === 'Enter' && addStyle()} />
              <Button onClick={addStyle}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allStyles.map((s) => {
                const isCustom = customStyles.some((c) => c.value === s.value);
                return (
                  <Badge key={s.value} variant={isCustom ? 'default' : 'outline'} className="gap-1 py-1.5">
                    {s.label}
                    {isCustom && <button className="ml-0.5 rounded-full hover:bg-destructive/30" onClick={() => removeStyle(s.value)}><X className="h-3 w-3" /></button>}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { currentRole, hasPermission } = useRole();

  if (!hasPermission('settings.manage')) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Card className="p-8 text-center">
          <Lock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-medium">无访问权限</p>
          <p className="mt-1 text-sm text-muted-foreground">当前角色「{currentRole.name}」没有系统设置权限，请联系管理员</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Shield className="h-6 w-6" /> 系统设置</h1>
        <p className="text-muted-foreground">管理角色权限、套餐配置和拍摄选项</p>
      </div>
      <Tabs defaultValue="roles">
        <TabsList>
          <TabsTrigger value="roles" className="gap-1.5"><Users className="h-4 w-4" /> 角色权限</TabsTrigger>
          <TabsTrigger value="packages" className="gap-1.5"><PackageIcon className="h-4 w-4" /> 套餐管理</TabsTrigger>
          <TabsTrigger value="types" className="gap-1.5"><Palette className="h-4 w-4" /> 类型与风格</TabsTrigger>
        </TabsList>
        <TabsContent value="roles" className="mt-4"><RoleManager /></TabsContent>
        <TabsContent value="packages" className="mt-4"><PackageManager /></TabsContent>
        <TabsContent value="types" className="mt-4"><TypeStyleManager /></TabsContent>
      </Tabs>
    </div>
  );
}
