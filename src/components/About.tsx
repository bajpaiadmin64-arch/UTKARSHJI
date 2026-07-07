import React, { useState, useEffect } from 'react';
import { Globe, Database, Award, Users, ShieldCheck, Zap } from 'lucide-react';

export default function About() {
  const [stats, setStats] = useState({
    projects: 0,
    clients: 0,
    years: 0,
    support: '24/7'
  });

  // Simple counting trigger on mount
  useEffect(() => {
    const projectTimer = setInterval(() => {
      setStats(prev => {
        if (prev.projects >= 150) {
          clearInterval(projectTimer);
          return prev;
        }
        return { ...prev, projects: prev.projects + 5 };
      });
    }, 30);

    const clientTimer = setInterval(() => {
      setStats(prev => {
        if (prev.clients >= 120) {
          clearInterval(clientTimer);
          return prev;
        }
        return { ...prev, clients: prev.clients + 4 };
      });
    }, 35);

    const yearsTimer = setInterval(() => {
      setStats(prev => {
        if (prev.years >= 5) {
          clearInterval(yearsTimer);
          return prev;
        }
        return { ...prev, years: prev.years + 1 };
      });
    }, 150);

    return () => {
      clearInterval(projectTimer);
      clearInterval(clientTimer);
      clearInterval(yearsTimer);
    };
  }, []);

  const corePillars = [
    {
      title: 'Custom Web Engineering',
      desc: 'Formulating immersive, high-conversion visual architectures. From rapid single-page portfolios to high-load business applications, built with clean responsive standards.',
      icon: Globe,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Excel & Data Automation',
      desc: 'Simplifying critical database pipelines. Building custom calculation systems, automated templates, beautiful MIS dashboards, and precise formulas that save hundreds of hours.',
      icon: Database,
      color: 'from-emerald-500 to-teal-600'
    }
  ];

  const capabilities = [
    'Custom Website Development',
    'Business Websites',
    'Portfolio Websites',
    'Landing Pages',
    'E-commerce Websites',
    'Responsive Web Design',
    'Excel Automation',
    'Data Cleaning',
    'Dashboard Creation',
    'Reporting Solutions',
    'Data Analysis'
  ];

  return (
    <section id="about" className="py-24 bg-slate-950 text-white relative border-t border-slate-900">
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="about-heading-container">
          <h2 className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold mb-3">
            WHO WE ARE
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight">
            High-Performance Digital Engineers
          </p>
          <div className="h-1.5 w-16 bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
          <p className="text-slate-400 mt-5 text-base sm:text-lg font-light leading-relaxed">
            At <strong>U B Web Developer</strong>, we specialize in bridging the gap between raw data and exceptional client interfaces. We build elite web assets and bulletproof, automated spreadsheets that empower businesses globally.
          </p>
        </div>

        {/* Dual Pillar Focus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16" id="about-pillars-grid">
          {corePillars.map((p, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 hover:border-slate-700/60 p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${p.color} flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300`}>
                <p.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-100">{p.title}</h3>
              <p className="text-slate-400 font-light leading-relaxed text-sm">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* List of Capabilities */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-3xl mb-16" id="capabilities-board">
          <h3 className="text-lg font-bold font-mono tracking-tight text-slate-200 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            Core Development & Data Competencies
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {capabilities.map((c, i) => (
              <div
                key={i}
                className="flex items-center space-x-2 bg-slate-900/60 border border-slate-850 px-4 py-3 rounded-xl hover:bg-slate-850/60 hover:border-cyan-800/40 transition-colors duration-200"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                <span className="text-xs sm:text-sm text-slate-300 font-medium">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-900/30 border border-slate-900 rounded-3xl p-8" id="about-stats-grid">
          <div className="text-center p-4 border-r border-slate-900 last:border-0">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-400">
              {stats.projects}+
            </div>
            <div className="text-xs sm:text-sm text-slate-400 font-light mt-1.5 uppercase tracking-wider font-mono">
              Projects Completed
            </div>
          </div>

          <div className="text-center p-4 border-r border-slate-900 last:border-0">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-purple-400">
              {stats.clients}+
            </div>
            <div className="text-xs sm:text-sm text-slate-400 font-light mt-1.5 uppercase tracking-wider font-mono">
              Happy Clients
            </div>
          </div>

          <div className="text-center p-4 border-r border-slate-900 last:border-0">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
              {stats.years}+
            </div>
            <div className="text-xs sm:text-sm text-slate-400 font-light mt-1.5 uppercase tracking-wider font-mono">
              Years Experience
            </div>
          </div>

          <div className="text-center p-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-yellow-400 animate-pulse">
              {stats.support}
            </div>
            <div className="text-xs sm:text-sm text-slate-400 font-light mt-1.5 uppercase tracking-wider font-mono">
              Expert Support
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
