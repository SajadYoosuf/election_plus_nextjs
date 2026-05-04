'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useResultsStore } from '@/store/results';
import { useEffect } from 'react';
import { TallyBoard } from '@/components/tally/TallyBoard';
import { InsightChips } from '@/components/chips/InsightChips';
import { SmartCard } from '@/components/constituency/SmartCard';
import { usePreferencesStore } from '@/store/preferences';
import { RealKeralaMap } from '@/components/map/RealKeralaMap';
import { AIBar } from '@/components/ai/AIBar';
import { ConstituencySelector } from '@/components/constituency/ConstituencySelector';
import { ConstituencyGrid } from '@/components/constituency/ConstituencyGrid';

export default function Home() {
  const { setLiveResults } = useResultsStore();
  const { language, toggleLanguage } = usePreferencesStore();

  const { data } = useQuery({
    queryKey: ['state'],
    queryFn: async () => {
      const res = await axios.get('/api/eci/state');
      return res.data;
    },
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (data) {
      setLiveResults(data);
    }
  }, [data, setLiveResults]);

  const translate = (ml: string, en: string) => (language === 'ml' ? ml : en);

  return (
    <main className="min-h-screen bg-kep-bg text-kep-text-primary pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 px-5 md:px-10 py-4 flex justify-between items-center bg-kep-bg/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-kep-ai/15 rounded-xl text-lg">🗳️</div>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-black tracking-tight leading-none">
              {translate('ഇലക്ഷൻ പൾസ്', 'ELECTION PULSE')}
            </h1>
            <span className="text-[10px] font-bold text-kep-ai uppercase tracking-widest mt-1">
              KERALA ASSEMBLY 2026
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2 border border-white/10"
          >
            <span className="text-xs font-bold text-kep-text-secondary uppercase">
              {language === 'ml' ? 'Malayalam' : 'English'}
            </span>
            <span className="text-xs opacity-30">|</span>
            <span className="text-xs font-bold text-white uppercase">
              {language === 'ml' ? 'EN' : 'ML'}
            </span>
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-8 space-y-12">
        {/* Top Section: Dashboard + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Tally & Controls */}
          <div className="lg:col-span-4 space-y-8">
            <section>
              <TallyBoard />
            </section>
            
            <section>
              <ConstituencySelector />
            </section>

            <section className="hidden lg:block">
              <div className="flex items-center gap-2 mb-4 opacity-50">
                <span className="text-sm">🚨</span>
                <span className="text-[10px] font-black tracking-[1.5px] uppercase">
                  {translate('തത്സമയ വിശകലനം', 'LIVE INSIGHTS')}
                </span>
              </div>
              <InsightChips />
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4 opacity-50">
                <span className="text-sm">📊</span>
                <span className="text-[10px] font-black tracking-[1.5px] uppercase">
                  {translate('മണ്ഡലം വിവരങ്ങൾ', 'CONSTITUENCY FOCUS')}
                </span>
              </div>
              <SmartCard />
            </section>
          </div>

          {/* Right Column: Interactive Map */}
          <div className="lg:col-span-8">
            <section className="lg:hidden mb-8">
              <InsightChips />
            </section>

            <section className="bg-kep-surface rounded-[40px] border border-white/5 p-6 md:p-10 h-full">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🗺️</span>
                  <div>
                    <h2 className="text-lg font-bold">
                      {translate('സംസ്ഥാന ഭൂപടം', 'INTERACTIVE STATE MAP')}
                    </h2>
                    <p className="text-xs text-kep-text-secondary">Geographic boundaries and real-time leads</p>
                  </div>
                </div>
              </div>
              
              <div className="w-full flex justify-center">
                <RealKeralaMap />
              </div>
            </section>
          </div>
        </div>

        {/* FULL WIDTH RESULTS SECTION */}
        <section className="pt-12 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl">
                🗳️
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase">
                  {translate('പൂർണ്ണ ഫലം', 'FULL STATE RESULTS')}
                </h2>
                <p className="text-sm text-kep-text-tertiary">Live data for all 140 constituencies</p>
              </div>
            </div>
          </div>
          
          <div className="w-full">
            <ConstituencyGrid />
          </div>
        </section>
      </div>

      <AIBar />
    </main>
  );
}
