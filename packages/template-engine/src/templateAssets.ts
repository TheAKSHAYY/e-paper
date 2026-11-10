/**
 * Authentic, self-hosted vector editorial photographs and diagrams for
 * newspaper sample templates.
 *
 * Each image is self-contained as a clean SVG data URI (zero external network
 * dependencies, safe for offline rendering and strict SSRF-protected PDF workers).
 */

function svgToDataUri(svg: string): string {
  // Clean whitespace and encode for data URI
  const cleaned = svg.replace(/\n\s*/g, ' ').trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleaned)}`;
}

/**
 * 1. Global Energy Summit (वैश्विक ऊर्जा शिखर सम्मेलन)
 */
export const SUMMIT_PHOTO_DATA_URI = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" width="900" height="520">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="60%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#06b6d4" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.8"/>
    </linearGradient>
    <linearGradient id="podiumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <radialGradient id="spotlight" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Hall Background -->
  <rect width="900" height="520" fill="url(#bgGrad)"/>
  <rect width="900" height="520" fill="url(#spotlight)"/>

  <!-- Architectural Hall Structure & Ceiling Beams -->
  <path d="M0,0 L900,0 L850,90 L50,90 Z" fill="#0b1120"/>
  <line x1="120" y1="0" x2="160" y2="90" stroke="#334155" stroke-width="2"/>
  <line x1="280" y1="0" x2="300" y2="90" stroke="#334155" stroke-width="2"/>
  <line x1="450" y1="0" x2="450" y2="90" stroke="#334155" stroke-width="2"/>
  <line x1="620" y1="0" x2="600" y2="90" stroke="#334155" stroke-width="2"/>
  <line x1="780" y1="0" x2="740" y2="90" stroke="#334155" stroke-width="2"/>

  <!-- Giant Summit Backdrop Screen -->
  <rect x="100" y="70" width="700" height="230" rx="8" fill="#020617" stroke="#38bdf8" stroke-width="3"/>
  <rect x="106" y="76" width="688" height="218" rx="6" fill="url(#screenGrad)"/>

  <!-- World Grid Lines on Screen -->
  <ellipse cx="450" cy="185" rx="260" ry="85" fill="none" stroke="#ffffff" stroke-dasharray="6,4" stroke-opacity="0.4" stroke-width="1.5"/>
  <ellipse cx="450" cy="185" rx="160" ry="55" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1.5"/>
  <line x1="190" y1="185" x2="710" y2="185" stroke="#ffffff" stroke-opacity="0.5" stroke-width="1.5"/>
  <line x1="450" y1="100" x2="450" y2="270" stroke="#ffffff" stroke-opacity="0.5" stroke-width="1.5"/>

  <!-- Summit Headline on Big Screen -->
  <text x="450" y="145" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-size="24" letter-spacing="2">GLOBAL CLEAN ENERGY CORRIDOR SUMMIT</text>
  <text x="450" y="175" text-anchor="middle" fill="#fef08a" font-family="Arial, sans-serif" font-weight="700" font-size="16" letter-spacing="1">GENEVA CONVENTION • 68 SIGNATORY NATIONS</text>

  <!-- Clean Energy Icons on Screen (Sun & Wind Turbine) -->
  <circle cx="280" cy="225" r="22" fill="#fbbf24"/>
  <path d="M280,195 L280,255 M250,225 L310,225" stroke="#fef08a" stroke-width="3"/>
  <circle cx="620" cy="225" r="18" fill="none" stroke="#ffffff" stroke-width="3"/>
  <line x1="620" y1="225" x2="620" y2="260" stroke="#ffffff" stroke-width="3"/>
  <line x1="620" y1="225" x2="605" y2="205" stroke="#ffffff" stroke-width="3"/>
  <line x1="620" y1="225" x2="635" y2="205" stroke="#ffffff" stroke-width="3"/>

  <!-- Stage Platform -->
  <polygon points="40,380 860,380 900,520 0,520" fill="#1e293b"/>
  <line x1="40" y1="380" x2="860" y2="380" stroke="#0ea5e9" stroke-width="4"/>

  <!-- Diplomatic Delegates Table -->
  <rect x="180" y="340" width="540" height="50" rx="4" fill="url(#podiumGrad)" stroke="#64748b" stroke-width="1.5"/>
  <text x="450" y="370" text-anchor="middle" fill="#f8fafc" font-family="Arial, sans-serif" font-weight="bold" font-size="15" letter-spacing="1.5">MINISTERIAL PLENARY COUNCIL</text>

  <!-- International Tabletop Nameplates -->
  <rect x="220" y="325" width="70" height="15" fill="#f8fafc" rx="2"/>
  <text x="255" y="336" text-anchor="middle" fill="#0f172a" font-family="Arial, sans-serif" font-size="9" font-weight="bold">INDIA</text>
  <rect x="330" y="325" width="70" height="15" fill="#f8fafc" rx="2"/>
  <text x="365" y="336" text-anchor="middle" fill="#0f172a" font-family="Arial, sans-serif" font-size="9" font-weight="bold">FRANCE</text>
  <rect x="440" y="325" width="70" height="15" fill="#f8fafc" rx="2"/>
  <text x="475" y="336" text-anchor="middle" fill="#0f172a" font-family="Arial, sans-serif" font-size="9" font-weight="bold">GERMANY</text>
  <rect x="550" y="325" width="70" height="15" fill="#f8fafc" rx="2"/>
  <text x="585" y="336" text-anchor="middle" fill="#0f172a" font-family="Arial, sans-serif" font-size="9" font-weight="bold">JAPAN</text>

  <!-- Delegates Silhouettes Seated at Table -->
  <circle cx="255" cy="305" r="16" fill="#0f172a"/>
  <path d="M230,340 C230,320 280,320 280,340 Z" fill="#0f172a"/>
  <circle cx="365" cy="305" r="16" fill="#0f172a"/>
  <path d="M340,340 C340,320 390,320 390,340 Z" fill="#0f172a"/>
  <circle cx="475" cy="305" r="16" fill="#0f172a"/>
  <path d="M450,340 C450,320 500,320 500,340 Z" fill="#0f172a"/>
  <circle cx="585" cy="305" r="16" fill="#0f172a"/>
  <path d="M560,340 C560,320 610,320 610,340 Z" fill="#0f172a"/>

  <!-- Central Speaker at Lectern -->
  <rect x="420" y="390" width="60" height="100" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
  <circle cx="450" cy="365" r="18" fill="#e2e8f0"/>
  <path d="M425,415 C425,385 475,385 475,415 Z" fill="#1e293b"/>
  <!-- Microphones -->
  <line x1="440" y1="390" x2="435" y2="375" stroke="#94a3b8" stroke-width="2"/>
  <line x1="460" y1="390" x2="465" y2="375" stroke="#94a3b8" stroke-width="2"/>

  <!-- Press Photographer Silhouettes in Foreground -->
  <ellipse cx="140" cy="510" rx="45" ry="35" fill="#020617"/>
  <ellipse cx="760" cy="510" rx="50" ry="35" fill="#020617"/>
  <polygon points="135,465 155,465 150,480 130,480" fill="#334155"/>
  <circle cx="145" cy="460" r="14" fill="#020617"/>

  <!-- Camera Flash Effect -->
  <circle cx="135" cy="465" r="5" fill="#ffffff"/>
  <line x1="135" y1="450" x2="135" y2="480" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.8"/>
  <line x1="120" y1="465" x2="150" y2="465" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.8"/>
</svg>
`);

/**
 * 2. Gaganyaan Cryogenic Propulsion Test (भारतीय अंतरिक्ष अनुसंधान)
 */
export const ROCKET_TEST_DATA_URI = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" width="900" height="520">
  <defs>
    <linearGradient id="nightSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="60%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="plumeFire" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="20%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#fb923c"/>
      <stop offset="85%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#7f1d1d" stop-opacity="0.2"/>
    </linearGradient>
    <radialGradient id="fireGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fb923c" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="#ef4444" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Deep Night Sky with Stars -->
  <rect width="900" height="520" fill="url(#nightSky)"/>
  <circle cx="80" cy="70" r="1.5" fill="#ffffff" opacity="0.8"/>
  <circle cx="160" cy="40" r="1.2" fill="#ffffff" opacity="0.6"/>
  <circle cx="280" cy="110" r="1.8" fill="#ffffff" opacity="0.9"/>
  <circle cx="680" cy="50" r="1.4" fill="#ffffff" opacity="0.7"/>
  <circle cx="790" cy="95" r="1.5" fill="#ffffff" opacity="0.8"/>
  <circle cx="840" cy="35" r="1.2" fill="#ffffff" opacity="0.5"/>

  <!-- Static Test Gantry Tower Structure (Lattice Steel) -->
  <rect x="360" y="40" width="180" height="380" fill="none" stroke="#475569" stroke-width="3"/>
  <line x1="360" y1="40" x2="540" y2="120" stroke="#334155" stroke-width="2"/>
  <line x1="540" y1="40" x2="360" y2="120" stroke="#334155" stroke-width="2"/>
  <line x1="360" y1="120" x2="540" y2="200" stroke="#334155" stroke-width="2"/>
  <line x1="540" y1="120" x2="360" y2="200" stroke="#334155" stroke-width="2"/>
  <line x1="360" y1="200" x2="540" y2="280" stroke="#334155" stroke-width="2"/>
  <line x1="540" y1="200" x2="360" y2="280" stroke="#334155" stroke-width="2"/>
  <line x1="360" y1="280" x2="540" y2="360" stroke="#334155" stroke-width="2"/>
  <line x1="540" y1="280" x2="360" y2="360" stroke="#334155" stroke-width="2"/>

  <!-- Cryogenic Fuel Tank Stage (White Cylinder with ISRO Tricolor Decal) -->
  <rect x="405" y="70" width="90" height="220" rx="10" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
  <rect x="405" y="140" width="90" height="6" fill="#f97316"/>
  <rect x="405" y="146" width="90" height="6" fill="#ffffff"/>
  <rect x="405" y="152" width="90" height="6" fill="#16a34a"/>
  <text x="450" y="195" text-anchor="middle" fill="#0f172a" font-family="Arial, sans-serif" font-weight="900" font-size="13" letter-spacing="2">ISRO</text>
  <text x="450" y="215" text-anchor="middle" fill="#475569" font-family="Arial, sans-serif" font-weight="bold" font-size="10">CE-20 CRYOGENIC</text>

  <!-- Engine Gimbal & Bell Nozzle -->
  <polygon points="430,290 470,290 485,340 415,340" fill="#334155" stroke="#94a3b8" stroke-width="2"/>

  <!-- Plume Flare Glow -->
  <circle cx="450" cy="420" r="160" fill="url(#fireGlow)"/>

  <!-- High-Energy Supersonic Plume Jet -->
  <polygon points="420,340 480,340 520,510 380,510" fill="url(#plumeFire)"/>
  <!-- Mach Diamonds in Exhaust Plume -->
  <polygon points="450,360 460,375 450,390 440,375" fill="#ffffff" opacity="0.9"/>
  <polygon points="450,405 464,420 450,435 436,420" fill="#ffffff" opacity="0.8"/>
  <polygon points="450,450 468,468 450,486 432,468" fill="#ffffff" opacity="0.7"/>

  <!-- Test Stand Concrete Flame Trench Base -->
  <rect x="0" y="470" width="900" height="50" fill="#0f172a"/>
  <polygon points="200,470 380,470 350,520 150,520" fill="#1e293b"/>
  <polygon points="700,470 520,470 550,520 750,520" fill="#1e293b"/>

  <!-- Cooling Water Deluge Steam Clouds -->
  <circle cx="340" cy="460" r="45" fill="#e2e8f0" opacity="0.35"/>
  <circle cx="280" cy="480" r="55" fill="#cbd5e1" opacity="0.25"/>
  <circle cx="560" cy="460" r="45" fill="#e2e8f0" opacity="0.35"/>
  <circle cx="620" cy="480" r="55" fill="#cbd5e1" opacity="0.25"/>

  <!-- Facility Floodlights Casting Beams -->
  <polygon points="120,420 380,280 400,320 120,440" fill="#ffffff" opacity="0.08"/>
  <polygon points="780,420 520,280 500,320 780,440" fill="#ffffff" opacity="0.08"/>
</svg>
`);

/**
 * 3. District Collectorate Building (जिला कलेक्ट्रेट प्रशासनिक भवन)
 */
export const COLLECTORATE_PHOTO_DATA_URI = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" width="900" height="520">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="55%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#f0f9ff"/>
    </linearGradient>
    <linearGradient id="stoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#eab308"/>
    </linearGradient>
    <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#15803d"/>
      <stop offset="100%" stop-color="#166534"/>
    </linearGradient>
  </defs>

  <!-- Clear Morning Sky -->
  <rect width="900" height="520" fill="url(#skyGrad)"/>

  <!-- Distant Trees and Landscape -->
  <circle cx="80" cy="360" r="60" fill="#166534" opacity="0.7"/>
  <circle cx="160" cy="350" r="70" fill="#15803d" opacity="0.8"/>
  <circle cx="750" cy="350" r="70" fill="#15803d" opacity="0.8"/>
  <circle cx="830" cy="360" r="60" fill="#166534" opacity="0.7"/>

  <!-- Neo-Classical Secretariat Wings -->
  <rect x="120" y="240" width="660" height="150" fill="#fef9c3" stroke="#ca8a04" stroke-width="2"/>

  <!-- Wing Windows Upper Floor -->
  <g fill="#0284c7" stroke="#ca8a04" stroke-width="1.5">
    <rect x="150" y="260" width="28" height="42" rx="14"/>
    <rect x="200" y="260" width="28" height="42" rx="14"/>
    <rect x="250" y="260" width="28" height="42" rx="14"/>
    <rect x="300" y="260" width="28" height="42" rx="14"/>
    <rect x="570" y="260" width="28" height="42" rx="14"/>
    <rect x="620" y="260" width="28" height="42" rx="14"/>
    <rect x="670" y="260" width="28" height="42" rx="14"/>
    <rect x="720" y="260" width="28" height="42" rx="14"/>
  </g>

  <!-- Wing Windows Ground Floor -->
  <g fill="#0f172a" stroke="#ca8a04" stroke-width="1.5">
    <rect x="150" y="325" width="28" height="45" rx="3"/>
    <rect x="200" y="325" width="28" height="45" rx="3"/>
    <rect x="250" y="325" width="28" height="45" rx="3"/>
    <rect x="300" y="325" width="28" height="45" rx="3"/>
    <rect x="570" y="325" width="28" height="45" rx="3"/>
    <rect x="620" y="325" width="28" height="45" rx="3"/>
    <rect x="670" y="325" width="28" height="45" rx="3"/>
    <rect x="720" y="325" width="28" height="45" rx="3"/>
  </g>

  <!-- Majestic Central Portico & Pillars -->
  <rect x="360" y="200" width="180" height="190" fill="#fef08a" stroke="#a16207" stroke-width="2.5"/>

  <!-- Classical Columns -->
  <g fill="#ffffff" stroke="#a16207" stroke-width="2">
    <rect x="375" y="240" width="18" height="150"/>
    <rect x="415" y="240" width="18" height="150"/>
    <rect x="465" y="240" width="18" height="150"/>
    <rect x="505" y="240" width="18" height="150"/>
  </g>

  <!-- Triangular Pediment -->
  <polygon points="350,200 450,110 550,200" fill="#fef08a" stroke="#a16207" stroke-width="3"/>
  <!-- Central Emblem inside Pediment -->
  <circle cx="450" cy="165" r="18" fill="#ca8a04" stroke="#78350f" stroke-width="2"/>
  <circle cx="450" cy="165" r="10" fill="none" stroke="#ffffff" stroke-width="1.5"/>

  <!-- Flagpole & Indian Tricolor on Dome -->
  <line x1="450" y1="110" x2="450" y2="40" stroke="#475569" stroke-width="3"/>
  <g transform="translate(450, 40)">
    <rect x="0" y="0" width="45" height="9" fill="#f97316"/>
    <rect x="0" y="9" width="45" height="9" fill="#ffffff"/>
    <rect x="0" y="18" width="45" height="9" fill="#16a34a"/>
    <circle cx="22.5" cy="13.5" r="3.5" fill="#1d4ed8"/>
  </g>

  <!-- Main Entrance Steps -->
  <polygon points="330,390 570,390 600,430 300,430" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2"/>
  <line x1="320" y1="400" x2="580" y2="400" stroke="#64748b" stroke-width="1.5"/>
  <line x1="310" y1="415" x2="590" y2="415" stroke="#64748b" stroke-width="1.5"/>

  <!-- Grand Forecourt Lawn & Flowerbeds -->
  <rect x="0" y="430" width="900" height="90" fill="url(#grassGrad)"/>
  <!-- Central Paved Driveway -->
  <polygon points="370,430 530,430 620,520 280,520" fill="#e2e8f0"/>
  <line x1="450" y1="430" x2="450" y2="520" stroke="#94a3b8" stroke-width="2" stroke-dasharray="8,6"/>
</svg>
`);

/**
 * 4. State Youth Sports & Athletics (राज्य स्तरीय युवा खेल महोत्सव)
 */
export const SPORTS_ATHLETES_DATA_URI = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" width="900" height="520">
  <defs>
    <linearGradient id="trackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#b91c1c"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </linearGradient>
    <linearGradient id="skyStadium" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="60%" stop-color="#312e81"/>
      <stop offset="100%" stop-color="#4338ca"/>
    </linearGradient>
  </defs>

  <!-- Twilight Stadium Atmosphere -->
  <rect width="900" height="520" fill="url(#skyStadium)"/>

  <!-- Stadium Stands / Cheering Spectator Terraces -->
  <ellipse cx="450" cy="220" rx="460" ry="90" fill="#1e1b4b" stroke="#6366f1" stroke-width="2"/>
  <ellipse cx="450" cy="240" rx="430" ry="70" fill="#2e1065"/>

  <!-- Stadium Floodlight Towers -->
  <g fill="#e0e7ff" opacity="0.9">
    <!-- Left Floodlight Tower -->
    <polygon points="60,250 80,250 85,80 55,80" fill="#312e81"/>
    <circle cx="70" cy="70" r="18" fill="#fef08a"/>
    <polygon points="70,70 180,320 0,380" fill="#ffffff" opacity="0.12"/>

    <!-- Right Floodlight Tower -->
    <polygon points="840,250 820,250 815,80 845,80" fill="#312e81"/>
    <circle cx="830" cy="70" r="18" fill="#fef08a"/>
    <polygon points="830,70 720,320 900,380" fill="#ffffff" opacity="0.12"/>
  </g>

  <!-- Synthetic Running Track -->
  <polygon points="0,270 900,270 900,520 0,520" fill="url(#trackGrad)"/>

  <!-- Curved Lane Lines (White Lines) -->
  <path d="M0,320 C300,310 600,310 900,320" stroke="#ffffff" stroke-width="3" fill="none"/>
  <path d="M0,370 C300,360 600,360 900,370" stroke="#ffffff" stroke-width="3.5" fill="none"/>
  <path d="M0,430 C300,420 600,420 900,430" stroke="#ffffff" stroke-width="4" fill="none"/>
  <path d="M0,490 C300,480 600,480 900,490" stroke="#ffffff" stroke-width="4.5" fill="none"/>

  <!-- Track Lane Numbers -->
  <text x="180" y="470" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-size="28" opacity="0.8">1</text>
  <text x="180" y="415" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-size="24" opacity="0.8">2</text>
  <text x="180" y="360" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-size="20" opacity="0.8">3</text>

  <!-- Lead Sprinter Silhouette Bursting Ahead -->
  <g fill="#f8fafc">
    <!-- Runner 1 (Front Runner) -->
    <circle cx="580" cy="330" r="18"/>
    <!-- Torso leaning forward -->
    <path d="M570,345 L620,390 L595,420 L560,360 Z"/>
    <!-- Arms pumping -->
    <path d="M575,355 L540,340 L530,365" stroke="#f8fafc" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M605,375 L645,395 L660,380" stroke="#f8fafc" stroke-width="8" stroke-linecap="round" fill="none"/>
    <!-- Legs in full stride -->
    <path d="M620,390 L670,440 L690,435" stroke="#f8fafc" stroke-width="9" stroke-linecap="round" fill="none"/>
    <path d="M595,420 L560,455 L530,470" stroke="#f8fafc" stroke-width="9" stroke-linecap="round" fill="none"/>
  </g>

  <!-- Runner 2 (Challenger) -->
  <g fill="#94a3b8">
    <circle cx="430" cy="340" r="16"/>
    <path d="M420,355 L465,395 L445,425 L415,370 Z"/>
    <path d="M425,365 L395,355 L385,380" stroke="#94a3b8" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="M455,385 L485,405" stroke="#94a3b8" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="M465,395 L505,445" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M445,425 L415,465" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" fill="none"/>
  </g>

  <!-- Finish Line Ribbon (Red/Gold fluttering) -->
  <path d="M680,310 C690,360 670,420 685,480" stroke="#ef4444" stroke-width="6" stroke-dasharray="14,6" fill="none"/>
</svg>
`);

/**
 * 5. Underground Metro Express (मेट्रो भूमिगत रूट)
 */
export const METRO_TRAIN_DATA_URI = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" width="900" height="520">
  <defs>
    <linearGradient id="tunnelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="70%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <linearGradient id="trainSilver" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="50%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
    <linearGradient id="headlightBeam" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Modern Metro Tunnel / Station Interior -->
  <rect width="900" height="520" fill="url(#tunnelGrad)"/>

  <!-- Station Platform Roof & Architectural Arches -->
  <path d="M0,0 L900,0 L820,120 L0,120 Z" fill="#020617"/>
  <line x1="150" y1="0" x2="150" y2="120" stroke="#475569" stroke-width="3"/>
  <line x1="380" y1="0" x2="380" y2="120" stroke="#475569" stroke-width="3"/>
  <line x1="620" y1="0" x2="620" y2="120" stroke="#475569" stroke-width="3"/>

  <!-- Passenger Platform (Right Side) -->
  <polygon points="580,240 900,240 900,520 540,520" fill="#334155" stroke="#64748b" stroke-width="2"/>
  <!-- Platform Yellow Safety Tactile Edge -->
  <polygon points="575,240 600,240 560,520 535,520" fill="#facc15"/>

  <!-- Metro Railway Track Bed (Left Side) -->
  <polygon points="0,240 575,240 535,520 0,520" fill="#0b0f19"/>
  <!-- Steel Rails -->
  <line x1="120" y1="240" x2="160" y2="520" stroke="#94a3b8" stroke-width="4"/>
  <line x1="340" y1="240" x2="420" y2="520" stroke="#94a3b8" stroke-width="4"/>

  <!-- Aerodynamic Modern Metro Train Front Cab -->
  <polygon points="100,160 480,170 510,410 80,400" fill="url(#trainSilver)" stroke="#0284c7" stroke-width="3"/>

  <!-- High-Speed Aerodynamic Nose Curve -->
  <path d="M420,170 C510,180 530,280 510,410 Z" fill="#0284c7"/>

  <!-- Driver Windshield (Dark Tinted Glass) -->
  <polygon points="260,185 450,195 470,270 240,265" fill="#082f49" stroke="#38bdf8" stroke-width="2"/>
  <polygon points="265,190 320,192 280,260 245,260" fill="#38bdf8" opacity="0.3"/>

  <!-- Passenger Windows along Coach -->
  <rect x="110" y="210" width="110" height="70" rx="6" fill="#0284c7" stroke="#e0f2fe" stroke-width="2"/>
  <rect x="115" y="215" width="100" height="60" rx="4" fill="#38bdf8" opacity="0.7"/>

  <!-- Metro Red / Blue Speed Stripe -->
  <rect x="80" y="300" width="425" height="18" fill="#ef4444"/>
  <rect x="80" y="318" width="425" height="8" fill="#0284c7"/>

  <!-- Bright LED Headlights Beam -->
  <circle cx="485" cy="350" r="14" fill="#fef08a"/>
  <circle cx="430" cy="350" r="14" fill="#fef08a"/>
  <polygon points="485,350 900,280 900,450 485,360" fill="url(#headlightBeam)"/>

  <!-- Route Display on Platform (Electronic LED Matrix) -->
  <rect x="680" y="60" width="180" height="40" rx="4" fill="#020617" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="770" y="86" text-anchor="middle" fill="#fbbf24" font-family="Courier, monospace" font-weight="bold" font-size="14" letter-spacing="1">PLATFORM 1: ON TIME</text>
</svg>
`);

/**
 * 6. Rural Agriculture & Lush Crop Harvest (जैविक खेती एवं बंपर पैदावार)
 */
export const ORGANIC_FARM_DATA_URI = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" width="900" height="520">
  <defs>
    <linearGradient id="morningSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fdba74"/>
      <stop offset="40%" stop-color="#fef08a"/>
      <stop offset="80%" stop-color="#bbf7d0"/>
      <stop offset="100%" stop-color="#86efac"/>
    </linearGradient>
    <linearGradient id="cropGreen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#16a34a"/>
      <stop offset="50%" stop-color="#15803d"/>
      <stop offset="100%" stop-color="#14532d"/>
    </linearGradient>
    <linearGradient id="wheatGold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="60%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
  </defs>

  <!-- Golden Sunrise Sky -->
  <rect width="900" height="520" fill="url(#morningSky)"/>

  <!-- Rising Sun on Horizon -->
  <circle cx="450" cy="220" r="70" fill="#fef08a"/>
  <circle cx="450" cy="220" r="90" fill="#fef08a" opacity="0.3"/>

  <!-- Distant Blue Ridge Hills -->
  <path d="M0,230 C200,180 400,240 600,190 C750,160 900,210 900,230 L900,320 L0,320 Z" fill="#65a30d" opacity="0.5"/>
  <path d="M0,250 C180,210 380,260 550,220 C720,190 900,240 900,250 L900,340 L0,340 Z" fill="#4d7c0f" opacity="0.7"/>

  <!-- Agricultural Terraced Crop Fields -->
  <polygon points="0,300 900,300 900,520 0,520" fill="url(#cropGreen)"/>

  <!-- Contour Irrigation Bunds -->
  <path d="M0,350 C320,330 580,370 900,340" stroke="#ca8a04" stroke-width="8" fill="none"/>
  <path d="M0,410 C280,390 620,430 900,400" stroke="#a16207" stroke-width="10" fill="none"/>

  <!-- Solar Powered Water Pump Station in Field -->
  <g transform="translate(680, 240)">
    <!-- Solar Panels -->
    <polygon points="20,50 80,30 95,65 35,85" fill="#1e3a8a" stroke="#60a5fa" stroke-width="1.5"/>
    <line x1="50" y1="40" x2="65" y2="75" stroke="#93c5fd" stroke-width="1"/>
    <!-- Support Pole -->
    <line x1="55" y1="80" x2="55" y2="120" stroke="#475569" stroke-width="4"/>
    <!-- Water Discharge Pipe with Gushing Water -->
    <path d="M55,110 L85,110 L95,135" stroke="#0284c7" stroke-width="4" fill="none"/>
    <circle cx="100" cy="138" r="12" fill="#38bdf8" opacity="0.8"/>
  </g>

  <!-- Golden Mature Wheat Ears in Sharp Foreground -->
  <g fill="url(#wheatGold)" stroke="#a16207" stroke-width="1.5">
    <!-- Wheat Stalk 1 -->
    <path d="M120,520 Q130,420 150,340" stroke="#ca8a04" stroke-width="4" fill="none"/>
    <ellipse cx="150" cy="335" rx="8" ry="14" transform="rotate(-15 150 335)"/>
    <ellipse cx="145" cy="355" rx="7" ry="12" transform="rotate(-25 145 355)"/>
    <ellipse cx="158" cy="350" rx="7" ry="12" transform="rotate(15 158 350)"/>
    <ellipse cx="140" cy="375" rx="7" ry="12" transform="rotate(-30 140 375)"/>
    <ellipse cx="155" cy="370" rx="7" ry="12" transform="rotate(20 155 370)"/>

    <!-- Wheat Stalk 2 -->
    <path d="M220,520 Q240,430 270,330" stroke="#ca8a04" stroke-width="4" fill="none"/>
    <ellipse cx="270" cy="325" rx="8" ry="14" transform="rotate(10 270 325)"/>
    <ellipse cx="260" cy="345" rx="7" ry="12" transform="rotate(-20 260 345)"/>
    <ellipse cx="278" cy="340" rx="7" ry="12" transform="rotate(25 278 340)"/>

    <!-- Wheat Stalk 3 (Foreground Right) -->
    <path d="M800,520 Q780,420 760,330" stroke="#ca8a04" stroke-width="4" fill="none"/>
    <ellipse cx="760" cy="325" rx="8" ry="14" transform="rotate(-10 760 325)"/>
    <ellipse cx="770" cy="345" rx="7" ry="12" transform="rotate(20 770 345)"/>
    <ellipse cx="752" cy="340" rx="7" ry="12" transform="rotate(-25 752 340)"/>
  </g>

  <!-- Farmer with Turban Walking in Field Inspecting Crops -->
  <g fill="#0f172a" transform="translate(360, 270)">
    <!-- Turban -->
    <ellipse cx="50" cy="20" rx="14" ry="10" fill="#f97316"/>
    <!-- Head -->
    <circle cx="50" cy="28" r="10"/>
    <!-- Kurta Body -->
    <path d="M35,40 L65,40 L70,85 L30,85 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
    <!-- Dhoti Legs -->
    <path d="M34,85 L44,130 L40,135" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
    <path d="M66,85 L56,130 L60,135" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
    <!-- Walking Staff (Lathi) -->
    <line x1="75" y1="25" x2="75" y2="140" stroke="#78350f" stroke-width="3"/>
  </g>
</svg>
`);

/**
 * 7. Election Mandate 2026 Victory Special (जनादेश 2026 चुनावी महा-कवरेज)
 */
export const ELECTION_VICTORY_DATA_URI = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" width="900" height="520">
  <defs>
    <linearGradient id="rallySky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#172554"/>
    </linearGradient>
    <linearGradient id="boardGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>

  <!-- Deep Patriotic Night Backdrop -->
  <rect width="900" height="520" fill="url(#rallySky)"/>

  <!-- Giant Live Results Scoreboard Screen in Background -->
  <rect x="80" y="30" width="740" height="220" rx="8" fill="url(#boardGrad)" stroke="#3b82f6" stroke-width="3"/>

  <!-- Screen Header -->
  <rect x="85" y="35" width="730" height="40" fill="#1e3a8a" rx="4"/>
  <text x="450" y="62" text-anchor="middle" fill="#fef08a" font-family="Arial, sans-serif" font-weight="900" font-size="20" letter-spacing="2">ELECTION RESULTS 2026 • जनादेश 2026</text>

  <!-- Live Tally Grid on Scoreboard Screen -->
  <!-- Alliance 1 (NDA) -->
  <g transform="translate(120, 95)">
    <rect width="180" height="135" rx="6" fill="#f97316" stroke="#ea580c" stroke-width="2"/>
    <text x="90" y="32" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-weight="bold" font-size="16">एनडीए (NDA)</text>
    <text x="90" y="85" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-size="48">148</text>
    <rect x="25" y="98" width="130" height="22" rx="4" fill="#ffffff"/>
    <text x="90" y="113" text-anchor="middle" fill="#c2410c" font-family="Arial, sans-serif" font-weight="900" font-size="11">प्रचंड बहुमत (+32)</text>
  </g>

  <!-- Alliance 2 (INDIA) -->
  <g transform="translate(360, 95)">
    <rect width="180" height="135" rx="6" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
    <text x="90" y="32" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-weight="bold" font-size="16">इंडिया (INDIA)</text>
    <text x="90" y="85" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-size="48">72</text>
    <rect x="25" y="98" width="130" height="22" rx="4" fill="#ffffff"/>
    <text x="90" y="113" text-anchor="middle" fill="#0369a1" font-family="Arial, sans-serif" font-weight="900" font-size="11">प्रमुख विपक्ष (-26)</text>
  </g>

  <!-- Alliance 3 (Others) -->
  <g transform="translate(600, 95)">
    <rect width="180" height="135" rx="6" fill="#64748b" stroke="#475569" stroke-width="2"/>
    <text x="90" y="32" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-weight="bold" font-size="16">अन्य (OTHERS)</text>
    <text x="90" y="85" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-size="48">10</text>
    <rect x="25" y="98" width="130" height="22" rx="4" fill="#ffffff"/>
    <text x="90" y="113" text-anchor="middle" fill="#334155" font-family="Arial, sans-serif" font-weight="900" font-size="11">निर्दलीय व अन्य</text>
  </g>

  <!-- Victory Stage Rostrum -->
  <polygon points="60,360 840,360 900,520 0,520" fill="#0f172a" stroke="#e2e8f0" stroke-width="1.5"/>

  <!-- Press Briefing Table & Media Microphone Cluster -->
  <rect x="220" y="330" width="460" height="70" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="3"/>
  <text x="450" y="365" text-anchor="middle" fill="#f8fafc" font-family="Arial, sans-serif" font-weight="900" font-size="16" letter-spacing="2">PRESS INFORMATION BUREAU • जनादेश 2026</text>

  <!-- Microphones Array on Podium -->
  <g stroke="#94a3b8" stroke-width="3">
    <line x1="390" y1="330" x2="410" y2="305"/>
    <circle cx="410" cy="302" r="5" fill="#ef4444"/>
    <line x1="430" y1="330" x2="435" y2="295"/>
    <circle cx="435" cy="292" r="5" fill="#3b82f6"/>
    <line x1="470" y1="330" x2="465" y2="295"/>
    <circle cx="465" cy="292" r="5" fill="#22c55e"/>
    <line x1="510" y1="330" x2="490" y2="305"/>
    <circle cx="490" cy="302" r="5" fill="#eab308"/>
  </g>

  <!-- Victorious Leaders Silhouette (Waving Victory Sign) -->
  <g fill="#f8fafc">
    <!-- Center Leader -->
    <circle cx="450" cy="260" r="22"/>
    <path d="M415,330 C415,290 485,290 485,330 Z"/>
    <!-- Raised Victory Arm with V-Sign -->
    <path d="M475,300 L515,245 L530,225" stroke="#f8fafc" stroke-width="8" stroke-linecap="round" fill="none"/>
    <circle cx="530" cy="225" r="5" fill="#f8fafc"/>

    <!-- Left Colleague -->
    <circle cx="340" cy="275" r="18" fill="#cbd5e1"/>
    <path d="M310,330 C310,300 370,300 370,330 Z" fill="#cbd5e1"/>

    <!-- Right Colleague -->
    <circle cx="560" cy="275" r="18" fill="#cbd5e1"/>
    <path d="M530,330 C530,300 590,300 590,330 Z" fill="#cbd5e1"/>
  </g>

  <!-- Festive Tricolor Confetti Falling Over Victory Podium -->
  <rect x="140" y="160" width="8" height="16" rx="2" fill="#f97316" transform="rotate(25 140 160)"/>
  <rect x="220" y="190" width="8" height="16" rx="2" fill="#ffffff" transform="rotate(-35 220 190)"/>
  <rect x="310" y="140" width="8" height="16" rx="2" fill="#16a34a" transform="rotate(45 310 140)"/>
  <rect x="580" y="150" width="8" height="16" rx="2" fill="#f97316" transform="rotate(-15 580 150)"/>
  <rect x="680" y="180" width="8" height="16" rx="2" fill="#ffffff" transform="rotate(30 680 180)"/>
  <rect x="760" y="130" width="8" height="16" rx="2" fill="#16a34a" transform="rotate(-40 760 130)"/>
  <rect x="480" y="120" width="10" height="20" rx="2" fill="#facc15" transform="rotate(15 480 120)"/>
  <rect x="390" y="170" width="9" height="18" rx="2" fill="#38bdf8" transform="rotate(-20 390 170)"/>

  <!-- Cheering Press & Cameras in Foreground Silhouette -->
  <ellipse cx="160" cy="510" rx="50" ry="30" fill="#020617"/>
  <ellipse cx="740" cy="510" rx="55" ry="30" fill="#020617"/>
  <rect x="725" y="465" width="30" height="20" rx="3" fill="#334155"/>
  <circle cx="740" cy="460" r="16" fill="#020617"/>
  <!-- Camera Flash -->
  <circle cx="730" cy="470" r="4" fill="#ffffff"/>
  <line x1="730" y1="455" x2="730" y2="485" stroke="#ffffff" stroke-width="2"/>
  <line x1="715" y1="470" x2="745" y2="470" stroke="#ffffff" stroke-width="2"/>
</svg>
`);
