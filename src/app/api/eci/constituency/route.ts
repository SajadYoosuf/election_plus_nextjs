import { NextRequest, NextResponse } from 'next/server';

// Use edge runtime so it executes in the region closest to the user (e.g. India)
export const runtime = 'edge';
export const preferredRegion = 'bom1';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
];

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ac = searchParams.get('ac');

  if (!ac) return NextResponse.json({ error: 'AC number required' }, { status: 400 });

  // Pad AC number to 3 digits
  const acPadded = ac.padStart(3, '0');

  const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  const fetchHeaders = {
    'User-Agent': randomUA,
    'Referer': 'https://results.eci.gov.in/',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };

  // Per the project spec: candidateswise-S11{AC}.htm is the correct URL
  const urls = [
    `https://results.eci.gov.in/ResultAcGenMay2026/candidateswise-S11${acPadded}.htm`,
    `https://results.eci.gov.in/ResultAcGenMay2026/ConstituencywiseS11${acPadded}.htm`,
  ];

  let lastError = '';
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: fetchHeaders, cache: 'no-store' });
      if (!res.ok) {
        lastError = `HTTP ${res.status} from ${url}`;
        continue;
      }

      const html = await res.text();
      const candidates = parseECITable(html);

      if (candidates.length > 0) {
        return NextResponse.json({ candidates, source: url }, {
          headers: { 'Cache-Control': 'no-store' }
        });
      }

      lastError = `No candidates parsed from ${url}`;
    } catch (err: any) {
      lastError = err.message;
    }
  }

  return NextResponse.json({ error: lastError, candidates: [] }, { status: 502 });
}

// ---------------------------------------------------------------------------
// ECI HTML Parser
// The candidateswise page has this column structure:
// 0: SN | 1: Candidate | 2: Party | 3: EVM Votes | 4: Postal Votes | 5: Total | 6: % | 7: Status
// ---------------------------------------------------------------------------
function parseECITable(html: string) {
  const candidates: { name: string; party: string; votes: number; status: string; margin: number }[] = [];

  // Extract all <tr> rows from the table
  const trMatches = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];

  for (const tr of trMatches) {
    // Extract all <td> cells from this row
    const tdMatches = tr.match(/<td[\s\S]*?<\/td>/gi) || [];
    if (tdMatches.length < 6) continue;

    const cells = tdMatches.map(td => stripHtml(td).trim());

    // Skip header rows
    if (cells[1] && (cells[1].toLowerCase() === 'candidate' || cells[0].toLowerCase() === 'sn' || cells[0] === '#')) continue;
    // Skip total / summary rows
    if (cells[1] && (cells[1].toLowerCase().includes('total') || cells[1].toLowerCase().includes('nota'))) continue;

    const name = cells[1];
    const party = cells[2];
    const totalVotesStr = cells[5]?.replace(/[^0-9]/g, '') || '0';
    const totalVotes = parseInt(totalVotesStr, 10) || 0;
    const status = cells[7] || cells[cells.length - 1] || '';

    if (name && name.length > 1 && totalVotes >= 0) {
      candidates.push({ name, party, votes: totalVotes, status, margin: 0 });
    }
  }

  // Sort by votes descending
  candidates.sort((a, b) => b.votes - a.votes);

  // Compute margin for winner
  if (candidates.length >= 2) {
    candidates[0].margin = candidates[0].votes - candidates[1].votes;
  }

  return candidates;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
}
