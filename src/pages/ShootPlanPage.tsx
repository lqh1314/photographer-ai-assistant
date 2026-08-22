import { useState } from 'react';
import { MapPin, Clock, Shirt, Package, Lightbulb, Palette, Save, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { PLAN_TEMPLATES, SHOOT_TYPES, STYLE_OPTIONS, type ShootPlan } from '@/data/shootPlans';
import { generateId } from '@/lib/utils';
export default function ShootPlanPage() {
  const [shootType, setShootType] = useState('');
  const [style, setStyle] = useState('');
  const [plan, setPlan] = useState<ShootPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<ShootPlan[]>([]);
  const availableStyles = shootType ? Object.keys(PLAN_TEMPLATES[shootType] || {}) : [];
  const generate = () => {
    if (!shootType || !style) { toast.error('请选择拍摄类型和风格'); return; }
    const template = PLAN_TEMPLATES[shootType]?.[style];
    if (!template) { toast.error('该类型+风格组合暂无方案，请换一个组合'); return; }
    setPlan({ ...template, id: generateId() }); toast.success('方案已生成');
  };
  const savePlan = () => { if (!plan) return; setSavedPlans((prev) => [plan, ...prev]); toast.success('方案已保存'); };
  const exportPlan = () => {
    if (!plan) return;
    const text = [plan.title, '='.repeat(40), `拍摄类型：${SHOOT_TYPES.find((t) => t.value === plan.shootType)?.label}`, `风格：${plan.style}`, `推荐地点：${plan.location}`, `最佳时段：${plan.bestTime}`, '', '【服装建议】', ...plan.outfits.map((o, i) => `${i + 1}. ${o}`), '', '【道具清单】', ...plan.props.map((p, i) => `${i + 1}. ${p}`), '', '【当日流程】', ...plan.schedule.map((s) => `${s.time}  ${s.activity}`), '', '【拍摄要点】', ...plan.tips.map((t, i) => `${i + 1}. ${t}`)].join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `${plan.title}.txt`; a.click(); URL.revokeObjectURL(url);
    toast.success('方案已导出');
  };
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold">拍摄方案策划</h1><p className="text-muted-foreground">选择拍摄类型和风格，AI 为您生成定制化拍摄方案</p></div>
      <Card className="mb-6"><CardContent className="p-6"><div className="grid gap-4 sm:grid-cols-3">
        <div><Label>拍摄类型</Label><Select value={shootType} onValueChange={(v) => { setShootType(v); setStyle(''); setPlan(null); }}><SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger><SelectContent>{SHOOT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>风格</Label><Select value={style} onValueChange={setStyle} disabled={!shootType}><SelectTrigger><SelectValue placeholder={shootType ? '选择风格' : '先选类型'} /></SelectTrigger><SelectContent>{STYLE_OPTIONS.filter((s) => availableStyles.includes(s.value)).map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
        <div className="flex items-end"><Button className="w-full" onClick={generate} disabled={!shootType || !style}><Sparkles className="mr-1.5 h-4 w-4" /> 生成方案</Button></div>
      </div></CardContent></Card>
      {plan && (
        <div className="space-y-4"><Card><CardHeader><div className="flex items-start justify-between"><div><CardTitle className="text-xl">{plan.title}</CardTitle><div className="mt-2 flex gap-2"><Badge>{SHOOT_TYPES.find((t) => t.value === plan.shootType)?.label}</Badge><Badge variant="outline">{plan.style}</Badge></div></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={savePlan}><Save className="mr-1.5 h-3.5 w-3.5" /> 保存</Button><Button variant="outline" size="sm" onClick={exportPlan}><Download className="mr-1.5 h-3.5 w-3.5" /> 导出</Button></div></div></CardHeader><CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><div className="text-xs text-muted-foreground">推荐地点</div><div className="text-sm font-medium">{plan.location}</div></div></div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"><Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><div className="text-xs text-muted-foreground">最佳时段</div><div className="text-sm font-medium">{plan.bestTime}</div></div></div>
          </div>
          <div><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Shirt className="h-4 w-4" /> 服装建议</h3><div className="flex flex-wrap gap-2">{plan.outfits.map((o, i) => <Badge key={i} variant="secondary" className="py-1.5">{o}</Badge>)}</div></div>
          <div><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Package className="h-4 w-4" /> 道具清单</h3><div className="flex flex-wrap gap-2">{plan.props.map((p, i) => <Badge key={i} variant="outline" className="py-1.5">{p}</Badge>)}</div></div>
          <Separator />
          <div><h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">当日流程</h3><div className="space-y-2">{plan.schedule.map((s, i) => <div key={i} className="flex gap-3 text-sm"><span className="w-14 shrink-0 font-mono text-primary">{s.time}</span><span className="text-muted-foreground">{s.activity}</span></div>)}</div></div>
          <Separator />
          <div><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Lightbulb className="h-4 w-4" /> 拍摄要点</h3><ul className="space-y-1.5">{plan.tips.map((t, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />{t}</li>)}</ul></div>
          <div><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Palette className="h-4 w-4" /> 配色参考</h3><div className="flex gap-2">{plan.colorPalette.map((c, i) => <div key={i} className="text-center"><div className="h-10 w-10 rounded-lg border" style={{ backgroundColor: c }} /><span className="text-[10px] text-muted-foreground">{c}</span></div>)}</div></div>
        </CardContent></Card></div>
      )}
      {savedPlans.length > 0 && (
        <Card className="mt-6"><CardHeader><CardTitle className="text-base">已保存方案 ({savedPlans.length})</CardTitle></CardHeader><CardContent><div className="space-y-2">{savedPlans.map((p) => <div key={p.id} className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-accent" onClick={() => setPlan(p)}><div><div className="text-sm font-medium">{p.title}</div><div className="text-xs text-muted-foreground">{p.location} · {p.bestTime}</div></div><Badge variant="outline">{p.style}</Badge></div>)}</div></CardContent></Card>
      )}
    </div>
  );
}
