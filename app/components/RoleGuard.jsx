
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function RoleGuard({ allowedRoles, children }) {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    const accountType = session.user.accountType;

    if (!allowedRoles.includes(accountType)) {
      const dashboardRoutes = {
        citizen: "/citizen/dashboard",
        admin: "/admin/dashboard",
        department: "/department/dashboard",
        maintenance: "/maintenance/dashboard",
      };

      router.replace(dashboardRoutes[accountType] || "/login");
    }
  }, [session, isPending, allowedRoles, router]);

  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  if (!allowedRoles.includes(session.user.accountType)) {
    return null;
  }

  return children;
}
