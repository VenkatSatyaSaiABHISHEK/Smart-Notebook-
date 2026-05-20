import React, { useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import DashboardPreview from '../components/landing/DashboardPreview';
import FeaturesSection from '../components/landing/FeaturesSection';
import AIShowcase from '../components/landing/AIShowcase';
import CommunityShowcase from '../components/landing/CommunityShowcase';
import AnalyticsSection from '../components/landing/AnalyticsSection';
import WorkflowTimeline from '../components/landing/WorkflowTimeline';
import Testimonials from '../components/landing/Testimonials';
import PricingSection from '../components/landing/PricingSection';
import FAQSection from '../components/landing/FAQSection';
import Footer from '../components/landing/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    // Basic global scroll animations can go here
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-[#f9fafb] min-h-screen text-[#111827] overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-600/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <Navbar />
      
      <main className="relative z-10 flex flex-col items-center w-full">
        <HeroSection />
        <DashboardPreview />
        <FeaturesSection />
        <AIShowcase />
        <CommunityShowcase />
        <AnalyticsSection />
        <WorkflowTimeline />
        <Testimonials />
        <PricingSection />
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
