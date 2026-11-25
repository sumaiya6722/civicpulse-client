
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  User,
  Building2,
  Wrench,
  Clock,
  CheckCircle,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { apiFetch } from "@/lib/api";

const statuses = [
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

export default function IssueDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [issue, setIssue] = useState(null);
  const [activities, setActivities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchIssue = async () => {
    const response = await apiFetch(`/issues/${id}`);
    const issueData = response.data;

    setIssue(issueData);
    setSelectedDepartment(
      issueData.assignedDepartment?._id || ""
    );
    setSelectedTeam(issueData.assignedTeam?._id || "");
    setSelectedStatus(issueData.status);
  };

  const fetchActivities = async () => {
    const response = await apiFetch(`/issues/${id}/activities`);
    setActivities(response.data || []);
  };

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError("");

        const [issueResponse, departmentResponse] = await Promise.all([
          apiFetch(`/issues/${id}`),
          apiFetch("/departments"),
        ]);

        const issueData = issueResponse.data;

        setIssue(issueData);
        setSelectedDepartment(
          issueData.assignedDepartment?._id || ""
        );
        setSelectedTeam(issueData.assignedTeam?._id || "");
        setSelectedStatus(issueData.status);

        setDepartments(departmentResponse.data || []);

        try {
          const activityResponse = await apiFetch(
            `/issues/${id}/activities`
          );
          setActivities(activityResponse.data || []);
        } catch (activityError) {
          console.error("Could not load issue activities:", activityError);
        }
      } catch (error) {
        setError(error.message || "Failed to load issue details.");
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [id]);

  // Load maintenance teams when a department is selected

  useEffect(() => {
    if (!selectedDepartment) return;

    let ignore = false;

    const fetchTeams = async () => {
      try {
        const response = await apiFetch(
          `/teams?department=${selectedDepartment}`
        );

        if (!ignore) {
          setTeams(response.data || []);
        }
      } catch (error) {
        console.error("Could not load maintenance teams:", error);
      }
    };

    fetchTeams();

    return () => {
      ignore = true;
    };
  }, [selectedDepartment]);


  const handleAssign = async (e) => {
    e.preventDefault();

    if (!selectedDepartment || !selectedTeam) {
      setError("Please select both a department and a team.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await apiFetch(`/issues/${id}/assign`, {
        method: "PATCH",
        body: JSON.stringify({
          assignedDepartment: selectedDepartment,
          assignedTeam: selectedTeam,
        }),
      });

      await fetchIssue();
      await fetchActivities();

      setMessage("Issue assigned successfully.");
    } catch (error) {
      setError(error.message || "Failed to assign issue.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    if (
      selectedStatus === "resolved" &&
      !resolutionNote.trim()
    ) {
      setError("A resolution note is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await apiFetch(`/issues/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: selectedStatus,
          resolutionNote,
        }),
      });

      await fetchIssue();
      await fetchActivities();

      setResolutionNote("");
      setMessage("Issue status updated successfully.");
    } catch (error) {
      setError(error.message || "Failed to update issue status.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="animate-spin text-blue-600" size={32} />
        <span className="ml-3 text-gray-500">
          Loading issue details...
        </span>
      </div>
    );
  }

  if (error && !issue) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-blue-600"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!issue) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-5 md:p-8">
      {/* Header */}
      <div className="mb-7">
        <Link
          href="/admin/issues"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Issues
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Issue Details
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Review and manage this citizen report.
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-medium ${statusStyles[issue.status] || "bg-gray-100 text-gray-600"
              }`}
          >
            {issue.status}
          </span>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {message && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle size={18} />
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Issue information */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold">
              Report Information
            </h2>

            <h3 className="text-xl font-bold text-gray-900">
              {issue.title}
            </h3>

            <p className="mt-4 leading-7 text-gray-600">
              {issue.description}
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium">{issue.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reported on</p>
                  <p className="font-medium">
                    {formatDate(issue.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-50 p-3 text-orange-600">
                  <ClipboardIcon />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="font-medium">{issue.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-3 text-green-600">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reported by</p>
                  <p className="font-medium">
                    {issue.reportedByName || issue.reportedBy}
                  </p>
                </div>
              </div>
            </div>

            {issue.resolutionNote && (
              <div className="mt-6 rounded-lg bg-green-50 p-4">
                <p className="font-semibold text-green-800">
                  Resolution Note
                </p>
                <p className="mt-2 text-sm text-green-700">
                  {issue.resolutionNote}
                </p>
              </div>
            )}
          </section>

          {/* Activity history */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold">
              Issue Activity History
            </h2>

            {activities.length === 0 ? (
              <p className="text-sm text-gray-500">
                No activity history available.
              </p>
            ) : (
              <div className="space-y-5">
                {activities.map((activity) => (
                  <div
                    key={activity._id}
                    className="flex gap-3"
                  >
                    <div className="mt-1 rounded-full bg-blue-50 p-2 text-blue-600">
                      <Clock size={17} />
                    </div>

                    <div className="flex-1 border-b pb-4">
                      <p className="font-medium text-gray-800">
                        {activity.description}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Admin actions */}
        <div className="space-y-6">
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold">
              Assign Issue
            </h2>

            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Department
                </label>

                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    const departmentId = e.target.value;
                    setSelectedDepartment(departmentId);
                    setSelectedTeam("");
                    setTeams([]);
                  }}
                  required
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select department</option>

                  {departments
                    .filter((department) => department.isActive)
                    .map((department) => (
                      <option
                        key={department._id}
                        value={department._id}
                      >
                        {department.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Maintenance Team
                </label>

                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  required
                  disabled={!selectedDepartment}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select maintenance team</option>

                  {teams
                    .filter((team) => team.isActive)
                    .map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Assign Issue"}
              </button>
            </form>
          </section>

          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold">
              Update Issue Status
            </h2>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  New Status
                </label>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("-", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {selectedStatus === "resolved" && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Resolution Note
                  </label>

                  <textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    rows={4}
                    placeholder="Describe how the issue was resolved..."
                    required
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Updating..." : "Update Status"}
              </button>
            </form>
          </section>

          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Current Assignment</h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Building2 size={19} className="text-gray-500" />
                <div>
                  <p className="text-gray-500">Department</p>
                  <p className="font-medium">
                    {issue.assignedDepartment?.name || "Not assigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Wrench size={19} className="text-gray-500" />
                <div>
                  <p className="text-gray-500">Maintenance Team</p>
                  <p className="font-medium">
                    {issue.assignedTeam?.name || "Not assigned"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ClipboardIcon() {
  return <CalendarDays size={20} />;
}
