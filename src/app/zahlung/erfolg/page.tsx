import StripeSuccessStatus from "@/components/StripeSuccessStatus";

export const metadata = {
  title: "Zahlung erfolgreich | DiagnoseHUB",
  description: "Deine DiagnoseHUB Pro-Zahlung wurde erfolgreich verarbeitet.",
};

export default function ZahlungErfolgPage() {
  return <StripeSuccessStatus />;
}