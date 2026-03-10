// layouts/PublicLayout.tsx
import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#08080E]">
      <Outlet />
    </div>
  );
}
