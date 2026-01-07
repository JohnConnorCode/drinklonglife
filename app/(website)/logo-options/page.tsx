'use client';

import { useState } from 'react';

// Starting fresh - proper infinity using two circles
function LogoV1({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Left circle of infinity */}
      <circle cx="25" cy="45" r="18" stroke="currentColor" strokeWidth="10" fill="none" />
      {/* Right circle of infinity */}
      <circle cx="75" cy="45" r="18" stroke="currentColor" strokeWidth="10" fill="none" />

      {/* Stem */}
      <rect x="47" y="25" width="6" height="18" rx="3" fill="currentColor" />

      {/* Small left leaf */}
      <ellipse cx="42" cy="18" rx="7" ry="11" fill="currentColor" transform="rotate(-25 42 18)" />
      <path d="M 38,22 L 44,13" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

      {/* Small right leaf */}
      <ellipse cx="58" cy="18" rx="7" ry="11" fill="currentColor" transform="rotate(25 58 18)" />
      <path d="M 62,22 L 56,13" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function LogoV2({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="25" cy="45" r="18" stroke="currentColor" strokeWidth="9" fill="none" />
      <circle cx="75" cy="45" r="18" stroke="currentColor" strokeWidth="9" fill="none" />
      <rect x="47.5" y="26" width="5" height="17" rx="2.5" fill="currentColor" />
      <ellipse cx="42" cy="19" rx="6.5" ry="10" fill="currentColor" transform="rotate(-25 42 19)" />
      <path d="M 38.5,22 L 43.5,14" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      <ellipse cx="58" cy="19" rx="6.5" ry="10" fill="currentColor" transform="rotate(25 58 19)" />
      <path d="M 61.5,22 L 56.5,14" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function LogoV3({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="25" cy="45" r="18" stroke="currentColor" strokeWidth="11" fill="none" />
      <circle cx="75" cy="45" r="18" stroke="currentColor" strokeWidth="11" fill="none" />
      <rect x="46.5" y="24" width="7" height="19" rx="3.5" fill="currentColor" />
      <ellipse cx="42" cy="17" rx="7.5" ry="12" fill="currentColor" transform="rotate(-25 42 17)" />
      <path d="M 37.5,21 L 44,12" stroke="white" strokeWidth="1.7" strokeLinecap="round" opacity="0.5" />
      <ellipse cx="58" cy="17" rx="7.5" ry="12" fill="currentColor" transform="rotate(25 58 17)" />
      <path d="M 62.5,21 L 56,12" stroke="white" strokeWidth="1.7" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function LogoV4({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="25" cy="45" r="18" stroke="currentColor" strokeWidth="10" fill="none" />
      <circle cx="75" cy="45" r="18" stroke="currentColor" strokeWidth="10" fill="none" />
      <rect x="47" y="25" width="6" height="18" rx="3" fill="currentColor" />
      <ellipse cx="41" cy="18" rx="7" ry="11" fill="currentColor" transform="rotate(-30 41 18)" />
      <path d="M 37,22 L 43,13" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <ellipse cx="59" cy="18" rx="7" ry="11" fill="currentColor" transform="rotate(30 59 18)" />
      <path d="M 63,22 L 57,13" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function LogoV5({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="25" cy="45" r="18" stroke="currentColor" strokeWidth="10" fill="none" />
      <circle cx="75" cy="45" r="18" stroke="currentColor" strokeWidth="10" fill="none" />
      <rect x="47" y="25" width="6" height="18" rx="3" fill="currentColor" />
      <ellipse cx="43" cy="18" rx="7" ry="11" fill="currentColor" transform="rotate(-20 43 18)" />
      <path d="M 39,22 L 45,13" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <ellipse cx="57" cy="18" rx="7" ry="11" fill="currentColor" transform="rotate(20 57 18)" />
      <path d="M 61,22 L 55,13" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function LogoV6({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="25" cy="45" r="18" stroke="currentColor" strokeWidth="10" fill="none" />
      <circle cx="75" cy="45" r="18" stroke="currentColor" strokeWidth="10" fill="none" />
      <rect x="47" y="25" width="6" height="18" rx="3" fill="currentColor" />
      <ellipse cx="40" cy="19" rx="6" ry="10" fill="currentColor" transform="rotate(-30 40 19)" />
      <path d="M 37,22 L 42,14" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      <ellipse cx="50" cy="14" rx="6" ry="10" fill="currentColor" />
      <path d="M 50,24 L 50,14" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      <ellipse cx="60" cy="19" rx="6" ry="10" fill="currentColor" transform="rotate(30 60 19)" />
      <path d="M 63,22 L 58,14" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

export default function LogoOptionsPage() {
  const [selected, setSelected] = useState<number | null>(null);

  const logos = [
    { id: 1, name: "Version 1", component: LogoV1, description: "Two circles forming infinity, standard weight" },
    { id: 2, name: "Version 2", component: LogoV2, description: "Slightly thinner" },
    { id: 3, name: "Version 3", component: LogoV3, description: "Slightly bolder" },
    { id: 4, name: "Version 4", component: LogoV4, description: "Leaves angled wider" },
    { id: 5, name: "Version 5", component: LogoV5, description: "Leaves angled narrower" },
    { id: 6, name: "Version 6", component: LogoV6, description: "Three leaves" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold mb-2">Long Life Logo - Fresh Start</h1>
          <p className="text-gray-600">Simple circles forming infinity</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {logos.map((logo, index) => {
            const LogoComponent = logo.component;
            const isSelected = selected === index;

            return (
              <div
                key={logo.id}
                className={`relative bg-white rounded-2xl p-8 shadow-lg transition-all cursor-pointer hover:shadow-2xl ${isSelected ? 'ring-4 ring-green-600' : ''}`}
                onClick={() => setSelected(index)}
              >
                {isSelected && (
                  <div className="absolute -top-3 -right-3 bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">✓</div>
                )}

                <div className="bg-gray-50 rounded-xl p-10 mb-4 flex items-center justify-center">
                  <LogoComponent className="w-full h-24 text-[#1a4d2e]" />
                </div>

                <div className="bg-[#1a4d2e] rounded-xl p-8 mb-4 flex items-center justify-center">
                  <LogoComponent className="w-full h-20 text-white" />
                </div>

                <h3 className="text-xl font-bold mb-2">{logo.name}</h3>
                <p className="text-gray-600 text-sm">{logo.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
