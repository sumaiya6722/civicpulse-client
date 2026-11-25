
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2,
  Users,
  LoaderCircle,
  History,
  ImageIcon,
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

const statusSteps = [
  { value: "pending", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

const formatStatus = (status = "") =>
  status
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatCategory = (category = "") =>
  category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatDate = (date) => {
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "Not available";

  return new Date(date).toLocaleString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getActivityTitle = (action = "") => {
  const titles = {
    created: "Issue Submitted",
    verified: "Issue Verified",
    assigned: "Issue Assigned",
    "status-updated": "Status Updated",
    resolved: "Issue Resolved",
    updated: "Issue Updated",
    deleted: "Issue Deleted",
  };

  return titles[action] || formatStatus(action);
};

export default function CitizenIssueDetailsPage() {
  const params = useParams();
  const issueId = params.id;

  const [issue, setIssue] = useState(null);
  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activityError, setActivityError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchIssueDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiFetch(`/issues/${issueId}`);

        if (!ignore) {
          setIssue(response.data);
        }

        // Fetch activity history separately.
        // If this request fails, the issue details can still be displayed.
        try {
          const activityResponse = await apiFetch(
            `/issues/${issueId}/activities`
          );

          if (!ignore) {
            setActivities(activityResponse.data || []);
          }
        } catch (activityError) {
          if (!ignore) {
            setActivityError(
              activityError.message || "Unable to load activity history."
            );
          }
        }
      } catch (error) {
        if (!ignore) {
          setError(error.message || "Failed to load issue details.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    if (issueId) {
      fetchIssueDetails();
    }

    return () => {
      ignore = true;
    };
  }, [issueId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoaderCircle
          size={32}
          className="animate-spin text-blue-600"
        />
        <span className="ml-3 text-sm text-gray-500">
          Loading issue details...
        </span>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-5">
        <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
          <AlertCircle
            size={42}
            className="mx-auto mb-4 text-red-500"
          />

          <h2 className="text-lg font-semibold text-gray-900">
            Unable to load issue
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error || "The requested issue could not be found."}
          </p>

          <Link
            href="/citizen/issues"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Back to My Reports
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(
    (step) => step.value === issue.status
  );

  const isRejected = issue.status === "rejected";

  const departmentName =
    issue.assignedDepartment?.name ||
    (issue.assignedDepartment ? "Department assigned" : "Not assigned yet");

  const teamName =
    issue.assignedTeam?.name ||
    (issue.assignedTeam ? "Maintenance team assigned" : "Not assigned yet");

  return (
    <div className="min-h-screen bg-gray-50 p-5 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Back Navigation */}
        <Link
          href="/citizen/issues"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to My Reports
        </Link>

        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-600">
              Issue Details
            </p>

            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              {issue.title}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Reported on {formatDate(issue.createdAt)}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
              statusStyles[issue.status] ||
              "bg-gray-100 text-gray-600"
            }`}
          >
            {formatStatus(issue.status)}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Issue Information */}
            <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <div className="border-b px-5 py-4">
                <h2 className="font-semibold text-gray-900">
                  Report Information
                </h2>
              </div>

              <div className="p-5">
                {/* Issue Image */}
                {issue.imageUrl ? (
                  <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg bg-gray-100 md:h-80">
                    <Image
                      src={issue.imageUrl}
                      alt={issue.title}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 768px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-6 flex h-48 items-center justify-center rounded-lg bg-gray-50">
                    <div className="text-center">
                      <ImageIcon
                        size={38}
                        className="mx-auto text-gray-300"
                      />
                      <p className="mt-2 text-sm text-gray-400">
                        No photograph was uploaded
                      </p>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-800">
                    Description
                  </h3>

                  <p className="whitespace-pre-wrap text-sm leading-7 text-gray-600">
                    {issue.description}
                  </p>
                </div>

                <div className="mt-6 grid gap-5 border-t pt-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">
                      Category
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {formatCategory(issue.category)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Report ID
                    </p>

                    <p className="mt-1 break-all font-medium text-gray-800">
                      {issue._id}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Issue Location */}
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <MapPin size={20} className="text-blue-600" />

                <h2 className="font-semibold text-gray-900">
                  Issue Location
                </h2>
              </div>

              <p className="text-sm leading-6 text-gray-700">
                {issue.location?.address || "Address not available"}
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Latitude
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {issue.location?.latitude ?? "Not available"}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Longitude
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {issue.location?.longitude ?? "Not available"}
                  </p>
                </div>
              </div>

              {issue.location?.latitude != null &&
                issue.location?.longitude != null && (
                  <a
                    href={`https://www.google.com/maps?q=${issue.location.latitude},${issue.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    <MapPin size={16} />
                    View location on Google Maps
                  </a>
                )}
            </section>

            {/* Activity History */}
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <History size={20} className="text-blue-600" />

                <h2 className="font-semibold text-gray-900">
                  Activity History
                </h2>
              </div>

              {activityError ? (
                <p className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700">
                  {activityError}
                </p>
              ) : activities.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">
                  No activity history is available yet.
                </p>
              ) : (
                <div className="space-y-6">
                  {activities.map((activity) => (
                    <div
                      key={activity._id}
                      className="relative flex gap-4"
                    >
                      <div className="relative flex shrink-0 flex-col items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          <History size={17} />
                        </div>

                        <div className="absolute top-10 h-full w-px bg-gray-200" />
                      </div>

                      <div className="min-w-0 flex-1 pb-2">
                        <h3 className="text-sm font-semibold text-gray-800">
                          {getActivityTitle(activity.action)}
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-gray-600">
                          {activity.description}
                        </p>

                        {activity.previousValue &&
                          activity.newValue && (
                            <p className="mt-2 text-xs text-gray-500">
                              {formatStatus(activity.previousValue)}
                              {" → "}
                              {formatStatus(activity.newValue)}
                            </p>
                          )}

                        <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                          <Clock size={13} />
                          {formatDateTime(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Progress */}
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="mb-5 font-semibold text-gray-900">
                Issue Progress
              </h2>

              {isRejected ? (
                <div className="rounded-lg bg-red-50 p-4">
                  <AlertCircle
                    size={23}
                    className="mb-2 text-red-600"
                  />

                  <p className="font-semibold text-red-700">
                    Report Rejected
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    This report has been rejected by the reviewing authority.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {statusSteps.map((step, index) => {
                    const completed =
                      currentStepIndex >= index &&
                      currentStepIndex !== -1;

                    const active = currentStepIndex === index;

                    return (
                      <div
                        key={step.value}
                        className="flex items-start gap-3"
                      >
                        <div className="relative">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              completed
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {completed ? (
                              <CheckCircle size={17} />
                            ) : (
                              <span className="text-xs font-semibold">
                                {index + 1}
                              </span>
                            )}
                          </div>

                          {index !== statusSteps.length - 1 && (
                            <div
                              className={`absolute left-1/2 top-8 h-7 w-0.5 -translate-x-1/2 ${
                                completed
                                  ? "bg-blue-600"
                                  : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>

                        <div className="pt-1">
                          <p
                            className={`text-sm font-medium ${
                              completed
                                ? "text-gray-900"
                                : "text-gray-400"
                            }`}
                          >
                            {step.label}
                          </p>

                          {active && (
                            <p className="mt-1 text-xs text-blue-600">
                              Current status
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Assignment Information */}
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="mb-5 font-semibold text-gray-900">
                Assignment Information
              </h2>

              <div className="space-y-5">
                <div className="flex gap-3">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <Building2 size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">
                      Assigned Department
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {departmentName}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                    <Users size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">
                      Maintenance Team
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {teamName}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="rounded-lg bg-green-50 p-2 text-green-600">
                    <CalendarDays size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">
                      Assigned Date
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {formatDate(issue.assignedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Resolution Information */}
            {issue.status === "resolved" && (
              <section className="rounded-xl border border-green-200 bg-green-50 p-5">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle size={20} />

                  <h2 className="font-semibold">
                    Issue Resolved
                  </h2>
                </div>

                {issue.resolvedAt && (
                  <p className="mt-3 text-sm text-green-800">
                    Resolved on {formatDate(issue.resolvedAt)}
                  </p>
                )}

                {issue.resolutionNote && (
                  <div className="mt-4 border-t border-green-200 pt-4">
                    <p className="text-xs font-semibold text-green-700">
                      Resolution Note
                    </p>

                    <p className="mt-2 text-sm leading-6 text-green-800">
                      {issue.resolutionNote}
                    </p>
                  </div>
                )}
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
