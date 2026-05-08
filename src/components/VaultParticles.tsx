import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  midX: number;
  midY: number;
  targetX: number;
  targetY: number;
  duration: number;
  size: number;
  edge: 'top' | 'right' | 'bottom' | 'left';
}

interface Flash {
  id: number;
  x: number;
  y: number;
  edge: 'top' | 'right' | 'bottom' | 'left';
}

export const VaultParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  const spawnParticle = useCallback(() => {
    const id = nextId.current++;
    
    // Choose a random target edge (not top or right if we want them to "travel" through)
    // Actually, any edge is fine for randomness.
    const edges: Array<'top' | 'right' | 'bottom' | 'left'> = ['top', 'right', 'bottom', 'left'];
    const targetEdge = edges[Math.floor(Math.random() * edges.length)];
    
    let targetX = Math.random() * 100;
    let targetY = Math.random() * 100;

    if (targetEdge === 'top') targetY = 0;
    else if (targetEdge === 'bottom') targetY = 100;
    else if (targetEdge === 'left') targetX = 0;
    else if (targetEdge === 'right') targetX = 100;

    const midX = 20 + Math.random() * 60;
    const midY = 20 + Math.random() * 60;

    const newParticle: Particle & { midX: number; midY: number } = {
      id,
      x: 100, // Top right corner
      y: 0,
      midX,
      midY,
      targetX,
      targetY,
      duration: 5 + Math.random() * 5, // 5-10 seconds for smooth movement
      size: 1.5 + Math.random() * 2,
      edge: targetEdge
    };

    setParticles(prev => [...prev, newParticle]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (particles.length < 10) {
        spawnParticle();
      }
    }, 1200);
    return () => clearInterval(interval);
  }, [particles.length, spawnParticle]);

  const handleParticleComplete = (particle: Particle) => {
    // Add a flash at the collision point
    const flashId = Date.now() + Math.random();
    setFlashes(prev => [...prev, { 
      id: flashId, 
      x: particle.targetX, 
      y: particle.targetY, 
      edge: particle.edge 
    }]);

    // Remove particle
    setParticles(prev => prev.filter(p => p.id !== particle.id));

    // Remove flash after animation
    setTimeout(() => {
      setFlashes(prev => prev.filter(f => f.id !== flashId));
    }, 800);
  };

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ left: `${particle.x}%`, top: `${particle.y}%`, opacity: 0, scale: 0 }}
            animate={{ 
              left: [`${particle.x}%`, `${particle.midX}%`, `${particle.targetX}%`], 
              top: [`${particle.y}%`, `${particle.midY}%`, `${particle.targetY}%`], 
              opacity: [0, 1, 1, 0.9],
              scale: [0, 1, 1.2, 1]
            }}
            transition={{ 
              duration: particle.duration, 
              ease: "easeInOut",
              times: [0, 0.4, 1]
            }}
            onAnimationComplete={() => handleParticleComplete(particle)}
            className="absolute rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)]"
            style={{ 
              width: particle.size, 
              height: particle.size,
            }}
          >
            {/* Particle Trail/Glow */}
            <div className="absolute inset-0 rounded-full bg-blue-300 blur-[3px] opacity-60" />
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {flashes.map(flash => (
          <React.Fragment key={flash.id}>
            {/* The "Intense Shine" at point of impact */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [1, 4, 2] }}
              className="absolute bg-white rounded-full blur-[10px]"
              style={{
                left: `${flash.x}%`,
                top: `${flash.y}%`,
                width: 30,
                height: 30,
                marginLeft: -15,
                marginTop: -15,
              }}
            />
            
            {/* localized border shine - much more intense */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              className="absolute bg-white blur-[6px] shadow-[0_0_20px_white]"
              style={{
                top: flash.edge === 'top' ? 0 : flash.edge === 'bottom' ? 'auto' : `${flash.y - 12.5}%`,
                bottom: flash.edge === 'bottom' ? 0 : 'auto',
                left: flash.edge === 'left' ? 0 : flash.edge === 'right' ? 'auto' : `${flash.x - 12.5}%`,
                right: flash.edge === 'right' ? 0 : 'auto',
                width: (flash.edge === 'top' || flash.edge === 'bottom') ? '100px' : '4px',
                height: (flash.edge === 'left' || flash.edge === 'right') ? '100px' : '4px',
                transform: (flash.edge === 'top' || flash.edge === 'bottom') ? 'translateX(-50%)' : 'translateY(-50%)'
              }}
            />
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
};
