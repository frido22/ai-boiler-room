import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface VisualizerProps {
  audioData?: Uint8Array;
}

const Visualizer = ({ audioData }: VisualizerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const particlesRef = useRef<THREE.Points>();

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    sceneRef.current = new THREE.Scene();
    
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current.position.z = 5;

    rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    containerRef.current.appendChild(rendererRef.current.domElement);

    // Create particles
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const particleCount = 1000;

    for (let i = 0; i < particleCount; i++) {
      vertices.push(
        THREE.MathUtils.randFloatSpread(10),
        THREE.MathUtils.randFloatSpread(10),
        THREE.MathUtils.randFloatSpread(10)
      );
    }

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );

    const material = new THREE.PointsMaterial({
      color: 0x4a9eff,
      size: 0.05,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    particlesRef.current = new THREE.Points(geometry, material);
    sceneRef.current.add(particlesRef.current);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (particlesRef.current) {
        particlesRef.current.rotation.x += 0.001;
        particlesRef.current.rotation.y += 0.002;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Cleanup
    return () => {
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Update visualization based on audio data
  useEffect(() => {
    if (!audioData || !particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      const audioIndex = Math.floor(i / 3) % audioData.length;
      const scale = audioData[audioIndex] / 128.0;
      positions[i + 1] += (scale - 1) * 0.1;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  }, [audioData]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default Visualizer;
