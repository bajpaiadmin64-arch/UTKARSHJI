import React, { useState } from 'react';
import { WEBSITE_SERVICES, EXCEL_SERVICES, EXCEL_CAPABILITIES } from '../data';
import { ServiceItem } from '../types';
import * as Icons from 'lucide-react';
import { Search, Sparkles, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface ServicesProps {
  onSelectService: (serviceName: string) => void;
}

export default function Services({ onSelectService }: ServicesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'web' | 'excel'>('all');

  const filteredCapabilities = EXCEL_CAPABILITIES.filter((cap) =>
    cap.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuyNow = (serviceName: string) => {
    onSelectService(serviceName);
    // Smooth scroll to order form
    const orderSection = document.getElementById('order');
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper to dynamically get Lucide icons
  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-6 h-6 text-cyan-400" />;
    }
    return <Icons.HelpCircle className="w-6 h-6 text-cyan-400" />;
  };

  return (
    <section id="services" className="py-24 bg-slate-950 text-white relative border-t border-slate-900">
      <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="services-header-container">
          <h2 className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold mb-3">
            AGENCY SOLUTIONS
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight">
            Premium Services & Transparent Pricing
          </p>
          <div className="h-1.5 w-16 bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
          <p className="text-slate-400 mt-5 text-base sm:text-lg font-light leading-relaxed">
            Choose a flat-rate package or search for exact custom capabilities. We deliver lightning-fast, high-end assets tailored specifically to your project requirements.
          </p>
        </div>

        {/* Category Selector Tab */}
        <div className="flex items-center justify-center gap-4 mb-12" id="services-tabs">
          {(['all', 'web', 'excel'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Services' : cat === 'web' ? 'Web Development' : 'Excel & Data'}
            </button>
          ))}
        </div>

        {/* Website Development Packages */}
        {(activeCategory === 'all' || activeCategory === 'web') && (
          <div className="mb-20" id="web-packages-container">
            <div className="flex items-center space-x-3 mb-8 justify-center lg:justify-start">
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/40">
                <Icons.Globe className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
                Professional Web Development Packages
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {WEBSITE_SERVICES.map((s) => (
                <div
                  key={s.id}
                  className="relative flex flex-col justify-between bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-cyan-800/40 p-8 rounded-2xl shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 group"
                >
                  {/* Highlight Premium badge */}
                  {s.id === 'web-premium' && (
                    <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                      Best Value / Full Scale
                    </div>
                  )}

                  <div>
                    {/* Icon & Name */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        {renderIcon(s.iconName)}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Delivery</span>
                        <span className="text-xs font-mono font-bold text-cyan-400">{s.deliveryTime}</span>
                      </div>
                    </div>

                    <h4 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-cyan-300 transition-colors">
                      {s.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-light mb-6 leading-relaxed">
                      {s.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-3 mb-8">
                      {s.features.map((feat, i) => (
                        <div key={i} className="flex items-start space-x-2.5">
                          <Icons.Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-300 font-light leading-relaxed">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="border-t border-slate-900 pt-6 mt-auto">
                    <div className="flex items-baseline justify-between mb-5">
                      <span className="text-xs font-mono text-slate-500">Starting price</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold font-mono text-white">₹{s.price}</span>
                        <span className="text-[10px] text-slate-500 font-mono block">One-time payment</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuyNow(s.name)}
                      className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl text-xs font-semibold tracking-wider uppercase text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-450 shadow-lg shadow-cyan-500/10 active:scale-95 transition-all duration-200"
                    >
                      <span>Buy Now / Order</span>
                      <Icons.ArrowRight className="w-4 h-4 text-slate-950" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Excel Services Packages */}
        {(activeCategory === 'all' || activeCategory === 'excel') && (
          <div className="mb-20" id="excel-packages-container">
            <div className="flex items-center space-x-3 mb-8 justify-center lg:justify-start">
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40">
                <Icons.Database className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
                Professional Excel & Data Services
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {EXCEL_SERVICES.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col justify-between bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-emerald-800/40 p-8 rounded-2xl shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group"
                >
                  <div>
                    {/* Icon & Name */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        {renderIcon(s.iconName)}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Delivery</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">{s.deliveryTime}</span>
                      </div>
                    </div>

                    <h4 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-emerald-300 transition-colors">
                      {s.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-light mb-6 leading-relaxed">
                      {s.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-3 mb-8">
                      {s.features.map((feat, i) => (
                        <div key={i} className="flex items-start space-x-2.5">
                          <Icons.Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-300 font-light leading-relaxed">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="border-t border-slate-900 pt-6 mt-auto">
                    <div className="flex items-baseline justify-between mb-5">
                      <span className="text-xs font-mono text-slate-500">Starting price</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold font-mono text-white">₹{s.price}</span>
                        <span className="text-[10px] text-slate-500 font-mono block">One-time payment</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuyNow(s.name)}
                      className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl text-xs font-semibold tracking-wider uppercase text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 shadow-lg shadow-emerald-500/10 active:scale-95 transition-all duration-200"
                    >
                      <span>Order Spreadsheet Solution</span>
                      <Icons.ArrowRight className="w-4 h-4 text-slate-950" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Excel Capability Finder */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-8 sm:p-12 relative" id="capability-finder">
          <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-purple-500/10 w-48 h-48 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-850 px-3 py-1 rounded-full mb-3">
              <Icons.Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                EXCEL SPECIALIST MATRIX
              </span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Excel Capability Quick-Selector</h4>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              We cover every advanced Excel feature requested. Type your requirement below (e.g., Pivot, Formulas, Sheets) and select the service to pre-populate your order draft instantly.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md mx-auto mb-8" id="capability-search">
            <Search className="absolute top-3.5 left-4 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search features (e.g. VLOOKUP, Attendance, Data Cleaning...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/80 transition-colors"
            />
          </div>

          {/* Grid list */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800" id="capability-grid">
            {filteredCapabilities.length > 0 ? (
              filteredCapabilities.map((cap, i) => (
                <button
                  key={i}
                  onClick={() => handleBuyNow(`Excel Capability: ${cap.name}`)}
                  className="flex flex-col justify-between items-start bg-slate-950/60 border border-slate-850/80 hover:border-purple-500/40 p-3.5 rounded-xl text-left hover:bg-slate-900/40 active:scale-95 transition-all duration-150 group"
                >
                  <span className="text-[9px] font-mono text-purple-400 font-medium tracking-wide uppercase">
                    {cap.category}
                  </span>
                  <span className="text-xs text-slate-200 font-bold tracking-tight mt-1 group-hover:text-purple-300 transition-colors">
                    {cap.name}
                  </span>
                  <div className="flex items-center space-x-1 mt-3.5 text-[10px] text-slate-500 group-hover:text-white transition-colors font-mono">
                    <span>Order</span>
                    <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-slate-500 font-mono">
                No matching Excel capability found. Fill in our order form for custom requirements!
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
