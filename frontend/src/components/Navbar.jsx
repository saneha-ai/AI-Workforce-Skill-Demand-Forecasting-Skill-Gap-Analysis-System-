import React from 'react';
import { Briefcase, LogOut, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-white/10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-emerald-400 rounded-lg flex items-center justify-center">
                        <Briefcase size={20} className="text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        CareerMatch.ai
                    </span>
                </div>

                {token && (
                    <div className="flex items-center gap-6 text-sm font-medium text-slate-300">
                        <div className="hidden md:flex gap-6">
                            <a href="#home" className="hover:text-white transition-colors">Home</a>
                            <a href="#upload" className="hover:text-white transition-colors">Analyze</a>
                            <a href="#dashboard" className="hover:text-white transition-colors">Dashboard</a>
                            <a onClick={() => navigate('/drift')} className="hover:text-white transition-colors cursor-pointer">Drift Monitor</a>
                        </div>

                        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                            <div className="flex items-center gap-2">
                                <User size={16} />
                                <span className="hidden md:inline text-white">{user.fullname || 'User'}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-all"
                                title="Logout"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
