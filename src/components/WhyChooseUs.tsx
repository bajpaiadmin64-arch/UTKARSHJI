import React from 'react';
import { Clock, IndianRupee, Smartphone, ShieldAlert, Search, RefreshCw, Lock, LifeBuoy } from 'lucide-react';

export default function WhyChooseUs() {
  const points = [
    {
      title: 'Fast & Timely Delivery',
      desc: 'Spreadsheets ready under 24-48 hours. Business websites launched in 3-5 days. We respect your tight schedules.',
      icon: Clock,
      color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40'
    },
    {
      title: 'Affordable Flat Pricing',
      desc: 'Top-tier development solutions designed specifically for startups, scale-ups, and budget-conscious professionals.',
      icon: IndianRupee,
      color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
    },
    {
      title: 'Mobile-First Adaptability',
      desc: 'All websites are fully optimized and fluid across iPhones, Android devices, tablets, and ultra-wide desktops.',
      icon: Smartphone,
      color: 'text-purple-400 bg-purple-950/40 border-purple-800/40'
    },
    {
      title: 'Premium Glassmorphic UI',
      desc: 'No cookie-cutter templates. We style high-end futuristic dark assets that stand out from competitors.',
      icon: ShieldAlert,
      color: 'text-pink-400 bg-pink-950/40 border-pink-800/40'
    },
    {
      title: 'SEO & Speed Optimized',
      desc: 'Structured HTML, meta tag headers, and compressed components ensuring your site ranks first locally.',
      icon: Search,
      color: 'text-blue-400 bg-blue-950/40 border-blue-800/40'
    },
    {
      title: 'Flexible Project Revisions',
      desc: 'Your absolute satisfaction is our top priority. We adapt, adjust, and refine deliverables until they are flawless.',
      icon: RefreshCw,
      color: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/40'
    },
    {
      title: 'Secure UPI Payments',
      desc: 'Direct secure bank-to-bank instant transfers via UPI ID or scannable dynamic QR codes without extra transaction fees.',
      icon: Lock,
      color: 'text-teal-400 bg-teal-950/40 border-teal-800/40'
    },
    {
      title: 'Expert Post-Delivery Support',
      desc: 'Get dedicated post-delivery maintenance and spreadsheet help to ensure your macros never stop running.',
      icon: LifeBuoy,
      color: 'text-orange-400 bg-orange-950/40 border-orange-800/40'
    }
  ];

  return (
    <section id="why-choose-us" className="py-24 bg-slate-950 text-white relative border-t border-slate-900">
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="why-choose-header-container">
          <h2 className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold mb-3">
            OUR COMPETITIVE EDGE
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight">
            Why Client Partnerships Succeed
          </p>
          <div className="h-1.5 w-16 bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
          <p className="text-slate-400 mt-5 text-base sm:text-lg font-light leading-relaxed">
            We deliver the visual quality and custom logic of premium high-end software agencies at accessible flat rates, backed by continuous customer-centric delivery.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="why-choose-bento-grid">
          {points.map((pt, idx) => (
            <div
              key={idx}
              className="bg-slate-900/40 border border-slate-850 hover:border-slate-750 p-6 rounded-2xl shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                {/* Icon Container */}
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-5 ${pt.color} group-hover:scale-105 transition-transform duration-300`}>
                  <pt.icon className="w-5 h-5" />
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2">
                  {pt.title}
                </h3>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  {pt.desc}
                </p>
              </div>

              {/* Minimal decoration */}
              <div className="h-1 w-8 bg-slate-800 rounded-full mt-6 group-hover:bg-cyan-500 transition-all duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
