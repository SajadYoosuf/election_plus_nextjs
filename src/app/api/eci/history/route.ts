import { NextRequest, NextResponse } from 'next/server';

const ECI_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Referer': 'https://results.eci.gov.in/',
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ac = searchParams.get('ac');
  const year = searchParams.get('year') || '2021';

  if (!ac) {
    return NextResponse.json({ error: 'AC number is required' }, { status: 400 });
  }

  try {
    // 2021 results are at a slightly different URL pattern
    const url = year === '2021' 
      ? `https://results.eci.gov.in/Result2021/candidateswise-S11${ac}.htm`
      : `https://results.eci.gov.in/ResultAcGenMay2016/candidateswise-S11${ac}.htm`;
      
    const res = await fetch(url, { headers: ECI_HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error(`ECI responded with ${res.status}`);
    const html = await res.text();
    const { parseConstituencyHTML } = await import('@/lib/parser');
    const candidates = parseConstituencyHTML(html);
    return NextResponse.json({ candidates });
  } catch (error: any) {
    console.error(`Error fetching historical ${year} data for AC ${ac}:`, error.message);
    return NextResponse.json({ 
      error: 'Failed to fetch historical data',
      status: error.response?.status 
    }, { status: 500 });
  }
}
