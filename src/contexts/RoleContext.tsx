import { createContext, useContext, useState, type ReactNode } from 'react';
interface RoleContextType {
  isPhotographer: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}
const RoleContext = createContext<RoleContextType | null>(null);
const PHOTOGRAPHER_PASSWORD = '1234';
export function RoleProvider({ children }: { children: ReactNode }) {
  const [isPhotographer, setIsPhotographer] = useState(false);
  const login = (password: string) => {
    if (password === PHOTOGRAPHER_PASSWORD) { setIsPhotographer(true); return true; }
    return false;
  };
  const logout = () => setIsPhotographer(false);
  return (
    <RoleContext.Provider value={{ isPhotographer, login, logout }}>
      {children}
    </RoleContext.Provider>
  );
}
export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
