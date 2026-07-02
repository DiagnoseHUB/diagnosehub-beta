import LearningKnowledgeSearch from "@/components/LearningKnowledgeSearch";

export const metadata = {
  title: "Bauteilwissen | DiagnoseHUB",
  description:
    "Bauteile, Sensoren, Aktoren und Fahrzeugsysteme praxisnah erklärt.",
};

export default function LernenWissenPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <LearningKnowledgeSearch />
    </main>
  );
}