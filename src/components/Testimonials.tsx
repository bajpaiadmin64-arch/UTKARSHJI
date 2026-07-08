import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, ShieldCheck, PenTool, MessageSquare, Award } from 'lucide-react';
import { TESTIMONIALS } from '../data';

interface TestimonialsProps {
  onOpenReviews: () => void;
}

export default function Testimonials({ onOpenReviews }: TestimonialsProps) {
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Animated counters
  const [ratingCounter, setRatingCounter] = useState(0);
  const [projectCounter, setProjectCounter] = useState(0);

  // Load approved reviews from Firestore
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          if (data.reviews && data.reviews.length > 0) {
            setReviewsList(data.reviews);
          } else {
            setReviewsList(TESTIMONIALS);
          }
        } else {
          setReviewsList(TESTIMONIALS);
        }
      } catch (err) {
        console.error("Testimonial review query error:", err);
        setReviewsList(TESTIMONIALS);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Smooth count-up animations for metrics
  useEffect(() => {
    // Animate Rating count from 0 to 4.9
    const ratingTarget = 4.9;
    const ratingDuration = 1500;
    const ratingSteps = 50;
    const ratingIncrement = ratingTarget / ratingSteps;
    let currentRatingStep = 0;

    const ratingTimer = setInterval(() => {
      currentRatingStep++;
      if (currentRatingStep >= ratingSteps) {
        setRatingCounter(ratingTarget);
        clearInterval(ratingTimer);
      } else {
        setRatingCounter((prev) => parseFloat((prev + ratingIncrement).toFixed(1)));
      }
    }, ratingDuration / ratingSteps);

    // Animate Project count from 0 to 150
    const projectTarget = 150;
    const projectDuration = 1500;
    const projectSteps = 50;
    const projectIncrement = Math.ceil(projectTarget / projectSteps);
    let currentProjectStep = 0;

    const projectTimer = setInterval(() => {
      currentProjectStep++;
      if (currentProjectStep >= projectSteps) {
        setProjectCounter(projectTarget);
        clearInterval(projectTimer);
      } else {
        setProjectCounter((prev) => Math.min(prev + projectIncrement, projectTarget));
      }
    }, projectDuration / projectSteps);

    return () => {
      clearInterval(ratingTimer);
      clearInterval(projectTimer);
    };
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? reviewsList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === reviewsList.length - 1 ? 0 : prev + 1));
  };

  const activeTest = reviewsList[activeIndex] || TESTIMONIALS[0];

  return (
    <section id="testimonials" className="py-24 bg-slate-950 text-white relative border-t border-slate-900 overflow-hidden">
      {/* Light ambiance effects */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto" id="testimonials-header-container">
          <h2 className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold mb-3">
            VERIFIED ADVOCACY
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight">
            Loved by Businesses Globally
          </p>
          <div className="h-1.5 w-16 bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
          <p className="text-slate-400 mt-5 text-base font-light leading-relaxed">
            Every rating is verified, coming directly from active spreadsheet users and business owners. We maintain a zero-fake-rating database policy.
          </p>
        </div>

        {/* TRUST SECTION BENTO GRID: STATS & CAROUSEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* STATS PANEL WITH ANIMATED COUNTER */}
          <div className="lg:col-span-4 bg-slate-900/40 border border-slate-850 p-6 sm:p-8 rounded-3xl backdrop-blur-md flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-1 text-xs font-mono text-cyan-400 uppercase bg-slate-950/60 border border-slate-850 px-3 py-1.5 rounded-full w-fit">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Trust Engine</span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">AVERAGE CLIENT RATING</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-extrabold text-white tracking-tight">{ratingCounter.toFixed(1)}</span>
                  <span className="text-xl text-slate-400 font-light">/ 5.0</span>
                </div>
                <div className="flex items-center space-x-1 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs font-mono text-slate-400 ml-1.5">({reviewsList.length} reviews log)</span>
                </div>
              </div>

              <div className="border-t border-slate-850/60 pt-6">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">TOTAL PRODUCTS EXECUTED</span>
                <span className="text-4xl font-extrabold text-cyan-400 tracking-tight">{projectCounter}+</span>
                <p className="text-xs text-slate-450 font-light mt-1.5 leading-relaxed">
                  Consisting of customized visual websites, formulas sheets, automatic rosters, and smart CRM platforms.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenReviews}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-450 transition-all shadow-md hover:shadow-cyan-500/10 active:scale-95"
            >
              <PenTool className="w-4 h-4" />
              <span>Write & Browse Reviews</span>
            </button>
          </div>

          {/* ACTIVE TESTIMONIAL SCROLLING SLIDER CAROUSEL */}
          <div 
            className="lg:col-span-8 relative bg-slate-900/40 border border-slate-850 p-8 sm:p-12 rounded-3xl shadow-2xl backdrop-blur-md flex flex-col justify-between"
            id="testimonials-carousel"
          >
            {/* Accent quote icons */}
            <div className="absolute top-6 left-6 text-slate-800 pointer-events-none">
              <Quote className="w-16 h-16 rotate-180 opacity-20" />
            </div>

            <div className="flex flex-col space-y-6 relative z-10 my-auto">
              {/* Stars rating */}
              <div className="flex items-center space-x-1" id="stars-container">
                {Array.from({ length: activeTest?.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Title if exists */}
              {activeTest?.title && (
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {activeTest.title}
                </h3>
              )}

              {/* Content review */}
              <p className="text-base sm:text-lg text-slate-250 font-light leading-relaxed italic">
                "{activeTest?.content || activeTest?.review}"
              </p>

              {/* Author info */}
              <div className="flex items-center space-x-3 pt-4">
                <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                  {activeTest?.image ? (
                    <img src={activeTest.image} alt={activeTest.name} className="w-full h-full object-cover" />
                  ) : (
                    <Award className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">{activeTest?.name}</span>
                  <span className="text-[11px] text-slate-450 font-mono mt-0.5 block">
                    {activeTest?.role || 'Verified Client'} • <span className="text-cyan-400 font-semibold">{activeTest?.company || 'Private Practice'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mt-10 border-t border-slate-850/60 pt-6">
              <div className="flex items-center space-x-1" id="testimonial-dots">
                {reviewsList.slice(0, 5).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeIndex === idx ? 'bg-cyan-400 w-5' : 'bg-slate-800'
                    }`}
                    aria-label={`Slide to review ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700 transition-all active:scale-95"
                  aria-label="Previous Review"
                  id="testimonial-prev-btn"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={handleNext}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700 transition-all active:scale-95"
                  aria-label="Next Review"
                  id="testimonial-next-btn"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
