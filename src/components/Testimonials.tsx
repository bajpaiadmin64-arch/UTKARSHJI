import React, { useState } from 'react';
import { TESTIMONIALS } from '../data';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  const activeTest = TESTIMONIALS[activeIndex];

  return (
    <section id="testimonials" className="py-24 bg-slate-950 text-white relative border-t border-slate-900 overflow-hidden">
      {/* Visual glowing points */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="testimonials-header-container">
          <h2 className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold mb-3">
            CLIENT ADVOCACY
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight">
            Loved by Businesses Globally
          </p>
          <div className="h-1.5 w-16 bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Carousel Slider Card */}
        <div
          className="relative bg-slate-900/40 border border-slate-850 p-8 sm:p-12 rounded-3xl shadow-2xl backdrop-blur-md"
          id="testimonials-carousel"
        >
          {/* Accent quote */}
          <div className="absolute top-6 left-6 text-slate-800 pointer-events-none">
            <Quote className="w-12 h-12 rotate-180 opacity-20" />
          </div>

          <div className="flex flex-col items-center text-center space-y-6">
            {/* Stars rating */}
            <div className="flex items-center space-x-1" id="stars-container">
              {Array.from({ length: activeTest.rating }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            {/* Content review */}
            <p className="text-base sm:text-lg text-slate-200 font-light leading-relaxed max-w-2xl italic">
              "{activeTest.content}"
            </p>

            {/* Author info */}
            <div>
              <span className="text-base font-bold text-white block">{activeTest.name}</span>
              <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                {activeTest.role}, <span className="text-cyan-400">{activeTest.company}</span>
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center space-x-4 mt-10">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700 transition-all active:scale-95"
              aria-label="Previous Review"
              id="testimonial-prev-btn"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Sliding Dots */}
            <div className="flex items-center space-x-1.5" id="testimonial-dots">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    activeIndex === idx ? 'bg-cyan-400 w-6' : 'bg-slate-800'
                  }`}
                  aria-label={`Slide to review ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700 transition-all active:scale-95"
              aria-label="Next Review"
              id="testimonial-next-btn"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
