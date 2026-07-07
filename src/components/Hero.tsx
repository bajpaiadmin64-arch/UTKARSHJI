import React from 'react';
import { ArrowRight, Code2, Database, Sparkles, ShieldCheck } from 'lucide-react';

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen pt-32 pb-20 flex items-center justify-center overflow-hidden bg-slate-950 text-white"
    >
      {/* Dynamic Futuristic Radial Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headline and CTAs */}
        <div className="lg:col-span-7 flex flex-col space-y-6 text-center lg:text-left" id="hero-text-container">
          {/* Accent Chip */}
          <div className="inline-flex items-center space-x-2 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-full w-fit mx-auto lg:mx-0 shadow-inner">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-medium tracking-wide text-slate-300">
              NEXT-GEN DIGITAL SOLUTIONS AGENCY
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Build Your <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Dream Website</span> & Get Professional{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Excel Solutions</span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
            Unleash peak business efficiency. We design stunning, lightning-fast, and search-optimized websites, alongside bespoke high-performance Excel dashboard automation, MIS reports, and custom formulas.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4" id="hero-cta-buttons">
            <a
              href="#order"
              className="group relative w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl text-sm font-semibold tracking-wide text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 transition-all duration-300 shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-95"
            >
              <span>Order Services Now</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#services"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl text-sm font-semibold tracking-wide text-slate-200 bg-slate-900/60 border border-slate-800 hover:bg-slate-850 hover:text-white transition-all duration-300"
            >
              <span>Browse Services</span>
            </a>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 pt-6 border-t border-slate-900" id="hero-trust-chips">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono">100% Satisfaction Guarantee</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono">Secure UPI Transfers</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono">Flat-Rate Pricing</span>
            </div>
          </div>
        </div>

        {/* Right Column: Premium Code & Sheet Layered Mockup */}
        <div className="lg:col-span-5 relative mt-10 lg:mt-0" id="hero-mockup-pane">
          {/* Backing glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 rounded-3xl blur-2xl opacity-60"></div>

          {/* Layout Containers */}
          <div className="relative space-y-4">
            {/* Mockup A: Professional IDE Panel */}
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md transform hover:-translate-y-1 transition-transform duration-300 relative z-10">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/70"></div>
                </div>
                <div className="text-[10px] font-mono text-slate-500">App.tsx — React (19.0)</div>
                <Code2 className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <pre className="text-xs font-mono text-slate-400 space-y-1 overflow-x-auto text-left leading-normal">
                <code>
                  <span className="text-purple-400">import</span> React <span className="text-purple-400">from</span> <span className="text-emerald-300">'react'</span>;<br />
                  <span className="text-purple-400">import</span> {'{ motion }'} <span className="text-purple-400">from</span> <span className="text-emerald-300">'motion/react'</span>;<br /><br />
                  <span className="text-blue-400">export default function</span> <span className="text-yellow-300">UBWebDeveloper</span>() {'{'}<br />
                  &nbsp;&nbsp;<span className="text-purple-400">return</span> (<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">&lt;</span><span className="text-cyan-400">div</span> <span className="text-purple-300">className</span>=<span className="text-emerald-300">"glassmorphic-card"</span><span className="text-slate-500">&gt;</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-100">Professional Agency Deliverables</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">&lt;/</span><span className="text-cyan-400">div</span><span className="text-slate-500">&gt;</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;);<br />
                  {'}'}
                </code>
              </pre>
            </div>

            {/* Mockup B: Advanced Interactive Spreadsheet Pivot Dashboard */}
            <div className="bg-slate-900/95 border border-emerald-950/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md transform translate-x-4 sm:translate-x-8 -mt-6 hover:translate-y-[-4px] transition-transform duration-300 relative z-20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500/70"></div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">XLSX ACTIVE</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500">CFO_Financial_MIS.xlsx</div>
                <Database className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="space-y-2">
                {/* Visual Chart mock */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-850 rounded-lg p-2 border border-slate-800/80 text-center">
                    <span className="text-[9px] text-slate-500 block uppercase font-mono">Q2 Growth</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">+41.2%</span>
                  </div>
                  <div className="bg-slate-850 rounded-lg p-2 border border-slate-800/80 text-center">
                    <span className="text-[9px] text-slate-500 block uppercase font-mono">Precision</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">100.0%</span>
                  </div>
                  <div className="bg-slate-850 rounded-lg p-2 border border-slate-800/80 text-center">
                    <span className="text-[9px] text-slate-500 block uppercase font-mono">Formula</span>
                    <span className="text-[10px] font-mono font-bold text-yellow-400">XLOOKUP</span>
                  </div>
                </div>
                {/* Data Grid Mockup */}
                <table className="w-full text-[10px] font-mono border-collapse text-left text-slate-400">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500">
                      <th className="pb-1">ID</th>
                      <th className="pb-1">DEPARTMENT</th>
                      <th className="pb-1 text-right">BUDGET</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-850">
                      <td className="py-1">A102</td>
                      <td>Software Dev</td>
                      <td className="text-right text-emerald-400 font-semibold">₹1,29,900</td>
                    </tr>
                    <tr>
                      <td className="py-1">A105</td>
                      <td>MIS Reporting</td>
                      <td className="text-right text-emerald-400 font-semibold">₹69,900</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
