import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard";

export const metadata: Metadata = {
  title: "Live control plane",
  description:
    "Interactive Finference demo with AI cost telemetry, routing policy simulation, governance, and usage metering.",
};

export default function DashboardPage() {
  return <Dashboard />;
}

