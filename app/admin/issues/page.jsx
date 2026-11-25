
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  ClipboardList,
  Eye,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  AlertCircle,
  Filter,
} from "lucide-react";

import { apiFetch } from "@/lib/api";

const statusOptions = [
  "pending",
  "verified",
  "assigned",
  "in-progress",
  "resolved",
];

const statusStyles = {
  pending: "bg-amber-100 text-amber-700",
  verified: "bg-blue-100 text-blue-700",
  assigned: "bg-indigo-100 text-indigo-700",
  "in-progress": "bg-purple-100 text-purple-700",
  resolved: "bg-green-100 text-green-700",
};

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [pagination, setPagination] = useState({
    totalIssues: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    location: "",
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
        });

        Object.entries(appliedFilters).forEach(([key, value]) => {
          if (value.trim()) {
            params.append(key, value.trim());
          }
        });

        const response = await apiFetch(`/issues?${params.toString()}`);

        setIssues(response.data || []);
        setPagination(response.pagination);
      } catch (error) {
        setError(error.message || "Failed to load issues.");
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [page, appliedFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedFilters({ ...filters });
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: "",
      status: "",
      category: "",
      location: "",
    };

    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5 md:p-8">
      {/* Page heading */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Issues Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View, search, and manage citizen-reported issues.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 shadow-sm">
          <ClipboardList className="text-blue-600" size={20} />
          <span className="text-sm text-gray-600">Total Issues:</span>
          <span className="font-bold text-gray-900">
            {pagination.totalIssues}
          </span>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={19} className="text-gray-500" />
          <h2 className="font-semibold">Search and Filters</h2>
        </div>

        <form onSubmit={handleSearch}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Search issues
              </label>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search title or description"
                  className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="">All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("-", " ").replace(/\b\w/g, (c) =>
                      c.toUpperCase()
                    )}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                placeholder="Enter category"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Location
              </label>
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Search location"
                  className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Apply Filters
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {/* Issues table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Reported Issues</h2>
          <p className="mt-1 text-sm text-gray-500">
            Recently submitted citizen reports.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoaderCircle
              className="animate-spin text-blue-600"
              size={30}
            />
            <span className="ml-3 text-gray-500">Loading issues...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-8 text-red-600">
            <AlertCircle size={20} />
            {error}
          </div>
        ) : issues.length === 0 ? (
          <div className="py-20 text-center">
            <ClipboardList
              size={40}
              className="mx-auto mb-3 text-gray-300"
            />
            <p className="font-medium text-gray-700">No issues found</p>
            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-212 text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Issue</th>
                    <th className="px-5 py-4 font-medium">Category</th>
                    <th className="px-5 py-4 font-medium">Location</th>
                    <th className="px-5 py-4 font-medium">Department</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 text-right font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {issues.map((issue) => (
                    <tr key={issue._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="max-w-55 truncate font-medium text-gray-900">
                          {issue.title}
                        </p>
                        <p className="mt-1 max-w-55 truncate text-xs text-gray-500">
                          {issue.description}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {issue.category}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {issue.location}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {issue.assignedDepartment?.name || "Not assigned"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            statusStyles[issue.status] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {issue.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                        {formatDate(issue.createdAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/issues/${issue._id}`}
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                        >
                          <Eye size={15} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col justify-between gap-3 border-t px-5 py-4 sm:flex-row sm:items-center">
              <p className="text-sm text-gray-500">
                Showing page {pagination.currentPage} of{" "}
                {pagination.totalPages}
                {" · "}
                {pagination.totalIssues} issues
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1}
                  className="rounded-lg border p-2 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="text-sm font-medium">
                  {pagination.currentPage}
                </span>

                <button
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(prev + 1, pagination.totalPages)
                    )
                  }
                  disabled={page >= pagination.totalPages}
                  className="rounded-lg border p-2 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
