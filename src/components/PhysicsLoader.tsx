import React, { useEffect, useState } from 'react';

interface PhysicsLoaderProps {
  onComplete?: () => void;
}

export const PhysicsLoader: React.FC<PhysicsLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = Math.random() * 2000 + 5000; // 5-7 ثوانٍ عشوائياً

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);

      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setIsComplete(true);
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-500 ${isComplete ? 'opacity-0' : 'opacity-100'}`}>
      {/* خلفية فيزيائية */}
      <div className="absolute inset-0 bg-gradient-to-br from-physics-dark via-physics-navy to-physics-dark overflow-hidden">
        {/* جزيئات متحركة */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-physics-gold rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${5 + Math.random() * 3}s infinite linear`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        {/* خطوط الطاقة */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-physics-gold to-transparent opacity-20"
              style={{
                top: `${10 + i * 12}%`,
                left: '0%',
                right: '0%',
                animation: `pulse ${3 + i * 0.5}s infinite`,
                animationDelay: `${i * 0.3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">

        {/* رسوم فيزيائية متحركة */}
        <div className="relative mb-16">
          <svg width="400" height="300" viewBox="0 0 400 300" className="mx-auto drop-shadow-2xl">
            <defs>
              <linearGradient id="atomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFA500" />
              </linearGradient>
              <linearGradient id="energyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00BFFF" />
                <stop offset="50%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FF6B6B" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* الذرة المركزية */}
            <g transform="translate(200,150)">
              {/* النواة */}
              <circle
                cx="0"
                cy="0"
                r="12"
                fill="url(#atomGrad)"
                filter="url(#glow)"
              >
                <animate attributeName="r" values="12;15;12" dur="2s" repeatCount="indefinite"/>
              </circle>

              {/* المدارات */}
              {[...Array(3)].map((_, i) => (
                <ellipse
                  key={i}
                  cx="0"
                  cy="0"
                  rx={30 + i * 20}
                  ry={15 + i * 10}
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth="1"
                  opacity="0.4"
                  transform={`rotate(${i * 60})`}
                />
              ))}

              {/* الإلكترونات */}
              {[...Array(6)].map((_, i) => (
                <circle
                  key={i}
                  r="3"
                  fill="#00BFFF"
                  filter="url(#glow)"
                >
                  <animateMotion
                    dur={`${3 + i * 0.5}s`}
                    repeatCount="indefinite"
                    path={`M ${30 + (i % 3) * 20} 0 A ${30 + (i % 3) * 20} ${15 + (i % 3) * 10} 0 1 1 ${-(30 + (i % 3) * 20)} 0 A ${30 + (i % 3) * 20} ${15 + (i % 3) * 10} 0 1 1 ${30 + (i % 3) * 20} 0`}
                    transform={`rotate(${i * 60})`}
                  />
                </circle>
              ))}
            </g>

            {/* معادلات فيزيائية */}
            <g opacity={progress > 20 ? "1" : "0"} style={{ transition: 'opacity 0.5s' }}>
              <text x="50" y="50" fill="#FFD700" fontSize="14" fontFamily="monospace">
                E = mc²
                <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
              </text>
              <text x="300" y="80" fill="#00BFFF" fontSize="12" fontFamily="monospace">
                F = ma
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite"/>
              </text>
              <text x="80" y="250" fill="#FF6B6B" fontSize="13" fontFamily="monospace">
                P = mv
                <animate attributeName="opacity" values="0.5;1;0.5" dur="3.5s" repeatCount="indefinite"/>
              </text>
              <text x="280" y="220" fill="#FFD700" fontSize="11" fontFamily="monospace">
                W = Fd
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2.8s" repeatCount="indefinite"/>
              </text>
            </g>

            {/* موجات الطاقة */}
            {progress > 40 && (
              <g>
                {[...Array(4)].map((_, i) => (
                  <path
                    key={i}
                    d={`M 0 ${150 + i * 10} Q 100 ${130 + i * 10} 200 ${150 + i * 10} T 400 ${150 + i * 10}`}
                    fill="none"
                    stroke="url(#energyGrad)"
                    strokeWidth="2"
                    opacity="0.6"
                  >
                    <animate
                      attributeName="d"
                      values={`M 0 ${150 + i * 10} Q 100 ${130 + i * 10} 200 ${150 + i * 10} T 400 ${150 + i * 10};M 0 ${150 + i * 10} Q 100 ${170 + i * 10} 200 ${150 + i * 10} T 400 ${150 + i * 10};M 0 ${150 + i * 10} Q 100 ${130 + i * 10} 200 ${150 + i * 10} T 400 ${150 + i * 10}`}
                      dur={`${2 + i * 0.3}s`}
                      repeatCount="indefinite"
                    />
                  </path>
                ))}
              </g>
            )}

            {/* جزيئات الطاقة */}
            {progress > 60 && (
              <g>
                {[...Array(8)].map((_, i) => (
                  <circle
                    key={i}
                    r="2"
                    fill="#FFD700"
                    opacity="0.8"
                  >
                    <animateMotion
                      dur={`${4 + Math.random() * 2}s`}
                      repeatCount="indefinite"
                      path={`M ${50 + i * 40} 280 L ${50 + i * 40} 20`}
                    />
                    <animate
                      attributeName="opacity"
                      values="0;1;0"
                      dur={`${4 + Math.random() * 2}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                ))}
              </g>
            )}

            {/* انفجار الطاقة */}
            {progress > 80 && (
              <g transform="translate(200,150)">
                <circle
                  cx="0"
                  cy="0"
                  r="50"
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth="3"
                  opacity="0.7"
                >
                  <animate attributeName="r" values="0;80;0" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle
                  cx="0"
                  cy="0"
                  r="30"
                  fill="none"
                  stroke="#FF6B6B"
                  strokeWidth="2"
                  opacity="0.5"
                >
                  <animate attributeName="r" values="0;60;0" dur="1.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite"/>
                </circle>
              </g>
            )}
          </svg>
        </div>

        {/* شريط التقدم المتقدم */}
        <div className="w-full max-w-md mb-12">
          <div className="relative">
            <div className="w-full h-4 bg-physics-navy/30 rounded-full overflow-hidden border border-physics-gold/30 shadow-lg">
              <div
                className="h-full bg-gradient-to-r from-physics-gold via-yellow-300 to-physics-gold rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                {/* تأثير الوميض */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
              </div>
            </div>

            {/* النسبة المئوية */}
            <div className="text-center mt-4">
              <span className="text-physics-gold font-bold text-xl drop-shadow-lg">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>

        {/* نقاط متحركة فقط */}
        <div className="text-center">
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-physics-gold rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-physics-gold rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-physics-gold rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>

      {/* CSS للحركات المخصصة */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};
