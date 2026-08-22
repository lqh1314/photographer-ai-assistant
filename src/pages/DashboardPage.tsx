import { useState, useRef, useEffect, useMemo } from 'react';
import { TrendingUp, Users, DollarSign, Calendar, Plus, Trash2, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import * as echarts from 'echarts';
import { MOCK_CUSTOMERS, CUSTOMER_SOURCES, type Customer } from '@/data/customers';
import { MOCK_ORDERS, ORDER_STATUS_MAP, type Order, type OrderStatus } from '@/data/orders';
import { MOCK_FAQS, type FAQ } from '@/data/faqs';
import { CHART_COLORS } from '@/lib/chart-colors';
import { generateId } from '@/lib/utils';
import { useRole } from '@/contexts/RoleContext';

const PLATFORMS = [{ value: 'xiaohongshu', label: '小红书' }, { value: 'wechat', label: '朋友圈' }, { value: 'weibo', label: '微博' }];
const TONES = [{ value: 'warm', label: '温暖治愈' }, { value: 'professional', label: '专业质感' }, { value: 'playful', label: '活泼俏皮' }];
function generateCopy(platform: string, tone: string, topic: string): string {
  const tonePrefix: Record<string, string> = { warm: '✨ 光影流转间，', professional: '用镜头说话，', playful: '📸 咔嚓！' };
  const platformSuffix: Record<string, string> = { xiaohongshu: `\n\n#摄影 #${topic} #约拍 #客片分享 #光影`, wechat: '', weibo: ` #摄影日常# #${topic}#` };
  const bodies: Record<string, string> = {
    warm: `每一张照片都是时光的礼物。${topic}，记录最真实的你。愿这些画面，成为你多年后翻看仍会心动的回忆。`,
    professional: `${topic}——我们追求每一个细节的完美。从光线到构图，从情绪到后期，用专业诠释你的独特气质。`,
    playful: `又一组超美的${topic}出炉啦！被美到说不出话～这样的风格你爱了吗？快来get同款！`,
  };
  return `${tonePrefix[tone]}${bodies[tone]}${platformSuffix[platform]}`;
}
function CopywritingPanel() {
  const [platform, setPlatform] = useState('xiaohongshu');
  const [tone, setTone] = useState('warm');
  const [topic, setTopic] = useState('日系写真');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const handleGenerate = () => { setResult(generateCopy(platform, tone, topic)); toast.success('文案已生成'); };
  const handleCopy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4" /> AI 营销文案生成</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <div><Label>平台</Label><Select value={platform} onValueChange={setPlatform}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PLATFORMS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>风格</Label><Select value={tone} onValueChange={setTone}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TONES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>主题</Label><Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="如：日系写真" /></div>
        </div>
        <Button onClick={handleGenerate}><Sparkles className="mr-1.5 h-4 w-4" /> 生成文案</Button>
        {result && (<div className="relative rounded-lg border bg-muted/30 p-4"><p className="whitespace-pre-wrap pr-8 text-sm">{result}</p><Button size="icon" variant="ghost" className="absolute right-2 top-2" onClick={handleCopy}>{copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}</Button></div>)}
      </CardContent>
    </Card>
  );
}
export default function DashboardPage() {
  const { isPhotographer } = useRole();
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [faqs, setFaqs] = useState<FAQ[]>(MOCK_FAQS);
  const revenueChartRef = useRef<HTMLDivElement>(null);
  const sourceChartRef = useRef<HTMLDivElement>(null);
  const statusChartRef = useRef<HTMLDivElement>(null);
  const kpis = useMemo(() => ({
    totalRevenue: orders.reduce((s, o) => s + o.amount, 0),
    pendingBalance: orders.reduce((s, o) => s + o.balance, 0),
    monthOrders: orders.length,
    activeCustomers: customers.length,
  }), [orders, customers]);
  useEffect(() => {
    if (!revenueChartRef.current || !sourceChartRef.current || !statusChartRef.current) return;
    const revenueChart = echarts.init(revenueChartRef.current);
    revenueChart.setOption({
      tooltip: { trigger: 'axis' }, grid: { left: 50, right: 20, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: ['3月', '4月', '5月', '6月', '7月', '8月'] },
      yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
      series: [{ type: 'line', smooth: true, data: [8600, 12300, 9800, 15600, 18900, 22400], itemStyle: { color: CHART_COLORS[0] }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59,130,246,0.3)' }, { offset: 1, color: 'rgba(59,130,246,0.02)' }]) } }],
    });
    const sourceChart = echarts.init(sourceChartRef.current);
    const sourceCount = customers.reduce<Record<string, number>>((acc, c) => { acc[c.source] = (acc[c.source] || 0) + 1; return acc; }, {});
    sourceChart.setOption({
      tooltip: { trigger: 'item' }, legend: { bottom: 0, textStyle: { fontSize: 11 } },
      series: [{ type: 'pie', radius: ['40%', '70%'], center: ['50%', '45%'], data: Object.entries(sourceCount).map(([name, value], i) => ({ name, value, itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] } })), label: { fontSize: 11 } }],
    });
    const statusChart = echarts.init(statusChartRef.current);
    const statusCount = orders.reduce<Record<string, number>>((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});
    statusChart.setOption({
      tooltip: { trigger: 'axis' }, grid: { left: 80, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'value' }, yAxis: { type: 'category', data: Object.keys(statusCount).map((s) => ORDER_STATUS_MAP[s as OrderStatus].label) },
      series: [{ type: 'bar', data: Object.values(statusCount).map((v, i) => ({ value: v, itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] } })), barWidth: 20 }],
    });
    const handleResize = () => { revenueChart.resize(); sourceChart.resize(); statusChart.resize(); };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); revenueChart.dispose(); sourceChart.dispose(); statusChart.dispose(); };
  }, [customers, orders]);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', source: '小红书', tags: '' });
  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) { toast.error('请填写姓名和电话'); return; }
    setCustomers((prev) => [{ id: generateId(), name: newCustomer.name, phone: newCustomer.phone, source: newCustomer.source, tags: newCustomer.tags.split(/[,，]/).filter(Boolean), totalSpent: 0, orderCount: 0, lastContact: new Date().toISOString().slice(0, 10) }, ...prev]);
    setNewCustomer({ name: '', phone: '', source: '小红书', tags: '' }); toast.success('客户已添加');
  };
  const deleteCustomer = (id: string) => { setCustomers((prev) => prev.filter((c) => c.id !== id)); toast.success('客户已删除'); };
  const updateOrderStatus = (id: string, status: OrderStatus) => { setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o))); toast.success('订单状态已更新'); };
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: '通用' });
  const addFaq = () => {
    if (!newFaq.question || !newFaq.answer) { toast.error('请填写问题和答案'); return; }
    setFaqs((prev) => [{ id: generateId(), ...newFaq }, ...prev]); setNewFaq({ question: '', answer: '', category: '通用' }); toast.success('FAQ 已添加');
  };
  const deleteFaq = (id: string) => { setFaqs((prev) => prev.filter((f) => f.id !== id)); toast.success('FAQ 已删除'); };
  if (!isPhotographer) {
    return (<div className="flex h-[60vh] items-center justify-center"><Card className="p-8 text-center"><p className="text-lg font-medium">摄影师工作台</p><p className="mt-2 text-sm text-muted-foreground">请在右上角切换到「摄影师」身份查看</p></Card></div>);
  }
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div><h1 className="text-2xl font-bold">摄影师工作台</h1><p className="text-muted-foreground">业务数据概览与管理</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4 p-5"><div className="rounded-lg bg-blue-100 p-3"><DollarSign className="h-5 w-5 text-blue-600" /></div><div><p className="text-xs text-muted-foreground">总营收</p><p className="text-xl font-bold">¥{kpis.totalRevenue.toLocaleString()}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><div className="rounded-lg bg-orange-100 p-3"><TrendingUp className="h-5 w-5 text-orange-600" /></div><div><p className="text-xs text-muted-foreground">待收尾款</p><p className="text-xl font-bold">¥{kpis.pendingBalance.toLocaleString()}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><div className="rounded-lg bg-green-100 p-3"><Calendar className="h-5 w-5 text-green-600" /></div><div><p className="text-xs text-muted-foreground">订单数</p><p className="text-xl font-bold">{kpis.monthOrders}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><div className="rounded-lg bg-purple-100 p-3"><Users className="h-5 w-5 text-purple-600" /></div><div><p className="text-xs text-muted-foreground">客户数</p><p className="text-xl font-bold">{kpis.activeCustomers}</p></div></CardContent></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardHeader><CardTitle className="text-base">营收趋势</CardTitle></CardHeader><CardContent><div ref={revenueChartRef} style={{ height: 280 }} /></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">客户来源</CardTitle></CardHeader><CardContent><div ref={sourceChartRef} style={{ height: 280 }} /></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">订单状态分布</CardTitle></CardHeader><CardContent><div ref={statusChartRef} style={{ height: 200 }} /></CardContent></Card>
      <CopywritingPanel />
      <Tabs defaultValue="orders">
        <TabsList><TabsTrigger value="orders">订单管理</TabsTrigger><TabsTrigger value="customers">客户管理</TabsTrigger><TabsTrigger value="faqs">FAQ 管理</TabsTrigger></TabsList>
        <TabsContent value="orders" className="mt-4">
          <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground"><tr><th className="p-3">订单号</th><th className="p-3">客户</th><th className="p-3">套餐</th><th className="p-3">金额</th><th className="p-3">拍摄日期</th><th className="p-3">状态</th><th className="p-3">操作</th></tr></thead>
            <tbody>{orders.map((o) => (<tr key={o.id} className="border-b last:border-0"><td className="p-3 font-mono text-xs">{o.id}</td><td className="p-3">{o.customerName}</td><td className="p-3">{o.packageName}</td><td className="p-3">¥{o.amount}</td><td className="p-3">{o.shootDate}</td><td className="p-3"><Badge className={ORDER_STATUS_MAP[o.status].color}>{ORDER_STATUS_MAP[o.status].label}</Badge></td><td className="p-3"><Select value={o.status} onValueChange={(v) => updateOrderStatus(o.id, v as OrderStatus)}><SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(ORDER_STATUS_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></td></tr>))}</tbody>
          </table></div></CardContent></Card>
        </TabsContent>
        <TabsContent value="customers" className="mt-4 space-y-4">
          <Card><CardHeader><CardTitle className="text-base">添加客户</CardTitle></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-5">
            <Input placeholder="姓名" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} />
            <Input placeholder="电话" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
            <Select value={newCustomer.source} onValueChange={(v) => setNewCustomer({ ...newCustomer, source: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CUSTOMER_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            <Input placeholder="标签（逗号分隔）" value={newCustomer.tags} onChange={(e) => setNewCustomer({ ...newCustomer, tags: e.target.value })} />
            <Button onClick={addCustomer}><Plus className="mr-1 h-4 w-4" /> 添加</Button>
          </div></CardContent></Card>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{customers.map((c) => (
            <Card key={c.id}><CardContent className="p-4">
              <div className="flex items-start justify-between"><div><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.phone}</p></div><Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => deleteCustomer(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div>
              <div className="mt-2 flex flex-wrap gap-1"><Badge variant="outline" className="text-[10px]">{c.source}</Badge>{c.tags.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}</div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>消费 ¥{c.totalSpent}</span><span>{c.orderCount} 单</span></div>
              {c.notes && <p className="mt-2 text-xs text-muted-foreground">{c.notes}</p>}
            </CardContent></Card>
          ))}</div>
        </TabsContent>
        <TabsContent value="faqs" className="mt-4 space-y-4">
          <Card><CardHeader><CardTitle className="text-base">添加 FAQ</CardTitle></CardHeader><CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3"><Input placeholder="分类" value={newFaq.category} onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })} /><Input placeholder="问题" value={newFaq.question} onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })} className="sm:col-span-2" /></div>
            <Textarea placeholder="答案" value={newFaq.answer} onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })} rows={2} />
            <Button onClick={addFaq}><Plus className="mr-1 h-4 w-4" /> 添加</Button>
          </CardContent></Card>
          <div className="space-y-2">{faqs.map((f) => (
            <Card key={f.id}><CardContent className="flex items-start justify-between gap-3 p-4"><div><div className="flex items-center gap-2"><Badge variant="outline" className="text-[10px]">{f.category}</Badge><p className="text-sm font-medium">{f.question}</p></div><p className="mt-1 text-xs text-muted-foreground">{f.answer}</p></div><Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-red-500" onClick={() => deleteFaq(f.id)}><Trash2 className="h-3.5 w-3.5" /></Button></CardContent></Card>
          ))}</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
