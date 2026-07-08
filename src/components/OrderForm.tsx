import React, { useState, useEffect, useRef } from 'react';
import { Upload, ShieldCheck, CheckCircle2, AlertTriangle, Loader2, ListOrdered, ClipboardList, Clock, RefreshCw, CreditCard, MessageSquare, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface OrderFormProps {
  selectedService: string;
  onOrderSuccess: (orderId: string, amount: string) => void;
}

export default function OrderForm({ selectedService, onOrderSuccess }: OrderFormProps) {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    whatsApp: '',
    serviceRequired: '',
    budget: '',
    deadline: '',
    projectDescription: '',
    referenceUrl: '',
    additionalNotes: '',
  });

  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  // Order history state
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user profile details into the form once they are authenticated
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: userProfile?.fullName || currentUser.displayName || '',
        email: userProfile?.email || currentUser.email || '',
        phone: userProfile?.phone || '',
        whatsApp: userProfile?.whatsApp || '',
        companyName: userProfile?.companyName || '',
      }));
    }
  }, [currentUser, userProfile]);

  // Sync sameAsPhone checkbox
  useEffect(() => {
    if (sameAsPhone && formData.phone) {
      setFormData((prev) => ({ ...prev, whatsApp: prev.phone }));
    }
  }, [sameAsPhone, formData.phone]);

  // Load user orders history if authenticated
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      return;
    }

    setLoadingOrders(true);

    const fetchMyOrders = async () => {
      const token = localStorage.getItem('ub_auth_token');
      if (!token) {
        setLoadingOrders(false);
        return;
      }

      try {
        const res = await fetch('/api/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        } else {
          console.error('Failed to fetch orders from backend');
        }
      } catch (err) {
        console.error('Fetch my orders error:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchMyOrders();
    // Refresh client orders every 10 seconds
    const interval = setInterval(fetchMyOrders, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Synchronize incoming selected service from parent components
  useEffect(() => {
    if (selectedService) {
      let mappedService = selectedService;
      if (selectedService.includes('Basic')) mappedService = 'Basic Website';
      else if (selectedService.includes('Business')) mappedService = 'Business Website';
      else if (selectedService.includes('Premium')) mappedService = 'Custom Website';
      else if (selectedService.includes('Formula')) mappedService = 'Custom Website';
      else if (selectedService.includes('KPI')) mappedService = 'Custom Website';
      else if (selectedService.includes('Automation')) mappedService = 'Custom Website';

      // Map to standard dropdown selections if possible
      const validOptions = [
        'Landing Page',
        'Business Website',
        'Ecommerce Website',
        'Portfolio Website',
        'Website Redesign',
        'Website Maintenance',
        'Custom Website'
      ];

      const found = validOptions.find(opt => mappedService.toLowerCase().includes(opt.toLowerCase()) || opt.toLowerCase().includes(mappedService.toLowerCase()));
      const selection = found || 'Custom Website';

      setFormData((prev) => ({ ...prev, serviceRequired: selection }));

      // Estimate budget
      if (selectedService.includes('Basic')) setFormData((p) => ({ ...p, budget: '₹499' }));
      else if (selectedService.includes('Business')) setFormData((p) => ({ ...p, budget: '₹999' }));
      else if (selectedService.includes('Premium')) setFormData((p) => ({ ...p, budget: '₹1299' }));
      else if (selectedService.includes('Formula')) setFormData((p) => ({ ...p, budget: '₹349' }));
      else if (selectedService.includes('KPI')) setFormData((p) => ({ ...p, budget: '₹699' }));
      else if (selectedService.includes('Automation')) setFormData((p) => ({ ...p, budget: '₹999' }));
    }
  }, [selectedService]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'phone' && sameAsPhone) {
      setFormData((prev) => ({ ...prev, whatsApp: value }));
    }
  };

  // Convert File to base64
  const processFile = (selectedFile: File) => {
    if (selectedFile.size > 20 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 20MB limit. Please upload a smaller reference file.');
      return;
    }
    setErrorMsg('');
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFileBase64(base64String);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Function to format and trigger WhatsApp communication
  const triggerWhatsAppRedirect = (orderId: string, oData: typeof formData) => {
    const waNumber = '7706929484';
    const message = `Hello Utkarsh, I have submitted a project inquiry!

*Order ID:* ${orderId}
*Name:* ${oData.fullName}
*Business Name:* ${oData.companyName || 'None'}
*Email:* ${oData.email}
*Mobile:* ${oData.phone}
*WhatsApp:* ${oData.whatsApp}
*Service Required:* ${oData.serviceRequired}
*Budget:* ${oData.budget}
*Timeline:* ${oData.deadline}
*Reference URL:* ${oData.referenceUrl || 'None'}

*Description:*
${oData.projectDescription}`;

    const encodedMsg = encodeURIComponent(message);
    const waUrl = `https://wa.me/91${waNumber}?text=${encodedMsg}`;
    
    // Attempt window.open, fallback to location change if blocked
    try {
      const win = window.open(waUrl, '_blank');
      if (win) win.focus();
      else window.location.href = waUrl;
    } catch (e) {
      window.location.href = waUrl;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Strict Field Validation
    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your Full Name.');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMsg('Please enter a valid Email Address.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Mobile Number.');
      return;
    }
    if (!formData.whatsApp.trim() || formData.whatsApp.length < 10) {
      setErrorMsg('Please enter a valid 10-digit WhatsApp Number.');
      return;
    }
    if (!formData.serviceRequired) {
      setErrorMsg('Please select the Service Required.');
      return;
    }
    if (!formData.budget.trim()) {
      setErrorMsg('Please specify your project Budget.');
      return;
    }
    if (!formData.deadline.trim()) {
      setErrorMsg('Please specify your Preferred Delivery Time.');
      return;
    }
    if (!formData.projectDescription.trim()) {
      setErrorMsg('Please describe your Project Requirements.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('You must agree to the service terms and conditions to proceed.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        fileName: file ? file.name : null,
        fileData: fileBase64 || null,
        userId: currentUser ? currentUser.uid : 'guest'
      };

      // Submit to backend server (which generates sequential ID and stores in Firestore)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server rejected submission');
      }

      // Store success order metadata
      setSuccessOrder(data.order);
      
      // Trigger parent handler to synchronize payments widget
      onOrderSuccess(data.order.id, formData.budget);

      // Instantly fire WhatsApp communication
      triggerWhatsAppRedirect(data.order.id, formData);

      // Reset form variables
      setFormData((prev) => ({
        ...prev,
        serviceRequired: '',
        budget: '',
        deadline: '',
        projectDescription: '',
        referenceUrl: '',
        additionalNotes: '',
      }));
      setFile(null);
      setFileBase64('');
      setAgreeTerms(false);
      setSameAsPhone(false);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during submission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayClick = (order: any) => {
    onOrderSuccess(order.id, order.budget || 'Flexible');
    const paymentSection = document.getElementById('payment');
    if (paymentSection) {
      paymentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetForm = () => {
    setSuccessOrder(null);
  };

  return (
    <section id="order" className="py-24 bg-slate-950 text-white relative border-t border-slate-900">
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in" id="order-header-container">
          <h2 className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold mb-3">
            SECURE PORTAL
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight">
            Professional Lead Management System
          </p>
          <div className="h-1.5 w-16 bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
          <p className="text-slate-400 mt-5 text-base font-light leading-relaxed">
            Fill in your layout specifications or Excel goals below. Our secure Firestore backend will compile your order and dispatch project blueprints immediately to Utkarsh.
          </p>
        </div>

        <div className="space-y-6">
          {/* Navigation Tab (Only show track orders if logged in) */}
          {currentUser && (
            <div className="flex bg-slate-900/40 border border-slate-850 rounded-2xl p-1.5 max-w-sm mx-auto mb-6" id="order-form-history-tabs">
              <button
                onClick={() => {
                  setActiveTab('form');
                  setSuccessOrder(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'form' 
                    ? 'bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border border-cyan-800/40 text-cyan-400' 
                    : 'text-slate-500 hover:text-slate-350'
                }`}
                id="btn-tab-form"
              >
                <ClipboardList className="w-4 h-4" />
                <span>Order Form</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('history');
                  setSuccessOrder(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'history' 
                    ? 'bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border border-cyan-800/40 text-cyan-400' 
                    : 'text-slate-500 hover:text-slate-350'
                }`}
                id="btn-tab-history"
              >
                <ListOrdered className="w-4 h-4" />
                <span>Track Orders ({orders.length})</span>
              </button>
            </div>
          )}

          {/* TAB CONTENT: ORDER HISTORY */}
          {activeTab === 'history' && currentUser && (
            <div className="bg-slate-900/40 border border-slate-850 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-md space-y-6" id="history-container">
              <div className="flex justify-between items-center pb-4 border-b border-slate-850">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Your Project Register</h3>
                  <p className="text-[10px] font-mono text-slate-500">REAL-TIME WORKFLOW SYNCHRONIZATION</p>
                </div>
                <RefreshCw className={`w-4 h-4 text-cyan-400 ${loadingOrders ? 'animate-spin' : ''}`} />
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center text-slate-500 font-mono text-xs flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                  <span>Querying Firestore Cluster...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-850 rounded-2xl p-6 animate-fade-in" id="no-orders-banner">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-xs font-mono text-slate-400">No projects submitted on this profile yet.</p>
                  <button
                    onClick={() => setActiveTab('form')}
                    className="text-xs text-cyan-400 underline mt-2 hover:text-cyan-300 font-mono"
                  >
                    Draft your first requirement profile &gt;&gt;
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" id="orders-history-list">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-slate-950/80 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700/60 transition-all shadow-lg"
                    >
                      <div>
                        {/* Order Card Header */}
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-mono font-bold text-cyan-400">{order.id}</span>
                          <div className="flex flex-col items-end gap-1">
                            {/* Status Badge */}
                            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              order.status === 'completed'
                                ? 'bg-emerald-950/60 border border-emerald-800/40 text-emerald-400'
                                : order.status === 'confirmed'
                                ? 'bg-blue-950/60 border border-blue-800/40 text-blue-400'
                                : 'bg-amber-950/60 border border-amber-800/40 text-amber-400'
                            }`}>
                              {order.status === 'completed' ? 'Completed' : order.status === 'confirmed' ? 'Processing' : 'Awaiting Review'}
                            </span>

                            {/* Payment Status Badge */}
                            <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              order.paymentStatus === 'paid'
                                ? 'bg-emerald-950/40 text-emerald-500'
                                : order.paymentStatus === 'pending_verification'
                                ? 'bg-amber-950/40 text-amber-500'
                                : 'bg-red-950/40 text-red-500'
                            }`}>
                              {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'pending_verification' ? 'Pending Verif' : 'Unpaid'}
                            </span>
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-slate-100 mb-1 line-clamp-1">{order.serviceRequired}</h4>
                        <p className="text-xs text-slate-400 font-light line-clamp-2 mb-3 h-8 leading-relaxed">
                          {order.projectDescription}
                        </p>
                      </div>

                      {/* Order Card Footer */}
                      <div className="border-t border-slate-900/80 pt-3 mt-3 flex justify-between items-center text-[10px] font-mono">
                        <div className="space-y-0.5 text-slate-500">
                          <div>Est. Budget: <span className="text-slate-300 font-bold">{order.budget}</span></div>
                          <div>Submitted: <span className="text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span></div>
                        </div>

                        {order.paymentStatus === 'unpaid' && (
                          <button
                            onClick={() => handlePayClick(order)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-amber-600/15 border border-amber-800/40 hover:border-amber-500 hover:text-white rounded-lg text-amber-400 transition-all font-mono"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay now</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: SUCCESS CARD */}
          {activeTab === 'form' && successOrder && (
            <div
              className="bg-slate-900/60 border border-emerald-500/30 p-8 sm:p-12 rounded-3xl text-center shadow-2xl backdrop-blur-md relative overflow-hidden animate-fade-in"
              id="order-success-card"
            >
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="w-16 h-16 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest block mb-1">
                SUBMISSION REGISTERED SUCCESSFULLY
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                Order ID: <span className="text-cyan-400 font-mono">{successOrder.id}</span>
              </h3>
              
              <div className="max-w-xl mx-auto space-y-2 mt-4 mb-6">
                <p className="text-base text-emerald-300/90 font-medium">
                  We have received your request.
                </p>
                <p className="text-sm text-slate-350 font-light leading-relaxed">
                  Our core solutions architecture team is reviewing your project requirements. We will contact you within 24 hours to proceed with implementation layouts.
                </p>
              </div>

              <div className="my-6 bg-slate-950/60 border border-slate-850 p-6 rounded-2xl max-w-md mx-auto text-left space-y-2.5 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Service Required:</span>
                  <span className="text-slate-200 font-bold text-right">{successOrder.serviceRequired}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Est. Budget:</span>
                  <span className="text-emerald-400 font-bold">{successOrder.budget}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Delivery Timeline:</span>
                  <span className="text-cyan-400 font-bold">{successOrder.deadline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference File:</span>
                  <span className="text-slate-400 truncate max-w-[180px]">{successOrder.fileName || 'None'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mt-8">
                <button
                  onClick={() => triggerWhatsAppRedirect(successOrder.id, successOrder)}
                  className="flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl text-sm font-semibold tracking-wide text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-lg shadow-emerald-950/40"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </button>
                <button
                  onClick={handleResetForm}
                  className="flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl text-sm font-semibold tracking-wide text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-850 active:scale-95 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: ORDER PLACEMENT FORM */}
          {activeTab === 'form' && !successOrder && (
            <form
              onSubmit={handleSubmit}
              className="bg-slate-900/40 border border-slate-850 p-6 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-md space-y-6 animate-fade-in"
              id="client-order-form"
            >
              {/* Header chip */}
              <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono uppercase bg-slate-950/60 border border-slate-850 px-3.5 py-1.5 rounded-full w-fit">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Secure Firestore Submission Framework</span>
              </div>

              {/* Error panel */}
              {errorMsg && (
                <div className="flex items-start space-x-2.5 bg-red-950/40 border border-red-800/40 p-4 rounded-xl text-red-400 text-xs sm:text-sm animate-shake">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form Row 1: Full Name & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider block">
                    Full Name <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500 transition-colors"
                    id="order-fullName"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider block">
                    Business Name <span className="text-slate-600">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="e.g. Sharma Logistics Corp"
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500 transition-colors"
                    id="order-companyName"
                  />
                </div>
              </div>

              {/* Form Row 2: Email, Phone, WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider block">
                    Email Address <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. client@example.com"
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500 transition-colors"
                    id="order-email"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider block">
                    Mobile Number <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500 transition-colors"
                    id="order-phone"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                      WhatsApp Number <span className="text-cyan-400">*</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsPhone}
                        onChange={(e) => setSameAsPhone(e.target.checked)}
                        className="rounded border-slate-800 text-cyan-500 focus:ring-0 w-3 h-3 bg-slate-950"
                      />
                      <span className="text-[10px] font-mono text-slate-400">Same as Mobile</span>
                    </label>
                  </div>
                  <input
                    type="tel"
                    name="whatsApp"
                    required
                    disabled={sameAsPhone}
                    value={formData.whatsApp}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500 transition-colors ${
                      sameAsPhone ? 'opacity-50 border-slate-900 cursor-not-allowed' : 'border-slate-800/80'
                    }`}
                    id="order-whatsApp"
                  />
                </div>
              </div>

              {/* Form Row 3: Service required dropdown, budget, timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider block">
                    Service Required <span className="text-cyan-400">*</span>
                  </label>
                  <select
                    name="serviceRequired"
                    required
                    value={formData.serviceRequired}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors"
                    id="order-serviceRequired"
                  >
                    <option value="" disabled>-- Select Service --</option>
                    <option value="Landing Page">Landing Page</option>
                    <option value="Business Website">Business Website</option>
                    <option value="Ecommerce Website">Ecommerce Website</option>
                    <option value="Portfolio Website">Portfolio Website</option>
                    <option value="Website Redesign">Website Redesign</option>
                    <option value="Website Maintenance">Website Maintenance</option>
                    <option value="Custom Website">Custom Website</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider block">
                    Estimated Budget <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="budget"
                    required
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="e.g. ₹999 or Flexible"
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500 transition-colors"
                    id="order-budget"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider block">
                    Preferred Delivery Time <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="deadline"
                    required
                    value={formData.deadline}
                    onChange={handleInputChange}
                    placeholder="e.g. 5 Days or urgent"
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500 transition-colors"
                    id="order-deadline"
                  />
                </div>
              </div>

              {/* Form Row 4: Reference Website URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider block">
                  Reference Website URL <span className="text-slate-600">(Optional)</span>
                </label>
                <input
                  type="url"
                  name="referenceUrl"
                  value={formData.referenceUrl}
                  onChange={handleInputChange}
                  placeholder="e.g. https://example.com/great-design"
                  className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500 transition-colors"
                  id="order-referenceUrl"
                />
              </div>

              {/* Form Row 5: Project Description */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                    Project Description <span className="text-cyan-400">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">Please describe pages, visual accents, content details...</span>
                </div>
                <textarea
                  name="projectDescription"
                  required
                  rows={5}
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  placeholder="Describe your design goals, required pages, reference features, desired animations..."
                  className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500 transition-colors"
                  id="order-projectDescription"
                />
              </div>

              {/* Form Row 6: Secure File Upload (Drag and Drop / Manual select) */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                  File Upload <span className="text-slate-650">(Images / PDF / DOC / ZIP - Max 20MB)</span>
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-cyan-400 bg-cyan-950/20 shadow-lg'
                      : file
                      ? 'border-emerald-500/50 bg-emerald-950/10'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                  }`}
                  id="order-file-dropzone"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".xlsx,.xls,.zip,.rar,.pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                  />
                  <Upload className={`w-10 h-10 mx-auto mb-3 ${file ? 'text-emerald-400' : 'text-slate-500'}`} />

                  {file ? (
                    <div className="space-y-1 font-mono">
                      <span className="text-xs text-slate-200 font-bold block">{file.name}</span>
                      <span className="text-[10px] text-slate-500 block">
                        Size: {Math.round(file.size / 1024)} KB — Click to change reference file
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1 font-mono">
                      <span className="text-xs text-slate-300 font-medium block">
                        Drag & Drop raw sheets or specification ZIPs here
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        or click to browse local files manually
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Row 7: Agree to Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 rounded border-slate-800 text-cyan-500 focus:ring-0 w-4 h-4 bg-slate-950"
                    id="order-agreeTerms"
                  />
                  <span className="text-xs text-slate-400 font-mono leading-relaxed select-none">
                    I agree to the Terms of Service. I authorize "U B Web Developer" core operations to securely record these specifications and contact me on WhatsApp for confirmation. <span className="text-cyan-400">*</span>
                  </span>
                </label>
              </div>

              {/* Form Submission Button */}
              <div className="pt-4 border-t border-slate-900 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl text-sm font-semibold tracking-wide text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 transition-all shadow-xl shadow-cyan-500/10 disabled:opacity-50 cursor-pointer"
                  id="order-submit-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 text-slate-950 animate-spin" />
                      <span>Compiling Specifications...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Project Requirements</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
