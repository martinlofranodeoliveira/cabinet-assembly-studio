import React, { Component, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Box, Edges } from '@react-three/drei';
import { PerspectiveCamera, Vector3, type Camera, type OrthographicCamera } from 'three';
import { OrbitControls } from 'three-stdlib';
import { display, type Parameters, type PanelID, type Vec } from './core';
import { text, type Locale } from './i18n';

export function adapt(v: Vec, p: Parameters): Vec { return [(p.W / 2 - v[0]) * 0.001, (v[1] - p.H / 2) * 0.001, (v[2] - p.D / 2) * 0.001]; }
export function cameraPose(p: Parameters, explosion: number, aspect: number, mode: 'front' | 'iso') {
  const b = display(p, explosion).bounds;
  const min = adapt(b.min, p), max = adapt(b.max, p);
  const target = min.map((n, i) => (n + max[i]!) / 2) as Vec;
  const radius = Math.hypot(...max.map((n, i) => (n - min[i]!) / 2));
  const safeAspect = Number.isFinite(aspect) ? Math.min(1, Math.max(0.05, aspect)) : 1;
  const halfFov = Math.atan(Math.tan(35 * Math.PI / 360) * safeAspect);
  const distance = radius / Math.sin(halfFov) * 1.12;
  const direction = mode === 'front' ? new Vector3(0, 0, -1) : new Vector3(-1, 0.65, -1).normalize();
  const position = new Vector3(...target).addScaledVector(direction, distance).toArray() as Vec;
  return { target, position };
}
export function connectNavigation(camera: Camera, canvas: HTMLCanvasElement, invalidate: () => void, target: Vec = [0, 0, 0]): () => void {
  const projected = camera as PerspectiveCamera | OrthographicCamera;
  if (!((projected as PerspectiveCamera).isPerspectiveCamera || (projected as OrthographicCamera).isOrthographicCamera)) throw new Error('Camera projection is unsupported');
  const controls = new OrbitControls(projected, canvas);
  controls.enableDamping = false;
  controls.minDistance = 0.05;
  controls.maxDistance = 100;
  controls.target.set(...target);
  controls.addEventListener('change', invalidate);
  controls.update();
  return () => {
    controls.removeEventListener('change', invalidate);
    controls.dispose();
    // connect() changes the actual inline style; CSS alone does not undo it.
    canvas.style.touchAction = 'pan-y';
  };
}
export function PanelScene({ p, explosion, selected, select }: { p: Parameters; explosion: number; selected: PanelID; select(id: PanelID): void }) {
  const panels = useMemo(() => display(p, explosion).panels, [p, explosion]);
  return <group name="cabinet">
    <ambientLight intensity={1.5} />
    <directionalLight position={[-3, 5, -4]} intensity={2.2} />
    {panels.map(v => <Box key={v.id} name={v.id} args={v.dimensions.map(n => n * 0.001) as Vec} position={adapt(v.center, p)} userData={{ panelId: v.id, selected: selected === v.id }} onClick={event => { event.stopPropagation(); select(v.id); }}>
      <meshStandardMaterial color={selected === v.id ? '#b9cdf3' : '#e1e8e9'} roughness={0.85} />
      <Edges color={selected === v.id ? '#235bd4' : '#586775'} threshold={15} />
    </Box>)}
  </group>;
}
function Rig({ p, explosion, mode, revision, navigation, lost }: { p: Parameters; explosion: number; mode: 'front' | 'iso'; revision: number; navigation: boolean; lost(): void }) {
  const { camera, size, invalidate, gl } = useThree();
  const pose = useMemo(() => cameraPose(p, explosion, size.width / Math.max(1, size.height), mode), [p, explosion, size.width, size.height, mode]);
  useLayoutEffect(() => {
    camera.position.set(...pose.position);
    camera.up.set(0, 1, 0);
    camera.lookAt(...pose.target);
    if ((camera as PerspectiveCamera).isPerspectiveCamera) {
      const perspective = camera as PerspectiveCamera;
      perspective.near = 0.001; perspective.far = 200; perspective.updateProjectionMatrix();
    }
    invalidate();
  }, [camera, pose, revision, invalidate]);
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.style.touchAction = 'pan-y';
    const onLost = (event: Event) => { event.preventDefault(); lost(); };
    canvas.addEventListener('webglcontextlost', onLost);
    return () => { canvas.removeEventListener('webglcontextlost', onLost); canvas.style.touchAction = 'pan-y'; };
  }, [gl, lost]);
  useEffect(() => {
    if (!navigation) { gl.domElement.style.touchAction = 'pan-y'; return; }
    return connectNavigation(camera, gl.domElement, invalidate, pose.target);
  }, [navigation, camera, gl, invalidate, pose, revision]);
  return null;
}
class SceneBoundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode; failed(): void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.failed(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
function supported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch { return false; }
}
export function Viewport({ p, explosion, selected, select, mode, revision, navigation, stopNavigation, locale, fallback, webgl, available }: {
  p: Parameters; explosion: number; selected: PanelID; select(id: PanelID): void; mode: 'front' | 'iso'; revision: number; navigation: boolean; stopNavigation(): void; locale: Locale; fallback: React.ReactNode; webgl?: boolean; available(ready: boolean): void;
}) {
  const [state, setState] = useState<'checking' | 'ready' | 'off' | 'lost'>('checking');
  const [attempt, setAttempt] = useState(0);
  const t = text(locale);
  useEffect(() => { available(state === 'ready'); }, [state, available]);
  useEffect(() => { setState((webgl ?? supported()) ? 'ready' : 'off'); }, [webgl, attempt]);
  const lost = React.useCallback(() => { stopNavigation(); setState('lost'); }, [stopNavigation]);
  if (state === 'checking') return <div className="fallback"><p role="status">{t.checking}</p>{fallback}</div>;
  if (state !== 'ready') return <div className="fallback"><p>{state === 'lost' ? t.lost : t.unavailable}</p><button onClick={() => { stopNavigation(); setState('checking'); setAttempt(n => n + 1); }}>{t.retry}</button>{fallback}</div>;
  return <SceneBoundary key={attempt} fallback={fallback} failed={lost}>
    <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [0, 0, -3], fov: 35 }} gl={{ antialias: true, alpha: true }} fallback={fallback} aria-label={t.workspace}>
      <PanelScene p={p} explosion={explosion} selected={selected} select={select} />
      <Rig p={p} explosion={explosion} mode={mode} revision={revision} navigation={navigation} lost={lost} />
    </Canvas>
  </SceneBoundary>;
}
