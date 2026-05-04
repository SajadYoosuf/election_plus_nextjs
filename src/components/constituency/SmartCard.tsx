'use client';

import { useMapStore } from '@/store/map';
import { usePreferencesStore } from '@/store/preferences';
import { keralaConstituencies } from '@/lib/constituencies';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Candidate, ConstituencyDetail } from '@/lib/types';
import { useState } from 'react';

export function SmartCard() {
  const { selectedAcNo } = useMapStore();
  const { language } = usePreferencesStore();
  const [activeYear, setActiveYear] = useState<'2026' | '2021'>('2026');

  const acInfo = selectedAcNo ? keralaConstituencies[selectedAcNo] : null;

  const { data, isLoading } = useQuery<ConstituencyDetail>({
    queryKey: ['constituency', selectedAcNo, activeYear],
    queryFn: async () => {
      const endpoint = activeYear === '2026' ? 'constituency' : 'history';
      const res = await axios.get(`/api/eci/${endpoint}?ac=${selectedAcNo}&year=${activeYear}`);
      return res.data;
    },
    enabled: !!selectedAcNo,
    refetchInterval: activeYear === '2026' ? 30000 : false,
  });

  const translate = (ml: string, en: string) => (language === 'ml' ? ml : en);

  if (!acInfo) {
    return (
      <div className="p-8 rounded-[32px] bg-kep-surface border border-white/5 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <span className="text-2xl text-kep-text-secondary">📍</span>
        </div>
        <h3 className="text-lg font-bold">
          {translate('മണ്ഡലം തിരഞ്ഞെടുക്കുക', 'Select a Constituency')}
        </h3>
        <p className="text-sm text-kep-text-secondary mt-2 max-w-[200px]">
          Tap the map or use search to see live results
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      layout
      className="p-6 rounded-[32px] bg-kep-surface border border-white/5 shadow-xl"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight">
            {translate(acInfo.nameMl, acInfo.name)}
          </h2>
          <span className="text-[10px] font-bold text-kep-text-secondary uppercase tracking-widest">
            {acInfo.district}
          </span>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button 
            onClick={() => setActiveYear('2026')}
            className={`px-3 py-1 text-[10px] font-black rounded-lg transition-colors ${activeYear === '2026' ? 'bg-kep-ai text-white' : 'text-kep-text-tertiary'}`}
          >
            2026
          </button>
          <button 
            onClick={() => setActiveYear('2021')}
            className={`px-3 py-1 text-[10px] font-black rounded-lg transition-colors ${activeYear === '2021' ? 'bg-kep-ai text-white' : 'text-kep-text-tertiary'}`}
          >
            2021
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 bg-white/5 rounded-md w-32" />
                    <div className="h-4 bg-white/5 rounded-md w-16" />
                  </div>
                  <div className="h-2 bg-white/5 rounded-full w-full" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key={activeYear}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            {data?.candidates?.slice(0, 3).map((candidate: Candidate, i: number) => (
              <CandidateRow 
                key={candidate.name}
                candidate={candidate}
                isLeading={i === 0}
                lang={language}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CandidateRow({ candidate, isLeading, lang }: { candidate: Candidate; isLeading: boolean; lang: string }) {
  const partyColor = getPartyColor(candidate.party);
  
  return (
    <div className="flex items-center gap-4">
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: isLeading ? `${partyColor}20` : 'rgba(255,255,255,0.05)' }}
      >
        <span className="text-sm" style={{ color: isLeading ? partyColor : 'var(--kep-text-secondary)' }}>
          {isLeading ? '📈' : '➖'}
        </span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-end mb-1.5">
          <span className="text-sm font-black truncate leading-tight">
            {candidate.name}
          </span>
          <span className="text-sm font-black tabular-nums">
            {candidate.votes.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-kep-text-secondary">
            {candidate.party}
          </span>
          {isLeading && (
            <span className="text-[10px] font-black text-kep-winning uppercase tracking-wider">
              {lang === 'ml' ? 'മുന്നിൽ' : 'LEADING'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function getPartyColor(party: string) {
  const p = party.toUpperCase();
  if (p.includes('CPI') || p === 'RSP') return 'var(--kep-ldf)';
  if (p === 'INC' || p === 'IUML' || p.includes('KEC')) return 'var(--kep-udf)';
  if (p === 'BJP') return 'var(--kep-nda)';
  return 'var(--kep-text-secondary)';
}
