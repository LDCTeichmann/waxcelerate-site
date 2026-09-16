// ─── Einzeln: Draht, Zange, Wachs-Service ───────────────────────────────────
// v3 (16.09.2026): drei Karten mit festen Zonen — Foto, Kicker, Name (zwei
// Zeilen Platz), zwei kurze Fakten, Preis immer am Kartenboden. Beim
// Einzelkauf kosten Zange und Draht je 1,80 € Versand (graue Pille); im Set
// entfällt er (grüne Pille). Alle Zahlen aus data.ts bzw. rewax/content.ts.
// Die ganze Karte ist der Link, deshalb keine weiteren Links darin.

import { Link } from 'react-router-dom';
import { ArrowUpRight, Truck, PackageCheck } from 'lucide-react';
import { accessories } from '@/lib/data';
import { PRICE, TURNAROUND } from '@/pages/rewax/content';
import { eur, PCT } from '@/pages/starter/content';
import { SET_FROM } from '@/pages/starter/setFacts';
import '@/pages/product/wax/wax.css';
import './starter.css';

export type AccCardId = 'wire' | 'pliers' | 'rewax' | 'set';

interface CardProps {
  to: string;
  img: string;
  imgPos: string;
  kicker: string;
  name: string;
  facts: string[];
  from?: string;
  price: string;
  notes: React.ReactNode;
}

function Card({ to, img, imgPos, kicker, name, facts, from, price, notes }: CardProps) {
  return (
    <Link to={to} className="wxs-acc-card">
      <div className="ph">
        <img src={img} alt="" aria-hidden loading="lazy" decoding="async" style={{ objectPosition: imgPos }} />
      </div>
      <div className="bd">
        <p className="kk">{kicker}</p>
        <p className="nm">{name}</p>
        <div className="facts">{facts.map((f) => <span key={f}>{f}</span>)}</div>
        <div className="ft">
          <div className="notes">{notes}</div>
          <div className="pr">
            <b>{from && <small>{from}</small>}{price}</b>
            <span className="go" aria-hidden><ArrowUpRight className="h-4 w-4" /></span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function AccessoryCards({ de, ids = ['wire', 'pliers', 'rewax'] }: { de: boolean; ids?: AccCardId[] }) {
  const wire = accessories.find((a) => a.id === 'acc-wire')!;
  const pliers = accessories.find((a) => a.id === 'acc-pliers')!;
  const toolNotes = (cost?: number) => (
    <>
      {cost !== undefined && (
        <span className="wxs-shipcost"><Truck aria-hidden />{de ? `zzgl. ${eur(cost, de)} Versand` : `plus ${eur(cost, de)} shipping`}</span>
      )}
      <span className="wxs-setdeal"><PackageCheck aria-hidden />{de ? `Im Set bis −${PCT} %, versandfrei` : `Up to −${PCT} % in the set, free shipping`}</span>
    </>
  );
  const spec = (a: typeof wire, key: string) => a.specs?.[key];

  const cards: Record<AccCardId, React.ReactNode> = {
    wire: <Card key="wire" to={`/zubehoer/${wire.slug}`}
        img="/images/blog/wax-blue-wire-chain-800.webp" imgPos="80% 70%"
        kicker={de ? 'Werkzeug' : 'Tool'}
        name={de ? wire.title : wire.titleEn}
        facts={de
          ? [spec(wire, 'Material') ?? 'Edelstahl', spec(wire, 'Länge') ?? '']
          : ['Stainless steel', '~55 cm each']}
        price={eur(wire.price, de)}
        notes={toolNotes(wire.shippingCost)} />,
    pliers: <Card key="pliers" to={`/zubehoer/${pliers.slug}`}
        img={pliers.image} imgPos="45% 60%"
        kicker={de ? 'Werkzeug' : 'Tool'}
        name={de ? pliers.title : pliers.titleEn}
        facts={de ? ['Gehärteter Stahl', 'mit Rückholfeder'] : ['Hardened steel', 'return spring']}
        price={eur(pliers.price, de)}
        notes={toolNotes(pliers.shippingCost)} />,
    rewax: <Card key="rewax" to="/kette-wachsen-lassen"
        img="/images/shelf/shelf-rewax-800.webp" imgPos="50% 60%"
        kicker="Service"
        name={de ? 'Kette wachsen lassen' : 'Get your chain waxed'}
        facts={de ? ['Einschicken, gewachst zurück', TURNAROUND.short] : ['Send in, get it back waxed', TURNAROUND.shortEn]}
        from={de ? 'ab ' : 'from '}
        price={eur(PRICE.rewax.bundle, de)}
        notes={
          <span className="wxs-shipcost">
            {de
              ? `je Kette ab 2 · einzeln ${eur(PRICE.rewax.single, de)} · zzgl. Rückversand`
              : `per chain from 2 · single ${eur(PRICE.rewax.single, de)} · plus return`}
          </span>
        } />,
    set: <Card key="set" to="/starter-set"
        img="/images/doors/starter-set-800.webp" imgPos="50% 60%"
        kicker={de ? 'Günstiger' : 'Better value'}
        name={de ? 'Starter-Set: Wachs, Zange, Draht' : 'Starter set: wax, pliers, wire'}
        facts={de ? ['alles fürs erste Wachsen', 'Kette optional'] : ['everything for the first waxing', 'chain optional']}
        from={de ? 'ab ' : 'from '}
        price={eur(SET_FROM, de)}
        notes={<span className="wxs-setdeal"><PackageCheck aria-hidden />{de ? `bis −${PCT} %, Versand kostenlos` : `up to −${PCT} %, free shipping`}</span>} />,
  };

  return <div className="wxs-acc">{ids.map((id) => cards[id])}</div>;
}
