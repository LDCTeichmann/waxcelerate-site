#!/usr/bin/env node
// Partner-Codes fuer /partner/konditionen verwalten (Upstash Redis, gleiche Instanz wie api/admin.ts).
//
//   node scripts/partner-code.mjs create "Beispiel Rad" "Leipzig" DE
//   node scripts/partner-code.mjs list
//   node scripts/partner-code.mjs revoke WX-ABCD-EFGH-JKLM
//   node scripts/partner-code.mjs restore WX-ABCD-EFGH-JKLM
//
// Zugang: UPSTASH_REDIS_REST_URL und UPSTASH_REDIS_REST_TOKEN aus der Umgebung oder aus
// .env.local (Vercel-Dashboard, Project Settings, Environment Variables). Ohne beides bricht
// das Skript ab. Ein gesperrter Code wirkt sofort, auch fuer schon angemeldete Browser.

import { randomInt } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { Redis } from '@upstash/redis';

if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/.exec(line);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) {
  console.error('UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN fehlen (Umgebung oder .env.local).');
  process.exit(1);
}
const redis = new Redis({ url, token });

const BASE = 'https://waxcelerate.de';
// Ohne 0/O/1/I, damit sich Codes am Telefon und von Hand sicher abtippen lassen.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_RE = /^WX-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const group = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
const newCode = () => `WX-${group()}-${group()}-${group()}`;

const [cmd, ...args] = process.argv.slice(2);

async function create(shop, city, country) {
  if (!shop || !city || !['DE', 'AT'].includes(country)) {
    console.error('Aufruf: create "<Shop>" "<Stadt>" <DE|AT>');
    process.exit(1);
  }
  const code = newCode();
  await redis.set(`partner:code:${code}`, { shop, city, country, active: true, createdAt: new Date().toISOString() });
  console.log(`Code:  ${code}`);
  console.log(`Shop:  ${shop}, ${city} (${country})`);
  console.log(`Link:  ${BASE}/partner/konditionen?c=${code}`);
  console.log('Den Link oder Code nur direkt an den Partner geben (Mail, Nachricht, zweiter QR im Konditionenblatt).');
}

async function setActive(code, active) {
  const c = (code ?? '').toUpperCase();
  if (!CODE_RE.test(c)) {
    console.error('Bitte einen Code im Format WX-XXXX-XXXX-XXXX angeben.');
    process.exit(1);
  }
  const rec = await redis.get(`partner:code:${c}`);
  if (!rec) {
    console.error('Code nicht gefunden.');
    process.exit(1);
  }
  await redis.set(`partner:code:${c}`, { ...rec, active });
  console.log(`${c} (${rec.shop}, ${rec.city}) ist jetzt ${active ? 'aktiv' : 'gesperrt'}.`);
}

async function list() {
  let cursor = 0;
  const rows = [];
  do {
    const [next, keys] = await redis.scan(cursor, { match: 'partner:code:*', count: 100 });
    cursor = Number(next);
    for (const key of keys) {
      const code = key.replace('partner:code:', '');
      const [rec, seen] = await Promise.all([redis.get(key), redis.get(`partner:seen:${code}`)]);
      if (rec) rows.push({ code, ...rec, seen: seen ?? '' });
    }
  } while (cursor !== 0);
  if (!rows.length) return console.log('Noch keine Codes angelegt.');
  rows.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  for (const r of rows) {
    console.log(`${r.code}  ${r.active ? 'aktiv   ' : 'gesperrt'}  ${r.country}  ${r.shop}, ${r.city}  · angelegt ${String(r.createdAt).slice(0, 10)}  · erster Login ${r.seen ? String(r.seen).slice(0, 10) : 'noch nie'}`);
  }
}

if (cmd === 'create') await create(args[0], args[1], args[2]);
else if (cmd === 'list') await list();
else if (cmd === 'revoke') await setActive(args[0], false);
else if (cmd === 'restore') await setActive(args[0], true);
else {
  console.error('Befehle: create "<Shop>" "<Stadt>" <DE|AT> | list | revoke <CODE> | restore <CODE>');
  process.exit(1);
}
