import AdminTable from "@/components/admin/AdminTable";
import { opportunities } from "@/lib/data";

const typeColors: Record<string, "green" | "gold" | "red" | "blue" | "gray"> = {
  "Emploi CDI": "green",
  "Stage":      "blue",
  "Graduate":   "gold",
  "Emploi":     "gold",
  "Freelance":  "red",
  "Volontariat":"gray",
};

export default function AdminOpportunitesPage() {
  const rows = opportunities.map((o) => ({
    id: o.id,
    title: o.title,
    meta1: o.company,
    meta2: o.location,
    meta3: o.type,
    badge: o.type,
    badgeColor: typeColors[o.type] || "gray" as const,
    published: true,
  }));

  return (
    <AdminTable
      title="Opportunités"
      icon="💼"
      rows={rows}
      newHref="/admin/opportunites/nouveau"
      newLabel="Ajouter une opportunité"
      searchPlaceholder="Rechercher une opportunité…"
      filterOptions={["Emploi CDI", "Stage", "Graduate", "Emploi", "Volontariat"]}
    />
  );
}
