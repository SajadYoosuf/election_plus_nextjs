'use client';

import { useResultsStore } from '@/store/results';
import { motion } from 'framer-motion';
import { ECIStateData } from '@/lib/types';

export function InsightChips() {
  const { liveResultsJson } = useResultsStore();
  
  const data: ECIStateData = JSON.parse(liveResultsJson);
  const chartData = data?.S11?.chartData || [];
  
  const tally = { LDF: 0, UDF: 0, NDA: 0 };
  chartData.forEach((item) => {
    const party = item[0] as string;
    if (['CPI(M)', 'CPI', 'RSP'].includes(party)) tally.LDF++;
    else if (['INC', 'IUML', 'KEC', 'KEC(M)', 'KEC(J)'].includes(party)) tally.UDF++;
    else if (party === 'BJP') tally.NDA++;
  });

  const insights = [];
  
  // Logical Tally Diffs
  if (tally.LDF > tally.UDF && tally.LDF > tally.NDA) {
    insights.push({ title: 'LDF LEADING STATE', color: 'var(--kep-ldf)', icon: '🔥' });
  } else if (tally.UDF > tally.LDF && tally.UDF > tally.NDA) {
    insights.push({ title: 'UDF LEADING STATE', color: 'var(--kep-udf)', icon: '🔥' });
  } else if (tally.NDA > tally.LDF && tally.NDA > tally.UDF) {
    insights.push({ title: 'NDA LEADING STATE', color: 'var(--kep-nda)', icon: '🔥' });
  }

  // Majority check
  if (tally.LDF >= 71) insights.push({ title: 'LDF CROSSED MAJORITY', color: 'var(--kep-winning)', icon: '✅' });
  if (tally.UDF >= 71) insights.push({ title: 'UDF CROSSED MAJORITY', color: 'var(--kep-winning)', icon: '✅' });

  if (insights.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {insights.map((insight, i) => (
        <motion.div
          key={insight.title}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex-shrink-0 px-4 py-2 rounded-full border flex items-center gap-2"
          style={{ 
            backgroundColor: `${insight.color}15`, 
            borderColor: `${insight.color}40` 
          }}
        >
          <span className="text-xs">{insight.icon}</span>
          <span className="text-[10px] font-black tracking-wider" style={{ color: insight.color }}>
            {insight.title}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
