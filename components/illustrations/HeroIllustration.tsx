export default function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 520 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: "100%", height: "auto", maxWidth: 520 }}
    >
      {/* Africa continent outline – simplified */}
      <g opacity="0.12">
        <path
          d="M220 60 C230 55, 260 52, 275 60 C290 68, 305 78, 315 95 C325 112, 328 130, 322 148 C316 166, 305 178, 308 195 C311 212, 325 225, 330 245 C335 265, 330 285, 320 302 C310 319, 295 330, 280 345 C265 360, 248 372, 235 380 C222 388, 210 388, 200 378 C190 368, 185 352, 180 335 C175 318, 170 300, 168 282 C166 264, 168 246, 165 228 C162 210, 155 195, 152 178 C149 161, 152 144, 158 128 C164 112, 174 98, 185 86 C196 74, 210 65, 220 60Z"
          fill="#C08435"
          stroke="#C08435"
          strokeWidth="1"
        />
      </g>

      {/* Dashboard card – main */}
      <g filter="url(#shadow1)">
        <rect x="60" y="80" width="280" height="190" rx="20" fill="white"/>
        <rect x="60" y="80" width="280" height="190" rx="20" stroke="rgba(20,20,16,0.06)" strokeWidth="1"/>
        {/* Card header */}
        <rect x="60" y="80" width="280" height="52" rx="20" fill="#F8F6F1"/>
        <rect x="60" y="108" width="280" height="24" fill="#F8F6F1"/>
        <circle cx="89" cy="106" r="13" fill="linear-gradient(135deg, #C08435, #E09B48)"/>
        <circle cx="89" cy="106" r="13" fill="#C08435" opacity="0.9"/>
        <text x="89" y="111" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="serif">A</text>
        <rect x="110" y="99" width="80" height="8" rx="4" fill="#38382E" opacity="0.7"/>
        <rect x="110" y="111" width="50" height="6" rx="3" fill="#928E80" opacity="0.5"/>
        {/* Content lines */}
        <rect x="84" y="150" width="220" height="8" rx="4" fill="#141410" opacity="0.08"/>
        <rect x="84" y="166" width="190" height="7" rx="3.5" fill="#141410" opacity="0.05"/>
        <rect x="84" y="180" width="205" height="7" rx="3.5" fill="#141410" opacity="0.05"/>
        {/* Tag */}
        <rect x="84" y="200" width="52" height="20" rx="10" fill="#FBF4E8"/>
        <text x="110" y="214" textAnchor="middle" fill="#C08435" fontSize="7" fontWeight="700" fontFamily="sans-serif">ACTUALITÉ</text>
        <rect x="144" y="200" width="46" height="20" rx="10" fill="#EAF4EF"/>
        <text x="167" y="214" textAnchor="middle" fill="#1A5C40" fontSize="7" fontWeight="700" fontFamily="sans-serif">TECH</text>
        {/* Read more */}
        <rect x="270" y="200" width="56" height="20" rx="10" fill="#141410"/>
        <text x="298" y="214" textAnchor="middle" fill="white" fontSize="7" fontWeight="600" fontFamily="sans-serif">Lire →</text>
      </g>

      {/* Floating stats card */}
      <g filter="url(#shadow2)">
        <rect x="290" y="180" width="170" height="100" rx="16" fill="white"/>
        <rect x="290" y="180" width="170" height="100" rx="16" stroke="rgba(20,20,16,0.06)" strokeWidth="1"/>
        <rect x="308" y="198" width="30" height="30" rx="8" fill="#FBF4E8"/>
        <text x="323" y="218" textAnchor="middle" fill="#C08435" fontSize="14">📚</text>
        <rect x="350" y="201" width="70" height="7" rx="3.5" fill="#141410" opacity="0.7"/>
        <rect x="350" y="213" width="45" height="12" rx="4" fill="#C08435" opacity="0.1"/>
        <text x="372" y="223" textAnchor="middle" fill="#C08435" fontSize="10" fontWeight="800" fontFamily="serif">340+</text>
        <rect x="308" y="240" width="134" height="1" fill="#141410" opacity="0.06"/>
        <rect x="308" y="252" width="30" height="6" rx="3" fill="#928E80" opacity="0.4"/>
        <rect x="344" y="252" width="30" height="6" rx="3" fill="#928E80" opacity="0.4"/>
        <rect x="380" y="252" width="30" height="6" rx="3" fill="#928E80" opacity="0.4"/>
        {/* Mini bar chart */}
        <rect x="308" y="258" width="8" height="16" rx="3" fill="#C08435" opacity="0.3"/>
        <rect x="320" y="252" width="8" height="22" rx="3" fill="#C08435" opacity="0.5"/>
        <rect x="332" y="255" width="8" height="19" rx="3" fill="#C08435" opacity="0.4"/>
        <rect x="344" y="248" width="8" height="26" rx="3" fill="#C08435" opacity="0.7"/>
        <rect x="356" y="253" width="8" height="21" rx="3" fill="#C08435" opacity="0.5"/>
        <rect x="368" y="246" width="8" height="28" rx="3" fill="#C08435"/>
        <rect x="380" y="250" width="8" height="24" rx="3" fill="#C08435" opacity="0.6"/>
        <rect x="392" y="255" width="8" height="19" rx="3" fill="#C08435" opacity="0.45"/>
        <rect x="404" y="249" width="8" height="25" rx="3" fill="#C08435" opacity="0.55"/>
      </g>

      {/* Bourse chip floating */}
      <g filter="url(#shadow3)">
        <rect x="30" y="260" width="200" height="72" rx="14" fill="white"/>
        <rect x="30" y="260" width="200" height="72" rx="14" stroke="rgba(20,20,16,0.06)" strokeWidth="1"/>
        <circle cx="52" cy="280" r="10" fill="#EAF4EF"/>
        <text x="52" y="284" textAnchor="middle" fontSize="10">🎓</text>
        <rect x="70" y="273" width="100" height="7" rx="3.5" fill="#141410" opacity="0.7"/>
        <rect x="70" y="285" width="70" height="6" rx="3" fill="#928E80" opacity="0.4"/>
        <rect x="47" y="303" width="60" height="16" rx="8" fill="#EAF4EF"/>
        <text x="77" y="315" textAnchor="middle" fill="#1A5C40" fontSize="7" fontWeight="700" fontFamily="sans-serif">OUVERT</text>
        <rect x="115" y="303" width="80" height="16" rx="8" fill="#FBF4E8"/>
        <text x="155" y="315" textAnchor="middle" fill="#C08435" fontSize="7" fontWeight="600" fontFamily="sans-serif">deadline 31 mars</text>
      </g>

      {/* Notification dot */}
      <g>
        <circle cx="340" cy="100" r="16" fill="#141410"/>
        <text x="340" y="105" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">12K</text>
        <circle cx="352" cy="88" r="5" fill="#C08435"/>
      </g>

      {/* Connection lines */}
      <line x1="170" y1="270" x2="290" y2="230" stroke="rgba(192,132,53,.15)" strokeWidth="1.5" strokeDasharray="4 4"/>
      <line x1="340" y1="116" x2="310" y2="150" stroke="rgba(192,132,53,.12)" strokeWidth="1.5" strokeDasharray="4 4"/>

      {/* Floating dots decoration */}
      <circle cx="420" cy="380" r="60" fill="rgba(192,132,53,.04)" />
      <circle cx="420" cy="380" r="40" fill="rgba(192,132,53,.05)" />
      <circle cx="420" cy="380" r="20" fill="rgba(192,132,53,.07)" />

      <circle cx="20" cy="180" r="4" fill="#C08435" opacity="0.3"/>
      <circle cx="35" cy="165" r="2.5" fill="#C08435" opacity="0.2"/>
      <circle cx="455" cy="140" r="3" fill="#1A5C40" opacity="0.3"/>
      <circle cx="480" cy="155" r="2" fill="#1A5C40" opacity="0.2"/>

      <defs>
        <filter id="shadow1" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="rgba(20,20,16,0.10)"/>
        </filter>
        <filter id="shadow2" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="20" floodColor="rgba(20,20,16,0.13)"/>
        </filter>
        <filter id="shadow3" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="14" floodColor="rgba(20,20,16,0.10)"/>
        </filter>
      </defs>
    </svg>
  );
}
