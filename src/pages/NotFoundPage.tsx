import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <Camera className="mb-4 h-16 w-16 text-muted-foreground" />
      <h1 className="mb-2 text-4xl font-bold">404</h1>
      <p className="mb-6 text-muted-foreground">页面未找到</p>
      <Link to="/"><Button>返回首页</Button></Link>
    </div>
  );
}
