import Footer from "@/components/Footer";
import Header from "@/components/Header";
import StripeSuccessStatus from "@/components/StripeSuccessStatus";

export const metadata = {
  title: "Zahlung erfolgreich | DiagnoseHUB",
  description: "Deine DiagnoseHUB Pro-Zahlung wurde erfolgreich verarbeitet.",
};

export default function ZahlungErfolgPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Header />
      <StripeSuccessStatus />
      <Footer />
    </div>
  );
}
