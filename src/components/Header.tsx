import { useState } from 'react';
import { Menu, Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useRole } from '@/contexts/RoleContext';
import { toast } from 'sonner';
interface HeaderProps { onMenuClick: () => void; }
export function Header({ onMenuClick }: HeaderProps) {
  const { isPhotographer, login, logout } = useRole();
  const [loginOpen, setLoginOpen] = useState(false);
  const [password, setPassword] = useState('');
  const handleLogin = () => {
    if (login(password)) { toast.success('已进入摄影师模式'); setLoginOpen(false); setPassword(''); }
    else { toast.error('密码错误'); }
  };
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}><Menu className="h-5 w-5" /></Button>
      <div className="flex items-center gap-2">
        {isPhotographer ? (
          <Button variant="outline" size="sm" onClick={logout}><LogIn className="mr-1.5 h-3.5 w-3.5" />退出摄影师</Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setLoginOpen(true)}><Lock className="mr-1.5 h-3.5 w-3.5" />摄影师入口</Button>
        )}
      </div>
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>摄影师登录</DialogTitle><DialogDescription>输入摄影师密码进入工作台模式</DialogDescription></DialogHeader>
          <Input type="password" placeholder="请输入密码" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          <DialogFooter><Button onClick={handleLogin}>登录</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
