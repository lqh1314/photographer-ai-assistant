import { Link } from 'react-router-dom';
import {
  Sparkles, Wand2, Image, MessageSquare, Calendar, ClipboardList,
  Camera, ArrowRight, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PACKAGES, type Package } from '@/data/packages';
import { MOCK_GALLERY } from '@/data/gallery';
import { useLocalStorage } from '@/lib/storage';
const features = [
  { icon: Sparkles, title: 'AI 智能选片', desc: '自动检测清晰度、曝光、构图，四级分类推荐，连拍去重', to: '/select', color: 'bg-blue-500' },
  { icon: Wand2, title: 'AI 修图工坊', desc: '一键增强、智能美颜、场景识别、去雾降噪，12种富士滤镜', to: '/edit', color: 'bg-purple-500' },
  { icon: Image, title: '客片展示厅', desc: '瀑布流作品集，支持文件夹批量导入，风格筛选', to: '/gallery', color: 'bg-pink-500' },
  { icon: MessageSquare, title: '在线咨询', desc: '智能客服解答套餐、价格、流程问题', to: '/chat', color: 'bg-green-500' },
  { icon: Calendar, title: '预约档期', desc: '在线查看档期、选择时段、锁定预约', to: '/booking', color: 'bg-orange-500' },
  { icon: ClipboardList, title: '拍摄方案', desc: '30种风格方案，含服装道具、时间流程、拍摄建议', to: '/plan', color: 'bg-cyan-500' },
];
export default function HomePage() {
  const [packages] = useLocalStorage<Package[]>('app_packages', PACKAGES);
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-20 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #a855f7 0%, transparent 50%)' }} />
        <div className="relative mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-white/10 text-white hover:bg-white/20">
            <Camera className="mr-1 h-3 w-3" /> 摄影师专属 AI 助手
          </Badge>
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
            光影助手
          </h1>
          <p className="mb-8 text-lg text-slate-300 md:text-xl">
            AI 智能选片 · 富士胶片模拟 · 智能修图 · 客户管理 · 档期预约
            <br className="hidden md:block" />
            让摄影师专注拍摄，重复事务交给 AI
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/select">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-4 w-4" /> 开始 AI 选片
              </Button>
            </Link>
            <Link to="/edit">
              <Button size="lg" variant="outline" className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Wand2 className="h-4 w-4" /> AI 修图工坊
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-2 text-center text-2xl font-bold">核心功能</h2>
        <p className="mb-10 text-center text-muted-foreground">从选片到交付，全流程 AI 赋能</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link key={f.to} to={f.to}>
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5">
                <CardContent className="p-6">
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${f.color} text-white`}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1 font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      {/* Gallery preview */}
      <section className="bg-muted/30 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">精选客片</h2>
              <p className="text-muted-foreground">多种风格，总有一款适合你</p>
            </div>
            <Link to="/gallery">
              <Button variant="ghost" className="gap-1">
                查看全部 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {MOCK_GALLERY.slice(0, 8).map((item) => (
              <Link key={item.id} to="/gallery" className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                <img
                  src={item.url}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="text-xs text-white/80">{item.style}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* Packages */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-2 text-center text-2xl font-bold">热门套餐</h2>
        <p className="mb-10 text-center text-muted-foreground">透明定价，无隐形消费</p>
        <div className="grid gap-4 md:grid-cols-3">
          {packages.slice(0, 3).map((pkg) => (
            <Card key={pkg.id} className={`relative ${pkg.popular ? 'border-primary shadow-lg' : ''}`}>
              {pkg.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <Star className="mr-1 h-3 w-3" /> 热门
                </Badge>
              )}
              <CardContent className="p-6">
                <h3 className="mb-1 text-lg font-semibold">{pkg.name}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{pkg.description}</p>
                <div className="mb-4">
                  <span className="text-3xl font-bold">¥{pkg.price}</span>
                  {pkg.originalPrice && (
                    <span className="ml-2 text-sm text-muted-foreground line-through">¥{pkg.originalPrice}</span>
                  )}
                </div>
                <ul className="mb-6 space-y-1.5 text-sm text-muted-foreground">
                  <li>拍摄时长：{pkg.duration}</li>
                  <li>精修 {pkg.retouchedCount} 张 / 原片 {pkg.originalCount}</li>
                  <li>{pkg.locations} 个场景 / {pkg.outfits} 套服装</li>
                </ul>
                <Link to="/booking">
                  <Button className="w-full">立即预约</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        <p>光影助手 · 摄影师专属 AI 智能助手</p>
        <p className="mt-1">AI 选片 · 智能修图 · 富士滤镜 · 客户管理 · 档期预约</p>
      </footer>
    </div>
  );
}
