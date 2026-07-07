import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles, Terminal, User, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenAI: () => void;
  onOpenAuth: () => void;
  onOpenAdmin?: () => void;
}

export default function Navbar({ onOpenAI, onOpenAuth, onOpenAdmin }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, userProfile, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Order Now', href: '#order' },
    { name: 'Payment', href: '#payment' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 shadow-lg shadow-black/10 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center space-x-3 group" id="logo-link">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
              <Terminal className="w-5 h-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 blur opacity-40 group-hover:opacity-70 transition-opacity duration-300"></div>
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight block">
                U B <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">Web Dev</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider font-mono uppercase block -mt-1">
                SOLUTIONS ARCHITECT
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-1" id="desktop-menu">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900/40 transition-all duration-200"
              >
                {link.name}
              </a>
            ))}

            {/* AI Consultant */}
            <button
              onClick={onOpenAI}
              className="ml-3 flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/40 border border-cyan-800/60 hover:bg-cyan-900/60 hover:text-white hover:border-cyan-500/80 shadow-lg shadow-cyan-950/20 active:scale-95 transition-all duration-200"
              id="ai-consultant-btn"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>AI</span>
            </button>

            {/* Admin Console Entry */}
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="ml-3 flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-950/45 border border-purple-800/60 hover:bg-purple-900/60 hover:text-white hover:border-purple-500/80 shadow-lg active:scale-95 transition-all duration-200 animate-pulse"
                id="nav-admin-btn"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Admin Console</span>
              </button>
            )}

            {/* Auth Block */}
            {currentUser ? (
              <div className="flex items-center space-x-2 pl-3 border-l border-slate-800 ml-2" id="nav-user-profile">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-mono font-medium text-slate-200 max-w-[100px] truncate">
                    {userProfile?.fullName || 'Client'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 active:scale-95 transition-all"
                  title="Sign Out Account"
                  id="nav-logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="ml-3 flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-950/40 border border-purple-800/60 hover:bg-purple-900/60 hover:text-white hover:border-purple-500/80 shadow-lg shadow-purple-950/20 active:scale-95 transition-all duration-200"
                id="nav-signin-btn"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Hamburguer */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={onOpenAI}
              className="mr-3 flex items-center justify-center p-2 rounded-lg text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 hover:bg-cyan-900/40 animate-pulse"
              title="Chat with AI"
              id="mobile-ai-trigger"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900/60 focus:outline-none"
              aria-label="Toggle Menu"
              id="mobile-hamburger-btn"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 right-0 z-40 w-full max-w-xs bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl p-6 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        id="mobile-nav-drawer"
      >
        <div className="flex items-center justify-between pb-6 border-b border-slate-850">
          <span className="text-lg font-bold text-white font-mono uppercase tracking-wider">Navigations</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-900"
            id="mobile-close-btn"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-6 flex flex-col space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900/60 transition-colors"
            >
              {link.name}
            </a>
          ))}

          {/* Mobile Auth options */}
          <div className="pt-6 border-t border-slate-900 mt-4 space-y-3">
            {currentUser ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800">
                  <User className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-sm font-bold text-slate-200 block truncate">{userProfile?.fullName || 'Client'}</span>
                    <span className="text-[10px] font-mono text-slate-500 block truncate">{currentUser.email}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-red-400 bg-red-950/20 border border-red-900/30 hover:bg-red-900/40 transition-all"
                  id="mobile-logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Account</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAuth();
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-950/20 border border-purple-800/40 hover:bg-purple-900/40 transition-all"
                id="mobile-signin-btn"
              >
                <User className="w-4 h-4" />
                <span>Sign In or Sign Up</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAdmin?.();
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-950/30 border border-purple-800/50 hover:bg-purple-900/40 transition-all mb-2"
                id="mobile-nav-admin-btn"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>Open Admin Console</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAI();
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 shadow-lg active:scale-95 transition-all"
              id="mobile-ai-consultant-btn"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Consult AI Partner</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
