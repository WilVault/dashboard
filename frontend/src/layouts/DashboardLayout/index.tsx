import { Outlet } from 'react-router-dom';
import SideNav from '../../components/SideNav';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <SideNav />
      <main className="flex-1 overflow-y-auto bg-[#08080E] p-6 text-white">
        <Outlet />
      </main>
    </div>
  );
}