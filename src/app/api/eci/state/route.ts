import { NextResponse } from 'next/server';

// Run this function from Mumbai (India) — ECI blocks non-Indian IP addresses
export const preferredRegion = 'bom1';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

export async function GET() {
  try {
    const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    
    const response = await fetch('https://results.eci.gov.in/ResultAcGenMay2026/election-json-S11-live.json', {
      headers: {
        'User-Agent': randomUA,
        'Accept': 'application/json',
        'Referer': 'https://results.eci.gov.in/',
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 0 } // Disable Next.js caching for this request
    });

    if (!response.ok) {
      throw new Error(`ECI responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('State API Critical Failure:', error.message);
    return NextResponse.json({ 
      error: 'ECI Data Source Unavailable',
      details: error.message 
    }, { status: 503 });
  }
}
