import { useState, useMemo } from 'react';
import {
  MapPin, Clock, Shirt, Package as PkgIcon, Lightbulb, Palette,
  Save, FileText, Sparkles, Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  PLAN_TEMPLATES, SHOOT_TYPES, STYLE_OPTIONS,
  type ShootPlan,
} from '@/data/shootPlans';
import { PACKAGES, type Package } from '@/data/packages';
import { useLocalStorage } from '@/lib/storage';
import { generateId } from '@/lib/utils';

interface Option { value: string; label: string; }

/** 为没有模板的自定义组合生成基础方案 */
function generateFallbackPlan(shootType: string, styleLabel: string, typeLabel: string): ShootPlan {
  return {
    id: '',
    title: `${typeLabel} · ${styleLabel}`,
    shootType,
    style: styleLabel,
    location: '根据风格推荐：城市特色街区 / 自然公园 / 专业影棚（可与摄影师沟通定制）',
    bestTime: '建议黄金时段：日出后1小时或日落前1.5小时',
    outfits: ['根据风格准备2-3套服装', '主色系统一，避免大logo', '可带配饰增加层次感'],
    props: ['与风格匹配的道具', '鲜花/气球等氛围道具', '个人纪念物增加故事感'],
    schedule: [
      { time: '09:00', activity: '化妆造型' },
      { time: '10:30', activity: '第一场景拍摄' },
      { time: '12:00', activity: '午餐休息' },
      { time: '13:30', activity: '第二场景拍摄' },
      { time: '16:00', activity: '黄金时段外景' },
      { time: '18:00', activity: '拍摄结束，确认收工' },
    ],
    tips: [
      '拍摄前一晚保证充足睡眠，睡前少喝水避免水肿',
      '提前与摄影师沟通参考图和喜欢的色调',
      '保持放松，自然的情绪最出片',
      '可准备一首喜欢的音乐帮助进入状态',
    ],
    colorPalette: ['#f5e6d3', '#d4a574', '#8b7355', '#4a3728', '#e8ddd0'],
  };
}

export default function ShootPlanPage() {
  const [customTypes] = useLocalStorage<Option[]>('app_shoot_types', []);
  const [customStyles] = useLocalStorage<Option[]>('app_styles', []);
  const [customPackages] = useLocalStorage<Package[]>('app_packages', PACKAGES);

  const allTypes = useMemo(() => [...SHOOT_TYPES, ...customTypes], [customTypes]);
  const allStyles = useMemo(() => [...STYLE_OPTIONS, ...customStyles], [customStyles]);

  const [shootType, setShootType] = useState('');
  const [style, setStyle] = useState('');
  const [plan, setPlan] = useState<ShootPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<ShootPlan[]>([]);

  const typeLabel = allTypes.find((t) => t.value === shootType)?.label || '';

  const availableStyles = shootType
    ? Object.keys(PLAN_TEMPLATES[shootType] || {}).length > 0
      ? Object.keys(PLAN_TEMPLATES[shootType])
      : allStyles.map((s) => s.value)
    : [];

  /** 推荐套餐：优先匹配拍摄类型，取最便宜的 */
  const recommendedPackage = useMemo(() => {
    if (!shootType) return null;
    const matched = customPackages
      .filter((p) => p.type === shootType)
      .sort((a, b) => a.price - b.price);
    return matched[0] || null;
  }, [shootType, customPackages]);

  const generate = () => {
    if (!shootType || !style) {
      toast.error('请选择拍摄类型和风格');
      return;
    }
    const sLabel = allStyles.find((s) => s.value === style)?.label || '';
    const tLabel = allTypes.find((t) => t.value === shootType)?.label || '';
    const template = PLAN_TEMPLATES[shootType]?.[style];
    const result = template
      ? { ...template, id: generateId() }
      : { ...generateFallbackPlan(shootType, sLabel, tLabel), id: generateId() };
    setPlan(result);
    toast.success(template ? '方案已生成' : '已为自定义组合生成基础方案');
  };

  const savePlan = () => {
    if (!plan) return;
    setSavedPlans((prev) => [plan, ...prev]);
    toast.success('方案已保存');
  };

  const exportPlan = () => {
    if (!plan) return;
    const text = [
      plan.title,
      '='.repeat(40),
      `拍摄类型：${typeLabel}`,
      `风格：${plan.style}`,
      `推荐地点：${plan.location}`,
      `最佳时段：${plan.bestTime}`,
      '',
      '【服装建议】',
      ...plan.outfits.map((o, i) => `${i + 1}. ${o}`),
      '',
      '【道具清单】',
      ...plan.props.map((p, i) => `${i + 1}. ${p}`),
      '',
      '【当日流程】',
      ...plan.schedule.map((s) => `${s.time}  ${s.activity}`),
      '',
      '【拍摄要点】',
      ...plan.tips.map((t, i) => `${i + 1}. ${t}`),
    ].join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('方案已导出');
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">生成拍摄方案</h1>
        <p className="text-muted-foreground">选择拍摄类型和风格偏好</p>
      </div>

      {/* Generator */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>拍摄类型</Label>
              <Select value={shootType} onValueChange={(v) => { setShootType(v); setStyle(''); setPlan(null); }}>
                <SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger>
                <SelectContent>
                  {allTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>风格偏好</Label>
              <Select value={style} onValueChange={(v) => { setStyle(v); setPlan(null); }} disabled={!shootType}>
                <SelectTrigger><SelectValue placeholder={shootType ? '选择风格' : '先选类型'} /></SelectTrigger>
                <SelectContent>
                  {availableStyles.map((sv) => {
                    const opt = allStyles.find((s) => s.value === sv);
                    return <SelectItem key={sv} value={sv}>{opt?.label || sv}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={generate} disabled={!shootType || !style}>
                <Sparkles className="mr-1.5 h-4 w-4" /> 生成方案
              </Button>
            </div>
          </div>

          {/* Recommended package */}
          {shootType && recommendedPackage && (
            <div className="mt-4 flex items-center justify-between rounded-lg border bg-muted/30 p-4">
              <div>
                <div className="text-xs text-muted-foreground">推荐套餐：{typeLabel}·{recommendedPackage.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {recommendedPackage.retouchedCount}张精修 · {recommendedPackage.duration}拍摄
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-primary">¥{recommendedPackage.price}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan result */}
      {plan && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{plan.title}</CardTitle>
                  <div className="mt-2 flex gap-2">
                    <Badge>{typeLabel}</Badge>
                    <Badge variant="outline">{plan.style}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={savePlan}>
                    <Save className="mr-1.5 h-3.5 w-3.5" /> 保存
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportPlan}>
                    <Download className="mr-1.5 h-3.5 w-3.5" /> 导出
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">推荐地点</div>
                    <div className="text-sm font-medium">{plan.location}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">最佳时段</div>
                    <div className="text-sm font-medium">{plan.bestTime}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Shirt className="h-4 w-4" /> 服装建议
                </h3>
                <div className="flex flex-wrap gap-2">
                  {plan.outfits.map((o, i) => (
                    <Badge key={i} variant="secondary" className="py-1.5">{o}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <PkgIcon className="h-4 w-4" /> 道具清单
                </h3>
                <div className="flex flex-wrap gap-2">
                  {plan.props.map((p, i) => (
                    <Badge key={i} variant="outline" className="py-1.5">{p}</Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4" /> 当日流程
                </h3>
                <div className="space-y-2">
                  {plan.schedule.map((s, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className="w-14 shrink-0 font-mono text-primary">{s.time}</span>
                      <span className="text-muted-foreground">{s.activity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Lightbulb className="h-4 w-4" /> 拍摄要点
                </h3>
                <ul className="space-y-1.5">
                  {plan.tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Palette className="h-4 w-4" /> 配色参考
                </h3>
                <div className="flex gap-2">
                  {plan.colorPalette.map((c, i) => (
                    <div key={i} className="text-center">
                      <div className="h-10 w-10 rounded-lg border" style={{ backgroundColor: c }} />
                      <span className="text-[10px] text-muted-foreground">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {savedPlans.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">已保存方案 ({savedPlans.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedPlans.map((p) => (
                <div
                  key={p.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-accent"
                  onClick={() => setPlan(p)}
                >
                  <div>
                    <div className="text-sm font-medium">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{p.location} · {p.bestTime}</div>
                  </div>
                  <Badge variant="outline">{p.style}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
