'use client';

import { useState } from 'react';
import { keralaConstituencies } from '@/lib/constituencies';
import { useMapStore } from '@/store/map';
import { usePreferencesStore } from '@/store/preferences';
import { motion, AnimatePresence } from 'framer-motion';

export function ConstituencySelector() {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { setSelectedAc } = useMapStore();
  const { language } = usePreferencesStore();

  const results = query 
    ? Object.values(keralaConstituencies).filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) || 
        c.nameMl.includes(query)
      ).slice(0, 5)
    : [];

  const translate = (ml: string, en: string) => (language === 'ml' ? ml : en);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-4 opacity-50">
        <span className="text-sm">🔍</span>
        <span className="text-[10px] font-black tracking-[1.5px] uppercase">
          {translate('മണ്ഡലം തിരഞ്ഞെടുക്കുക', 'FIND CONSTITUENCY')}
        </span>
      </div>

      <div className="relative">
        <input 
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsExpanded(true);
          }}
          onFocus={() => setIsExpanded(true)}
          placeholder={translate('തിരയുക...', 'Search by name...')}
          className="w-full bg-kep-surface border border-white/5 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:border-kep-ai transition-colors"
        />
        
        <AnimatePresence>
          {isExpanded && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 z-50 mt-2 bg-kep-elevated border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {results.map(c => (
                <button
                  key={c.acNo}
                  onClick={() => {
                    setSelectedAc(c.acNo);
                    setQuery('');
                    setIsExpanded(false);
                  }}
                  className="w-full px-5 py-3 text-left hover:bg-white/5 flex justify-between items-center transition-colors"
                >
                  <span className="text-sm font-bold">{translate(c.nameMl, c.name)}</span>
                  <span className="text-[10px] text-kep-text-tertiary uppercase">{c.district}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
