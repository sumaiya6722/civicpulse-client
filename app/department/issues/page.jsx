
"use client";

import { useCallback,useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ClipboardList,
  LoaderCircle,
  ArrowRight,
  MapPin,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

import { apiFetch } from "@/lib/api";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-700",
  under_review: "bg-blue-100 text-blue-700",
  assigned: "bg-purple-100 text-purple-700",
  in_progress: "bg-orange-100 text-orange-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const statuses = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

const formatLabel = (value = "") =>
  value.replaceAll("_", " ").replace(/\b\w/g, (char) =>
    char.toUpperCase()
  );

const formatDate = (date) => {
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function DepartmentIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchIssues = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = new URLSearchParams({
          page: "1",
          limit: "100",
        });

        if (status !== "all") {
          params.set("status", status);
        }

        if (search.trim()) {
          params.set("search", search.trim());
        }

        const response = await apiFetch(`/issues?${params.toString()}`);

        setIssues(response.data || []);
      } catch (error) {
        setError(error.message || "Failed to retrieve department issues.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, status]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchIssues();
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchIssues]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Page Header */}
        <div>
          <p className="text-sm font-medium text-blue-600">
            Department Management
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            Issue Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Review and monitor infrastructure issues assigned to your department.
          </p>
        </div>

        {/* Search and Filters */}
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by issue title or description..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              {statuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => fetchIssues(true)}
              disabled={loading || refreshing}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </section>

        {/* Issue List */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">
                Department Issues
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {issues.length} issue{issues.length === 1 ? "" : "s"} displayed
              </p>
            </div>

            <ClipboardList className="text-gray-400" size={22} />
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-red-600">{error}</p>

              <button
                type="button"
                onClick={() => fetchIssues()}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : issues.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-300" />

              <h3 className="mt-4 font-semibold text-gray-800">
                No issues found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                No issues match your current search or status filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {issues.map((issue) => (
                <article
                  key={issue._id}
                  className="flex flex-col gap-4 p-5 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 gap-4">
                    {issue.imageUrl ? (
                      <Image
                        src={issue.imageUrl}
                        alt={issue.title}
                        width={80}
                        height={80}
                        unoptimized
                        className="h-20 w-20 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <ClipboardList className="text-gray-400" size={26} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        {issue.title}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {issue.description}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} />
                          {issue.location?.address || "Location unavailable"}
                        </span>

                        <span className="flex items-center gap-1">
                          <CalendarDays size={13} />
                          {formatDate(issue.createdAt)}
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        Category: {formatLabel(issue.category)}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[issue.status] ||
                        "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {formatLabel(issue.status)}
                    </span>

                    <Link
                      href={`/department/issues/${issue._id}`}
                      className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Review Issue
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
