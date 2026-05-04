'use client';

import { useResultsStore } from '@/store/results';
import { usePreferencesStore } from '@/store/preferences';
import { keralaConstituencies } from '@/lib/constituencies';
import { useMapStore } from '@/store/map';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ECIStateData } from '@/lib/types';

export function ConstituencyGrid() {
  const { liveResultsJson } = useResultsStore();
  const { setSelectedAc } = useMapStore();
  const { language } = usePreferencesStore();
  const [filter, setFilter] = useState<'ALL' | 'LDF' | 'UDF' | 'NDA'>('ALL');

  const data: ECIStateData = JSON.parse(liveResultsJson);
  const chartData = data?.S11?.chartData || [];

  const translate = (ml: string, en: string) => (language === 'ml' ? ml : en);

  const getPartyForAc = (acNo: number) => {
    const entry = chartData.find((item) => Number(item[2]) === acNo);
    return entry ? (entry[0] as string) : null;
  };

  const getLeaderForAc = (acNo: number) => {
    const entry = chartData.find((item) => Number(item[2]) === acNo);
    return entry ? (entry[3] as string) : 'Counting...';
  };

  const getPartyColor = (party: string | null) => {
    if (!party) return 'var(--kep-text-tertiary)';
    const p = party.toUpperCase();
    if (p.includes('CPI') || p === 'RSP') return 'var(--kep-ldf)';
    if (p === 'INC' || p === 'IUML' || p.includes('KEC')) return 'var(--kep-udf)';
    if (p === 'BJP') return 'var(--kep-nda)';
    return 'var(--kep-text-secondary)';
  };

  const filteredConstituencies = Object.values(keralaConstituencies).filter(c => {
    if (filter === 'ALL') return true;
    const party = getPartyForAc(c.acNo);
    if (!party) return false;
    const p = party.toUpperCase();
    if (filter === 'LDF') return p.includes('CPI') || p === 'RSP';
    if (filter === 'UDF') return p === 'INC' || p === 'IUML' || p.includes('KEC');
    if (filter === 'NDA') return p === 'BJP';
    return false;
  });

  return (
    <div className="space-y-6">
      {/* Modern Filter Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit border border-white/5">
        {(['ALL', 'LDF', 'UDF', 'NDA'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
              filter === f 
                ? 'bg-kep-ai text-white shadow-lg shadow-kep-ai/20' 
                : 'text-kep-text-tertiary hover:text-kep-text-secondary'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Modern Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredConstituencies.map(c => {
          const party = getPartyForAc(c.acNo);
          const leader = getLeaderForAc(c.acNo);
          const color = getPartyColor(party);

          return (
            <motion.button
              key={c.acNo}
              layout
              onClick={() => {
                setSelectedAc(c.acNo);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-4 rounded-2xl bg-kep-surface/50 border border-white/5 hover:border-white/10 transition-all text-left flex items-center gap-4 group"
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
              >
                <span className="text-xs font-black" style={{ color }}>{c.acNo}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold truncate group-hover:text-kep-ai transition-colors">
                  {translate(c.nameMl, c.name)}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-black tracking-widest text-kep-text-tertiary uppercase truncate">
                    {leader}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-white/10" />
                  <span className="text-[9px] font-bold" style={{ color }}>{party || '...'}</span>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-lg text-kep-ai">→</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
