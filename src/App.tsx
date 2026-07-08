/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import OrderForm from './components/OrderForm';
import Payment from './components/Payment';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';
import AuthModal from './components/AuthModal';
import AdminPortal from './components/AdminPortal';
import ReviewsPage from './components/ReviewsPage';

export default function App() {
  const [selectedService, setSelectedService] = useState('');
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [view, setView] = useState<'landing' | 'admin' | 'reviews'>('landing');

  // When a user selects a service from packages or capability matrix
  const handleSelectService = (serviceName: string) => {
    setSelectedService(serviceName);
  };

  // When order is submitted, pass Order ID & budget automatically to Payment desk
  const handleOrderSuccess = (newOrderId: string, estAmount: string) => {
    setOrderId(newOrderId);
    setAmount(estAmount);
  };

  const handleOpenAi = () => {
    setAiOpen(true);
    // Tweak to smoothly focus chat input if opened
    setTimeout(() => {
      const input = document.getElementById('chat-input');
      input?.focus();
    }, 300);
  };

  if (view === 'admin') {
    return <AdminPortal onClose={() => setView('landing')} />;
  }

  if (view === 'reviews') {
    return <ReviewsPage onClose={() => setView('landing')} />;
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 selection:bg-cyan-500 selection:text-slate-950 animate-fade-in" id="ub-root-wrapper">
      {/* Translucent Backdrop Navigation */}
      <Navbar 
        onOpenAI={handleOpenAi} 
        onOpenAuth={() => setIsAuthModalOpen(true)} 
        onOpenAdmin={() => setView('admin')} 
        onOpenReviews={() => setView('reviews')}
      />

      {/* Hero Entrance Page */}
      <Hero />

      {/* Main Agency Story and Metric Stats */}
      <About />

      {/* Comprehensive Catalog & Flat Rates */}
      <Services onSelectService={handleSelectService} />

      {/* Portfolio Gallery Showcase & Case Studies */}
      <Portfolio />

      {/* Value Propositions Bento Board */}
      <WhyChooseUs />

      {/* Interactive Submissions Form */}
      <OrderForm selectedService={selectedService} onOrderSuccess={handleOrderSuccess} />

      {/* BHIM UPI Direct payment verification desk */}
      <Payment orderId={orderId} amount={amount} />

      {/* Testimonial slider reviews */}
      <Testimonials onOpenReviews={() => setView('reviews')} />

      {/* FAQ accordions */}
      <FAQ />

      {/* Direct support anchors and inquiry form */}
      <Contact />

      {/* Detailed copyright & privacy maps */}
      <Footer />

      {/* Intelligent Gemini Consultation system */}
      <AIAssistant
        onSelectService={handleSelectService}
        isOpen={aiOpen}
        onToggle={() => setAiOpen(!aiOpen)}
      />

      {/* Secure Client Authentication Gateway Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

