export default function HowItWorksIllustration({ step }: { step: 1 | 2 | 3 }) {
  if (step === 1) return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 80 }}>
      <circle cx="40" cy="40" r="36" fill="#FBF4E8"/>
      <rect x="24" y="28" width="32" height="24" rx="5" fill="#C08435" opacity="0.2" stroke="#C08435" strokeWidth="1.5"/>
      <rect x="28" y="34" width="14" height="3" rx="1.5" fill="#C08435"/>
      <rect x="28" y="40" width="20" height="3" rx="1.5" fill="#C08435" opacity="0.5"/>
      <rect x="28" y="46" width="16" height="3" rx="1.5" fill="#C08435" opacity="0.35"/>
      <circle cx="52" cy="28" r="7" fill="#141410"/>
      <text x="52" y="32" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">✓</text>
    </svg>
  );
  if (step === 2) return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 80 }}>
      <circle cx="40" cy="40" r="36" fill="#EAF4EF"/>
      <circle cx="40" cy="35" r="9" fill="none" stroke="#1A5C40" strokeWidth="2"/>
      <path d="M34 48 C34 43, 38 41, 40 41 C42 41, 46 43, 46 48" stroke="#1A5C40" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="55" cy="30" r="6" fill="#1A5C40" opacity="0.15" stroke="#1A5C40" strokeWidth="1.5"/>
      <circle cx="25" cy="44" r="5" fill="#1A5C40" opacity="0.15" stroke="#1A5C40" strokeWidth="1.5"/>
      <text x="55" y="34" textAnchor="middle" fill="#1A5C40" fontSize="7" fontWeight="700">+</text>
    </svg>
  );
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 80 }}>
      <circle cx="40" cy="40" r="36" fill="#EBF0FB"/>
      <path d="M28 50 L34 44 L40 48 L52 34" stroke="#1E4DA8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="52" cy="34" r="3" fill="#1E4DA8"/>
      <rect x="24" y="54" width="32" height="3" rx="1.5" fill="#1E4DA8" opacity="0.2"/>
    </svg>
  );
}
