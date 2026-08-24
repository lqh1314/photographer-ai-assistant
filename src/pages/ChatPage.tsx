import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PACKAGES, type Package } from '@/data/packages';
import { MOCK_FAQS } from '@/data/faqs';
import { useLocalStorage } from '@/lib/storage';
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
const QUICK_QUESTIONS = [
  '套餐价格是多少？',
  '怎么预约拍摄？',
  '精修需要多久？',
  '可以改期吗？',
  '有哪些风格？',
  '加片怎么收费？',
];
function generateReply(input: string, packages: Package[]): string {
  const text = input.toLowerCase();
  // 套餐价格
  if (text.includes('价格') || text.includes('多少钱') || text.includes('套餐') || text.includes('收费')) {
    const pkgList = packages.map(
      (p) => `• ${p.name}：¥${p.price}（${p.duration}，精修${p.retouchedCount}张，${p.outfits}套服装）`
    ).join('\n');
    return `我们目前有以下套餐：\n\n${pkgList}\n\n具体可以根据您的需求定制，请问您想拍什么类型呢？`;
  }
  // 预约
  if (text.includes('预约') || text.includes('订') || text.includes('档期') || text.includes('什么时候')) {
    return '预约很简单！您可以点击左侧「预约档期」页面，选择日期和时段，支付定金后即可锁定档期。\n\n定金为套餐总价的30%-50%，拍摄前7天以上可免费改期一次。请问您大概想什么时候拍呢？';
  }
  // 精修
  if (text.includes('精修') || text.includes('修图') || text.includes('多久') || text.includes('周期')) {
    return '拍摄后3-5个工作日交付原片，选片确认后15-20个工作日完成精修。\n\n精修包含调色、磨皮、瘦身、穿帮修复等。加急服务可缩短至7个工作日（需额外付费）。您也可以使用我们的 AI 修图工坊自行体验富士胶片滤镜效果！';
  }
  // 改期/取消
  if (text.includes('改期') || text.includes('取消') || text.includes('退')) {
    return '改期政策如下：\n• 拍摄前7天以上：免费改期一次\n• 3-7天内：收取20%手续费\n• 3天内：定金不退\n• 因天气等不可抗力：可免费改期\n\n请问您需要改期吗？';
  }
  // 风格
  if (text.includes('风格') || text.includes('日系') || text.includes('复古') || text.includes('电影') || text.includes('韩式')) {
    return '我们擅长多种风格：清新日系、复古胶片、情绪光影、韩式简约、新中式、电影感等。\n\n您可以在「客片展示」页面浏览不同风格的作品，也可以告诉我您喜欢的感觉，我帮您推荐！';
  }
  // 加片
  if (text.includes('加片') || text.includes('加修') || text.includes('多修')) {
    return '超出套餐精修张数按 80元/张 收费，加片满20张享8折优惠。加片在选片时一并确认即可。';
  }
  // 选片
  if (text.includes('选片')) {
    return '我们提供 AI 智能选片功能！上传原片后，AI 会自动检测清晰度、曝光、构图，按「精修主推/套系保底/备选/建议淘汰」四级分类，还能自动识别连拍重复。选片时限为收到原片后7天内。';
  }
  // 服装
  if (text.includes('服装') || text.includes('衣服') || text.includes('穿什么')) {
    return '套餐包含的服装由工作室提供，也可以自带。建议自带1-2套日常服装更自然。拍摄前我们会发送详细的准备清单，包括服装配色建议、护肤提醒等。';
  }
  // 交付
  if (text.includes('交付') || text.includes('拿照片') || text.includes('底片') || text.includes('原片')) {
    return '精修片通过网盘交付，保留90天，请及时下载备份。原片全送（套餐标注数量以上）。套餐包含的相册/画框等实物在精修确认后15个工作日内寄出。';
  }
  // 你好
  if (text.includes('你好') || text.includes('hi') || text.includes('hello') || text.includes('在吗')) {
    return '你好呀！我是光影助手 📷 很高兴为您服务！\n\n我可以帮您了解套餐价格、查看客片、预约档期、解答拍摄疑问。请问有什么可以帮您的？';
  }
  // 默认回复
  return '感谢您的咨询！这个问题我帮您记录下来，会尽快让摄影师本人回复您。\n\n您也可以先看看我们的客片作品或套餐介绍，或者告诉我您想拍什么类型、什么风格，我来为您推荐～';
}
export default function ChatPage() {
  const [packages] = useLocalStorage<Package[]>('app_packages', PACKAGES);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好呀！我是光影助手 📷 我可以帮您了解套餐、查看客片、预约档期、解答拍摄疑问。请问有什么可以帮您的？',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);
  const send = (text?: string) => {
    const content = (text || input).trim();
    if (!content) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    // 模拟流式回复延迟
    setTimeout(() => {
      const reply = generateReply(content, packages);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  };
  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-4xl flex-col p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">在线咨询</h1>
        <p className="text-muted-foreground">智能客服为您解答拍摄相关问题</p>
      </div>
      {/* Quick questions */}
      <div className="mb-3 flex flex-wrap gap-2">
        {QUICK_QUESTIONS.map((q) => (
          <Button key={q} variant="outline" size="sm" onClick={() => send(q)}>
            {q}
          </Button>
        ))}
      </div>
      {/* Messages */}
      <Card className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="space-y-4 p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl bg-muted px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
      {/* Input */}
      <div className="mt-3 flex gap-2">
        <Input
          placeholder="输入您的问题..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <Button onClick={() => send()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
