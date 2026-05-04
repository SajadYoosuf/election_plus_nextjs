import * as cheerio from 'cheerio';

export interface Candidate {
  name: string;
  party: string;
  votes: number;
  margin: number;
  status: string;
}

export function parseConstituencyHTML(html: string): Candidate[] {
  const $ = cheerio.load(html);
  const candidates: Candidate[] = [];

  // ECI Table parsing logic
  // Based on structure: 0:SN, 1:Candidate, 2:Party, 3:EVM, 4:Postal, 5:Total, 6:%
  $('table tbody tr').each((_, element) => {
    const cells = $(element).find('td');
    
    if (cells.length >= 6) {
      const name = $(cells[1]).text().trim();
      const party = $(cells[2]).text().trim();
      const votesStr = $(cells[5]).text().trim().replace(/,/g, '');
      const votes = parseInt(votesStr) || 0;
      
      // The status (Leading/Won) is often in a specific badge or text color
      // but sometimes it's in the last column.
      const status = $(cells[cells.length - 1]).text().trim();

      if (name && name !== 'Candidate' && name !== 'Total') {
        candidates.push({ 
          name, 
          party, 
          votes, 
          margin: 0, // Will compute margin after sorting
          status 
        });
      }
    }
  });

  // Sort by votes descending
  const sorted = candidates.sort((a, b) => b.votes - a.votes);

  // Compute margins
  if (sorted.length >= 2) {
    sorted[0].margin = sorted[0].votes - sorted[1].votes;
    sorted[0].status = sorted[0].status || 'Leading';
  }

  return sorted;
}
