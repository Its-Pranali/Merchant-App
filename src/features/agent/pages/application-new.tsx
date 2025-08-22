import { RoleGuard } from "@/components/role-guard";
import { ApplicationForm } from "../components/application-form";

export function ApplicationNewPage() {
  return (
    <RoleGuard allowedRoles={['AGENT']}>
      <ApplicationForm />
    </RoleGuard>
  );
}