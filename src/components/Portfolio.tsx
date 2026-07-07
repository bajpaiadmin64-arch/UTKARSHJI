import React, { useState } from 'react';
import { PORTFOLIO_PROJECTS } from '../data';
import { Project } from '../types';
import { ExternalLink, X, Laptop, Database, HelpCircle } from 'lucide-react';

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories = [
    'All',
    'Business Websites',
    'Portfolio Websites',
    'Landing Pages',
    'Excel Dashboards',
    'MIS Reports',
    'Data Cleaning Projects',
  ];

  const filteredProjects = PORTFOLIO_PROJECTS.filter((proj) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'MIS Reports') {
      return proj.category === 'MIS Reports' || proj.category === 'MIS & Pivot Reports';
    }
    return proj.category.toLowerCase().includes(selectedCategory.toLowerCase().substring(0, 15));
  });

  return (
    <section id="portfolio" className="py-24 bg-slate-950 text-white relative border-t border-slate-900">
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="portfolio-header-container">
          <h2 className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold mb-3">
            OUR WORKS
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight">
            Case Studies & Proof of Concept
          </p>
          <div className="h-1.5 w-16 bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
          <p className="text-slate-400 mt-5 text-base sm:text-lg font-light leading-relaxed">
            Explore our curated selection of interactive web systems and automated spreadsheet dashboards. Every project represents precision development, pixel-perfect design, and optimized business logic.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12" id="portfolio-category-tags">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4.5 py-2 rounded-xl text-xs font-mono font-medium tracking-wide transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 shadow-lg shadow-cyan-500/10 font-semibold'
                  : 'bg-slate-900 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="portfolio-grid-layout">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => setSelectedProject(proj)}
              className="bg-slate-900/40 border border-slate-850 hover:border-slate-750 p-6 rounded-2xl cursor-pointer hover:shadow-2xl hover:shadow-black/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Visual Header Mockup based on project type */}
                <div className="w-full h-44 rounded-xl bg-slate-950 border border-slate-900 overflow-hidden relative flex items-center justify-center mb-6 group-hover:border-cyan-800/40 transition-colors">
                  {/* Backdrop subtle gradient */}
                  <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${
                    proj.mockupType === 'website' ? 'from-cyan-500 to-purple-500' : 'from-emerald-500 to-teal-500'
                  }`}></div>

                  {proj.mockupType === 'website' ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center">
                        <Laptop className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest">WEB PLATFORM</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center">
                        <Database className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400/80 uppercase tracking-widest">DATA ENGINE</span>
                    </div>
                  )}

                  {/* Glass Card hover overlay */}
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <span className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-white bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
                      <span>View Details</span>
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {proj.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-mono uppercase bg-slate-950/80 border border-slate-850 px-2 py-0.5 rounded text-slate-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2">
                  {proj.title}
                </h3>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  {proj.description.length > 120 ? proj.description.substring(0, 117) + '...' : proj.description}
                </p>
              </div>

              {/* Metrics summary */}
              {proj.stats && (
                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-900">
                  {proj.stats.map((st, i) => (
                    <div key={i}>
                      <span className="text-[9px] font-mono uppercase text-slate-500 block">{st.label}</span>
                      <span className="text-xs font-mono font-bold text-slate-200 block">{st.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal: Project Details */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" id="portfolio-modal">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white"
                id="close-modal-btn"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2.5 mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-slate-950/60 border border-slate-800 text-cyan-400">
                  {selectedProject.category}
                </span>
                <span className="text-slate-600 font-mono">/</span>
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  {selectedProject.mockupType === 'website' ? 'React SPA' : 'Microsoft Excel Sheet'}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">{selectedProject.title}</h3>

              {/* Fake visual mock in modal */}
              <div className="w-full h-48 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center mb-6">
                <div className="text-center space-y-2">
                  <span className="text-xs font-mono text-slate-500 uppercase block">Interactive Simulation</span>
                  <p className="text-xs text-slate-300 max-w-md px-4 font-light">
                    Realized using dynamic styling, responsive flex-grid matrices, custom event state routing, and offline storage.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-slate-300">
                <p className="text-sm font-light leading-relaxed">{selectedProject.description}</p>

                {/* Tech Specs */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Technologies Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map((t, idx) => (
                      <span key={idx} className="text-xs font-mono bg-slate-950 border border-slate-850 px-3 py-1 rounded-lg text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats board */}
                {selectedProject.stats && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-850">
                    {selectedProject.stats.map((st, i) => (
                      <div key={i} className="bg-slate-950/60 border border-slate-850 rounded-xl p-4">
                        <span className="text-[10px] font-mono uppercase text-slate-500 block">{st.label}</span>
                        <span className="text-lg font-mono font-bold text-cyan-400 block mt-1">{st.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide bg-slate-950 hover:bg-slate-850 text-slate-300"
                >
                  Close Case Study
                </button>
                <a
                  href="#order"
                  onClick={() => {
                    setSelectedProject(null);
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold tracking-wide text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400"
                >
                  Request Similar Project
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
