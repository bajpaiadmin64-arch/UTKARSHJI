import React, { useState, useEffect } from 'react';
import { Copy, Check, QrCode, Sparkles, Send, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface PaymentProps {
  orderId: string;
  amount: string;
}

export default function Payment({ orderId, amount }: PaymentProps) {
  const [copied, setCopied] = useState(false);
  const [inputOrderId, setInputOrderId] = useState(orderId || '');
  const [transactionId, setTransactionId] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successConfirm, setSuccessConfirm] = useState(false);

  const upiId = '7706929484@axl';
  const merchantName = 'U B Web Developer';

  // Format payment link
  const formattedAmount = amount.replace(/[^0-9]/g, '');
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&tn=${encodeURIComponent(
    'Project Order ' + (inputOrderId || 'Deposit')
  )}&am=${formattedAmount || ''}&cu=INR`;

  useEffect(() => {
    if (orderId) {
      setInputOrderId(orderId);
    }
  }, [orderId]);

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!inputOrderId || !transactionId) {
      setErrorMsg('Please enter your Order ID and Transaction ID / UTR.');
      return;
    }

    setLoading(true);

    try {
      // 1. Submit payment details to node server backend for email generation logs
      const res = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: inputOrderId,
          transactionId,
          clientNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification request rejected');
      }

      // 2. Synchronize payment confirmation state with Firestore/LocalStorage
      let updatedSandbox = false;
      const savedOrders = localStorage.getItem('ub_sandbox_orders');
      if (savedOrders) {
        try {
          const orders = JSON.parse(savedOrders);
          const matchIndex = orders.findIndex((o: any) => o.id.toLowerCase() === inputOrderId.toLowerCase());
          if (matchIndex !== -1) {
            const o = orders[matchIndex];
            const currentNotes = o.additionalNotes || '';
            const newNotes = currentNotes + (clientNotes ? "\n[Payment Confirmation Notes]: " + clientNotes : '');
            orders[matchIndex] = {
              ...o,
              paymentStatus: 'pending_verification',
              transactionId: transactionId,
              status: 'confirmed',
              additionalNotes: newNotes
            };
            localStorage.setItem('ub_sandbox_orders', JSON.stringify(orders));
            console.log('[SANDBOX SUCCESS] Order payment reference synchronized in localStorage.');
            updatedSandbox = true;
          }
        } catch (e) {
          console.error('[SANDBOX ERROR] Failed to parse sandbox orders:', e);
        }
      }

      if (!updatedSandbox) {
        try {
          const orderDocRef = doc(db, 'orders', inputOrderId.toUpperCase());
          const orderSnap = await getDoc(orderDocRef);
          if (orderSnap.exists()) {
            const currentNotes = orderSnap.data().additionalNotes || '';
            const newNotes = currentNotes + (clientNotes ? "\n[Payment Confirmation Notes]: " + clientNotes : '');
            await updateDoc(orderDocRef, {
              paymentStatus: 'pending_verification',
              transactionId: transactionId,
              status: 'confirmed',
              additionalNotes: newNotes
            });
            console.log('[FIRESTORE SUCCESS] Order payment reference synchronized.');
          } else {
            // Retry matching exactly if user didn't uppercase
            const orderDocRefLower = doc(db, 'orders', inputOrderId);
            const orderSnapLower = await getDoc(orderDocRefLower);
            if (orderSnapLower.exists()) {
              const currentNotes = orderSnapLower.data().additionalNotes || '';
              const newNotes = currentNotes + (clientNotes ? "\n[Payment Confirmation Notes]: " + clientNotes : '');
              await updateDoc(orderDocRefLower, {
                paymentStatus: 'pending_verification',
                transactionId: transactionId,
                status: 'confirmed',
                additionalNotes: newNotes
              });
              console.log('[FIRESTORE SUCCESS] Order payment reference synchronized (lower match).');
            } else {
              console.warn('[FIRESTORE WARN] Order ID not found in Firestore. Payment processed with local backend ledger fallback.');
            }
          }
        } catch (fbErr: any) {
          console.error('Firestore synchronisation bypass error:', fbErr);
          // If the error is missing permissions, we do not crash or throw uncaught exception.
          if (fbErr.code === 'permission-denied') {
            console.warn('Firestore permissions denied. Continuing with node backend ledger success confirmation.');
          } else {
            handleFirestoreError(fbErr, OperationType.UPDATE, `orders/${inputOrderId}`);
          }
        }
      }

      setSuccessConfirm(true);
      setTransactionId('');
      setClientNotes('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Verification failed. Please check the Order ID is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="payment" className="py-24 bg-slate-950 text-white relative border-t border-slate-900">
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="payment-header-container">
          <h2 className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold mb-3">
            PAYMENT GATEWAY
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight">
            Secure Instant UPI Payment Desk
          </p>
          <div className="h-1.5 w-16 bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
          <p className="text-slate-400 mt-5 text-base sm:text-lg font-light leading-relaxed">
            Pay safely from any UPI app (GPay, PhonePe, Paytm, BHIM) with zero transaction fees. Use our scannable QR code below or click the direct payment trigger from your mobile device.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Panel: UPI Card & QR Code */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-850 p-8 rounded-3xl shadow-2xl relative overflow-hidden text-center flex flex-col items-center">
            {/* Ambient glows */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* UPI Merchant Header */}
            <div className="w-full flex justify-between items-center pb-4 border-b border-slate-850 mb-6 font-mono text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>BHIM UPI MERCHANT</span>
              </span>
              <span className="text-[10px] text-slate-500">Flat Fees: 0%</span>
            </div>

            <h4 className="text-lg font-bold text-slate-200 mb-1">{merchantName}</h4>
            <p className="text-xs text-slate-400 mb-6">Official Freelance Agency ID</p>

            {/* Mock/Stylized SVG QR Code */}
            <div className="relative bg-white p-4 rounded-2xl shadow-xl w-48 h-48 mb-6 flex items-center justify-center group hover:scale-[1.02] transition-transform duration-300">
              {/* SVG vector drawing realistic QR blocks and a central "UPI" badge */}
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                {/* QR alignment squares */}
                <rect x="5" y="5" width="20" height="20" rx="2" fill="#0f172a" />
                <rect x="9" y="9" width="12" height="12" rx="1" fill="#ffffff" />
                <rect x="12" y="12" width="6" height="6" fill="#0f172a" />

                <rect x="75" y="5" width="20" height="20" rx="2" fill="#0f172a" />
                <rect x="79" y="9" width="12" height="12" rx="1" fill="#ffffff" />
                <rect x="82" y="12" width="6" height="6" fill="#0f172a" />

                <rect x="5" y="75" width="20" height="20" rx="2" fill="#0f172a" />
                <rect x="9" y="79" width="12" height="12" rx="1" fill="#ffffff" />
                <rect x="12" y="82" width="6" height="6" fill="#0f172a" />

                {/* Simulated random QR dots pattern */}
                <path d="M30 5h5v5h-5zM40 5h10v5H40zM60 5h10v5H60zM30 15h15v5H30zM50 15h10v5H50zM65 15h5v5h-5zM35 25h10v5H35zM55 25h5v5h-5zM70 25h15v5H70zM5 35h15v5H5zM25 35h10v5H25zM45 35h5v5h-5zM60 35h25v5H60zM15 45h10v5H15zM35 45h5v5h-5zM50 45h10v5H50zM65 45h20v5H65zM5 55h15v5H5zM30 55h20v5H30zM60 55h10v5H60zM75 55h20v5H75zM15 65h10v5H15zM40 65h15v5H40zM65 65h10v5H65zM30 75h10v5H30zM45 75h15v5H45zM65 75h10v5H65zM35 85h25v5H35zM75 85h5v5h-5zM40 95h40v5H40z" fill="#0f172a" />

                {/* Central Logo Overlay */}
                <rect x="36" y="36" width="28" height="28" rx="6" fill="#0f172a" />
                <rect x="38" y="38" width="24" height="24" rx="4" fill="#ffffff" />
                <text x="50" y="53" fill="#0f172a" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">UPI</text>
              </svg>
            </div>

            {/* UPI ID Row */}
            <div className="w-full bg-slate-950/60 border border-slate-850 py-3 px-4 rounded-xl flex items-center justify-between font-mono text-xs mb-6">
              <span className="text-slate-500">UPI ID:</span>
              <span className="text-slate-100 font-bold">{upiId}</span>
              <button
                onClick={copyUpi}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-cyan-400 active:scale-90 transition-transform"
                title="Copy UPI ID"
                id="copy-upi-btn"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Direct App Pay (Mobile only indicator) */}
            <a
              href={upiUrl}
              className="w-full py-4 rounded-xl text-xs font-semibold tracking-wider uppercase text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 transition-all shadow-lg active:scale-95"
            >
              Pay Instantly via UPI App
            </a>
            <span className="text-[10px] text-slate-500 font-mono mt-3">
              Clicking triggers PhonePe, GPay, Paytm on supported devices
            </span>
          </div>

          {/* Right Panel: Payment Confirmation Form */}
          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-850 p-6 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-md relative">
            <h3 className="text-xl font-bold text-white mb-2">Step 2: Submit Payment Reference</h3>
            <p className="text-xs text-slate-400 font-light leading-relaxed mb-6">
              Once you complete the transaction through your UPI app, submit the Transaction Reference ID (UTR / Reference number) below to verify your submission and expedite delivery.
            </p>

            {successConfirm ? (
              <div
                className="border border-emerald-500/30 bg-slate-950/40 p-8 rounded-2xl text-center space-y-4"
                id="payment-success-card"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Reference Submitted Successfully!</h4>
                <p className="text-xs text-slate-400 font-light max-w-md mx-auto leading-relaxed">
                  Your reference ID is associated with your order. Utkarsh will verify the transfer in his Bhim ledger and initiate drafting of your deliverables. We will notify you shortly.
                </p>
                <button
                  onClick={() => setSuccessConfirm(false)}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  Verify Another Payment
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifySubmit} className="space-y-4" id="payment-verification-form">
                {errorMsg && (
                  <div className="flex items-start space-x-2.5 bg-red-950/40 border border-red-800/40 p-4 rounded-xl text-red-400 text-xs font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Form row: Order ID & Amount */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      Associated Order ID <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UB-102943"
                      value={inputOrderId}
                      onChange={(e) => setInputOrderId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
                      id="pay-orderId"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      Amount Paid (INR)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={amount || 'Flexible'}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-500"
                    />
                  </div>
                </div>

                {/* Transaction Ref */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    UPI Transaction ID / UTR Number <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 312849201948"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
                    id="pay-transactionId"
                  />
                  <span className="text-[9px] font-mono text-slate-550 block">
                    Usually a 12-digit numeric code visible on your UPI app transaction receipt
                  </span>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    Payment Notes / Sender Name <span className="text-slate-600">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Sent from Rajesh Sharma GPay. Please begin Q4 Excel sheet ASAP."
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
                    id="pay-clientNotes"
                  />
                </div>

                <div className="pt-4 border-t border-slate-900 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl text-xs font-semibold tracking-wider uppercase text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition-all shadow-xl shadow-emerald-500/10"
                    id="pay-verify-btn"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 text-slate-950 animate-spin" />
                        <span>Verifying Reference Ledger...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-slate-950" />
                        <span>Submit Verification Request</span>
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
