import { useState } from 'react';
import { Menu, Lock, LogIn, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRole } from '@/contexts/RoleContext';
import { toast } from 'sonner';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { currentRole, roles, isPhotographer, login, logout, switchRole } = useRole();
  const [loginOpen, setLoginOpen] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (login(password)) {
      toast.success(`已进入「${currentRole.name}」模式`);
      setLoginOpen(false);
      setPassword('');
    } else {
      toast.error('密码错误，请重试');
    }
  };

  const switchableRoles = roles.filter((r) => r.id !== currentRole.id && r.id !== 'customer');

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex flex-1 items-center justify-end gap-2">
        {isPhotographer ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <span className={`h-2 w-2 rounded-full ${currentRole.color}`} />
                {currentRole.name}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>切换角色</DropdownMenuLabel>
              {switchableRoles.map((r) => (
                <DropdownMenuItem key={r.id} onClick={() => { switchRole(r.id); toast.success(`已切换到「${r.name}」`); }}>
                  <span className={`mr-2 h-2 w-2 rounded-full ${r.color}`} />
                  {r.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogIn className="mr-2 h-3.5 w-3.5" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setLoginOpen(true)}>
            <Lock className="mr-1.5 h-3.5 w-3.5" />
            工作人员登录
          </Button>
        )}
      </div>
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>工作人员登录</DialogTitle>
            <DialogDescription>输入密码进入对应工作角色（管理员 admin / 摄影师 1234 / 助理 assistant）</DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <DialogFooter>
            <Button onClick={handleLogin}>登录</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
