import React, { useState } from 'react';
import { FAQ_ITEMS } from '../data';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id || null);

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-24 bg-slate-950 text-white relative border-t border-slate-900">
      <div className="absolute top-10 left-10 w-80 h-80 bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="faq-header-container">
          <h2 className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold mb-3">
            KNOWLEDGE BASE
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight">
            Frequently Answered Inquiries
          </p>
          <div className="h-1.5 w-16 bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
          <p className="text-slate-400 mt-5 text-base sm:text-lg font-light leading-relaxed">
            Have questions regarding delivery speed, custom Excel macros, website files or refunds? Look through our primary answers below or chat with our automated AI assistant anytime.
          </p>
        </div>

        {/* Collapsible Accordion Grid */}
        <div className="space-y-4" id="faq-accordion-container">
          {FAQ_ITEMS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden transition-all duration-300"
              >
                {/* Accordion Trigger Button */}
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-slate-900/60 text-left transition-colors"
                  aria-expanded={isOpen}
                  id={`faq-btn-${faq.id}`}
                >
                  <div className="flex items-center space-x-3.5 pr-4">
                    <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                    <span className="text-sm sm:text-base font-bold text-slate-100">{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>

                {/* Collapsible Content */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[300px] border-t border-slate-850/60 p-6 bg-slate-950/40' : 'max-h-0'
                  } overflow-hidden`}
                >
                  <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
