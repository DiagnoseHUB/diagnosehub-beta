import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PlanAccessGate from "@/components/PlanAccessGate";
import LearningKnowledgeSearch from "@/components/LearningKnowledgeSearch";

export const metadata = {
  title: "Bauteilwissen | DiagnoseHUB",
  description:
    "Bauteile, Sensoren, Aktoren und Fahrzeugsysteme praxisnah erklärt.",
};

export default function LernenWissenPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Header />

      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <PlanAccessGate feature="componentKnowledge">
          <LearningKnowledgeSearch />
        </PlanAccessGate>
      </main>

      <Footer />
    </div>
  );
}
