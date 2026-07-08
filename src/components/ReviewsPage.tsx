import React, { useState, useEffect, useRef } from 'react';
import { Star, Upload, Search, Filter, ShieldCheck, Check, Loader2, ArrowLeft, MessageSquare, Heart, Globe, Calendar, AlertTriangle } from 'lucide-react';

interface ReviewsPageProps {
  onClose: () => void;
}

export default function ReviewsPage({ onClose }: ReviewsPageProps) {
  // Form state
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [country, setCountry] = useState('India');
  const [image, setImage] = useState<string>('');
  const [fileLoading, setFileLoading] = useState(false);

  // App state
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStars, setSelectedStars] = useState<number | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load reviews from backend
  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // SEO Schema Markup Injection
  useEffect(() => {
    const existingSchema = document.getElementById('seo-reviews-schema');
    if (existingSchema) existingSchema.remove();

    if (reviews.length > 0) {
      const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
      const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "U B Web Developer Custom Code & Automation Services",
        "image": "https://www.ubwebdeveloper.com/assets/logo.png",
        "description": "Elite Web Development, custom templates, BHIM payments automation, and high-performance Excel dashboard services.",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": avg.toFixed(1),
          "bestRating": "5",
          "worstRating": "1",
          "ratingCount": reviews.length.toString()
        },
        "review": reviews.slice(0, 10).map((r) => ({
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": r.name
          },
          "datePublished": r.createdAt ? r.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          "reviewBody": r.review,
          "name": r.title,
          "reviewRating": {
            "@type": "Rating",
            "bestRating": "5",
            "ratingValue": r.rating.toString(),
            "worstRating": "1"
          }
        }))
      };

      const script = document.createElement('script');
      script.id = 'seo-reviews-schema';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [reviews]);

  // Image Upload helper (Base64 conversion)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Avatar image must be under 2MB.');
        return;
      }
      setFileLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setFileLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Form validation
    if (!name.trim()) return setErrorMsg('Please enter your name.');
    if (!title.trim()) return setErrorMsg('Please write a brief summary title.');
    if (!review.trim() || review.length < 15) return setErrorMsg('Review body must contain at least 15 characters.');
    if (!country.trim()) return setErrorMsg('Please enter your country.');

    setSubmitting(true);
    try {
      const payload = {
        name,
        company,
        rating,
        title,
        review,
        image,
        country
      };

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Review submission failed.');

      setSuccessMsg('Thank you! Your feedback has been safely submitted. To maintain the absolute integrity of our verified reviews engine, it will appear public once approved by the administrator.');
      
      // Reset form fields
      setName('');
      setCompany('');
      setRating(5);
      setTitle('');
      setReview('');
      setImage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during review submission.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter & Search Logic
  const filteredReviews = reviews.filter((r) => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.review.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.company && r.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRating = selectedStars === 'all' || r.rating === selectedStars;

    return matchesSearch && matchesRating;
  });

  // Pagination bounds
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <button 
            onClick={onClose}
            className="flex items-center space-x-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors py-2 px-3 bg-slate-900 rounded-xl border border-slate-850"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Agency Workspace</span>
          </button>
          
          <div className="text-right sm:text-right">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Client Satisfaction Hub</h1>
            <p className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-widest">
              100% Verified Customer Advocacy Log
            </p>
          </div>
        </div>

        {/* Success / Error Banners */}
        {successMsg && (
          <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 p-5 rounded-2xl flex items-start space-x-3 text-sm animate-fadeIn">
            <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{successMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: SUBMISSION FORM */}
          <div className="lg:col-span-5 bg-slate-900/40 border border-slate-850 p-6 sm:p-8 rounded-3xl backdrop-blur-md space-y-6">
            <div>
              <h2 className="text-lg font-bold flex items-center space-x-2 text-slate-200">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <span>Submit Your Feedback</span>
              </h2>
              <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-wider">
                Real feedback only • Saved permanently
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Name & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Name *</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ramesh Sharma" 
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Company (Optional)</label>
                  <input 
                    type="text" 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Tech Solutions" 
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Rating Star Selection */}
              <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Rating Scale *</label>
                <div className="flex items-center space-x-2 mt-1">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform active:scale-95"
                    >
                      <Star 
                        className={`w-6 h-6 transition-colors ${
                          (hoverRating || rating) >= starValue 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-slate-600'
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-slate-400 ml-2">({rating} / 5 stars)</span>
                </div>
              </div>

              {/* Country & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Country *</label>
                  <input 
                    type="text" 
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. India" 
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Review Title *</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Outstanding Code Quality!" 
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Review Message */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Review Message * (Min 15 chars)</label>
                <textarea 
                  required
                  rows={4}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share details of your experience working with Utkarsh Bajpai. Mention responsiveness, execution layout precision, or dashboard capabilities..." 
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono focus:border-cyan-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Optional Profile Photo Avatar Base64 */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Avatar Image (Optional)</label>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                    {image ? (
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Globe className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-lg text-xs font-mono transition-colors text-slate-300"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{fileLoading ? 'Reading...' : 'Upload Avatar'}</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden" 
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="text-red-400 text-xs font-mono bg-red-950/20 border border-red-900/40 p-3 rounded-lg flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Submitting Log...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Submit Verified Review</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT VIEWPORT: PUBLIC APPROVED REVIEWS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Search, Filter star controls */}
            <div className="bg-slate-900/20 border border-slate-850 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search reviews..." 
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-mono text-slate-400">Stars:</span>
                <select 
                  value={selectedStars}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedStars(val === 'all' ? 'all' : parseInt(val, 10));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-300 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars only</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>

            {/* Public Review Cards list */}
            {loading ? (
              <div className="py-24 text-center space-y-3 font-mono text-xs text-slate-500 flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <span>Reading Verified Database Ledger...</span>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-slate-850 rounded-3xl p-6 text-slate-500">
                <Star className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-xs font-mono">No approved reviews matched your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paginatedReviews.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-slate-900/30 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all shadow-md group relative"
                  >
                    {item.pinned && (
                      <span className="absolute top-3 right-3 bg-cyan-950 border border-cyan-800/40 text-[8px] font-mono text-cyan-400 font-bold px-1.5 py-0.5 rounded">
                        PINNED
                      </span>
                    )}

                    <div className="space-y-3">
                      {/* Rating stars & Date */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${
                                i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'
                              }`} 
                            />
                          ))}
                        </div>
                        <div className="flex items-center space-x-1 text-[9px] font-mono text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-600" />
                          <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-slate-400 font-light mt-1.5 leading-relaxed italic">
                          "{item.review}"
                        </p>
                      </div>
                    </div>

                    {/* Author footer */}
                    <div className="flex items-center space-x-3 pt-4 mt-4 border-t border-slate-900/60">
                      <div className="w-9 h-9 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-mono font-bold text-cyan-400">
                            {item.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-white truncate">{item.name}</span>
                          <span className="bg-cyan-950 text-cyan-400 rounded-full p-0.5" title="Verified Client">
                            <Check className="w-2.5 h-2.5 stroke-[4]" />
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block truncate">
                          {item.company || 'Private Client'} • <span className="text-slate-400">{item.country}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 pt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-xs font-mono text-slate-300 rounded-lg disabled:opacity-40 transition-all"
                >
                  Prev
                </button>
                <span className="text-xs font-mono text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-xs font-mono text-slate-300 rounded-lg disabled:opacity-40 transition-all"
                >
                  Next
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
