"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ServicesPage from "@/components/ServicesPage";
import PopularServices from "@/components/PopularServices";
import FeaturesSection from "@/components/FeaturesSection";
import AiChatButton from "@/components/AiChatButton";


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <ServicesPage />
        <PopularServices />
        <FeaturesSection />
        
        <AiChatButton />
      
      </main>
      <Footer />
    </div>
  );
}

