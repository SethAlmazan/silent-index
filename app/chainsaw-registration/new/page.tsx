import { AppShell } from "@/components/chainventory/app";
import RegistrationForm from "@/components/chainventory/registration-form";

export default function NewRegistrationPage() {
  return (
    <AppShell active="dashboard">
      <RegistrationForm />
    </AppShell>
  );
}