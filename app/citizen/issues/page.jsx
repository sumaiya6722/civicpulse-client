
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  FileText,
  MapPin,
  CalendarDays,
  ArrowRight,
  LoaderCircle,
  Filter,
  Plus,
  X,
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

const formatStatus = (status = "") => {
  return status
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatCategory = (category = "") => {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function CitizenIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

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
          setError(error.message || "Failed to load your reports.");
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

  const filteredIssues = issues.filter((issue) => {
    const searchTerm = search.toLowerCase();

    const matchesSearch =
      issue.title?.toLowerCase().includes(searchTerm) ||
      issue.description?.toLowerCase().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "all" || issue.status === selectedStatus;

    const matchesCategory =
      selectedCategory === "all" ||
      issue.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const hasActiveFilters =
    search !== "" ||
    selectedStatus !== "all" ||
    selectedCategory !== "all";

  const clearFilters = () => {
    setSearch("");
    setSelectedStatus("all");
    setSelectedCategory("all");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Reports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and track all the infrastructure issues you have reported.
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

      {/* Search and Filters */}
      <section className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />

          <h2 className="font-semibold text-gray-800">
            Search and Filter Reports
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="road">Road Damage</option>
            <option value="streetlight">Streetlight</option>
            <option value="drainage">Drainage</option>
            <option value="waste">Waste Management</option>
            <option value="water_supply">Water Supply</option>
            <option value="public_property">Public Property</option>
            <option value="other">Other</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <X size={15} />
            Clear filters
          </button>
        )}
      </section>

      {/* Results Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">
          Your Submitted Reports
        </h2>

        {!loading && (
          <span className="text-sm text-gray-500">
            {filteredIssues.length}{" "}
            {filteredIssues.length === 1 ? "report" : "reports"} found
          </span>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-white py-24">
          <LoaderCircle
            className="animate-spin text-blue-600"
            size={28}
          />

          <span className="ml-3 text-sm text-gray-500">
            Loading your reports...
          </span>
        </div>
      ) : filteredIssues.length === 0 ? (
        /* Empty State */
        <div className="rounded-xl border bg-white px-5 py-16 text-center">
          <FileText
            size={45}
            className="mx-auto mb-4 text-gray-300"
          />

          <h3 className="font-semibold text-gray-800">
            {issues.length === 0
              ? "You haven't reported any issues yet"
              : "No matching reports found"}
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            {issues.length === 0
              ? "Start reporting infrastructure problems in your community."
              : "Try changing your search or filter criteria."}
          </p>

          {issues.length === 0 ? (
            <Link
              href="/citizen/issues/new"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus size={18} />
              Report Your First Issue
            </Link>
          ) : (
            <button
              onClick={clearFilters}
              className="mt-5 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        /* Issues List */
        <div className="space-y-4">
          {filteredIssues.map((issue) => (
            <div
              key={issue._id}
              className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Issue Image */}
                <div className="relative h-52 w-full bg-gray-100 sm:h-auto sm:w-56 sm:shrink-0">
                  {issue.imageUrl ? (
                    <Image
                      src={issue.imageUrl}
                      alt={issue.title}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, 224px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full min-h-40 items-center justify-center">
                      <FileText
                        size={40}
                        className="text-gray-300"
                      />
                    </div>
                  )}
                </div>

                {/* Issue Information */}
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-5 p-5">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {formatCategory(issue.category)}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusStyles[issue.status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {formatStatus(issue.status)}
                      </span>
                    </div>

                    <Link
                      href={`/citizen/issues/${issue._id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {issue.title}
                    </Link>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                      {issue.description}
                    </p>

                    <div className="mt-4 flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:gap-5">
                      <span className="flex items-start gap-2">
                        <MapPin
                          size={15}
                          className="mt-0.5 shrink-0"
                        />
                        {issue.location?.address ||
                          "Location not provided"}
                      </span>

                      <span className="flex items-center gap-2">
                        <CalendarDays size={15} />
                        {formatDate(issue.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end border-t pt-4">
                    <Link
                      href={`/citizen/issues/${issue._id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View Details
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
