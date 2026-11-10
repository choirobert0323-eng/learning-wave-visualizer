import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import * as XLSX from 'xlsx';
import { parseRows, SAMPLE_ROWS, waveCoordinates } from './data';

function WaveTopology({ data }) {
  const geometry = useMemo(() => {
    const points = waveCoordinates(data).map((point) => new THREE.Vector3(...point));
    if (points.length < 2) return null;
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 300, 0.35, 8, false);
  }, [data]);
  useEffect(() => () => geometry?.dispose(), [geometry]);
  if (!geometry) return null;
  return <mesh geometry={geometry}><meshStandardMaterial color="#00ffee" emissive="#003333" wireframe /></mesh>;
}

export default function App() {
  const [data, setData] = useState(() => parseRows(SAMPLE_ROWS));
  const [message, setMessage] = useState('Showing 24 synthetic learning records.');
  const [loading, setLoading] = useState(false);
  async function uploadFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setMessage('Choose a file smaller than 2 MiB.'); return; }
    setLoading(true);
    try {
      const workbook = XLSX.read(await file.arrayBuffer());
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = parseRows(XLSX.utils.sheet_to_json(sheet));
      if (parsed.length < 2) throw new Error('Include at least two learning records.');
      setData(parsed); setMessage(`Loaded ${parsed.length} records from ${file.name}.`);
    } catch (error) { setMessage(error.message || 'Unable to read this file.'); }
    finally { setLoading(false); event.target.value = ''; }
  }
  function reset() { setData(parseRows(SAMPLE_ROWS)); setMessage('Showing 24 synthetic learning records.'); }
  return <main className="app">
    <section className="panel">
      <p className="eyebrow">LEARNING DATA / 3D EXPLORATION</p>
      <h1>Learning Wave Visualizer</h1>
      <p>Explore learning records as a 3D curve.</p>
      <p className="legend">Correct → smaller amplitude · Incorrect → larger amplitude and distortion<br />Category → phase and height offset</p>
      <div className="actions"><label>Import XLSX / CSV<input type="file" accept=".xlsx,.xls,.csv" onChange={uploadFile} disabled={loading} /></label><button onClick={reset} disabled={loading}>Reset sample</button><a href="sample.csv" download>Download sample</a></div>
      <p role="status">{loading ? 'Reading file…' : message}</p>
      <small>Files stay in your browser. Drag to rotate, scroll to zoom. This is an exploratory visual mapping, not a validated learning score.</small>
    </section>
    <div className="scene" aria-label="Interactive 3D learning wave">
      <Canvas camera={{ position: [15, 12, 28], fov: 50 }}>
        <color attach="background" args={['#070e18']} />
        <ambientLight intensity={0.7} /><pointLight position={[20, 20, 20]} intensity={2} />
        <Bounds fit clip observe margin={1.3}><WaveTopology data={data} /></Bounds>
        <gridHelper args={[100, 40, '#16434d', '#102a38']} /><OrbitControls makeDefault />
      </Canvas>
    </div>
  </main>;
}
