import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Echtzeit-3D-Wachsblock (lazy geladen, PNG-Fallback im Hero).
 * Form & Material dem echten Produkt nachempfunden: flacher, gerundeter
 * Block, tiefblaues Wachs mit MoS₂-/Additiv-Sprenkeln (prozedural gebackene
 * Albedo-Textur), wachstypischer Clearcoat-Glanz. Bewegung ist ausschließlich
 * nutzer-getrieben: Cursor neigt den Block (gedämpft), Scroll dreht ihn —
 * kein Idle-Loop. Einmaliger Entrance-Settle beim Laden.
 */

/**
 * Additiv-Sprenkel als echte 3D-Partikel auf der Blockoberfläche
 * (InstancedMesh) — keine UV-Säume wie bei Texturen auf RoundedBox.
 * Verteilt auf Front, rechte Flanke und Oberseite (die sichtbaren Faces).
 */
function Speckles() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const COUNT = 900;

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const s = new THREE.Vector3();
    const light = new THREE.Color('#E8EEF6');
    const dark  = new THREE.Color('#101F3E');
    const c = new THREE.Color();

    // Flache Bereiche der Faces (innerhalb der Kantenrundung r=0.26)
    const hx = 1.25 - 0.3, hy = 1.25 - 0.3, hz = 0.475;
    for (let i = 0; i < COUNT; i++) {
      const pick = Math.random();
      if (pick < 0.68) {
        v.set((Math.random() * 2 - 1) * hx, (Math.random() * 2 - 1) * hy, hz + 0.001);
      } else if (pick < 0.84) {
        v.set(1.25 - 0.001, (Math.random() * 2 - 1) * hy, (Math.random() * 2 - 1) * (hz - 0.12));
      } else {
        v.set((Math.random() * 2 - 1) * hx, 1.25 - 0.001, (Math.random() * 2 - 1) * (hz - 0.12));
      }
      const sc = 0.004 + Math.random() * 0.011;
      s.set(sc, sc, sc * 0.35);
      m.compose(v, q, s);
      mesh.setMatrixAt(i, m);
      c.copy(Math.random() < 0.88 ? light : dark);
      c.multiplyScalar(0.75 + Math.random() * 0.45);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial roughness={0.6} metalness={0} />
    </instancedMesh>
  );
}

function Block({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const scrollN = useRef(0);
  const settled = useRef(0);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      scrollN.current = Math.min(1.5, window.scrollY / window.innerHeight);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, [reduced]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    if (reduced) {
      g.rotation.set(0.42, -0.5, 0);
      g.scale.setScalar(1);
      return;
    }
    // Einmaliger Entrance-Settle (kein Loop): Block dreht sich in Position.
    settled.current = Math.min(1, settled.current + dt / 1.5);
    const ease = 1 - Math.pow(1 - settled.current, 3);

    const tRX = 0.42 + pointer.current.y * 0.14;
    const tRY = -0.5 - (1 - ease) * 1.25 + pointer.current.x * 0.28 + scrollN.current * 1.1;

    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tRX, 4.2, dt);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, tRY, 4.2, dt);
    g.position.y = (1 - ease) * -0.55 + scrollN.current * -0.35;
    g.scale.setScalar(0.93 + ease * 0.07);
  });

  return (
    <group ref={group} rotation={[0.42, -1.75, 0]} scale={0.93}>
      <RoundedBox args={[2.5, 2.5, 0.95]} radius={0.26} smoothness={10}>
        <meshPhysicalMaterial
          color={new THREE.Color('#3560BE')}
          roughness={0.44}
          metalness={0}
          clearcoat={0.45}
          clearcoatRoughness={0.55}
          specularIntensity={0.45}
          sheen={0.4}
          sheenRoughness={0.6}
          sheenColor={new THREE.Color('#9FB8E8')}
        />
      </RoundedBox>
      <Speckles />
    </group>
  );
}

export default function HeroBlock3D({ reduced = false }: { reduced?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.45, 4.7], fov: 31 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {/* Lichtregie: weiches Key, kühles Rim, Himmel/Boden-Verlauf — kein HDR-Download */}
      <hemisphereLight args={['#CDD7E6', '#0A0B0D', 0.55]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3.5, 4, 5]} intensity={1.55} />
      <directionalLight position={[-4.5, 2, -3]} intensity={1.0} color="#A9C6FF" />
      <pointLight position={[0, -2.5, 3.5]} intensity={0.35} />
      <Block reduced={reduced} />
      <ContactShadows position={[0, -1.78, 0]} opacity={0.55} scale={7.5} blur={2.6} far={3.4} color="#000000" />
    </Canvas>
  );
}
