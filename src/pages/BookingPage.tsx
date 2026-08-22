import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { MOCK_BOOKINGS, TIME_SLOTS, BOOKING_STATUS_MAP, PREPARATION_CHECKLIST, type Booking, type BookingStatus } from '@/data/bookings';
import { PACKAGES, PACKAGE_SHOOT_TYPES } from '@/data/packages';
import { useRole } from '@/contexts/RoleContext';
import { generateId } from '@/lib/utils';
export default function BookingPage() {
  const { isPhotographer } = useRole();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 7, 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [showForm, setShowForm] = useState(false);
  const [showChecklist, setShowChecklist] = useState<Booking | null>(null);
  const [form, setForm] = useState({ customerName: '', phone: '', shootType: '', packageId: '', location: '', notes: '' });
  const year = currentMonth.getFullYear(); const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const bookedDates = useMemo(() => { const map = new Map<string, Booking[]>(); bookings.forEach((b) => { const arr = map.get(b.date) || []; arr.push(b); map.set(b.date, arr); }); return map; }, [bookings]);
  const calendarDays = useMemo(() => { const days: (number | null)[] = []; for (let i = 0; i < firstDay; i++) days.push(null); for (let d = 1; d <= daysInMonth; d++) days.push(d); return days; }, [firstDay, daysInMonth]);
  const formatDate = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const isDateBooked = (dateStr: string) => (bookedDates.get(dateStr) || []).length >= TIME_SLOTS.length;
  const getBookedSlots = (dateStr: string) => (bookedDates.get(dateStr) || []).map((b) => b.timeSlot);
  const handleDateClick = (d: number) => { const dateStr = formatDate(d); if (isDateBooked(dateStr)) { toast.error('该日期已约满'); return; } setSelectedDate(dateStr); setSelectedSlot(null); setShowForm(false); };
  const handleSlotClick = (slot: string) => { setSelectedSlot(slot); setShowForm(true); };
  const submitBooking = () => {
    if (!form.customerName || !form.phone || !form.shootType) { toast.error('请填写姓名、电话和拍摄类型'); return; }
    const pkg = PACKAGES.find((p) => p.id === form.packageId);
    setBookings((prev) => [...prev, { id: generateId(), customerName: form.customerName, phone: form.phone, shootType: form.shootType, packageId: form.packageId, packageName: pkg?.name, date: selectedDate!, timeSlot: selectedSlot!, location: form.location || '待定', status: 'pending', price: pkg?.price, notes: form.notes, createdAt: new Date().toISOString().slice(0, 10) }]);
    toast.success('预约提交成功！我们会尽快与您确认');
    setShowForm(false); setForm({ customerName: '', phone: '', shootType: '', packageId: '', location: '', notes: '' }); setSelectedDate(null); setSelectedSlot(null);
  };
  const updateStatus = (id: string, status: BookingStatus) => { setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b))); toast.success('状态已更新'); };
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold">{isPhotographer ? '档期管理' : '预约档期'}</h1><p className="text-muted-foreground">{isPhotographer ? '查看和管理所有预约' : '选择日期和时段，在线预约拍摄'}</p></div>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2"><CalIcon className="h-5 w-5" />{year}年{month + 1}月</CardTitle><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}><ChevronRight className="h-4 w-4" /></Button></div></div></CardHeader>
          <CardContent>
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">{['日', '一', '二', '三', '四', '五', '六'].map((d) => <div key={d} className="py-1">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((d, i) => {
                if (d === null) return <div key={i} />;
                const dateStr = formatDate(d); const full = isDateBooked(dateStr); const dayBookings = bookedDates.get(dateStr) || [];
                const isSelected = selectedDate === dateStr; const isToday = dateStr === '2026-08-22';
                return (<button key={i} onClick={() => handleDateClick(d)} className={`relative aspect-square rounded-lg border p-1 text-sm transition-colors ${isSelected ? 'border-primary bg-primary text-primary-foreground' : full ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed' : 'hover:border-primary hover:bg-accent'} ${isToday && !isSelected ? 'border-blue-400' : ''}`}>{d}{dayBookings.length > 0 && !full && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-orange-500" />}{full && <span className="absolute bottom-0.5 right-0.5 text-[8px]">满</span>}</button>);
              })}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400" /> 今天</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> 有预约</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-300" /> 已约满</span></div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          {selectedDate && !showForm && (
            <Card><CardHeader><CardTitle className="text-base">{selectedDate} 可选时段</CardTitle><CardDescription>选择您方便的时段</CardDescription></CardHeader><CardContent className="space-y-2">{TIME_SLOTS.map((slot) => { const booked = getBookedSlots(selectedDate).includes(slot); return (<button key={slot} disabled={booked} onClick={() => handleSlotClick(slot)} className={`flex w-full items-center justify-between rounded-lg border p-3 text-sm transition-colors ${booked ? 'cursor-not-allowed border-red-200 bg-red-50 text-red-400' : 'hover:border-primary hover:bg-accent'}`}><span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {slot}</span>{booked ? <span>已被预约</span> : <ChevronRight className="h-4 w-4" />}</button>); })}</CardContent></Card>
          )}
          {showForm && (
            <Card><CardHeader><CardTitle className="text-base">填写预约信息</CardTitle><CardDescription>{selectedDate} {selectedSlot}</CardDescription></CardHeader><CardContent className="space-y-3">
              <div><Label>姓名 *</Label><Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="您的姓名" /></div>
              <div><Label>电话 *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="联系电话" /></div>
              <div><Label>拍摄类型 *</Label><Select value={form.shootType} onValueChange={(v) => setForm({ ...form, shootType: v })}><SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger><SelectContent>{PACKAGE_SHOOT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>选择套餐</Label><Select value={form.packageId} onValueChange={(v) => setForm({ ...form, packageId: v })}><SelectTrigger><SelectValue placeholder="选择套餐（可选）" /></SelectTrigger><SelectContent>{PACKAGES.filter((p) => !form.shootType || p.type === form.shootType).map((p) => <SelectItem key={p.id} value={p.id}>{p.name} - ¥{p.price}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>拍摄地点</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="期望拍摄地点" /></div>
              <div><Label>备注</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="特殊需求或风格偏好" rows={2} /></div>
              <div className="flex gap-2"><Button className="flex-1" onClick={submitBooking}>提交预约</Button><Button variant="outline" onClick={() => setShowForm(false)}>返回</Button></div>
            </CardContent></Card>
          )}
          {!selectedDate && (<Card><CardContent className="p-6 text-center text-muted-foreground"><CalIcon className="mx-auto mb-2 h-8 w-8" /><p className="text-sm">请在日历中选择日期</p></CardContent></Card>)}
        </div>
      </div>
      {isPhotographer && (
        <Card className="mt-6"><CardHeader><CardTitle className="text-base">全部预约 ({bookings.length})</CardTitle></CardHeader><CardContent><div className="space-y-2">{bookings.map((b) => (
          <div key={b.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
            <div className="flex-1 min-w-[200px]"><div className="font-medium">{b.customerName}</div><div className="text-xs text-muted-foreground">{b.phone} · {b.packageName || b.shootType}</div></div>
            <div className="text-sm"><div>{b.date}</div><div className="text-xs text-muted-foreground">{b.timeSlot} · {b.location}</div></div>
            <Badge className={BOOKING_STATUS_MAP[b.status].color}>{BOOKING_STATUS_MAP[b.status].label}</Badge>
            <div className="flex gap-1">{b.status === 'pending' && <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, 'confirmed')}><CheckCircle className="h-3 w-3" /> 确认</Button>}{b.status === 'confirmed' && <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, 'completed')}>完成</Button>}<Button size="sm" variant="ghost" onClick={() => setShowChecklist(b)}>准备清单</Button></div>
          </div>
        ))}</div></CardContent></Card>
      )}
      {showChecklist && (
        <Card className="mt-4"><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-base">拍摄准备清单 - {showChecklist.customerName}</CardTitle><Button variant="ghost" size="sm" onClick={() => setShowChecklist(null)}>关闭</Button></div></CardHeader><CardContent><ul className="space-y-2">{(PREPARATION_CHECKLIST[showChecklist.shootType] || PREPARATION_CHECKLIST.portrait).map((item, i) => <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />{item}</li>)}</ul></CardContent></Card>
      )}
    </div>
  );
}
