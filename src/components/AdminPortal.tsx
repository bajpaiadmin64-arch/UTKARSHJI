import React, { useState, useEffect } from 'react';
import { 
  Terminal, ShieldAlert, KeyRound, Loader2, RefreshCw, PlusCircle, Trash2, 
  Search, Filter, ClipboardList, CheckCircle2, AlertTriangle, Clock, X, Eye, 
  ArrowLeft, Mail, Phone, DollarSign, UserCheck, ShieldCheck, Check, Info, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

interface AdminPortalProps {
  onClose: () => void;
}

export default function AdminPortal({ onClose }: AdminPortalProps) {
  const { currentUser, isAdmin, login, logout, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'create'>('orders');
  
  // Auth Form State
  const [loginEmail, setLoginEmail] = useState('bajpaiadmin64@gmail.com');
  const [loginPassword, setLoginPassword] = useState('BAJPAI@890');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Firestore Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Selected Order for detail view / editing modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);

  // Success notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Create order state
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    whatsApp: '',
    companyName: '',
    serviceRequired: 'Premium Website',
    budget: '₹1299',
    deadline: '5-7 Days',
    projectDescription: '',
    additionalNotes: '',
    status: 'pending',
    paymentStatus: 'unpaid'
  });
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Sandbox orders generator and storage helper
  const getInitialSandboxOrders = () => {
    const saved = localStorage.getItem('ub_sandbox_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    
    // Default initial mock orders for sandbox preview
    const initial = [
      {
        id: "UB-847291",
        userId: "mock-client-1",
        fullName: "Ramesh Sharma",
        companyName: "Sharma Agro Industries",
        email: "ramesh@sharmaagro.com",
        phone: "+91 98765 43210",
        whatsApp: "+91 98765 43210",
        serviceRequired: "Premium Website",
        budget: "₹1299",
        deadline: "5-7 Days",
        projectDescription: "Requesting a high-end web storefront for our agro product inventory with localized custom database integrations.",
        additionalNotes: "Needs deep violet ambient theme styling and quick WhatsApp click integrations.",
        status: "confirmed",
        paymentStatus: "paid",
        createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
      },
      {
        id: "UB-310492",
        userId: "mock-client-2",
        fullName: "Anjali Gupta",
        companyName: "Gupta Financials Ltd",
        email: "anjali@guptafinance.in",
        phone: "+91 88877 66554",
        whatsApp: "",
        serviceRequired: "Excel Automation & Macros",
        budget: "₹999",
        deadline: "3-4 Days",
        projectDescription: "Complete automated financial statement matching macros. Must auto-validate input cell structures.",
        additionalNotes: "Deliver source code file in .xlsm binary format.",
        status: "pending",
        paymentStatus: "pending_verification",
        transactionId: "UTR9482710482",
        createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
      },
      {
        id: "UB-112948",
        userId: "mock-client-3",
        fullName: "Sumit Verma",
        companyName: "Verma Tech Labs",
        email: "sumit@vermatech.io",
        phone: "+91 77766 55443",
        whatsApp: "+91 77766 55443",
        serviceRequired: "Basic Website",
        budget: "₹499",
        deadline: "2-3 Days",
        projectDescription: "A portfolio page with elegant typography and contact form matching user profiles.",
        additionalNotes: "Use Space Grotesk styling and Fira Code mono fonts.",
        status: "completed",
        paymentStatus: "paid",
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
      }
    ];
    
    localStorage.setItem('ub_sandbox_orders', JSON.stringify(initial));
    return initial;
  };

  // Load orders only when logged in as admin
  useEffect(() => {
    if (!currentUser || !isAdmin) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);
    setOrdersError('');

    const fetchAdminOrders = async () => {
      const token = localStorage.getItem('ub_auth_token');
      if (!token) {
        setOrdersError('Authentication token not found.');
        setLoadingOrders(false);
        return;
      }

      try {
        const res = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
          setOrdersError('');
        } else {
          const data = await res.json();
          setOrdersError(data.error || 'Failed to fetch admin orders.');
        }
      } catch (err) {
        console.error('Fetch admin orders error:', err);
        setOrdersError('Network connection failure.');
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchAdminOrders();
    // Refresh every 10 seconds to make it responsive / quasi-realtime
    const interval = setInterval(fetchAdminOrders, 10000);
    return () => clearInterval(interval);
  }, [currentUser, isAdmin]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Pre-fill Admin Credentials helper
  const handlePrefillAdmin = () => {
    setLoginEmail('bajpaiadmin64@gmail.com');
    setLoginPassword('BAJPAI@890');
    setAuthError('');
  };

  // Perform Admin Login
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    if (loginEmail !== 'bajpaiadmin64@gmail.com') {
      setAuthError('Only the authorized system administrator can sign into this console.');
      setAuthLoading(false);
      return;
    }

    try {
      await login(loginEmail, loginPassword);
    } catch (err: any) {
      console.error('Admin Sign-In failure:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError('Invalid Admin credentials. Please check the pre-populated values.');
      } else {
        setAuthError(err.message || 'Authentication failed.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle status update
  const handleUpdateStatus = async (orderId: string, field: 'status' | 'paymentStatus', value: string) => {
    const isSandboxMode = currentUser?.uid === 'admin-sandbox-uid' || currentUser?.uid?.startsWith('user-sandbox-');
    if (isSandboxMode) {
      const updated = orders.map(o => o.id === orderId ? { ...o, [field]: value } : o);
      setOrders(updated);
      localStorage.setItem('ub_sandbox_orders', JSON.stringify(updated));
      showNotification('success', `[Sandbox Mode] Order ${orderId} ${field} successfully updated to "${value}"`);
      return;
    }

    try {
      const token = localStorage.getItem('ub_auth_token');
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: value })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update order status');
      }
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, [field]: value } : o));
      showNotification('success', `Order ${orderId} ${field} successfully updated to "${value}"`);
    } catch (err: any) {
      console.error('Error updating order:', err);
      showNotification('error', err.message || 'Failed to update order in database.');
    }
  };

  // Handle Full Order Edit Save
  const handleSaveOrderChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSavingChanges(true);
    const isSandboxMode = currentUser?.uid === 'admin-sandbox-uid' || currentUser?.uid?.startsWith('user-sandbox-');
    if (isSandboxMode) {
      const updated = orders.map(o => o.id === selectedOrder.id ? { ...selectedOrder } : o);
      setOrders(updated);
      localStorage.setItem('ub_sandbox_orders', JSON.stringify(updated));
      setIsEditModalOpen(false);
      showNotification('success', `[Sandbox Mode] Successfully saved changes for order: ${selectedOrder.id}`);
      setSavingChanges(false);
      return;
    }

    try {
      const token = localStorage.getItem('ub_auth_token');
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: selectedOrder.fullName,
          email: selectedOrder.email,
          phone: selectedOrder.phone,
          whatsApp: selectedOrder.whatsApp || '',
          companyName: selectedOrder.companyName || '',
          serviceRequired: selectedOrder.serviceRequired,
          budget: selectedOrder.budget,
          deadline: selectedOrder.deadline,
          projectDescription: selectedOrder.projectDescription,
          additionalNotes: selectedOrder.additionalNotes || '',
          status: selectedOrder.status,
          paymentStatus: selectedOrder.paymentStatus,
          transactionId: selectedOrder.transactionId || ''
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save order changes');
      }
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...selectedOrder } : o));
      setIsEditModalOpen(false);
      showNotification('success', `Successfully saved changes for order: ${selectedOrder.id}`);
    } catch (err: any) {
      console.error('Error saving edits:', err);
      showNotification('error', err.message || 'Failed to save changes.');
    } finally {
      setSavingChanges(false);
    }
  };

  // Handle Order Deletion
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete order ${orderId}? This cannot be undone.`)) {
      return;
    }

    const isSandboxMode = currentUser?.uid === 'admin-sandbox-uid' || currentUser?.uid?.startsWith('user-sandbox-');
    if (isSandboxMode) {
      const updated = orders.filter(o => o.id !== orderId);
      setOrders(updated);
      localStorage.setItem('ub_sandbox_orders', JSON.stringify(updated));
      showNotification('success', `[Sandbox Mode] Order ${orderId} was successfully deleted.`);
      return;
    }

    try {
      const token = localStorage.getItem('ub_auth_token');
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete order');
      }
      setOrders(prev => prev.filter(o => o.id !== orderId));
      showNotification('success', `Order ${orderId} was successfully deleted.`);
    } catch (err: any) {
      console.error('Error deleting order:', err);
      showNotification('error', err.message || 'Deletion failed.');
    }
  };

  // Handle New Order Creation from Admin end
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.fullName || !createForm.email || !createForm.phone || !createForm.projectDescription) {
      showNotification('error', 'Please fill in all mandatory fields (*) to create an order.');
      return;
    }

    setCreatingOrder(true);
    const isSandboxMode = currentUser?.uid === 'admin-sandbox-uid' || currentUser?.uid?.startsWith('user-sandbox-');
    
    try {
      const orderId = "UB-" + Math.floor(100000 + Math.random() * 900000);
      const createdAt = new Date().toISOString();

      const orderPayload = {
        id: orderId,
        userId: currentUser?.uid || 'admin_direct',
        fullName: createForm.fullName,
        companyName: createForm.companyName || '',
        email: createForm.email,
        phone: createForm.phone,
        whatsApp: createForm.whatsApp || '',
        serviceRequired: createForm.serviceRequired,
        budget: createForm.budget,
        deadline: createForm.deadline,
        projectDescription: createForm.projectDescription,
        additionalNotes: createForm.additionalNotes || '',
        status: createForm.status,
        paymentStatus: createForm.paymentStatus,
        createdAt: createdAt
      };

      if (isSandboxMode) {
        const currentOrders = [orderPayload, ...orders];
        setOrders(currentOrders);
        localStorage.setItem('ub_sandbox_orders', JSON.stringify(currentOrders));
        
        showNotification('success', `[Sandbox Mode] Successfully created new order: ${orderId}`);
        setActiveTab('orders');
        
        // Reset form
        setCreateForm({
          fullName: '',
          email: '',
          phone: '',
          whatsApp: '',
          companyName: '',
          serviceRequired: 'Premium Website',
          budget: '₹1299',
          deadline: '5-7 Days',
          projectDescription: '',
          additionalNotes: '',
          status: 'pending',
          paymentStatus: 'unpaid'
        });
        setCreatingOrder(false);
        return;
      }

      // Submit payload to Express Backend Node.js system to keep containers synced
      const payload = {
        fullName: createForm.fullName,
        companyName: createForm.companyName || '',
        email: createForm.email,
        phone: createForm.phone,
        whatsApp: createForm.whatsApp || '',
        serviceRequired: createForm.serviceRequired,
        budget: createForm.budget,
        deadline: createForm.deadline,
        projectDescription: createForm.projectDescription,
        additionalNotes: createForm.additionalNotes || '',
        fileName: null,
        fileData: null,
        userId: currentUser?.uid || 'admin_direct'
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Backend Sync rejected order creation');
      }

      // Manually push new order to local list for snappy UI updates
      setOrders(prev => [
        {
          ...payload,
          id: orderId,
          status: createForm.status,
          paymentStatus: createForm.paymentStatus,
          createdAt
        },
        ...prev
      ]);

      showNotification('success', `Successfully created new order: ${orderId}`);
      setActiveTab('orders');
      
      // Reset form
      setCreateForm({
        fullName: '',
        email: '',
        phone: '',
        whatsApp: '',
        companyName: '',
        serviceRequired: 'Premium Website',
        budget: '₹1299',
        deadline: '5-7 Days',
        projectDescription: '',
        additionalNotes: '',
        status: 'pending',
        paymentStatus: 'unpaid'
      });
    } catch (err: any) {
      console.error('Error creating order:', err);
      showNotification('error', err.message || 'Failed to submit direct admin order.');
    } finally {
      setCreatingOrder(false);
    }
  };

  // Filter logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // KPI calculations
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  
  const estimatedRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => {
      const amtStr = o.budget || '0';
      const cleanAmt = parseInt(amtStr.replace(/[^0-9]/g, ''), 10) || 0;
      return sum + cleanAmt;
    }, 0);

  // Authentication Guard Screen
  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans" id="admin-login-wrapper">
        {/* Background Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.04),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(6,182,212,0.04),transparent_50%)]"></div>
        
        {/* Top Floating Exit */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 flex items-center space-x-2 text-xs font-mono tracking-wider text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-cyan-950/55 bg-slate-900/60 backdrop-blur px-3 py-1.5 rounded-xl transition-all"
          id="admin-login-exit-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>EXIT PORTAL</span>
        </button>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 shadow-xl shadow-purple-900/20 mb-4 animate-bounce">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight font-sans text-white">
              ADMIN <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">PORTAL</span>
            </h1 >
            <p className="text-xs text-slate-400 font-mono tracking-wide uppercase mt-1">U B WEB DEVELOPER SOLUTIONS</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative" id="admin-login-card">
            {/* Header Shield */}
            <div className="flex items-center space-x-2 text-purple-400 mb-6 font-mono text-xs border-b border-slate-850 pb-4">
              <KeyRound className="w-4 h-4" />
              <span>SECURE ADMINISTRATIVE ACCESS</span>
            </div>

            {authError && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-900/50 flex items-start space-x-2 text-red-300 text-xs leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">Admin Identity (Email)</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500/80 transition-colors"
                  placeholder="admin@ubwebdev.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">Console Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500/80 transition-colors"
                  placeholder="••••••••••••"
                  required
                />
              </div>

              {/* Autofill helper */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handlePrefillAdmin}
                  className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 hover:text-cyan-300 hover:underline transition-all flex items-center space-x-1"
                >
                  <span>Auto-Fill Admin Credentials</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex items-center justify-center space-x-2 py-3.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider hover:from-purple-500 hover:to-cyan-400 transition-all active:scale-95 disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>VERIFYING CRYPTO SHIELD...</span>
                  </>
                ) : (
                  <span>DECRYPT & ENTER PORTAL</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="admin-dashboard-root">
      {/* Dynamic Toast Notification */}
      {notification && (
        <div 
          className={`fixed top-6 right-6 z-50 flex items-center space-x-3 px-5 py-4 rounded-2xl shadow-2xl border transition-all animate-fade-in ${
            notification.type === 'success' 
              ? 'bg-slate-900 border-cyan-500/40 text-cyan-200' 
              : 'bg-slate-900 border-red-500/40 text-red-200'
          }`}
          id="admin-notification"
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          )}
          <span className="text-xs font-medium tracking-wide">{notification.text}</span>
        </div>
      )}

      {/* Admin Nav Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-900/10">
              <ShieldCheck className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center space-x-1">
                <span>ADMIN</span>
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">DASHBOARD</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider -mt-1 uppercase">Logged in: {currentUser.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                activeTab === 'orders'
                  ? 'bg-purple-950/40 border-purple-500/40 text-purple-350 shadow-lg shadow-purple-950/10'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Manage Orders
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center space-x-1.5 ${
                activeTab === 'create'
                  ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-350 shadow-lg shadow-cyan-950/10'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Lodge New Order</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-800 text-slate-350 hover:border-slate-700 hover:text-white bg-slate-900/40 transition-all ml-4"
            >
              Exit Console
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KPI Banner Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Projects */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-slate-950 text-purple-400 border border-slate-800">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Total Projects</span>
              <p className="text-xl font-bold text-white mt-0.5">{loadingOrders ? '...' : totalOrdersCount}</p>
            </div>
          </div>

          {/* Active Queue */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-slate-950 text-yellow-400 border border-slate-800">
              <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Pending Review</span>
              <p className="text-xl font-bold text-white mt-0.5">{loadingOrders ? '...' : pendingOrdersCount}</p>
            </div>
          </div>

          {/* Completed Delivery */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-slate-950 text-cyan-400 border border-slate-800">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Delivered Items</span>
              <p className="text-xl font-bold text-white mt-0.5">{loadingOrders ? '...' : completedOrdersCount}</p>
            </div>
          </div>

          {/* Gross volume ledger */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3.5 col-span-2 lg:col-span-1">
            <div className="p-2.5 rounded-xl bg-slate-950 text-green-400 border border-slate-800">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Secured Revenue</span>
              <p className="text-xl font-bold text-green-400 mt-0.5">₹{loadingOrders ? '...' : estimatedRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Tab 1: Manage Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6" id="admin-orders-tab">
            {/* Control Panel: Filters & Search */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center gap-4">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-250 focus:outline-none focus:border-purple-500/80 transition-colors"
                  placeholder="Search orders by Client, ID, Email, Phone..."
                />
              </div>

              {/* Status filter tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mr-1 flex items-center">
                  <Filter className="w-3 h-3 mr-1" /> Status:
                </span>
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                      statusFilter === st
                        ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Payment filter tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mr-1 flex items-center">
                  <Filter className="w-3 h-3 mr-1" /> Payment:
                </span>
                {['all', 'unpaid', 'pending_verification', 'paid'].map((pt) => (
                  <button
                    key={pt}
                    onClick={() => setPaymentFilter(pt)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                      paymentFilter === pt
                        ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-350'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pt === 'pending_verification' ? 'Pending verify' : pt}
                  </button>
                ))}
              </div>
            </div>

            {/* Error view */}
            {ordersError && (
              <div className="p-6 rounded-2xl bg-red-950/30 border border-red-900/40 text-center text-red-300">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400 animate-pulse" />
                <p className="text-xs font-mono font-bold uppercase">{ordersError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold hover:border-slate-700 text-white"
                >
                  Hard Refresh Connection
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {loadingOrders ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-slate-900/40 border border-slate-800 rounded-2xl">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">DECRYPTING ENCRYPTED DATA STREAMS...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
                <ClipboardList className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                <h3 className="text-sm font-bold text-slate-300">No Orders Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Try widening your search terms or selecting "All" in the status filter dropdowns.
                </p>
              </div>
            ) : (
              /* Desktop Orders List Grid */
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-slate-800/80 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                        <th className="px-6 py-4">Order Code</th>
                        <th className="px-6 py-4">Client Detail</th>
                        <th className="px-6 py-4">Service Package</th>
                        <th className="px-6 py-4">Budget & Limit</th>
                        <th className="px-6 py-4">Workflow Status</th>
                        <th className="px-6 py-4">Payment Node</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-850/30 transition-colors">
                          {/* Order ID */}
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="font-mono font-bold text-white bg-slate-950 px-2.5 py-1.5 border border-slate-850 rounded-lg">
                              {order.id}
                            </span>
                            <span className="block text-[9px] text-slate-500 font-mono mt-2 uppercase">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          {/* Client Detail */}
                          <td className="px-6 py-5">
                            <div className="font-semibold text-slate-200">{order.fullName}</div>
                            {order.companyName && (
                              <div className="text-[10px] text-slate-400 font-mono italic mt-0.5">{order.companyName}</div>
                            )}
                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-1.5">
                              <span className="flex items-center"><Mail className="w-3 h-3 mr-1 shrink-0 text-slate-500" /> {order.email}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-1">
                              <span className="flex items-center"><Phone className="w-3 h-3 mr-1 shrink-0 text-slate-500" /> {order.phone}</span>
                            </div>
                          </td>

                          {/* Service REQUIRED */}
                          <td className="px-6 py-5">
                            <div className="font-mono text-[11px] font-medium text-slate-250 bg-slate-950/80 border border-slate-850 rounded-lg px-2 py-1 inline-block">
                              {order.serviceRequired}
                            </div>
                            {order.fileName && (
                              <div className="flex items-center text-[9px] text-cyan-400 font-mono mt-2 bg-cyan-950/30 border border-cyan-900/30 px-1.5 py-0.5 rounded inline-flex">
                                <FileText className="w-3 h-3 mr-1" /> {order.fileName}
                              </div>
                            )}
                          </td>

                          {/* Budget & Deadline */}
                          <td className="px-6 py-5">
                            <div className="font-semibold text-green-400">{order.budget}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-1">Deadline: {order.deadline}</div>
                          </td>

                          {/* Workflow Status */}
                          <td className="px-6 py-5 whitespace-nowrap">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order.id, 'status', e.target.value)}
                              className={`text-[10px] font-bold uppercase tracking-wider rounded-lg px-2.5 py-1.5 border bg-slate-950 text-center cursor-pointer outline-none ${
                                order.status === 'completed'
                                  ? 'border-green-500/30 text-green-400'
                                  : order.status === 'confirmed'
                                  ? 'border-cyan-500/30 text-cyan-400'
                                  : order.status === 'cancelled'
                                  ? 'border-red-500/30 text-red-400'
                                  : 'border-yellow-500/30 text-yellow-400 animate-pulse'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>

                          {/* Payment status selector */}
                          <td className="px-6 py-5 whitespace-nowrap">
                            <select
                              value={order.paymentStatus}
                              onChange={(e) => handleUpdateStatus(order.id, 'paymentStatus', e.target.value)}
                              className={`text-[10px] font-bold uppercase tracking-wider rounded-lg px-2.5 py-1.5 border bg-slate-950 text-center cursor-pointer outline-none ${
                                order.paymentStatus === 'paid'
                                  ? 'border-green-500/30 text-green-400'
                                  : order.paymentStatus === 'pending_verification'
                                  ? 'border-yellow-500/30 text-yellow-450 animate-pulse'
                                  : 'border-slate-800 text-slate-400'
                              }`}
                            >
                              <option value="unpaid">Unpaid</option>
                              <option value="pending_verification">Verify (Pending)</option>
                              <option value="paid">Paid</option>
                            </select>
                            {order.transactionId && (
                              <div className="text-[9px] font-mono text-slate-400 mt-2 block truncate max-w-[120px]" title={order.transactionId}>
                                UTR: {order.transactionId}
                              </div>
                            )}
                          </td>

                          {/* Action Items */}
                          <td className="px-6 py-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsEditModalOpen(true);
                                }}
                                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-slate-350 transition-colors"
                                title="Edit Full Specs & Parameters"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-2 rounded-lg bg-red-950/20 hover:bg-red-950/60 border border-red-900/30 hover:border-red-900/70 text-red-400 transition-colors"
                                title="Delete Project Ledger"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Create Order from Admin side */}
        {activeTab === 'create' && (
          <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative" id="admin-create-tab">
            <div className="flex items-center space-x-2 text-cyan-400 mb-6 font-mono text-xs border-b border-slate-850 pb-4">
              <PlusCircle className="w-4 h-4 animate-pulse" />
              <span>DIRECT ADMINISTRATIVE WORK ORDER LODGEMENT</span>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-6">
              
              {/* Client Contact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80 transition-colors"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">Customer Email Address *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80 transition-colors"
                    placeholder="7706929484"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">WhatsApp Contact</label>
                  <input
                    type="tel"
                    value={createForm.whatsApp}
                    onChange={(e) => setCreateForm({ ...createForm, whatsApp: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80 transition-colors"
                    placeholder="WhatsApp phone number"
                  />
                </div>
              </div>

              {/* Company Info & Service Required */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">Company Name</label>
                  <input
                    type="text"
                    value={createForm.companyName}
                    onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80 transition-colors"
                    placeholder="Company or agency name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">Service Required *</label>
                  <select
                    value={createForm.serviceRequired}
                    onChange={(e) => {
                      // Auto populate estimated flat rates to keep things slick
                      let budgetVal = '₹1299';
                      let deliveryVal = '5-7 Days';
                      const val = e.target.value;
                      if (val === 'Basic Website') { budgetVal = '₹499'; deliveryVal = '2-3 Days'; }
                      else if (val === 'Business Website') { budgetVal = '₹999'; deliveryVal = '4-5 Days'; }
                      else if (val === 'Premium Website') { budgetVal = '₹1299'; deliveryVal = '5-7 Days'; }
                      else if (val === 'Excel Formulas & Architecture') { budgetVal = '₹349'; deliveryVal = '1-2 Days'; }
                      else if (val === 'Excel MIS Reports & Dashboards') { budgetVal = '₹699'; deliveryVal = '2-3 Days'; }
                      else if (val === 'Excel Automation & Macros') { budgetVal = '₹999'; deliveryVal = '3-4 Days'; }

                      setCreateForm({ 
                        ...createForm, 
                        serviceRequired: val,
                        budget: budgetVal,
                        deadline: deliveryVal
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80 transition-colors cursor-pointer"
                  >
                    <option value="Basic Website">Basic Website (₹499)</option>
                    <option value="Business Website">Business Website (₹999)</option>
                    <option value="Premium Website">Premium Website (₹1299)</option>
                    <option value="Excel Formulas & Architecture">Excel Formulas & Architecture (₹349)</option>
                    <option value="Excel MIS Reports & Dashboards">Excel MIS Reports & Dashboards (₹699)</option>
                    <option value="Excel Automation & Macros">Excel Automation & Macros (₹999)</option>
                  </select>
                </div>
              </div>

              {/* Budget, Timeline & Statuses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">Budget Val</label>
                  <input
                    type="text"
                    value={createForm.budget}
                    onChange={(e) => setCreateForm({ ...createForm, budget: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">Timeline</label>
                  <input
                    type="text"
                    value={createForm.deadline}
                    onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">Initial Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 transition-colors cursor-pointer"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">Payment State</label>
                  <select
                    value={createForm.paymentStatus}
                    onChange={(e) => setCreateForm({ ...createForm, paymentStatus: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 transition-colors cursor-pointer"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="pending_verification">Verify (Pending)</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">Project Description & Specifications *</label>
                <textarea
                  required
                  rows={4}
                  value={createForm.projectDescription}
                  onChange={(e) => setCreateForm({ ...createForm, projectDescription: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80 transition-colors font-sans leading-relaxed"
                  placeholder="Outline client guidelines, required features, pages, or data sheets schema..."
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">Internal Admin / Progress Notes</label>
                <textarea
                  rows={2}
                  value={createForm.additionalNotes}
                  onChange={(e) => setCreateForm({ ...createForm, additionalNotes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80 transition-colors font-sans leading-relaxed"
                  placeholder="Private internal comments, system milestones, or specific guidelines..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="px-5 py-3 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingOrder}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider hover:from-cyan-350 hover:to-purple-405 transition-all flex items-center space-x-1.5"
                >
                  {creatingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Lodging Order...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Submit Direct Work Order</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}
      </main>

      {/* Edit/Detail Modal View Overlay */}
      {isEditModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md" id="admin-edit-modal">
          <div className="absolute inset-0" onClick={() => setIsEditModalOpen(false)} />
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl relative p-1 overflow-hidden shadow-2xl z-10 animate-fade-in">
            {/* Modal header */}
            <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-850">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-xs text-slate-400">EXAMINING PARAMETERS FOR</span>
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800 px-2 py-0.5 rounded">
                  {selectedOrder.id}
                </span>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <form onSubmit={handleSaveOrderChanges} className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              
              {/* Client Contact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">Client Full Name</label>
                  <input
                    type="text"
                    required
                    value={selectedOrder.fullName}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, fullName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/80"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">Client Email</label>
                  <input
                    type="email"
                    required
                    value={selectedOrder.email}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/80"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={selectedOrder.phone}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/80"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">WhatsApp Info</label>
                  <input
                    type="text"
                    value={selectedOrder.whatsApp || ''}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, whatsApp: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/80"
                  />
                </div>
              </div>

              {/* Service specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">Service Package</label>
                  <input
                    type="text"
                    required
                    value={selectedOrder.serviceRequired}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, serviceRequired: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/80"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">Company Affiliation</label>
                  <input
                    type="text"
                    value={selectedOrder.companyName || ''}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, companyName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/80"
                  />
                </div>
              </div>

              {/* Finance details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">Budget Allocation</label>
                  <input
                    type="text"
                    required
                    value={selectedOrder.budget}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, budget: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/80"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">Timeline Limit</label>
                  <input
                    type="text"
                    required
                    value={selectedOrder.deadline}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, deadline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/80"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">Payment UTR / Transaction ID</label>
                  <input
                    type="text"
                    value={selectedOrder.transactionId || ''}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, transactionId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/80"
                    placeholder="Enter UPI Transaction ID"
                  />
                </div>
              </div>

              {/* Status Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">Workflow Status</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">Payment Verification</label>
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, paymentStatus: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="pending_verification">Pending Verification</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              {/* Requirements specifications */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">Project Specifications</label>
                <textarea
                  rows={4}
                  required
                  value={selectedOrder.projectDescription}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, projectDescription: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none leading-relaxed font-sans"
                />
              </div>

              {/* Additional comments */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">Internal Progress Logs / Notes</label>
                <textarea
                  rows={2}
                  value={selectedOrder.additionalNotes || ''}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, additionalNotes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none leading-relaxed font-sans"
                  placeholder="Insert notes or followups..."
                />
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between border-t border-slate-850 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteOrder(selectedOrder.id);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2.5 bg-red-950/20 hover:bg-red-950/60 border border-red-900/40 hover:border-red-900 text-red-400 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                >
                  Delete Order
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                  >
                    Discard Edits
                  </button>
                  <button
                    type="submit"
                    disabled={savingChanges}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-slate-950 font-bold rounded-xl text-[10px] font-bold uppercase tracking-wider hover:from-purple-500 hover:to-cyan-400 transition-all active:scale-95 flex items-center space-x-1.5"
                  >
                    {savingChanges ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Specs & Status</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
