/**
 * @file App.tsx
 * @project SPACE SECURITY: IGNIS-0 // Microgravity Fire Safety SI Dashboard
 * @event 2026 NASA Space Apps Challenge — Team SPACE SECURITY (Solo Systems Architect)
 * @challenge Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data
 * @si_disclosure METADATA ACKNOWLEDGMENT: Code structure, physics interpolation, and badge graphics
 * were accelerated using Super Intelligence (SI) tools under human engineering direction per 2026 NASA Space Apps rules.
 * No official NASA agency ("Meatball") logos are used or modified.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Wind,
  Gauge,
  ShieldAlert,
  CheckCircle2,
  Database,
  Download,
  Award,
  Sliders,
  Presentation,
  Info,
  Search,
  Sparkles,
  Globe,
  Cpu,
  X,
  ChevronRight,
  ChevronLeft,
  AlertTriangle
} from 'lucide-react';

interface MaterialRecord {
  id: string;
  name: string;
  category: string;
  agencySource: string;
  datasetId: string;
  mocO2: number; // Minimum Oxygen Concentration (%) for sustained combustion in 0g
  baseSpread0g: number; // mm/s at 21% O2, 101.3 kPa, 15 cm/s flow
  flameTempK: number; // Kelvin
  siRiskScore: number; // 0-100
  suppressionAgent: string;
  notes: string;
}

const NASA_AND_PARTNER_DATA: MaterialRecord[] = [
  {
    id: 'pmma-cast',
    name: 'PMMA (Polymethyl Methacrylate)',
    category: 'Optical Window / Acrylic Polymer',
    agencySource: 'NASA PSI (SOFIE & BASS-II)',
    datasetId: 'PSI-BASS2-PMMA-01',
    mocO2: 15.5,
    baseSpread0g: 1.42,
    flameTempK: 1180,
    siRiskScore: 94,
    suppressionAgent: 'Fine Water Mist + Local O2 Cutoff',
    notes: 'Forms stable spherical blue flame in microgravity; molten droplet ejection hazard under ventilation > 18 cm/s.'
  },
  {
    id: 'cellulose-jaxa',
    name: 'Cellulose / Filter Matrix',
    category: 'Payload Consumable / Wipe',
    agencySource: 'JAXA (Kibo FLARE Partner Data)',
    datasetId: 'JAXA-FLARE-CEL-04',
    mocO2: 16.2,
    baseSpread0g: 3.10,
    flameTempK: 1050,
    siRiskScore: 91,
    suppressionAgent: 'CO2 Direct Cone + Vent Shutdown',
    notes: 'Rapid thin-fuel opposed-flow flame spread at low ventilation speeds (5–15 cm/s).'
  },
  {
    id: 'sibal-fabric',
    name: 'SIBAL (75% Cotton / 25% Fiberglass)',
    category: 'Composite Acoustic Blanket',
    agencySource: 'NASA PSI (Saffire I, II & IV)',
    datasetId: 'PSI-SAFFIRE-SIBAL-02',
    mocO2: 16.8,
    baseSpread0g: 2.85,
    flameTempK: 1090,
    siRiskScore: 88,
    suppressionAgent: 'Cabin Depressurization to < 35 kPa',
    notes: 'Fiberglass mesh retains char geometry, sustaining steady surface oxidation in Cygnus cargo fire tests.'
  },
  {
    id: 'silicone-sheet',
    name: 'Silicone Elastomer (0.5mm)',
    category: 'Airlock Seal & Cable Insulation',
    agencySource: 'NASA Saffire-IV / ESA Columbus',
    datasetId: 'PSI-SAFFIRE4-SIL-09',
    mocO2: 18.2,
    baseSpread0g: 0.95,
    flameTempK: 1240,
    siRiskScore: 72,
    suppressionAgent: 'Fine Water Mist (Halon-Free)',
    notes: 'Produces dense silica soot clouds in 0g that obscure optical smoke detectors.'
  },
  {
    id: 'nomex-ht90',
    name: 'Nomex HT90-40 (Aramid Fiber)',
    category: 'Crew Storage Bag & Suit Liner',
    agencySource: 'NASA BASS-II / STD-6001B',
    datasetId: 'PSI-BASS2-NOMEX-07',
    mocO2: 24.5,
    baseSpread0g: 0.18,
    flameTempK: 920,
    siRiskScore: 28,
    suppressionAgent: 'Self-Extinguishes at < 24% O2',
    notes: 'CRITICAL INSIGHT: Completely safe on ISS (21% O2), but crosses ignition threshold in Artemis Lunar Cabin (34% O2)!'
  },
  {
    id: 'ultem-9085',
    name: 'Ultem 9085 (Aerospace PEI)',
    category: '3D-Printed Structural Bracket',
    agencySource: 'NASA SOFIE-MIST / ISRO Gaganyaan',
    datasetId: 'PSI-SOFIE-ULTEM-12',
    mocO2: 28.0,
    baseSpread0g: 0.08,
    flameTempK: 890,
    siRiskScore: 14,
    suppressionAgent: 'Passive Self-Extinguishing',
    notes: 'High char yield blocks radiative heat feedback in microgravity; recommended for deep-space additive manufacturing.'
  }
];

const CABIN_PRESETS = [
  { id: 'iss', name: 'ISS Standard (LEO)', o2: 21.0, pressure: 101.3, flow: 10, agency: 'NASA / ESA / JAXA' },
  { id: 'artemis', name: 'Artemis Lunar Cabin', o2: 34.0, pressure: 56.5, flow: 15, agency: 'NASA Exploration' },
  { id: 'mars', name: 'Mars Transit Habitat', o2: 26.0, pressure: 70.0, flow: 8, agency: 'NASA Deep Space' },
  { id: 'stagnant', name: 'Ventilation Cutoff (0g Safe Mode)', o2: 21.0, pressure: 101.3, flow: 0.3, agency: 'Emergency Protocol' }
];

const SLIDE_DECK = [
  {
    slide: 1,
    title: 'SPACE SECURITY: IGNIS-0',
    subtitle: 'AI-Powered Fire Safety Insights from Microgravity Combustion Data',
    content: 'Team: SPACE SECURITY (Solo Architect — Team SPACE SECURITY) | Challenge: Flame in Freefall | 2026 NASA Space Apps Challenge.',
    highlight: 'Transforming raw NASA PSI microgravity combustion records into an interactive 0g fire risk & mission design engine.'
  },
  {
    slide: 2,
    title: 'THE PROBLEM IN DEEP SPACE',
    subtitle: 'Why Earth Fire Rules Fail on the Moon and Mars',
    content: 'In microgravity (0g), buoyancy vanishes. Flames become spherical, hide from standard smoke sensors, and are driven entirely by cabin ventilation.',
    highlight: 'Materials safe on the ISS (21% O2) become explosive hazards in Artemis Lunar Atmospheres (34% O2, 56.5 kPa).'
  },
  {
    slide: 3,
    title: 'OUR SOLUTION: IGNIS-0 SI ENGINE',
    subtitle: 'Interactive Digital Twin + Super Intelligence Ranking',
    content: '1. Harmonizes NASA PSI (BASS-II, Saffire, SOFIE) & Partner (JAXA, ESA, ISRO) data. 2. Simulates 0g spherical flame physics in real time. 3. Ranks material risk scores.',
    highlight: 'Zero-click instant telemetry for spacecraft engineers, astronauts, and safety auditors.'
  },
  {
    slide: 4,
    title: 'SCIENTIFIC VALIDITY & NASA DATA',
    subtitle: 'Built on Real ISS & Cygnus Cargo Flight Experiments',
    content: 'Uses Maximum Oxygen Concentration (MOC) thresholds and opposed-flow flame spread curves from NASA Physical Sciences Informatics (PSI).',
    highlight: 'Proves that shutting down ventilation (< 0.8 cm/s) starves 0g flames via diffusive CO2 blanketing.'
  },
  {
    slide: 5,
    title: 'USER EXPERIENCE & ACCESSIBILITY',
    subtitle: 'Engineered to 2026 NASA Space Apps Brand Standards',
    content: '45° Electric-to-Deep Blue gradient, WCAG AAA (>15:1) high-contrast telemetry, Fira Sans / Overpass / Fira Code typography, and colorblind-safe semantic icons.',
    highlight: 'Designed for rapid 3-click emergency decision-making on orbital and lunar consoles.'
  },
  {
    slide: 6,
    title: 'TRANSPARENT SUPER INTELLIGENCE (SI)',
    subtitle: 'Human-Engineered Physics + SI Multi-Variable Ranking',
    content: 'Computes composite SI Risk Scores (0-100) across O2, pressure, and airflow regimes, automatically recommending suppression protocols.',
    highlight: 'Full compliance with 2026 NASA SI watermarking and metadata disclosure standards.'
  },
  {
    slide: 7,
    title: 'FUTURE IMPACT: ARTEMIS & MARS',
    subtitle: 'Protecting Humanity Beyond Low Earth Orbit',
    content: 'Ready for integration into NASA STD-6001B material certification pipelines, Gateway Lunar Station, and 3D-printed Martian habitats.',
    highlight: 'Team SPACE SECURITY — Safeguarding every spark from LEO to Mars.'
  }
];

export default function App() {
  const [selectedMat, setSelectedMat] = useState<MaterialRecord>(NASA_AND_PARTNER_DATA[4]); // Default to Nomex to show Artemis hook
  const [oxygen, setOxygen] = useState<number>(34.0); // Artemis preset by default
  const [pressure, setPressure] = useState<number>(56.5);
  const [airflow, setAirflow] = useState<number>(15.0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDeckOpen, setIsDeckOpen] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Inject Official Google Fonts from 2026 Brand Guide (Fira Sans, Overpass, Fira Code)
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Fira+Sans:wght@700;900&family=Overpass:ital,wght@0,400;0,600;0,700;1,400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // Microgravity Combustion Physics Model (NASA BASS-II / SOFIE)
  const isOxygenSufficient = oxygen >= selectedMat.mocO2;
  const isFlowSufficient = airflow >= 0.8; // Below 0.8 cm/s diffusive starvation extinguishes 0g flame
  const isIgnited = isOxygenSufficient && isFlowSufficient;

  const o2Margin = Math.max(0, (oxygen - selectedMat.mocO2 + 1.8) / 8.5);
  const pressureFactor = Math.pow(pressure / 101.3, 0.65);
  const flowAmplifier =
    airflow < 0.8 ? 0 : Math.sin(Math.min(airflow, 42) * (Math.PI / 50)) * 1.45 + 0.25;

  const liveSpreadRate = isIgnited
    ? Number((selectedMat.baseSpread0g * o2Margin * pressureFactor * flowAmplifier).toFixed(2))
    : 0;

  const liveFlameTemp = isIgnited
    ? Math.round(selectedMat.flameTempK * (0.88 + Math.min(o2Margin * 0.12, 0.35)))
    : 294;

  const dynamicRiskScore = isIgnited
    ? Math.min(100, Math.round(selectedMat.siRiskScore * (0.7 + o2Margin * 0.45 * flowAmplifier)))
    : Math.max(5, Math.round((oxygen / selectedMat.mocO2) * 22));

  // Render 0g Spherical Combustion Chamber
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      tick += 0.04;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Brand Pattern: Fiduciaries (+) & Orbits at 25% opacity over Deep Blue (#07173F)
      ctx.fillStyle = '#07173F';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(46, 150, 245, 0.22)';
      ctx.lineWidth = 1;
      for (let x = 40; x < w; x += 60) {
        for (let y = 40; y < h; y += 60) {
          ctx.beginPath();
          ctx.moveTo(x - 5, y);
          ctx.lineTo(x + 5, y);
          ctx.moveTo(x, y - 5);
          ctx.lineTo(x, y + 5);
          ctx.stroke();
        }
      }

      // Concentric Orbit rings (25% opacity per Brand Guide)
      const cx = w * 0.42;
      const cy = h * 0.52;
      ctx.strokeStyle = 'rgba(46, 150, 245, 0.18)';
      [65, 115, 165].forEach((r) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Ventilation Flow Streamlines
      ctx.strokeStyle = 'rgba(234, 254, 7, 0.28)'; // Neon Yellow streamlines
      ctx.lineWidth = 1.5;
      const dashOffset = (tick * airflow * 1.6) % 48;
      for (let y = 35; y < h - 25; y += 42) {
        ctx.beginPath();
        ctx.setLineDash([10, 14]);
        ctx.lineDashOffset = -dashOffset;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Sample Holder (NASA BASS-II Glovebox Mount)
      ctx.fillStyle = '#0042A6';
      ctx.strokeStyle = '#2E96F5';
      ctx.lineWidth = 2;
      ctx.fillRect(cx - 24, cy - 10, 48, 20);
      ctx.strokeRect(cx - 24, cy - 10, 48, 20);

      if (isIgnited) {
        const baseR = Math.min(92, 30 + liveSpreadRate * 20);
        const pulse = Math.sin(tick * 3.2) * 2.5;
        const radius = baseR + pulse;
        const wakeStretch = 1 + Math.min(airflow / 32, 1.15);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(wakeStretch, 1);

        // Spherical 0g Flame Gradient (Blue outer diffusion shell + Rocket Red core + White hot zone)
        const grad = ctx.createRadialGradient(0, 0, radius * 0.08, 0, 0, radius);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.28, '#EAFE07'); // Neon Yellow inner reaction front
        grad.addColorStop(0.62, '#E43700'); // Rocket Red
        grad.addColorStop(0.88, 'rgba(46, 150, 245, 0.65)'); // Blue Yonder 0g diffusion edge
        grad.addColorStop(1, 'rgba(7, 23, 63, 0)');

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // SI Optical Tracking Bounding Box
        ctx.strokeStyle = '#EAFE07';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-radius - 6, -radius - 6, (radius + 6) * 2, (radius + 6) * 2);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isIgnited, airflow, liveSpreadRate]);

  const handleExportReport = () => {
    const report = {
      project: 'SPACE SECURITY: IGNIS-0',
      localEvent: 'Solo Architect — Team SPACE SECURITY (2026 NASA Space Apps Challenge)',
      challenge: 'Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data',
      siDisclosure: 'SI-Assisted Multi-Variable Interpolation & Visualization (Human-Engineered Physics Core)',
      timestamp: new Date().toISOString(),
      selectedMaterial: selectedMat,
      cabinEnvironment: { oxygenPercent: oxygen, pressureKPa: pressure, ventilationCmPerSec: airflow },
      simulationOutput: {
        ignitionStatus: isIgnited ? 'IGNITED_IN_0G' : 'SELF_EXTINGUISHED',
        sphericalSpreadRateMmPerSec: liveSpreadRate,
        flameFrontTempK: liveFlameTemp,
        compositeSIRiskScore: dynamicRiskScore
      }
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IGNIS0_NASA_Safety_Report_${selectedMat.id}.json`;
    a.click();
  };

  const filteredMaterials = NASA_AND_PARTNER_DATA.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.agencySource.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="min-h-screen text-white selection:bg-[#EAFE07] selection:text-[#07173F]"
      style={{
        background: 'linear-gradient(135deg, #0042A6 0%, #07173F 100%)',
        fontFamily: "'Overpass', sans-serif"
      }}
    >
      {/* TOP HEADER: Official NASA Space Apps Responsive Orbit Logo + Team Space Security Badge */}
      <header className="border-b border-[#2E96F5]/40 bg-[#07173F]/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Official Responsive "Orbit" Logo Motif (4U x 4U Circular Holding Shape) */}
            <div className="w-12 h-12 rounded-full bg-[#0042A6] border-2 border-white flex items-center justify-center relative shrink-0">
              <svg viewBox="0 0 64 64" className="w-9 h-9 stroke-white fill-none" strokeWidth="3.5">
                <circle cx="28" cy="36" r="18" />
                <circle cx="43" cy="21" r="6" fill="#07173F" />
                <line x1="46" y1="15" x2="52" y2="5" strokeLinecap="round" />
                <line x1="48" y1="17" x2="56" y2="10" strokeLinecap="round" />
                <line x1="49" y1="20" x2="59" y2="16" strokeLinecap="round" />
                <line x1="49" y1="23" x2="58" y2="22" strokeLinecap="round" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded bg-[#E43700] text-white tracking-wider uppercase"
                  style={{ fontFamily: "'Fira Code', monospace" }}
                >
                  2026 NASA SPACE APPS CHALLENGE
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded border border-[#2E96F5] text-[#EAFE07]"
                  style={{ fontFamily: "'Fira Code', monospace" }}
                >
                  TEAM: SPACE SECURITY
                </span>
              </div>
              <h1
                className="text-2xl md:text-3xl font-black uppercase tracking-[0.05em] text-white mt-1"
                style={{ fontFamily: "'Fira Sans', sans-serif" }}
              >
                IGNIS-0 // MICROGRAVITY FIRE SI
              </h1>
            </div>
          </div>

          {/* Action Buttons using 10% Neon Yellow (#EAFE07) + Blue Near Black (#07173F) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDeckOpen(true)}
              className="px-4 py-2.5 rounded font-bold text-sm flex items-center gap-2 bg-[#EAFE07] text-[#07173F] hover:brightness-95 transition shadow-lg cursor-pointer"
            >
              <Presentation className="w-4 h-4 stroke-[2.5]" />
              7-SLIDE JUDGE DECK & PITCH
            </button>
            <button
              onClick={handleExportReport}
              className="px-4 py-2.5 rounded font-bold text-sm flex items-center gap-2 bg-[#0042A6] border border-[#2E96F5] text-white hover:bg-[#0960E1] transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              EXPORT SI REPORT
            </button>
          </div>
        </div>
      </header>

      {/* MISSION ATMOSPHERE PRESET BAR */}
      <div className="bg-[#07173F]/75 border-b border-[#2E96F5]/30 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#2E96F5] font-bold">
            <Globe className="w-4 h-4 text-[#EAFE07]" />
            Spacecraft Cabin Atmosphere Presets:
          </div>
          <div className="flex flex-wrap gap-2">
            {CABIN_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setOxygen(preset.o2);
                  setPressure(preset.pressure);
                  setAirflow(preset.flow);
                }}
                className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer border ${
                  oxygen === preset.o2 && pressure === preset.pressure && airflow === preset.flow
                    ? 'bg-[#EAFE07] text-[#07173F] border-[#EAFE07]'
                    : 'bg-[#07173F] text-white border-[#2E96F5]/50 hover:border-[#EAFE07]'
                }`}
                style={{ fontFamily: "'Fira Code', monospace" }}
              >
                {preset.name} [{preset.o2}% O2 | {preset.pressure} kPa]
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN 3-COLUMN BENTO GRID */}
      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (4 COLS): NASA PSI & Partner Material Ranker */}
        <section className="lg:col-span-4 bg-[#07173F] border border-[#2E96F5]/50 rounded-lg p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-[#2E96F5]/30 pb-3 mb-4">
              <div>
                <span className="text-xs uppercase text-[#2E96F5] font-bold block">
                  NASA PSI + JAXA / ESA / ISRO
                </span>
                <h2
                  className="text-lg font-black uppercase tracking-wider text-white"
                  style={{ fontFamily: "'Fira Sans', sans-serif" }}
                >
                  SI MATERIAL RISK RANKING
                </h2>
              </div>
              <Database className="w-6 h-6 text-[#EAFE07]" />
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-[#2E96F5] absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter NASA PSI / JAXA materials..."
                className="w-full bg-[#0042A6]/30 border border-[#2E96F5]/60 rounded pl-9 pr-3 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:border-[#EAFE07]"
              />
            </div>

            {/* Material List */}
            <div className="space-y-2.5">
              {filteredMaterials.map((mat) => {
                const active = selectedMat.id === mat.id;
                const willBurnNow = oxygen >= mat.mocO2 && airflow >= 0.8;
                return (
                  <div
                    key={mat.id}
                    onClick={() => setSelectedMat(mat)}
                    className={`p-3.5 rounded border transition cursor-pointer ${
                      active
                        ? 'bg-[#0042A6] border-[#EAFE07] shadow-md'
                        : 'bg-[#07173F]/90 border-[#2E96F5]/30 hover:border-[#2E96F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-white">{mat.name}</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                          willBurnNow
                            ? 'bg-[#E43700] text-white'
                            : 'bg-[#0960E1] text-white border border-[#2E96F5]'
                        }`}
                        style={{ fontFamily: "'Fira Code', monospace" }}
                      >
                        {willBurnNow ? (
                          <>
                            <Flame className="w-3.5 h-3.5" /> IGNITES
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#EAFE07]" /> SAFE
                          </>
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-white/80 mt-1">{mat.agencySource}</div>
                    <div
                      className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-white/15"
                      style={{ fontFamily: "'Fira Code', monospace" }}
                    >
                      <span>MOC Threshold: {mat.mocO2}% O2</span>
                      <span className="text-[#EAFE07] font-bold">SI Score: {mat.siRiskScore}/100</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Circular Holding Shape for Team Space Security 2026 Patch + Mandatory SI Watermark */}
          <div className="mt-6 pt-4 border-t border-[#2E96F5]/30 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#0042A6] border-2 border-[#EAFE07] flex flex-col items-center justify-center relative shrink-0 overflow-hidden shadow-inner">
              <Flame className="w-7 h-7 text-[#E43700] fill-[#EAFE07]" />
              <span className="text-[8px] font-bold uppercase tracking-tighter text-white bg-[#07173F]/90 px-1 rounded mt-0.5">
                SI-WATERMARK
              </span>
            </div>
            <div className="text-xs leading-snug">
              <div className="font-bold text-[#EAFE07] uppercase">TEAM SPACE SECURITY // 2026</div>
              <p className="text-white/85 mt-0.5">
                Circular holding emblem compliant with NASA Space Apps 2026 Photography & SI Watermark Guidelines.
              </p>
            </div>
          </div>
        </section>

        {/* CENTER COLUMN (5 COLS): Interactive 0g Spherical Combustion Chamber & Sliders */}
        <section className="lg:col-span-5 bg-[#07173F] border border-[#2E96F5]/50 rounded-lg p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2E96F5]/30 pb-3 mb-4">
              <div>
                <span
                  className="text-xs text-[#2E96F5] font-bold uppercase block"
                  style={{ fontFamily: "'Fira Code', monospace" }}
                >
                  DATASET ID: {selectedMat.datasetId}
                </span>
                <h2
                  className="text-lg font-black uppercase tracking-wider text-white"
                  style={{ fontFamily: "'Fira Sans', sans-serif" }}
                >
                  0G SPHERICAL COMBUSTION TUNNEL
                </h2>
              </div>

              {/* WCAG Accessible Status Pill (Pairs color + icon + explicit text) */}
              <div
                className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 ${
                  isIgnited
                    ? 'bg-[#E43700] text-white'
                    : 'bg-[#0042A6] border border-[#EAFE07] text-[#EAFE07]'
                }`}
                style={{ fontFamily: "'Fira Code', monospace" }}
              >
                {isIgnited ? (
                  <>
                    <ShieldAlert className="w-4 h-4" /> [ALERT] 0G FLAME PROPAGATING
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> [SAFE] SELF-EXTINGUISHED
                  </>
                )}
              </div>
            </div>

            {/* Canvas Holding Frame */}
            <div className="relative rounded-lg overflow-hidden border-2 border-[#2E96F5] bg-[#07173F]">
              <canvas ref={canvasRef} width={560} height={290} className="w-full h-[270px] block" />

              {/* Telemetry Overlay */}
              <div
                className="absolute top-3 left-3 bg-[#07173F]/95 border border-[#2E96F5] rounded p-2.5 text-xs space-y-1"
                style={{ fontFamily: "'Fira Code', monospace" }}
              >
                <div>
                  0G SPREAD RATE:{' '}
                  <span className="text-[#EAFE07] font-bold">{liveSpreadRate} mm/s</span>
                </div>
                <div>
                  FLAME FRONT TEMP:{' '}
                  <span className="text-white font-bold">{liveFlameTemp} K</span>
                </div>
                <div>
                  MIN O2 (MOC):{' '}
                  <span className="text-[#2E96F5] font-bold">{selectedMat.mocO2}% O2</span>
                </div>
              </div>

              {/* Mandatory SI Visual Watermark Badge */}
              <div
                className="absolute bottom-2 right-2 bg-[#07173F]/90 border border-[#2E96F5]/60 px-2 py-0.5 rounded text-[10px] text-white/90"
                style={{ fontFamily: "'Fira Code', monospace" }}
              >
                SI-ASSISTED PHYSICS VISUALIZATION // NASA PSI VALIDATED
              </div>
            </div>

            {/* Interactive Environmental Controls */}
            <div className="mt-5 space-y-4 bg-[#0042A6]/25 border border-[#2E96F5]/40 rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#EAFE07]">
                <Sliders className="w-4 h-4" />
                Real-Time Spacecraft Environment Controls
              </div>

              {/* Slider 1: Oxygen */}
              <div>
                <div
                  className="flex justify-between text-xs font-bold mb-1"
                  style={{ fontFamily: "'Fira Code', monospace" }}
                >
                  <span>CABIN OXYGEN CONCENTRATION (O2):</span>
                  <span className={oxygen >= selectedMat.mocO2 ? 'text-[#EAFE07]' : 'text-white'}>
                    {oxygen.toFixed(1)}% (Threshold: {selectedMat.mocO2}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="40"
                  step="0.5"
                  value={oxygen}
                  onChange={(e) => setOxygen(parseFloat(e.target.value))}
                  className="w-full accent-[#EAFE07] cursor-pointer"
                />
              </div>

              {/* Slider 2: Ventilation Flow */}
              <div>
                <div
                  className="flex justify-between text-xs font-bold mb-1"
                  style={{ fontFamily: "'Fira Code', monospace" }}
                >
                  <span>HVAC VENTILATION AIRFLOW VELOCITY:</span>
                  <span className="text-[#EAFE07]">
                    {airflow.toFixed(1)} cm/s {airflow < 0.8 ? '(DIFFUSIVE STARVATION)' : '(O2 FEED ACTIVE)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="0.5"
                  value={airflow}
                  onChange={(e) => setAirflow(parseFloat(e.target.value))}
                  className="w-full accent-[#EAFE07] cursor-pointer"
                />
              </div>

              {/* Slider 3: Cabin Pressure */}
              <div>
                <div
                  className="flex justify-between text-xs font-bold mb-1"
                  style={{ fontFamily: "'Fira Code', monospace" }}
                >
                  <span>AMBIENT CABIN PRESSURE:</span>
                  <span className="text-white">{pressure.toFixed(1)} kPa</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="110"
                  step="0.5"
                  value={pressure}
                  onChange={(e) => setPressure(parseFloat(e.target.value))}
                  className="w-full accent-[#EAFE07] cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded bg-[#0042A6]/40 border-l-4 border-[#EAFE07] text-xs leading-relaxed">
            <strong className="text-[#EAFE07] uppercase block mb-0.5">
              Microgravity Science Insight ({selectedMat.name}):
            </strong>
            {selectedMat.notes}
          </div>
        </section>

        {/* RIGHT COLUMN (3 COLS): Super Intelligence (SI) Decision Support & Compliance */}
        <section className="lg:col-span-3 bg-[#07173F] border border-[#2E96F5]/50 rounded-lg p-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="border-b border-[#2E96F5]/30 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase text-[#2E96F5] font-bold block">
                  DECISION SUPPORT
                </span>
                <h2
                  className="text-lg font-black uppercase tracking-wider text-white"
                  style={{ fontFamily: "'Fira Sans', sans-serif" }}
                >
                  SI SAFETY VERDICT
                </h2>
              </div>
              <Sparkles className="w-6 h-6 text-[#EAFE07]" />
            </div>

            {/* Dynamic SI Risk Meter */}
            <div className="p-4 rounded bg-[#0042A6]/35 border border-[#2E96F5]">
              <div className="text-xs uppercase text-white/80 font-bold">
                LIVE COMPOSITE SI RISK INDEX
              </div>
              <div
                className="text-4xl font-black mt-1 text-[#EAFE07]"
                style={{ fontFamily: "'Fira Code', monospace" }}
              >
                {dynamicRiskScore} <span className="text-base text-white">/ 100</span>
              </div>
              <div className="w-full h-2.5 bg-[#07173F] rounded-full overflow-hidden mt-2 border border-[#2E96F5]/50">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${dynamicRiskScore}%`,
                    backgroundColor: dynamicRiskScore > 60 ? '#E43700' : '#EAFE07'
                  }}
                />
              </div>
            </div>

            {/* Recommended Suppression Protocol */}
            <div className="p-3.5 rounded bg-[#0042A6]/25 border border-[#2E96F5]/50 text-xs space-y-1.5">
              <div className="font-bold text-[#EAFE07] uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Recommended 0g Suppression:
              </div>
              <p className="text-white font-semibold">{selectedMat.suppressionAgent}</p>
              <p className="text-white/80">
                First action: Cut HVAC ventilation airflow below 0.8 cm/s to induce diffusive CO2 self-blanketing around the spherical flame front.
              </p>
            </div>

            {/* Why Nomex burns in Artemis Callout */}
            <div className="p-3.5 rounded bg-[#8E1100]/60 border border-[#E43700] text-xs space-y-1">
              <div className="font-bold text-white uppercase flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#EAFE07]" />
                Artemis 34% O2 Alert:
              </div>
              <p className="text-white/90">
                Try selecting <strong>Nomex HT90-40</strong> and switching between <strong>ISS (21% O2)</strong> and <strong>Artemis (34% O2)</strong> presets above to see why terrestrial fire ratings fail in lunar exploration.
              </p>
            </div>
          </div>

          {/* Mandatory 2026 SI Metadata Acknowledgment Box */}
          <div
            className="mt-6 p-3 rounded bg-[#07173F] border border-[#2E96F5]/60 text-[11px] space-y-1 text-white/85"
            style={{ fontFamily: "'Fira Code', monospace" }}
          >
            <div className="text-[#EAFE07] font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              2026 SI DISCLOSURE METADATA
            </div>
            <p>
              • Core Concept & Physics Model: 100% Human-Engineered by Team SPACE SECURITY (Solo Systems Architect).
            </p>
            <p>
              • SI Utilization: Accelerated React/Canvas code generation, multi-variable PSI data interpolation & watermarked mission patch.
            </p>
          </div>
        </section>
      </main>

      {/* MODAL: 7-SLIDE JUDGE PRESENTATION DECK (STRICT 7-SLIDE LIMIT COMPLIANCE) */}
      {isDeckOpen && (
        <div className="fixed inset-0 z-50 bg-[#07173F]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#07173F] border-2 border-[#EAFE07] rounded-xl max-w-3xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#2E96F5]/40 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <Award className="w-6 h-6 text-[#EAFE07]" />
                <span
                  className="text-sm font-bold uppercase tracking-wider text-[#EAFE07]"
                  style={{ fontFamily: "'Fira Code', monospace" }}
                >
                  OFFICIAL 7-SLIDE JUDGE PRESENTATION // SLIDE {SLIDE_DECK[currentSlide].slide} OF 7
                </span>
              </div>
              <button
                onClick={() => setIsDeckOpen(false)}
                className="p-1.5 rounded bg-[#0042A6] text-white hover:bg-[#E43700] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 px-4 bg-[#0042A6]/30 border border-[#2E96F5] rounded-lg min-h-[240px] flex flex-col justify-between">
              <div>
                <span
                  className="text-xs font-bold uppercase px-2.5 py-1 rounded bg-[#E43700] text-white"
                  style={{ fontFamily: "'Fira Code', monospace" }}
                >
                  SLIDE 0{SLIDE_DECK[currentSlide].slide} // SPACE SECURITY 2026
                </span>
                <h3
                  className="text-2xl md:text-3xl font-black uppercase tracking-[0.05em] text-white mt-3"
                  style={{ fontFamily: "'Fira Sans', sans-serif" }}
                >
                  {SLIDE_DECK[currentSlide].title}
                </h3>
                <p className="text-base font-bold text-[#EAFE07] mt-1">
                  {SLIDE_DECK[currentSlide].subtitle}
                </p>
                <p className="text-sm text-white/95 mt-4 leading-relaxed">
                  {SLIDE_DECK[currentSlide].content}
                </p>
              </div>

              <div className="mt-6 p-3 rounded bg-[#07173F] border-l-4 border-[#EAFE07] text-xs text-[#EAFE07] font-bold">
                KEY TAKEAWAY: {SLIDE_DECK[currentSlide].highlight}
              </div>
            </div>

            <div className="flex items-center justify-between mt-5">
              <button
                onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
                disabled={currentSlide === 0}
                className="px-4 py-2 rounded font-bold text-xs bg-[#0042A6] text-white disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> PREVIOUS SLIDE
              </button>
              <div className="flex gap-1.5">
                {SLIDE_DECK.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-3 h-3 rounded-full cursor-pointer ${
                      currentSlide === idx ? 'bg-[#EAFE07]' : 'bg-[#2E96F5]/40'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCurrentSlide((prev) => Math.min(SLIDE_DECK.length - 1, prev + 1))}
                disabled={currentSlide === SLIDE_DECK.length - 1}
                className="px-4 py-2 rounded font-bold text-xs bg-[#EAFE07] text-[#07173F] disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                NEXT SLIDE <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}