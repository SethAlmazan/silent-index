import { AppShell } from "@/components/chainventory/app";
import ChainsawRecordsClient from "./records-client";

export default function ChainsawRecordsPage() {
  return (
    <AppShell active="records">
      <ChainsawRecordsClient />
    </AppShell>
  );
}