import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  FileCheck,
  History,
  Settings,
  LogOut,
  ShieldCheck
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Certificates', path: '/admin/dashboard', icon: FileCheck },
    { label: 'Verification Logs', path: '/admin/dashboard', icon: History },
    { label: 'Settings', path: '/admin/dashboard', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#112240] border-r border-[#1E293B] text-white flex flex-col justify-between shrink-0 min-h-screen">
      <div className="p-6 space-y-8">
        
        {/* Logo */}
        <Link to="/" className="block">
          <Logo size="md" variant="dark" />
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <span className="text-[11px] font-bold text-[#F59E0B] uppercase tracking-wider block px-3 mb-2">
            Admin Menu
          </span>

          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path && idx === 0;
            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#F59E0B] text-slate-950 font-bold border border-[#F59E0B] shadow-md shadow-[#F59E0B]/20'
                    : 'text-[#CBD5E1] hover:bg-[#0A192F] hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-[#38BDF8]'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Logout */}
      <div className="p-6 border-t border-[#1E293B] space-y-4">
        <div className="p-3 rounded-xl bg-[#0A192F] border border-[#1E293B] text-xs text-[#CBD5E1] space-y-1">
          <div className="flex items-center gap-1.5 text-[#F59E0B] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Institutional Admin
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Connected to MongoDB Database.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 text-sm font-bold transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
};
