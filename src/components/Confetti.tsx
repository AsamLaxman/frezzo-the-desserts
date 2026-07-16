import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function Confetti({ trigger }: { trigger: number }) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number; rotation: number; duration: number }>>([]);

  useEffect(() => {
    if (trigger > 0) {
      const colors = ['#F48FB1', '#F8BBD0', '#4A2E1B', '#EAE0D5', '#8B5E3C'];
      const newParticles = Array.from({ length: 60 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 150 + 50;
        return {
          id: Date.now() + i,
          x: Math.cos(angle) * velocity * (Math.random() * 2 + 1),
          y: Math.sin(angle) * velocity * (Math.random() * 2 + 1) - 50,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          rotation: Math.random() * 360,
          duration: Math.random() * 1 + 0.8
        };
      });
      
      setParticles(newParticles);
      
      const timer = setTimeout(() => {
        setParticles([]);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden">
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{ 
                x: p.x, 
                y: p.y + 300, 
                opacity: 0, 
                rotate: p.rotation,
                scale: 1
              }}
              transition={{ duration: p.duration, ease: "easeOut" }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '4px'
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
