"use client";
import { useLanguage } from "@/context/LanguageContext";

export default function CTA({ onJoinClick }) {
  const { t } = useLanguage();

  return (
    <section className="bg-black text-white py-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-3">
          {t.readyToStart || "Ready to get started?"}
        </h2>
        <p className="text-base mb-6 text-gray-300">
          {t.joinNowText || "Join thousands of satisfied customers on Kaazbazar"}
        </p>
        <button
          onClick={onJoinClick}
          className="bg-white text-black px-6 py-2.5 rounded-md font-semibold hover:bg-gray-100 transition"
        >
          {t.signUpNow || "Join now"}
        </button>
      </div>
    </section>
  );
}