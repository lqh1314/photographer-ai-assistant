import { createContext, useContext, useState, type ReactNode } from 'react';
import { DEFAULT_ROLES, type RoleDef, type Permission } from '@/data/roles';
import { useLocalStorage } from '@/lib/storage';

interface RoleContextType {
  roles: RoleDef[];
  currentRole: RoleDef;
  isPhotographer: boolean;
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  switchRole: (roleId: string) => void;
  hasPermission: (perm: Permission) => boolean;
  addRole: (role: Omit<RoleDef, 'id'>) => void;
  updateRole: (id: string, updates: Partial<RoleDef>) => void;
  deleteRole: (id: string) => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useLocalStorage<RoleDef[]>('app_roles', DEFAULT_ROLES);
  const [currentRoleId, setCurrentRoleId] = useState<string>('customer');

  const currentRole = roles.find((r) => r.id === currentRoleId) || roles[0];
  const isPhotographer = currentRoleId !== 'customer';
  const isAdmin = currentRoleId === 'admin';

  const login = (password: string) => {
    const role = roles.find((r) => r.password && r.password === password);
    if (role) {
      setCurrentRoleId(role.id);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentRoleId('customer');

  const switchRole = (roleId: string) => {
    if (roles.some((r) => r.id === roleId)) {
      setCurrentRoleId(roleId);
    }
  };

  const hasPermission = (perm: Permission) => currentRole.permissions.includes(perm);

  const addRole = (role: Omit<RoleDef, 'id'>) => {
    const id = `role_${Date.now()}`;
    setRoles((prev) => [...prev, { ...role, id }]);
  };

  const updateRole = (id: string, updates: Partial<RoleDef>) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteRole = (id: string) => {
    const target = roles.find((r) => r.id === id);
    if (target?.isSystem) return;
    setRoles((prev) => prev.filter((r) => r.id !== id));
    if (currentRoleId === id) setCurrentRoleId('customer');
  };

  return (
    <RoleContext.Provider
      value={{ roles, currentRole, isPhotographer, isAdmin, login, logout, switchRole, hasPermission, addRole, updateRole, deleteRole }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
