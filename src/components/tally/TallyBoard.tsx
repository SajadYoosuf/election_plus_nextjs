'use client';

import { useResultsStore } from '@/store/results';
import { usePreferencesStore } from '@/store/preferences';
import { motion } from 'framer-motion';
import { ECIStateData } from '@/lib/types';

export function TallyBoard() {
  const { liveResultsJson } = useResultsStore();
  const { language } = usePreferencesStore();
  
  const data: ECIStateData = JSON.parse(liveResultsJson);
  const chartData = data?.S11?.chartData || [];
  
  const tally = { LDF: 0, UDF: 0, NDA: 0, Other: 0 };
  
  chartData.forEach((item) => {
    const party = item[0] as string;
    if (['CPI(M)', 'CPI', 'RSP'].includes(party)) tally.LDF++;
    else if (['INC', 'IUML', 'KEC', 'KEC(M)', 'KEC(J)'].includes(party)) tally.UDF++;
    else if (party === 'BJP') tally.NDA++;
    else tally.Other++;
  });

  const translate = (ml: string, en: string) => (language === 'ml' ? ml : en);

  return (
    <div className="w-full p-6 rounded-3xl bg-gradient-to-br from-kep-elevated to-kep-surface/80 border border-white/10 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] font-black tracking-[1.5px] text-kep-text-secondary">
          {translate('കേരള നിലവാരം', 'KERALA TALLY')}
        </span>
        <div className="px-2.5 py-1 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-black text-red-500 tracking-wider uppercase">
            {translate('തത്സമയം', 'LIVE')}
          </span>
        </div>
      </div>

      <div className="flex justify-around items-end mb-6">
        <TallyItem label="LDF" count={tally.LDF} color="var(--kep-ldf)" />
        <TallyItem label="UDF" count={tally.UDF} color="var(--kep-udf)" />
        <TallyItem label="NDA" count={tally.NDA} color="var(--kep-nda)" />
      </div>

      <MajorityBar tally={tally} />
      
      <div className="mt-3 text-center">
        <span className="text-[10px] font-medium text-kep-text-secondary">
          {translate('ഭൂരിപക്ഷം: 71', 'Majority: 71')}
        </span>
      </div>
    </div>
  );
}

function TallyItem({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.span 
        key={count}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl font-black tabular-nums"
        style={{ color, textShadow: `0 0 20px ${color}40` }}
      >
        {count}
      </motion.span>
      <span className="text-[11px] font-bold text-white/90 mt-1">{label}</span>
    </div>
  );
}

interface Tally {
  LDF: number;
  UDF: number;
  NDA: number;
  Other: number;
}

function MajorityBar({ tally }: { tally: Tally }) {
  const total = 140;
  const ldfP = (tally.LDF / total) * 100;
  const udfP = (tally.UDF / total) * 100;
  const ndaP = (tally.NDA / total) * 100;

  return (
    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex">
      <motion.div initial={{ width: 0 }} animate={{ width: `${ldfP}%` }} className="bg-kep-ldf" />
      <motion.div initial={{ width: 0 }} animate={{ width: `${udfP}%` }} className="bg-kep-udf" />
      <motion.div initial={{ width: 0 }} animate={{ width: `${ndaP}%` }} className="bg-kep-nda" />
    </div>
  );
}
