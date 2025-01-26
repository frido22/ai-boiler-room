import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import * as THREE from 'three';

interface VisualizerProps {
  audioUrl: string;
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ audioUrl, isPlaying }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const analyzerRef = useRef<AnalyserNode>();
  const animationFrameRef = useRef<number>();

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#4a9eff',
      progressColor: '#1e50ff',
      cursorColor: '#ffffff',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height: 100,
      barGap: 2,
      responsive: true,
      normalize: true,
      partialRender: true,
    });

    wavesurfer.load(audioUrl);
    wavesurferRef.current = wavesurfer;

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl]);

  // Handle play/pause
  useEffect(() => {
    const wavesurfer = wavesurferRef.current;
    if (!wavesurfer) return;

    if (isPlaying) {
      wavesurfer.play();
    } else {
      wavesurfer.pause();
    }
  }, [isPlaying]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

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

    const particles = new THREE.Points(geometry, material);
    sceneRef.current.add(particles);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (particles) {
        particles.rotation.x += 0.001;
        particles.rotation.y += 0.002;
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

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default Visualizer;
