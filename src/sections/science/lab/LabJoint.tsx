// ─── LabJoint — das Kettengelenk im Querschnitt, Einstieg ins Labor ─────────
//
// Dieselben Ringe wie die Lupe in FrictionLens (Bolzen r38, Wachsspalt
// Zone 01, Laschenschulter r76, Wachsspalt Zone 02, Rolle r118), hier als
// Metallkoerper mit Glanz auf dunklem Grund. Die Kamera faehrt in Zone 01:
// transform-origin liegt genau auf dem Spalt, die Skalierung haengt an --z
// (0..1), das FilmLab aus dem Scroll setzt.

const JOINT_ZOOM_AT = { x: 0.5 + 42 / 520, y: 0.5 };   // Anteil der Breite/Hoehe

export function LabJoint({ de }: { de: boolean }) {
  const cx = 260, cy = 150;
  return (
    <div className="lab-joint" style={{ transformOrigin: `${JOINT_ZOOM_AT.x * 100}% ${JOINT_ZOOM_AT.y * 100}%` }}>
      <svg viewBox="0 0 520 300" className="block w-full h-full" role="img"
        aria-label={de ? 'Querschnitt durch ein Kettengelenk: Bolzen, Laschenschulter, Rolle, dazwischen zwei Wachsspalte.' : 'Cross-section through a chain joint: pin, plate shoulder, roller, with two wax gaps between.'}>
        <defs>
          <radialGradient id="lj-metal" cx="0.35" cy="0.3" r="0.9">
            <stop offset="0" stopColor="#AEB7C2" />
            <stop offset="0.55" stopColor="#5F6772" />
            <stop offset="1" stopColor="#2B3037" />
          </radialGradient>
          <radialGradient id="lj-pin" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#F1F4F7" />
            <stop offset="1" stopColor="#8E98A4" />
          </radialGradient>
          <radialGradient id="lj-wax" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.8" stopColor="#3D67CA" />
            <stop offset="1" stopColor="#7FA6DA" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r="140" fill="#07090C" />
        <circle cx={cx} cy={cy} r="118" fill="url(#lj-metal)" stroke="#C9D1DA" strokeOpacity=".5" />
        <circle cx={cx} cy={cy} r="84" fill="url(#lj-wax)" opacity=".85" />
        <circle cx={cx} cy={cy} r="76" fill="url(#lj-metal)" stroke="#C9D1DA" strokeOpacity=".5" />
        <circle cx={cx} cy={cy} r="46" fill="url(#lj-wax)" className="lab-joint-zone" />
        <circle cx={cx} cy={cy} r="38" fill="url(#lj-pin)" />
        <circle cx={cx + 42} cy={cy} r="10" fill="none" stroke="#fff" strokeWidth="1.4" className="lab-pulse" />
      </svg>
      <span className="lab-tag lab-tag--dark" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>{de ? 'Bolzen' : 'Pin'}</span>
      <span className="lab-tag" style={{ left: '50%', top: '70%', transform: 'translate(-50%,-50%)' }}>{de ? 'Laschenschulter' : 'Plate shoulder'}</span>
      <span className="lab-tag" style={{ left: '50%', top: '85%', transform: 'translate(-50%,-50%)' }}>{de ? 'Rolle' : 'Roller'}</span>
      <span className="lab-callout" style={{ left: `${JOINT_ZOOM_AT.x * 100 + 3}%`, top: '50%' }}>
        {de ? 'Zone 01 · hier liegt der Film' : 'Zone 01 · the film sits here'}
      </span>
    </div>
  );
}
