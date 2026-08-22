import { Routes, Route } from 'react-router-dom';
import { RoleProvider } from '@/contexts/RoleContext';
import { Layout } from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import GalleryPage from '@/pages/GalleryPage';
import PhotoSelectPage from '@/pages/PhotoSelectPage';
import PhotoEditPage from '@/pages/PhotoEditPage';
import ChatPage from '@/pages/ChatPage';
import BookingPage from '@/pages/BookingPage';
import ShootPlanPage from '@/pages/ShootPlanPage';
import DashboardPage from '@/pages/DashboardPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <RoleProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/select" element={<PhotoSelectPage />} />
          <Route path="/edit" element={<PhotoEditPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/plan" element={<ShootPlanPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </RoleProvider>
  );
}
