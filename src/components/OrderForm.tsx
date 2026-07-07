import React, { useState, useEffect, useRef } from 'react';
import { Upload, HelpCircle, ShieldCheck, CheckCircle2, AlertTriangle, Loader2, ListOrdered, ClipboardList, Clock, RefreshCw, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import AuthForm from './AuthForm';

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
    additionalNotes: '',
  });

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

  // Real-time Firestore or Sandbox order history listener
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      return;
    }

    const isSandboxMode = currentUser?.uid === 'admin-sandbox-uid' || currentUser?.uid?.startsWith('user-sandbox-');

    if (isSandboxMode) {
      setLoadingOrders(true);
      const loadSandboxOrders = () => {
        const saved = localStorage.getItem('ub_sandbox_orders');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const filtered = parsed.filter((o: any) => o.userId === currentUser.uid || o.userId === 'admin_direct');
            setOrders(filtered);
          } catch (e) {
            console.error(e);
            setOrders([]);
          }
        } else {
          setOrders([]);
        }
        setLoadingOrders(false);
      };

      loadSandboxOrders();

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'ub_sandbox_orders') {
          loadSandboxOrders();
        }
      };
      window.addEventListener('storage', handleStorageChange);

      const interval = setInterval(loadSandboxOrders, 1000);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    }

    setLoadingOrders(true);
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data()
      }));
      // Sort client-side by date because combined index might not be configured yet, ensuring zero errors
      fetchedOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(fetchedOrders);
      setLoadingOrders(false);
    }, (error) => {
      console.error('Error listening to orders:', error);
      setLoadingOrders(false);
      if (error.code === 'permission-denied') {
        console.warn('Firestore subscription permission denied. Try logging out and logging in to trigger sandbox session.');
      } else {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      }
    });

    return unsubscribe;
  }, [currentUser]);

  // Synchronize incoming selected service from parent callbacks
  useEffect(() => {
    if (selectedService) {
      setFormData((prev) => ({ ...prev, serviceRequired: selectedService }));
      // Attempt to guess budget
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
  };

  // Convert File to base64
  const processFile = (selectedFile: File) => {
    if (selectedFile.size > 20 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 20MB limit. Please upload a smaller draft.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser) {
      setErrorMsg('You must be signed in to submit project parameters.');
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone || !formData.serviceRequired || !formData.projectDescription) {
      setErrorMsg('Please complete all mandatory fields marked with *.');
      return;
    }

    setLoading(true);

    try {
      const orderId = "UB-" + Math.floor(100000 + Math.random() * 900000);
      const createdAt = new Date().toISOString();

      const payload = {
        ...formData,
        id: orderId,
        fileName: file ? file.name : null,
        fileData: fileBase64 || null,
      };

      // 1. Submit to API backend (triggers local state save & logs email)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server rejected order submission');
      }

      // 2. Submit to Firebase Firestore or Local Sandbox storage for persistent storage
      const firestoreOrder = {
        id: orderId,
        userId: currentUser.uid,
        fullName: formData.fullName,
        companyName: formData.companyName || '',
        email: formData.email,
        phone: formData.phone,
        whatsApp: formData.whatsApp || '',
        serviceRequired: formData.serviceRequired,
        budget: formData.budget || 'Flexible',
        deadline: formData.deadline || 'Flexible',
        projectDescription: formData.projectDescription,
        fileName: file ? file.name : null,
        additionalNotes: formData.additionalNotes || '',
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: createdAt
      };

      const isSandboxMode = currentUser?.uid === 'admin-sandbox-uid' || currentUser?.uid?.startsWith('user-sandbox-');

      if (isSandboxMode) {
        const saved = localStorage.getItem('ub_sandbox_orders');
        let sandboxOrders = [];
        if (saved) {
          try {
            sandboxOrders = JSON.parse(saved);
          } catch (e) {
            console.error(e);
          }
        }
        sandboxOrders.unshift(firestoreOrder);
        localStorage.setItem('ub_sandbox_orders', JSON.stringify(sandboxOrders));
        console.log('[SANDBOX SUCCESS] Order saved in local sandbox collection.');
      } else {
        try {
          await setDoc(doc(db, 'orders', orderId), firestoreOrder);
        } catch (err: any) {
          if (err.code === 'permission-denied') {
            console.warn('Firestore permissions denied. Falling back to local sandbox storage.');
            const saved = localStorage.getItem('ub_sandbox_orders') || '[]';
            try {
              const sandboxOrders = JSON.parse(saved);
              sandboxOrders.unshift(firestoreOrder);
              localStorage.setItem('ub_sandbox_orders', JSON.stringify(sandboxOrders));
            } catch (e) {
              console.error(e);
            }
          } else {
            handleFirestoreError(err, OperationType.WRITE, `orders/${orderId}`);
          }
        }
      }

      // Successfully saved
      setSuccessOrder(firestoreOrder);
      
      // Trigger parent handler to auto-populate payment desk with this Order ID
      onOrderSuccess(orderId, formData.budget || 'Flexible');

      // Clear layout-specific fields, retaining user profile fields
      setFormData((prev) => ({
        ...prev,
        serviceRequired: '',
        budget: '',
        deadline: '',
        projectDescription: '',
        additionalNotes: '',
      }));
      setFile(null);
      setFileBase64('');

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during order routing. Please try again.');
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

  return (
    <section id="order" className="py-24 bg-slate-950 text-white relative border-t border-slate-900">
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="order-header-container">
          <h2 className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold mb-3">
            SECURE PORTAL
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight">
            Place Your Professional Project Order
          </p>
          <div className="h-1.5 w-16 bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
          <p className="text-slate-400 mt-5 text-base sm:text-lg font-light leading-relaxed">
            Fill in your layout specifications or Excel goals below. Our secure backend will compile your order and dispatch project blueprints immediately to Utkarsh.
          </p>
        </div>

        {/* Auth Locked Card vs Dashboard Tabs */}
        {!currentUser ? (
          <div className="bg-slate-900/60 border border-slate-850 p-6 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-md" id="order-auth-locked">
            <div className="max-w-md mx-auto text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center mx-auto mb-4 text-cyan-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-200">Client Profile Required</h3>
              <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">
                To guarantee secure transmission of specification records and unlock your interactive dashboard, please create an account or sign in below.
              </p>
            </div>
            <AuthForm embedMode={true} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabs for Order Form / Order History */}
            <div className="flex bg-slate-900/40 border border-slate-850 rounded-2xl p-1.5 max-w-sm mx-auto" id="order-form-history-tabs">
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

            {/* TAB CONTENT: ORDER HISTORY */}
            {activeTab === 'history' && (
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
                  <div className="py-12 text-center border border-dashed border-slate-850 rounded-2xl p-6" id="no-orders-banner">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="orders-history-list">
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
                className="bg-slate-900/60 border border-emerald-500/30 p-8 sm:p-12 rounded-3xl text-center shadow-2xl backdrop-blur-md relative overflow-hidden"
                id="order-success-card"
              >
                {/* Visual shine */}
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest block mb-1">
                  SUBMISSION REGISTERED
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                  Order ID: <span className="text-cyan-400 font-mono">{successOrder.id}</span>
                </h3>
                <p className="text-sm text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
                  Congratulations {successOrder.fullName}! Your project order was compiled and stored. A dispatch summary was triggered to <span className="font-semibold text-slate-100">utkarshbajpai025@gmail.com</span>.
                </p>

                <div className="my-8 bg-slate-950/60 border border-slate-850 p-6 rounded-2xl max-w-md mx-auto text-left space-y-2 font-mono text-xs">
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-500">Service Required:</span>
                    <span className="text-slate-200 font-bold text-right">{successOrder.serviceRequired}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-500">Est. Budget:</span>
                    <span className="text-emerald-400 font-bold">{successOrder.budget}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-500">Est. Deadline:</span>
                    <span className="text-cyan-400 font-bold">{successOrder.deadline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Attachment:</span>
                    <span className="text-slate-400">{successOrder.fileName || 'None'}</span>
                  </div>
                </div>

                <div className="space-y-4 max-w-sm mx-auto">
                  <a
                    href="#payment"
                    className="w-full flex items-center justify-center space-x-2 py-4 rounded-xl text-sm font-semibold tracking-wide text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-xl shadow-emerald-500/10 transition-all active:scale-95"
                  >
                    <span>Proceed to Payment Desk</span>
                  </a>
                  <button
                    onClick={() => setSuccessOrder(null)}
                    className="text-xs text-slate-400 hover:text-white underline transition-colors"
                  >
                    Place Another Order
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ORDER PLACEMENT FORM */}
            {activeTab === 'form' && !successOrder && (
              <form
                onSubmit={handleSubmit}
                className="bg-slate-900/40 border border-slate-850 p-6 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-md space-y-6 animate-fadeIn"
                id="client-order-form"
              >
                {/* Header chip */}
                <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono uppercase bg-slate-950/60 border border-slate-850 px-3.5 py-1.5 rounded-full w-fit">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Durable Secure Data Intake Protocol</span>
                </div>

                {/* Error panel */}
                {errorMsg && (
                  <div className="flex items-start space-x-2.5 bg-red-950/40 border border-red-800/40 p-4 rounded-xl text-red-400 text-xs sm:text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Form Row 1: Full Name & Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                      Full Name <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Utkarsh Bajpai"
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500"
                      id="order-fullName"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                      Company Name <span className="text-slate-600">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="e.g. Sharma Logistics Corp"
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500"
                      id="order-companyName"
                    />
                  </div>
                </div>

                {/* Form Row 2: Email & Phone & Whatsapp */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                      Email Address <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. client@example.com"
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500"
                      id="order-email"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                      Phone Number <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 7706929484"
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500"
                      id="order-phone"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                      WhatsApp Number <span className="text-slate-650">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      name="whatsApp"
                      value={formData.whatsApp}
                      onChange={handleInputChange}
                      placeholder="e.g. 7706929484"
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500"
                      id="order-whatsApp"
                    />
                  </div>
                </div>

                {/* Form Row 3: Service dropdown & Budget & Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                      Service Required <span className="text-cyan-400">*</span>
                    </label>
                    <select
                      name="serviceRequired"
                      required
                      value={formData.serviceRequired}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                      id="order-serviceRequired"
                    >
                      <option value="" disabled>-- Select Service --</option>
                      <option value="Basic Website Package (₹499)">Basic Website Package (₹499)</option>
                      <option value="Business Growth Website (₹999)">Business Growth Website (₹999)</option>
                      <option value="Elite Premium Experience (₹1299)">Elite Premium Experience (₹1299)</option>
                      <option value="Excel Formulas & Architecture (₹349)">Excel Formulas & Architecture (₹349)</option>
                      <option value="Excel KPI Dashboards & MIS (₹699)">Excel KPI Dashboards & MIS (₹699)</option>
                      <option value="Excel Workflow Automation & Tools (₹999)">Excel Workflow Automation & Tools (₹999)</option>
                      <option value="Custom Project Requirements">Custom Project Requirements</option>
                      {formData.serviceRequired && !['Basic Website Package (₹499)', 'Business Growth Website (₹999)', 'Elite Premium Experience (₹1299)', 'Excel Formulas & Architecture (₹349)', 'Excel KPI Dashboards & MIS (₹699)', 'Excel Workflow Automation & Tools (₹999)', 'Custom Project Requirements'].includes(formData.serviceRequired) && (
                        <option value={formData.serviceRequired}>{formData.serviceRequired}</option>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                      Estimated Budget
                    </label>
                    <input
                      type="text"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="e.g. ₹999 or Flexible"
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500"
                      id="order-budget"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                      Estimated Deadline
                    </label>
                    <input
                      type="text"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      placeholder="e.g. 3 Days or Urgent"
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500"
                      id="order-deadline"
                    />
                  </div>
                </div>

                {/* Form Row 4: Project Description */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                      Project Description & Specifications <span className="text-cyan-400">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-550">Please describe pages, formulas, sheets details...</span>
                  </div>
                  <textarea
                    name="projectDescription"
                    required
                    rows={5}
                    value={formData.projectDescription}
                    onChange={handleInputChange}
                    placeholder="Describe your design goals, formulas to build, sheets to clean, attendance parameters..."
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500"
                    id="order-projectDescription"
                  />
                </div>

                {/* Form Row 5: Secure File Upload (Drag and Drop / Manual select) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                    Project Uploads & Reference Files <span className="text-slate-650">(Excel, ZIP, PDF, Images, DOCX - Max 20MB)</span>
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

                {/* Form Row 6: Additional Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                    Additional Notes or Special Instructions <span className="text-slate-650">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    placeholder="Include custom links, color schemes preference, WhatsApp preferred call times..."
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-500"
                    id="order-additionalNotes"
                  />
                </div>

                {/* Form Submission Button */}
                <div className="pt-4 border-t border-slate-900 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl text-sm font-semibold tracking-wide text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 transition-all shadow-xl shadow-cyan-500/10 disabled:opacity-50"
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
        )}
      </div>
    </section>
  );
}
