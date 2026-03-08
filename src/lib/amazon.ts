export function buildAmazonSearchUrl(searchQuery: string): string {
  const encoded = encodeURIComponent(searchQuery);
  return `https://www.amazon.co.jp/s?k=${encoded}`;
}
