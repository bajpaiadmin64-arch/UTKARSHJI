import React, { useState } from 'react';
import { Terminal, Github, Linkedin, Twitter, Sparkles, Scale, X } from 'lucide-react';

export default function Footer() {
  const [activePolicy, setActivePolicy] = useState<'privacy' | 'terms' | null>(null);

  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Order Now', href: '#order' },
    { name: 'Payment', href: '#payment' },
    { name: 'Contact', href: '#contact' },
  ];

  const services = [
    'Basic Web Package',
    'Business Web Package',
    'Elite Premium Web',
    'Excel Formulas & Lookup',
    'MIS Reporting & Pivot',
    'Excel Automations',
  ];

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-16 font-sans relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        {/* Col 1: Brand Info */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              U B <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Web Developer</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 font-light leading-relaxed max-w-sm">
            Professional Web Development & Advanced Microsoft Excel Spreadsheet Automation Solutions. Building bespoke dynamic layout structures and custom automated formulas for modern global enterprises.
          </p>
          {/* Social icons */}
          <div className="flex items-center space-x-3 pt-2">
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 hover:text-white transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 hover:text-white transition-colors" aria-label="GitHub">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 hover:text-white transition-colors" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="md:col-span-3 space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-200">Company Grid</h4>
          <ul className="space-y-2 text-xs">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <a href={link.href} className="hover:text-cyan-400 transition-colors">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Services Grid */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-200">Agency Capabilities</h4>
          <ul className="space-y-2 text-xs">
            {services.map((item) => (
              <li key={item} className="flex items-center space-x-2">
                <div className="w-1 h-1 rounded-full bg-cyan-400"></div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copy footer strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-550">
        <span>© {new Date().getFullYear()} U B Web Developer. All rights reserved.</span>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActivePolicy('privacy')}
            className="hover:text-slate-300 underline transition-colors"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActivePolicy('terms')}
            className="hover:text-slate-300 underline transition-colors"
          >
            Terms & Conditions
          </button>
        </div>
      </div>

      {/* Policy Modal Overlay */}
      {activePolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" id="policy-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 relative max-h-[80vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setActivePolicy(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-950 hover:bg-slate-805 border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-cyan-400 mb-4">
              <Scale className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                {activePolicy === 'privacy' ? 'Privacy Protection Policy' : 'Terms & Conditions Agreements'}
              </h3>
            </div>

            <div className="space-y-3 text-xs text-slate-400 font-light leading-relaxed">
              {activePolicy === 'privacy' ? (
                <>
                  <p>At <strong>U B Web Developer</strong>, accessible from this workspace, we prioritize client data confidentiality above all else.</p>
                  <p><strong>1. Information Collection:</strong> We collect details submitted on our Order Form (Name, Email, WhatsApp, reference files). Reference spreadsheets or specifications uploaded are kept strictly confidential on our container server during delivery and purged upon confirmation.</p>
                  <p><strong>2. Usage:</strong> Submissions are dispatched securely via our secure backend to our lead developer, Utkarsh Bajpai, solely to estimate, formulate, and deliver your assets.</p>
                  <p><strong>3. Protection:</strong> We do not lease, trade, or distribute client contact credentials or proprietary spreadsheets with third-party vendors.</p>
                </>
              ) : (
                <>
                  <p>By accessing or placing an order at <strong>U B Web Developer</strong>, you consent to compile, execute, and deliver within our designated operating frameworks.</p>
                  <p><strong>1. Deliverables:</strong> Delivery times are approximations. Although Basic packages are launched in 24-72 hours, intricate MIS panels can take up to 7 business days.</p>
                  <p><strong>2. Payment:</strong> Work begins immediately after submitting the correct Transaction Ref / UTR ID on our Payment Confirmation ledger. Flat fees are non-revertible once design blueprints are signed off.</p>
                  <p><strong>3. Revisions:</strong> We offer comprehensive post-delivery modifications based on package details to guarantee full system compatibility.</p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActivePolicy(null)}
                className="px-4.5 py-2 rounded-xl bg-slate-950 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
