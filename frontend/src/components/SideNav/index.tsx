import { NavLink } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';

interface NavItem {
  label: string;
  path:  string;
  icon:  string;
}

// Add new nav links here as you build more screens
const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { label: 'Terminals', path: '/terminals', icon: '🖥️' },
  { label: 'Payments',  path: '/payments',  icon: '💳' },
];

export default function SideNav() {
  const { person, logout } = useSession();

  return (
    <nav className="flex flex-col w-60 min-w-60 h-screen bg-gray-900 text-white overflow-y-auto">

      {/* Header */}
      <div className="px-5 py-6 border-b border-white/10">
        <span className="text-lg font-bold">⚡ MyApp</span>
      </div>

      {/* Nav links */}
      <ul className="flex-1 py-3 space-y-0.5 list-none m-0 p-3">
        {navItems.map(item => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors duration-150 no-underline
                ${isActive
                  ? 'bg-white/10 text-white font-semibold border-l-4 border-indigo-500 pl-3'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              <span className="w-5 text-center text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <div className="flex flex-col mb-3">
          <span className="text-sm font-semibold text-white">{person?.fullName}</span>
          <span className="text-xs text-white/50 capitalize">{person?.timezone}</span>
        </div>
        <button
          onClick={logout}
          className="w-full py-2 text-sm text-white bg-white/8 border border-white/20 rounded-md cursor-pointer transition-colors duration-150 hover:bg-white/15"
        >
          Logout
        </button>
      </div>

    </nav>
  );
}