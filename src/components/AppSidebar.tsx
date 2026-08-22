import { NavLink } from 'react-router-dom';
import {
  Camera, Sparkles, Image, MessageSquare, Calendar,
  ClipboardList, LayoutDashboard, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import type { Permission } from '@/data/roles';

interface NavItem {
  to: string;
  icon: typeof Camera;
  label: string;
  perm?: Permission;
}

const customerNav: NavItem[] = [
  { to: '/', icon: Camera, label: '首页' },
  { to: '/gallery', icon: Image, label: '客片展示' },
  { to: '/select', icon: Sparkles, label: 'AI 选片' },
  { to: '/edit', icon: Sparkles, label: 'AI 修图' },
  { to: '/chat', icon: MessageSquare, label: '在线咨询' },
  { to: '/booking', icon: Calendar, label: '预约档期' },
  { to: '/plan', icon: ClipboardList, label: '拍摄方案' },
];

const photographerNav: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: '工作台', perm: 'dashboard.view' },
  { to: '/select', icon: Sparkles, label: 'AI 选片', perm: 'photo.select' },
  { to: '/edit', icon: Sparkles, label: 'AI 修图', perm: 'photo.edit' },
  { to: '/gallery', icon: Image, label: '客片管理', perm: 'gallery.manage' },
  { to: '/booking', icon: Calendar, label: '档期管理', perm: 'bookings.manage' },
  { to: '/plan', icon: ClipboardList, label: '拍摄方案', perm: 'plans.manage' },
  { to: '/chat', icon: MessageSquare, label: '客户消息' },
  { to: '/settings', icon: Settings, label: '系统设置', perm: 'settings.manage' },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { isPhotographer, currentRole, logout, hasPermission } = useRole();
  const nav = isPhotographer
    ? photographerNav.filter((item) => !item.perm || hasPermission(item.perm))
    : customerNav;

  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="flex items-center gap-2 px-2 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Camera className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-bold">光影助手</div>
          <div className="text-xs text-muted-foreground">{currentRole.name}</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      {isPhotographer && (
        <Button variant="outline" size="sm" onClick={logout} className="mt-auto">
          退出登录
        </Button>
      )}
    </div>
  );
}
