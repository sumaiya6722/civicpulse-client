
"use client";

import { useEffect, useState } from "react";
// import Link from "next/link";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import NotificationBell from "@/app/components/NotificationBell";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-700",
  under_review: "bg-blue-100 text-blue-700",
  assigned: "bg-purple-100 text-purple-700",
  in_progress: "bg-orange-100 text-orange-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const formatStatus = (status = "") =>
  status.replaceAll("_", " ").replace(/\b\w/g, (char) =>
    char.toUpperCase()
  );

export default function StaffDashboard({ role }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isDepartment = role === "department";

  const dashboardTitle = isDepartment
    ? "Department Dashboard"
    : "Maintenance Dashboard";

  useEffect(() => {
    let ignore = false;

    const fetchIssues = async () => {
      try {
        const response = await apiFetch("/issues?page=1&limit=100");

        if (!ignore) {
          setIssues(response.data || []);
        }
      } catch (error) {
        if (!ignore) {
          setError(error.message || "Failed to load issues.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchIssues();

    return () => {
      ignore = true;
    };
  }, []);

  const pendingCount = issues.filter(
    (issue) =>
      issue.status === "pending" ||
      issue.status === "under_review" ||
      issue.status === "assigned"
  ).length;

  const inProgressCount = issues.filter(
    (issue) => issue.status === "in_progress"
  ).length;

  const resolvedCount = issues.filter(
    (issue) => issue.status === "resolved"
  ).length;

  const stats = [
    {
      title: "Total Issues",
      value: issues.length,
      icon: ClipboardList,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Pending / Assigned",
      value: pendingCount,
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "In Progress",
      value: inProgressCount,
      icon: AlertCircle,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Resolved",
      value: resolvedCount,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {dashboardTitle}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {isDepartment
                ? "Review and monitor issues assigned to your department."
                : "View and manage maintenance tasks assigned to your team."}
            </p>
          </div>

          <NotificationBell />
        </div>

        {/* Statistics */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          {stat.title}
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                      </div>

                      <div className={`rounded-lg p-3 ${stat.color}`}>
                        <Icon size={22} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Assigned Issues */}
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isDepartment ? "Department Issues" : "Assigned Tasks"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {isDepartment
                    ? "Issues currently assigned to your department."
                    : "Maintenance issues assigned to your team."}
                </p>
              </div>

              {issues.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <ClipboardList className="mx-auto h-10 w-10 text-gray-300" />

                  <p className="mt-3 font-medium text-gray-700">
                    No assigned issues yet
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    New assignments will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {issues.map((issue) => (
                    <div
                      key={issue._id}
                      className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900">
                          {issue.title}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                          {issue.description}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                          <span>
                            Category: {formatStatus(issue.category)}
                          </span>

                          <span>
                            Location: {issue.location?.address || "Not provided"}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            statusStyles[issue.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {formatStatus(issue.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
