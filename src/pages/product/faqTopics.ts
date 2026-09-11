// Stichworte, an denen eine Frage als produktrelevant erkannt wird.
// Reihenfolge = Anzeigereihenfolge. Eigene, JSX-freie Datei (statt in
// ProductFaq.tsx), weil scripts/generate-product-html.mjs (P1-2) dieselbe
// Auswahl fuer den vorgerenderten Rumpf braucht und ein .mjs-Skript keine
// .tsx-Datei mit React-/lucide-react-Imports importieren sollte — eine
// Quelle statt einer zweiten, getippten Kopie der Stichworte.
export const WAX_TOPICS = [
  'Classic und Pro', 'Classic or Pro',
  'Ausrüstung', 'equipment',
  'entfetten', 'degrease',
  'Anwendungen hält ein 500g', 'applications does a 500g',
  'breche ich die Kette', 'break the chain in',
  'Nachwachsen immer alles', 'always remove all',
  'nicht so lange', 'not last as long',
  'PTFE',
  'E-Bike',
  'Kassette und Kettenblätter', 'cassette and chainrings',
  'Wachstopf', 'wax pot',
];

export const CHAIN_TOPICS = [
  'vorgewachsten Kette', 'pre-waxed chain',
  'komplett ersetzen', 'replace the chain',
  'Quick-Links', 'quick links',
  'Ultraschallbad', 'ultrasonic',
  'Regen', 'rain',
  'Ketten-Rotation', 'chain rotation',
];
