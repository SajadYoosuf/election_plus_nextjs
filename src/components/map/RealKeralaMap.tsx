'use client';

import { useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3-geo';
import { useResultsStore } from '@/store/results';
import { useMapStore } from '@/store/map';
import { motion, AnimatePresence } from 'framer-motion';
import { ECIStateData } from '@/lib/types';
import { FeatureCollection, Geometry } from 'geojson';

const GEOJSON_URL = 'https://raw.githubusercontent.com/opendatakerala/kerala-assembly-map/main/KLA_2026_Review/KLA_AC_2026.geojson';

interface ACProperties {
  AC_NO: string | number;
  AC_NAME: string;
}

export function RealKeralaMap() {
  const [geoData, setGeoData] = useState<FeatureCollection<Geometry, ACProperties> | null>(null);
  const { liveResultsJson } = useResultsStore();
  const { selectedAcNo, setSelectedAc } = useMapStore();
  const [hoveredAc, setHoveredAc] = useState<number | null>(null);

  const data: ECIStateData = JSON.parse(liveResultsJson);
  const chartData = data?.S11?.chartData || [];

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error('Error loading map data:', err));
  }, []);

  const projection = useMemo(() => {
    if (!geoData) return null;
    return d3.geoMercator().fitSize([400, 800], geoData);
  }, [geoData]);

  const pathGenerator = useMemo(() => {
    if (!projection) return null;
    return d3.geoPath().projection(projection);
  }, [projection]);

  const getLiveDataForAc = (acNo: number) => {
    return chartData.find((item) => Number(item[2]) === acNo);
  };

  const getPartyColor = (party: string | null) => {
    if (!party) return 'rgba(255,255,255,0.05)';
    const p = party.toUpperCase();
    if (p.includes('CPI') || p === 'RSP') return 'var(--kep-ldf)';
    if (p === 'INC' || p === 'IUML' || p.includes('KEC')) return 'var(--kep-udf)';
    if (p === 'BJP') return 'var(--kep-nda)';
    return 'var(--kep-text-secondary)';
  };

  if (!geoData || !pathGenerator) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-4">
        <div className="w-12 h-12 border-4 border-kep-ai border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-bold text-kep-text-secondary animate-pulse">
          ALGORITHMIC MAPPING IN PROGRESS...
        </span>
      </div>
    );
  }

  const hoveredData = hoveredAc ? getLiveDataForAc(hoveredAc) : null;

  return (
    <div className="relative w-full h-full flex justify-center items-center">
      <svg
        viewBox="0 0 400 800"
        className="w-full h-full max-h-[800px] drop-shadow-[0_0_50px_rgba(0,0,0,0.8)]"
      >
        <g>
          {geoData.features.map((feature) => {
            const acNo = Number(feature.properties?.AC_NO);
            const liveData = getLiveDataForAc(acNo);
            const party = liveData ? (liveData[0] as string) : null;
            const color = getPartyColor(party);
            const isSelected = selectedAcNo === acNo;
            const isHovered = hoveredAc === acNo;

            return (
              <motion.path
                key={acNo}
                d={pathGenerator(feature) || ''}
                fill={color}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={isSelected ? 2 : 0.5}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  stroke: isSelected || isHovered ? 'white' : 'rgba(255,255,255,0.15)',
                  fill: isSelected || isHovered ? color : `${color}dd`,
                }}
                whileHover={{ scale: 1.01, zIndex: 10 }}
                onMouseEnter={() => setHoveredAc(acNo)}
                onMouseLeave={() => setHoveredAc(null)}
                onClick={() => setSelectedAc(acNo)}
                className="cursor-pointer transition-all duration-300"
              />
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 p-4 rounded-2xl bg-kep-surface/50 backdrop-blur-md border border-white/5 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--kep-ldf)] shadow-[0_0_10px_var(--kep-ldf)]" />
          <span className="text-[10px] font-black tracking-widest text-white uppercase">LDF</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--kep-udf)] shadow-[0_0_10px_var(--kep-udf)]" />
          <span className="text-[10px] font-black tracking-widest text-white uppercase">UDF</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--kep-nda)] shadow-[0_0_10px_var(--kep-nda)]" />
          <span className="text-[10px] font-black tracking-widest text-white uppercase">NDA</span>
        </div>
      </div>

      {/* Modern Floating Result Card */}
      <AnimatePresence>
        {hoveredAc && hoveredData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="absolute top-0 right-0 z-50 p-6 rounded-[32px] bg-kep-elevated/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-[260px] pointer-events-none"
          >
            <div className="text-[10px] font-black tracking-[2px] text-kep-text-tertiary mb-3 uppercase">
              LIVE CONSTITUENCY
            </div>
            
            <div className="text-2xl font-black text-white leading-tight mb-1">
              {geoData.features.find((f) => Number(f.properties?.AC_NO) === hoveredAc)?.properties?.AC_NAME}
            </div>
            <div className="text-[10px] font-bold text-kep-text-secondary uppercase tracking-widest mb-6">
              AC NO: {hoveredAc}
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-[9px] font-black text-kep-winning tracking-widest uppercase mb-1">
                  CURRENT LEADER
                </div>
                <div className="text-md font-black text-white truncate">
                  {hoveredData[3] as string}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: getPartyColor(hoveredData[0] as string) }}
                  />
                  <span className="text-[11px] font-bold" style={{ color: getPartyColor(hoveredData[0] as string) }}>
                    {hoveredData[0] as string}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[9px] font-bold text-kep-text-tertiary">CLICK FOR DETAIL</span>
              <span className="text-lg">📊</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
