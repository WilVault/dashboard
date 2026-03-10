import { Outlet } from 'react-router-dom';
import SideNav from '../../components/SideNav';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <SideNav />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}