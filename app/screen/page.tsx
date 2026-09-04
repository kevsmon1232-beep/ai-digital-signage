"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Ad {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  is_active: boolean;
}

export default function SignageScreen() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch initial ads
  const fetchAds = async () => {
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching ads:", error);
      return;
    }

    if (data) {
      setAds(data);
    }
  };

  useEffect(() => {
    fetchAds();

    // Realtime subscription para mag-auto-update kapag may bagong ad
    const channel = supabase
      .channel("ads-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ads" },
        () => {
          fetchAds();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Ad rotation logic
  useEffect(() => {
    if (ads.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [ads.length]);

  if (!ads.length) {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center text-3xl font-semibold gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p>Loading Ads...</p>
      </div>
    );
  }

  const currentAd = ads[currentIndex];

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col justify-between p-12 overflow-hidden">
      <header className="flex justify-between items-center border-b border-gray-800 pb-4">
        <h1 className="text-5xl font-extrabold tracking-wide">
          {currentAd?.title || "Digital Signage"}
        </h1>
        <span className="text-sm bg-gray-800 px-3 py-1 rounded-full text-gray-400">
          Ad {currentIndex + 1} of {ads.length}
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center my-6">
        {currentAd?.image_url ? (
          <img
            src={currentAd.image_url}
            alt="Ad Visual"
            className="max-h-[65vh] w-auto object-contain rounded-2xl shadow-2xl"
          />
        ) : (
          <div className="bg-gray-900 w-full h-[50vh] rounded-2xl flex items-center justify-center text-gray-500 text-2xl border border-gray-800">
            No Image Displayed
          </div>
        )}
      </main>

      <footer className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
        <p className="text-2xl text-gray-200 leading-relaxed">
          {currentAd?.description || "No description provided."}
        </p>
      </footer>
    </div>
  );
}