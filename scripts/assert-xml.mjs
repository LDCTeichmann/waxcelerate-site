// Shared well-formedness check for sitemap.xml and google-merchant-feed.xml.
// A broken character (bare &) is enough for Google to drop the whole file.
// Throw during `npm run gen:public` so a bad feed never reaches dist/.

export function assertXml(xml, name) {
  if (typeof xml !== 'string' || !xml.startsWith('<?xml')) {
    throw new Error(`${name}: missing XML declaration`);
  }
  const stripped = xml.replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9A-Fa-f]+);/g, '');
  if (stripped.includes('&')) {
    throw new Error(`${name}: unescaped & — crawlers reject this file`);
  }
  if (xml.includes('\u0000')) {
    throw new Error(`${name}: null byte`);
  }
}
