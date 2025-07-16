export function extractEmailsFromText(raw: string): string[] {
    const cleaned = raw.replace(/\n/g, " ").replace(/\s+/g, " ");
    
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    
    const matches = cleaned.match(emailRegex);
    
    return matches ? Array.from(new Set(matches)) : [];
  }
  