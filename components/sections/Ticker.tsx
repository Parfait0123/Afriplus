const items = [
  { label: "UA", text: "Accord historique pour le commerce numérique panafricain" },
  { label: "TECH", text: "Nairobi : 120+ startups IA en 2026" },
  { label: "CLIMAT", text: "COP31 — 40 milliards pour l'adaptation climatique africaine" },
  { label: "BOURSE", text: "Mastercard Foundation Scholars — deadline 31 Mars" },
  { label: "SPORT", text: "18 médailles d'or africaines aux Championnats du Monde" },
  { label: "EMPLOI", text: "Banque Mondiale recrute — Analyste Financier Junior" },
  { label: "ÉVÉNEMENT", text: "AfricaTech Summit 2026 — Nairobi, 15 Avril" },
  { label: "NIGERIA", text: "Croissance de 4,2% au T4 2025 — 2ème économie africaine" },
];

export default function Ticker() {
  const doubled = [...items, ...items];
  return (
    <div
      style={{
        background: "#141410",
        padding: "0.62rem 0",
        overflow: "hidden",
        whiteSpace: "nowrap",
        borderTop: "1px solid rgba(255,255,255,.04)",
      }}
    >
      <div className="ticker-anim" style={{ display: "inline-block" }}>
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontSize: "0.72rem",
              fontWeight: 500,
              color: "rgba(255,255,255,.45)",
              padding: "0 2rem",
            }}
          >
            <em
              style={{
                color: "#E09B48",
                fontStyle: "normal",
                marginRight: "0.3rem",
              }}
            >
              {item.label}
            </em>
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
