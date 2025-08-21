
import { useEffect, useRef } from 'react';

export default function PhysicsBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Physical formulas to display
    const formulas = [
      "E = mc²",
      "F = ma",
      "V = IR",
      "P = VI",
      "E = hf",
      "F = G(m₁m₂/r²)",
      "PV = nRT",
      "λ = h/p",
      "T = 2π√(L/g)",
      "Ψ = Ae^(i(kx-ωt))"
    ];
    
    if (!containerRef.current) return;

    // Clear any existing elements
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    
    // Create electrons
    for (let i = 0; i < 8; i++) {
      createElectron();
    }
    
    // Create atoms
    for (let i = 0; i < 3; i++) {
      createAtom();
    }
    
    // Create formulas
    for (let i = 0; i < 6; i++) {
      createFormula(formulas);
    }
    
    function createElectron() {
      const electron = document.createElement('div');
      electron.className = 'physics-particle physics-electron';
      
      // Random size between 5-12px
      const size = Math.random() * 7 + 5;
      electron.style.width = `${size}px`;
      electron.style.height = `${size}px`;
      
      // Random position
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      electron.style.left = `${left}vw`;
      electron.style.top = `${top}vh`;
      
      // Random animation duration
      const duration = Math.random() * 10 + 5;
      electron.style.animation = `orbit ${duration}s linear infinite, pulse 2s ease-in-out infinite`;
      
      // Random start time
      const delay = Math.random() * 5;
      electron.style.animationDelay = `-${delay}s`;
      
      containerRef.current?.appendChild(electron);
    }
    
    function createAtom() {
      if (!containerRef.current) return;
      
      const atom = document.createElement('div');
      atom.className = 'physics-atom';
      
      // Random position
      const left = Math.random() * 80 + 10;
      const top = Math.random() * 80 + 10;
      atom.style.left = `${left}vw`;
      atom.style.top = `${top}vh`;
      
      // Random animation
      atom.style.animation = `float ${Math.random() * 5 + 5}s ease-in-out infinite`;
      
      // Create nucleus
      const nucleus = document.createElement('div');
      nucleus.className = 'physics-particle';
      nucleus.style.width = '12px';
      nucleus.style.height = '12px';
      nucleus.style.backgroundColor = '#ff9800';
      nucleus.style.boxShadow = '0 0 10px #ff9800';
      nucleus.style.position = 'absolute';
      nucleus.style.left = '50%';
      nucleus.style.top = '50%';
      nucleus.style.transform = 'translate(-50%, -50%)';
      nucleus.style.zIndex = '2';
      
      atom.appendChild(nucleus);
      
      // Create orbits
      for (let i = 0; i < 3; i++) {
        const orbit = document.createElement('div');
        orbit.style.position = 'absolute';
        orbit.style.width = `${60 + i * 20}px`;
        orbit.style.height = `${60 + i * 20}px`;
        orbit.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        orbit.style.borderRadius = '50%';
        orbit.style.left = '50%';
        orbit.style.top = '50%';
        orbit.style.transform = 'translate(-50%, -50%)';
        
        // Random rotation
        orbit.style.animation = `float ${Math.random() * 10 + 10}s linear infinite`;
        
        atom.appendChild(orbit);
        
        // Add electron to orbit
        const electron = document.createElement('div');
        electron.className = 'physics-particle physics-electron';
        electron.style.width = '6px';
        electron.style.height = '6px';
        electron.style.position = 'absolute';
        electron.style.left = '50%';
        electron.style.top = '0';
        electron.style.transform = 'translate(-50%, -50%)';
        electron.style.animation = `orbit ${3 + i * 2}s linear infinite`;
        
        orbit.appendChild(electron);
      }
      
      containerRef.current.appendChild(atom);
    }
    
    function createFormula(formulas: string[]) {
      if (!containerRef.current) return;
      
      const formula = document.createElement('div');
      formula.className = 'physics-formula';
      formula.textContent = formulas[Math.floor(Math.random() * formulas.length)];
      
      // Random position
      const left = Math.random() * 80 + 10;
      const top = Math.random() * 80 + 10;
      formula.style.left = `${left}vw`;
      formula.style.top = `${top}vh`;
      
      // Random opacity
      formula.style.opacity = (Math.random() * 0.2 + 0.1).toString();
      
      // Random size
      const size = Math.random() * 16 + 14;
      formula.style.fontSize = `${size}px`;
      
      // Random rotation
      const rotation = Math.random() * 40 - 20;
      formula.style.transform = `rotate(${rotation}deg)`;
      
      containerRef.current.appendChild(formula);
    }
    
    // Clean up function
    return () => {
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, []);
  
  return <div ref={containerRef} className="absolute inset-0 overflow-hidden z-0" />;
}
