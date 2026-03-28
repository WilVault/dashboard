import { NavLink, useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import {
  DashboardLogo,
  TransactionLogo,
  BudgetsLogo,
  ReportsLogo,
  AccountsLogo,
  WilvaultLogo
} from '../../icons';
import './styles.css';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardLogo width={19} height={19} className='filter-green'/> },
  { label: 'Transactions', path: '/transactions', icon: <TransactionLogo width={19} height={19} className='filter-green'/> },
  { label: 'Budgets', path: '/budgets', icon: <BudgetsLogo width={19} height={19} className='filter-green'/>},
  { label: 'Reports', path: '/reports', icon: <ReportsLogo width={19} height={19} className='filter-green'/>},
  { label: 'Accounts', path: '/accounts', icon: <AccountsLogo width={19} height={19} className='filter-green'/>},
];

export default function SideNav() {
  const { person } = useSession();
  const navigate = useNavigate();

  return (
    <nav className="
      flex flex-col h-screen bg-[#08080E] text-white overflow-y-auto sticky top-0
      w-16 min-w-16
      lg:w-70 lg:min-w-70
      transition-all duration-200
      border-r border-white/10
    ">

      {/* Header */}
      <div className="border-b border-white/10 flex items-center justify-center lg:justify-start px-0 lg:px-5 py-6">
        {/* Icon-only: "W" monogram on collapsed rail */}
        <span className="lg:hidden text-xl font-bold text-[#C9FA30]">
          <WilvaultLogo width={40} height={40} />
        </span>
        {/* Full wordmark on desktop */}
        <div className="hidden lg:block">
          <span className="text-2xl font-bold text-[#C9FA30]">WILVAULT</span>
          <br />
          <span className='text-xs text-[#4A4A68]'>PERSONAL FINANCE</span>
        </div>
      </div>

      {/* Nav links */}
      <ul className="flex-1 py-3 space-y-0.5 list-none m-0 p-2 lg:p-3">
        {navItems.map(item => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                `flex items-center justify-center lg:justify-start gap-3
                 px-0 lg:px-5 py-3.5 rounded-lg text-sm transition-colors duration-150 no-underline
                ${isActive
                  ? 'bg-[#2a3207] text-[#C9FA30] font-semibold'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              {/* Label only on desktop */}
              <span className="hidden lg:inline">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer / Profile */}
      <div
        onClick={() => navigate('/profile')}
        className="border-t border-white/10 hover:bg-white/8 cursor-pointer
                   flex items-center justify-center lg:justify-start
                   px-0 lg:px-5 py-4"
      >
        <img
          src={person?.profileUrl}
          alt={person?.fullName}
          title={person?.fullName}
          className='w-9 h-9 rounded-full shrink-0'
        />
        {/* Name + timezone only on desktop */}
        <div className="hidden lg:flex flex-col ml-2">
          <span className="text-sm font-semibold text-white">{person?.fullName}</span>
          <span className="text-xs text-white/50 capitalize">{person?.timezone}</span>
        </div>
      </div>

    </nav>
  );
}