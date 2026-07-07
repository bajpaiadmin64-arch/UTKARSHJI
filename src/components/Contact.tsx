import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, Send, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const phone = '7706929484';
  const email = 'utkarshbajpai025@gmail.com';
  const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(
    "Hi U B Web Developer, I'm interested in your design and Excel services!"
  )}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending email log on backend
    setTimeout(() => {
      console.log(`
========================================================================
[EMAIL SENT TO utkarshbajpai025@gmail.com]
Subject: CONTACT FORM INQUIRY - ${formData.subject}
From: ${formData.name} (${formData.email})
Message: ${formData.message}
========================================================================
      `);
      setLoading(false);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  return (
    <section id="contact" className="py-24 bg-slate-950 text-white relative border-t border-slate-900">
      <div className="absolute top-10 right-1/4 w-80 h-80 bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="contact-header-container">
          <h2 className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold mb-3">
            GET IN TOUCH
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight">
            Initiate Your Project Discussion
          </p>
          <div className="h-1.5 w-16 bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Panel: Contact Links & Map */}
          <div className="lg:col-span-5 space-y-6" id="contact-details-panel">
            {/* Direct communication buttons card */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-850 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              <h3 className="text-lg font-bold text-white mb-6">Direct Channels</h3>

              <div className="space-y-4">
                {/* Whatsapp trigger */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 bg-emerald-950/40 border border-emerald-900/60 hover:bg-emerald-900/40 p-4 rounded-2xl transition-all duration-200 group"
                  id="contact-whatsapp"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5 text-slate-950 fill-slate-950" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase tracking-wider">
                      WhatsApp Chat
                    </span>
                    <span className="text-sm font-bold text-slate-200 block mt-0.5">Click to Text Instantly</span>
                  </div>
                </a>

                {/* Call trigger */}
                <a
                  href={`tel:+91${phone}`}
                  className="flex items-center space-x-4 bg-cyan-950/40 border border-cyan-900/60 hover:bg-cyan-900/40 p-4 rounded-2xl transition-all duration-200 group"
                  id="contact-call"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold block uppercase tracking-wider">
                      Phone Line
                    </span>
                    <span className="text-sm font-bold text-slate-200 block mt-0.5">+91 {phone}</span>
                  </div>
                </a>

                {/* Email trigger */}
                <a
                  href={`mailto:${email}`}
                  className="flex items-center space-x-4 bg-purple-950/40 border border-purple-900/60 hover:bg-purple-900/40 p-4 rounded-2xl transition-all duration-200 group"
                  id="contact-email"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 font-bold block uppercase tracking-wider">
                      Support Email
                    </span>
                    <span className="text-sm font-bold text-slate-200 block mt-0.5">{email}</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Dark Styled Google Maps Placeholder */}
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-3xl relative overflow-hidden h-60 flex flex-col justify-between" id="maps-placeholder">
              {/* Maps grid vector look */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-40"></div>
              {/* Glowing location ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/50 flex items-center justify-center animate-ping"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-slate-900 shadow-lg absolute"></div>
              </div>

              <div className="relative z-10 font-mono text-[9px] uppercase text-slate-500">
                <span>GEO-LOCATION MATRIX</span>
              </div>

              <div className="relative z-10 text-center font-mono space-y-1">
                <span className="text-xs font-bold text-slate-300 block">Uttar Pradesh, India</span>
                <span className="text-[9px] text-slate-500 block">Serving clients worldwide remotely</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Interactive Contact Form */}
          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-850 p-6 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-md relative">
            <h3 className="text-xl font-bold text-white mb-6">Drop Us a Message</h3>

            {success ? (
              <div className="border border-emerald-500/30 bg-slate-950/40 p-8 rounded-2xl text-center space-y-4" id="contact-success">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Inquiry Sent Successfully!</h4>
                <p className="text-xs text-slate-400 font-light max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. Your message is recorded and dispatched. Utkarsh will get back to you via your email address within 12 hours.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4" id="contact-inquiry-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. David K."
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Your Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. david@example.com"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Website development consultation"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Inquiry Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about pages, custom spreadsheets, budgets, deadlines or integrations you want..."
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-900 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl text-xs font-semibold tracking-wider uppercase text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 transition-all shadow-xl shadow-cyan-500/10"
                    id="contact-submit-btn"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 text-slate-950 animate-spin" />
                        <span>Dispatching Mail...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-slate-950" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
