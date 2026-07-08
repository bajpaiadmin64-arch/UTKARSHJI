import React, { useState, useEffect } from 'react';
import { 
  Globe, Database, Award, Users, ShieldCheck, Zap, Instagram, Github, Linkedin, 
  Edit3, Camera, UploadCloud, X, Save, Loader2, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const founderImg = "/src/assets/images/founder_headshot_1783524077102.jpg";
const logoImg = "/src/assets/images/ub_logo_1783522166217.jpg";

export default function About() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    clients: 0,
    years: 0,
    support: '24/7'
  });

  // Dynamic Founder State
  const [founder, setFounder] = useState({
    name: "Utkarsh Bajpai",
    role: "Founder & Chief Architect",
    instagram: "https://www.instagram.com/utkarsh____bajpai____?igsh=NHpyMXIwMmdkN3Fq",
    github: "https://github.com/utkarshbajpai",
    linkedin: "https://linkedin.com/in/utkarshbajpai",
    bio: "U B Web Developer was built on a core philosophy: software should be incredibly elegant, mathematically precise, and designed strictly to solve human problems. Whether we are hand-crafting visual web frameworks or programming elite data automation pipes, our target is unmatched user experience and high business leverage.",
    secondaryBio: "Under Utkarsh's leadership, our team has executed over 150 digital products spanning interactive client hubs, business portals, data analysis frameworks, and custom automation architectures for elite partners globally.",
    imageUrl: founderImg
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    role: "",
    instagram: "",
    github: "",
    linkedin: "",
    bio: "",
    secondaryBio: "",
    fileData: ""
  });
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchFounderDetails = async () => {
    try {
      const res = await fetch('/api/founder');
      if (res.ok) {
        const data = await res.json();
        setFounder(data);
      }
    } catch (err) {
      console.error("Failed to fetch founder profile:", err);
    }
  };

  useEffect(() => {
    fetchFounderDetails();
  }, []);

  const handleOpenEdit = () => {
    setEditForm({
      name: founder.name,
      role: founder.role,
      instagram: founder.instagram,
      github: founder.github,
      linkedin: founder.linkedin,
      bio: founder.bio,
      secondaryBio: founder.secondaryBio,
      fileData: ""
    });
    setImagePreview(founder.imageUrl);
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG/JPG).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Image size exceeds 8MB. Please select a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setEditForm(prev => ({ ...prev, fileData: base64 }));
    };
    reader.onerror = () => {
      setError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveFounder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem('ub_auth_token');
    try {
      const res = await fetch('/api/founder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile.");
      }

      setFounder(data.founder);
      setSuccess("Founder profile updated successfully!");
      setTimeout(() => {
        setIsEditing(false);
      }, 1200);
    } catch (err: any) {
      setError(err.message || "An error occurred while saving profile.");
    } finally {
      setSaving(false);
    }
  };

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

        {/* Meet the Founder Section */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-850 p-8 sm:p-12 rounded-3xl mb-16 relative overflow-hidden" id="meet-the-founder">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          {isAdmin && (
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={handleOpenEdit}
                className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900/90 border border-cyan-500/30 text-cyan-400 hover:text-white hover:bg-cyan-950/40 hover:border-cyan-400 rounded-xl transition-all shadow-md active:scale-95 text-xs font-mono"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Founder Profile</span>
              </button>
            </div>
          )}
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Founder Image & Social Handles */}
            <div className="md:col-span-4 flex flex-col items-center text-center">
              <div className="relative group mb-5">
                {/* Glowing border ring */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 blur-md opacity-75 group-hover:opacity-100 group-hover:blur-lg transition-all duration-300"></div>
                {/* Image holder */}
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-slate-850 bg-slate-950 flex items-center justify-center p-3">
                  <img 
                    src={logoImg} 
                    alt="U B Web Developer Logo" 
                    className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Founder Name & Role */}
              <h4 className="text-xl font-bold tracking-tight text-white mb-1">
                {founder.name}
              </h4>
              <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-4">
                {founder.role}
              </p>

              {/* Social Channels with interactive hover designs */}
              <div className="flex items-center justify-center space-x-4">
                {founder.instagram && (
                  <a 
                    href={founder.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-400 hover:text-pink-500 hover:border-pink-500/50 hover:bg-pink-950/20 active:scale-95 transition-all duration-300"
                    title="Instagram Profile"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {founder.github && (
                  <a 
                    href={founder.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-white/50 hover:bg-slate-800/40 active:scale-95 transition-all duration-300"
                    title="GitHub Profile"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {founder.linkedin && (
                  <a 
                    href={founder.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-400 hover:text-blue-400 hover:border-blue-400/50 hover:bg-blue-950/20 active:scale-95 transition-all duration-300"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Founder Narrative Bio */}
            <div className="md:col-span-8 flex flex-col justify-center">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2 font-semibold">
                LEADERSHIP MESSAGE
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
                Powering Precision Web Craftsmanship
              </h3>
              <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed mb-4">
                "{founder.bio}"
              </p>
              <p className="text-slate-400 text-sm font-light leading-relaxed mb-6">
                {founder.secondaryBio}
              </p>

              {/* Core Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 bg-slate-900/50 border border-slate-900/60 p-4 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2"></div>
                  <div>
                    <h5 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">Engineering Quality</h5>
                    <p className="text-xs text-slate-450 font-light mt-1">Refined, production-ready fullstack architectures adhering to top standards.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 bg-slate-900/50 border border-slate-900/60 p-4 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2"></div>
                  <div>
                    <h5 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">Data-Driven Solutions</h5>
                    <p className="text-xs text-slate-450 font-light mt-1">Deep-seated analytical systems that simplify complex workflows.</p>
                  </div>
                </div>
              </div>
            </div>
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

        {/* Administrator Founder Profile Editor Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-850 rounded-2xl shadow-2xl shadow-cyan-950/20 overflow-hidden my-8">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-850 bg-slate-900/50">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <h3 className="text-lg font-bold text-white tracking-tight">Edit Founder Profile</h3>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveFounder} className="p-6 space-y-6">
                {/* Notifications */}
                {error && (
                  <div className="flex items-start space-x-2.5 p-3.5 bg-red-950/30 border border-red-500/30 rounded-xl text-red-200 text-sm">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-start space-x-2.5 p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-200 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Identity Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                      Founder Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 font-sans text-sm text-white rounded-xl py-2.5 px-4 outline-none transition-colors"
                      placeholder="Utkarsh Bajpai"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                      Founder Title / Role
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.role}
                      onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 font-sans text-sm text-white rounded-xl py-2.5 px-4 outline-none transition-colors"
                      placeholder="Founder & Chief Architect"
                    />
                  </div>
                </div>

                {/* Social URL Inputs */}
                <div className="space-y-3">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                    Social Media Profile Handles & Links
                  </label>
                  
                  <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-1">
                    <Instagram className="w-5 h-5 text-pink-500 shrink-0" />
                    <input
                      type="url"
                      value={editForm.instagram}
                      onChange={(e) => setEditForm(prev => ({ ...prev, instagram: e.target.value }))}
                      className="w-full bg-transparent border-0 font-sans text-sm text-white py-2 focus:ring-0 outline-none"
                      placeholder="Instagram URL (e.g., https://instagram.com/your_handle)"
                    />
                  </div>

                  <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-1">
                    <Github className="w-5 h-5 text-slate-200 shrink-0" />
                    <input
                      type="url"
                      value={editForm.github}
                      onChange={(e) => setEditForm(prev => ({ ...prev, github: e.target.value }))}
                      className="w-full bg-transparent border-0 font-sans text-sm text-white py-2 focus:ring-0 outline-none"
                      placeholder="GitHub Profile URL"
                    />
                  </div>

                  <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-1">
                    <Linkedin className="w-5 h-5 text-blue-400 shrink-0" />
                    <input
                      type="url"
                      value={editForm.linkedin}
                      onChange={(e) => setEditForm(prev => ({ ...prev, linkedin: e.target.value }))}
                      className="w-full bg-transparent border-0 font-sans text-sm text-white py-2 focus:ring-0 outline-none"
                      placeholder="LinkedIn Profile URL"
                    />
                  </div>
                </div>

                {/* Message/Bio Textarea */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                    Founder Quote / Message
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 font-sans text-sm text-white rounded-xl py-2.5 px-4 outline-none transition-colors resize-none"
                    placeholder="Provide a quote reflecting the philosophy of U B Web Developer..."
                  />
                </div>

                {/* Secondary bio narrative */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                    Secondary Narrative / Achievements
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.secondaryBio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, secondaryBio: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 font-sans text-sm text-white rounded-xl py-2.5 px-4 outline-none transition-colors resize-none"
                    placeholder="Provide detailed narrative history or achievements..."
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-850">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/10 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Profiles...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
