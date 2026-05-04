'use client';

import { useResultsStore } from '@/store/results';
import { useMapStore } from '@/store/map';
import { keralaConstituencies } from '@/lib/constituencies';
import { ECIStateData } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function KeralaMap() {
  const { liveResultsJson } = useResultsStore();
  const { selectedAcNo, setSelectedAc } = useMapStore();
  const [hoveredAc, setHoveredAc] = useState<number | null>(null);

  const data: ECIStateData = JSON.parse(liveResultsJson);
  const chartData = data?.S11?.chartData || [];

  // Group by district
  const districts: Record<string, number[]> = {};
  Object.entries(keralaConstituencies).forEach(([acNo, info]) => {
    if (!districts[info.district]) districts[info.district] = [];
    districts[info.district].push(Number(acNo));
  });

  const getPartyForAc = (acNo: number) => {
    const entry = chartData.find((item) => Number(item[2]) === acNo);
    return entry ? (entry[0] as string) : null;
  };

  const getPartyColor = (party: string | null) => {
    if (!party) return 'rgba(255,255,255,0.05)';
    const p = party.toUpperCase();
    if (p.includes('CPI') || p === 'RSP') return 'var(--kep-ldf)';
    if (p === 'INC' || p === 'IUML' || p.includes('KEC')) return 'var(--kep-udf)';
    if (p === 'BJP') return 'var(--kep-nda)';
    return 'var(--kep-text-secondary)';
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { scale: 0, opacity: 0 },
    show: { scale: 1, opacity: 1 }
  };

  return (
    <div className="relative">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
      >
        {Object.entries(districts).map(([district, acNumbers]) => (
          <motion.div 
            key={district} 
            variants={item}
            className="p-5 rounded-3xl bg-kep-surface/50 border border-white/5 hover:border-white/10 transition-colors group"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[11px] font-black tracking-[2px] text-kep-text-secondary uppercase group-hover:text-kep-ai transition-colors">
                {district}
              </h3>
              <span className="text-[9px] font-bold text-kep-text-tertiary px-2 py-0.5 rounded-full bg-white/5">
                {acNumbers.length} SEATS
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {acNumbers.map((acNo) => {
                const party = getPartyForAc(acNo);
                const color = getPartyColor(party);
                const isSelected = selectedAcNo === acNo;
                const isHovered = hoveredAc === acNo;

                return (
                  <div key={acNo} className="relative">
                    <motion.button
                      whileHover={{ scale: 1.4, zIndex: 10 }}
                      whileTap={{ scale: 0.9 }}
                      onHoverStart={() => setHoveredAc(acNo)}
                      onHoverEnd={() => setHoveredAc(null)}
                      onClick={() => setSelectedAc(acNo)}
                      className="w-5 h-5 rounded-full transition-all duration-300"
                      style={{ 
                        backgroundColor: color,
                        boxShadow: isSelected || isHovered ? `0 0 20px ${color}80` : 'none',
                        border: isSelected ? '2px solid white' : '1px solid rgba(255,255,255,0.1)'
                      }}
                    />
                    
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: -40, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none whitespace-nowrap px-3 py-1.5 rounded-lg bg-kep-elevated border border-white/10 shadow-2xl shadow-black"
                        >
                          <div className="text-[10px] font-black text-white leading-tight">
                            {keralaConstituencies[acNo].name}
                          </div>
                          <div className="text-[9px] font-bold opacity-60" style={{ color }}>
                            {party || 'Counting...'}
                          </div>
                          <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-kep-elevated border-r border-b border-white/10" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modern Overlay Legend */}
      <div className="mt-10 p-6 rounded-[32px] bg-kep-surface/30 border border-dashed border-white/10 flex flex-wrap justify-center gap-8">
        <LegendItem color="var(--kep-ldf)" label="LDF (CPI-M/CPI)" />
        <LegendItem color="var(--kep-udf)" label="UDF (INC/IUML)" />
        <LegendItem color="var(--kep-nda)" label="NDA (BJP)" />
        <LegendItem color="rgba(255,255,255,0.1)" label="WAITING" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}40` }} />
      <span className="text-[10px] font-black tracking-widest text-kep-text-secondary uppercase">{label}</span>
    </div>
  );
}
