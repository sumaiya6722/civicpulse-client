import RoleGuard from "../components/RoleGuard";

export default function CitizenLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["citizen"]}>
      {children}
    </RoleGuard>
  );
}