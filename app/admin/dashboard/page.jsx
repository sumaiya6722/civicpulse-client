
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  Users,
  Wrench,
  Bell,
  Menu,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { apiFetch } from "@/lib/api";

const navigation = [
  {
    name: "Overview",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "All Issues",
    href: "/admin/issues",
    icon: ClipboardList,
  },
  {
    name: "Departments",
    href: "/admin/departments",
    icon: Building2,
  },
  {
    name: "Maintenance Teams",
    href: "/admin/teams",
    icon: Wrench,
  },
  {
    name: "Staff Management",
    href: "/admin/staff",
    icon: Users,
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await apiFetch("/dashboard/stats");
        setStats(response.data);
      } catch (error) {
        setError(error.message || "Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const statCards = stats
    ? [
        {
          title: "Total Issues",
          value: stats.issues.total,
          icon: ClipboardList,
          color: "bg-blue-100 text-blue-600",
        },
        {
          title: "Pending Issues",
          value: stats.issues.pending,
          icon: Clock,
          color: "bg-amber-100 text-amber-600",
        },
        {
          title: "In Progress",
          value: stats.issues.inProgress,
          icon: Activity,
          color: "bg-purple-100 text-purple-600",
        },
        {
          title: "Resolved Issues",
          value: stats.issues.resolved,
          icon: CheckCircle,
          color: "bg-green-100 text-green-600",
        },
        {
          title: "Departments",
          value: stats.departments.total,
          icon: Building2,
          color: "bg-indigo-100 text-indigo-600",
        },
        {
          title: "Maintenance Teams",
          value: stats.teams.total,
          icon: Wrench,
          color: "bg-orange-100 text-orange-600",
        },
        {
          title: "Staff Members",
          value: stats.staff.total,
          icon: Users,
          color: "bg-pink-100 text-pink-600",
        },
      ]
    : [];

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 bg-slate-900 text-white md:block">
        <div className="border-b border-slate-700 px-6 py-6">
          <h1 className="text-2xl font-bold">
            Civic<span className="text-blue-400">Pulse</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">Admin Dashboard</p>
        </div>

        <nav className="space-y-2 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/admin/dashboard";

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={19} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1">
        {/* Header */}
        <header className="flex items-center justify-between border-b bg-white px-5 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <button className="text-gray-600 md:hidden" aria-label="Menu">
              <Menu size={24} />
            </button>

            <div>
              <h2 className="text-xl font-bold md:text-2xl">
                Dashboard Overview
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Welcome to your CivicPulse administration panel.
              </p>
            </div>
          </div>

          <button
            className="rounded-full border p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>
        </header>

        <div className="p-5 md:p-8">
          {/* Page heading */}
          <div className="mb-7">
            <h3 className="text-lg font-semibold">System Summary</h3>
            <p className="mt-1 text-sm text-gray-500">
              An overview of reported issues and system resources.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <LoaderCircle className="animate-spin text-blue-600" size={32} />
              <span className="ml-3 text-gray-500">
                Loading dashboard...
              </span>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle size={20} />
                Unable to load dashboard
              </div>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          ) : (
            <>
              {/* Statistics cards */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      key={card.title}
                      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">
                          {card.title}
                        </p>

                        <div className={`rounded-lg p-3 ${card.color}`}>
                          <Icon size={21} />
                        </div>
                      </div>

                      <p className="mt-4 text-3xl font-bold">
                        {card.value ?? 0}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Additional statistics */}
              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <h3 className="font-semibold">Issue Status Breakdown</h3>

                  <div className="mt-5 space-y-5">
                    {[
                      {
                        label: "Pending",
                        value: stats.issues.pending,
                        color: "bg-amber-500",
                      },
                      {
                        label: "Verified",
                        value: stats.issues.verified,
                        color: "bg-blue-500",
                      },
                      {
                        label: "Assigned",
                        value: stats.issues.assigned,
                        color: "bg-indigo-500",
                      },
                      {
                        label: "In Progress",
                        value: stats.issues.inProgress,
                        color: "bg-purple-500",
                      },
                      {
                        label: "Resolved",
                        value: stats.issues.resolved,
                        color: "bg-green-500",
                      },
                    ].map((item) => {
                      const percentage =
                        stats.issues.total > 0
                          ? (item.value / stats.issues.total) * 100
                          : 0;

                      return (
                        <div key={item.label}>
                          <div className="mb-2 flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.label}
                            </span>
                            <span className="font-semibold">
                              {item.value}
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full ${item.color}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <h3 className="font-semibold">System Resources</h3>

                  <div className="mt-5 space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          Active Departments
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                          {stats.departments.active}
                        </p>
                      </div>
                      <Building2 className="text-indigo-500" size={28} />
                    </div>

                    <div className="border-t" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          Active Maintenance Teams
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                          {stats.teams.active}
                        </p>
                      </div>
                      <Wrench className="text-orange-500" size={28} />
                    </div>

                    <div className="border-t" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          Total Staff Members
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                          {stats.staff.total}
                        </p>
                      </div>
                      <Users className="text-pink-500" size={28} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
