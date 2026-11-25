import RoleGuard from "../components/RoleGuard";

export default function DepartmentLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["department"]}>
      {children}
    </RoleGuard>
  );
}