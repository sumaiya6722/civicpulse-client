
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  MapPin,
  CalendarDays,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

import { apiFetch } from "@/lib/api";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-700",
  verified: "bg-blue-100 text-blue-700",
  assigned: "bg-purple-100 text-purple-700",
  "in-progress": "bg-orange-100 text-orange-700",
  resolved: "bg-green-100 text-green-700",
};

const formatStatus = (status) => {
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function CitizenDashboardPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setError(error.message || "Failed to load your reported issues.");
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

  const totalIssues = issues.length;
  const pendingIssues = issues.filter(
    (issue) => issue.status === "pending"
  ).length;
  const inProgressIssues = issues.filter(
    (issue) => issue.status === "in-progress"
  ).length;
  const resolvedIssues = issues.filter(
    (issue) => issue.status === "resolved"
  ).length;

  const recentIssues = issues.slice(0, 5);

  const statistics = [
    {
      title: "Total Reports",
      value: totalIssues,
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending",
      value: pendingIssues,
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "In Progress",
      value: inProgressIssues,
      icon: AlertCircle,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "Resolved",
      value: resolvedIssues,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-5 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Citizen Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here`s an overview of your reported issues.
          </p>
        </div>

        <Link
          href="/citizen/issues/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={19} />
          Report an Issue
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>

                  <h2 className="mt-2 text-3xl font-bold text-gray-900">
                    {loading ? "—" : stat.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={23} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent issues */}
      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b px-5 py-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-gray-900">
              My Recent Reports
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Track the progress of issues you have reported.
            </p>
          </div>

          <Link
            href="/citizen/issues"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View All Reports
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoaderCircle
              className="animate-spin text-blue-600"
              size={28}
            />
            <span className="ml-3 text-sm text-gray-500">
              Loading your reports...
            </span>
          </div>
        ) : recentIssues.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <FileText
              size={42}
              className="mx-auto mb-3 text-gray-300"
            />

            <h3 className="font-semibold text-gray-800">
              You haven`t reported any issues yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Help improve your community by reporting an infrastructure
              problem.
            </p>

            <Link
              href="/citizen/issues/new"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus size={18} />
              Report Your First Issue
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {recentIssues.map((issue) => (
              <div
                key={issue._id}
                className="flex flex-col justify-between gap-4 px-5 py-5 transition hover:bg-gray-50 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <Link
                    href={`/citizen/issues/${issue._id}`}
                    className="font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {issue.title}
                  </Link>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {issue.location}
                    </span>

                    <span className="flex items-center gap-1">
                      <CalendarDays size={14} />
                      {formatDate(issue.createdAt)}
                    </span>
                  </div>

                  <p className="mt-2 text-xs capitalize text-gray-500">
                    {issue.category}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
                      statusStyles[issue.status] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {formatStatus(issue.status)}
                  </span>

                  <Link
                    href={`/citizen/issues/${issue._id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Information */}
      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
        <h3 className="font-semibold text-blue-900">
          How issue tracking works
        </h3>

        <p className="mt-2 text-sm leading-6 text-blue-800">
          After submitting a report, the relevant department will review
          it. Once verified, the issue can be assigned to a maintenance
          team. You can follow its progress until it is resolved.
        </p>
      </div>
    </div>
  );
}
