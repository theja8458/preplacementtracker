import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ConsolePage from "@/components/ConsolePage";

export const metadata: Metadata = {
  title: "Code Console — Coming Soon",
  description: "Write code, run it, see the output — right in your browser. Coming soon to PlacementPrep.",
};

export default function ConsoleRoute() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ConsolePage />
      </main>
    </>
  );
}
