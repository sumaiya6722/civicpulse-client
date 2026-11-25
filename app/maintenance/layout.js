import RoleGuard from "../components/RoleGuard";

export default function MaintenanceLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["maintenance"]}>
      {children}
    </RoleGuard>
  );
}