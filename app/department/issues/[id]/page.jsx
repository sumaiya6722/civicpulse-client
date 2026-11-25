
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from 'next/image';
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Clock,
  ClipboardList,
  LoaderCircle,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Building2,
  Users,
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
  "pending",
  "under_review",
  "assigned",
  "in_progress",
  "resolved",
];

const formatLabel = (value = "") =>
  value.replaceAll("_", " ").replace(/\b\w/g, (char) =>
    char.toUpperCase()
  );

const formatDate = (date) => {
  if (!date) return "Not available";

  return new Date(date).toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function DepartmentIssueDetailsPage() {
  const { id } = useParams();

  const [issue, setIssue] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    let ignore = false;

    const fetchIssueDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const [issueResponse, activityResponse] = await Promise.all([
          apiFetch(`/issues/${id}`),
          apiFetch(`/issues/${id}/activities?page=1&limit=100`),
        ]);

        if (!ignore) {
          setIssue(issueResponse.data);
          setActivities(activityResponse.data || []);
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

    fetchIssueDetails();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoaderCircle className="h-9 w-9 animate-spin text-blue-600" />
      </main>
    );
  }

  if (error || !issue) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-white p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />

          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Unable to load issue
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error || "The requested issue could not be found."}
          </p>

          <Link
            href="/department/issues"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <ArrowLeft size={16} />
            Back to Issues
          </Link>
        </div>
      </main>
    );
  }

  const currentStep = statusSteps.indexOf(issue.status);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Back Navigation */}
        <Link
          href="/department/issues"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Department Issues
        </Link>

        {/* Header */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Issue Review
              </p>

              <h1 className="mt-2 text-2xl font-bold text-gray-900">
                {issue.title}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Report ID: {issue._id}
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-medium ${statusStyles[issue.status] || "bg-gray-100 text-gray-700"
                }`}
            >
              {formatLabel(issue.status)}
            </span>
          </div>
        </section>

        {/* Issue Information */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          <div className="space-y-6 lg:col-span-2">

            {/* Description */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Issue Description
              </h2>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                {issue.description}
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {formatLabel(issue.category)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Submitted</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {formatDate(issue.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Image */}
            {issue.imageUrl && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Reported Image
                </h2>

                <a
                  href={issue.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <Image
                    src={issue.imageUrl}
                    alt={issue.title}
                    width={1000}
                    height={700}
                    unoptimized
                    className="max-h-112.5w-full rounded-lg object-contain"
                  />
                </a>
              </div>
            )}

            {/* Location */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <MapPin size={20} />
                Issue Location
              </h2>

              <p className="mt-4 text-sm text-gray-600">
                {issue.location?.address || "Address not available"}
              </p>

              {issue.location?.latitude != null &&
                issue.location?.longitude != null && (
                  <>
                    <p className="mt-3 text-xs text-gray-500">
                      Latitude: {issue.location.latitude}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Longitude: {issue.location.longitude}
                    </p>

                    <a
                      href={`https://www.google.com/maps?q=${issue.location.latitude},${issue.location.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Open in Google Maps
                      <ExternalLink size={15} />
                    </a>
                  </>
                )}
            </div>
          </div>

          {/* Assignment Information */}
          <div className="space-y-6">

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Assignment Details
              </h2>

              <div className="mt-5 space-y-5">
                <div className="flex gap-3">
                  <Building2 className="mt-1 text-blue-600" size={20} />

                  <div>
                    <p className="text-xs text-gray-500">
                      Department
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {issue.assignedDepartment?.name || "Not assigned"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Users className="mt-1 text-blue-600" size={20} />

                  <div>
                    <p className="text-xs text-gray-500">
                      Maintenance Team
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {issue.assignedTeam?.name || "Not assigned"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CalendarDays className="mt-1 text-blue-600" size={20} />

                  <div>
                    <p className="text-xs text-gray-500">
                      Assigned Date
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {formatDate(issue.assignedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resolution Information */}
            {issue.status === "resolved" && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-6">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle size={20} />
                  <h2 className="font-semibold">
                    Resolution Details
                  </h2>
                </div>

                <p className="mt-4 text-sm leading-6 text-green-800">
                  {issue.resolutionNote || "No resolution note provided."}
                </p>

                <p className="mt-3 text-xs text-green-700">
                  Resolved: {formatDate(issue.resolvedAt)}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Issue Progress */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Issue Progress
          </h2>

          <div className="mt-6 space-y-5">
            {statusSteps.map((step, index) => {
              const completed =
                currentStep !== -1 && index <= currentStep;

              return (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${completed
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-400"
                      }`}
                  >
                    {completed ? (
                      <CheckCircle size={17} />
                    ) : (
                      <Clock size={17} />
                    )}
                  </div>

                  <div>
                    <p
                      className={`text-sm font-medium ${completed ? "text-gray-900" : "text-gray-400"
                        }`}
                    >
                      {formatLabel(step)}
                    </p>
                  </div>
                </div>
              );
            })}

            {issue.status === "rejected" && (
              <p className="text-sm font-medium text-red-600">
                This issue has been rejected.
              </p>
            )}
          </div>
        </section>

        {/* Activity History */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <ClipboardList size={20} />
            Issue Activity History
          </h2>

          {activities.length === 0 ? (
            <p className="mt-5 text-sm text-gray-500">
              No activity history available.
            </p>
          ) : (
            <div className="mt-6 space-y-6">
              {activities.map((activity) => (
                <div
                  key={activity._id}
                  className="relative border-l-2 border-gray-200 pb-2 pl-6 last:border-transparent"
                >
                  <div className="absolute -left-1.75 top-0 h-3 w-3 rounded-full border-2 border-blue-500 bg-white" />

                  <p className="font-medium text-gray-900">
                    {formatLabel(activity.action)}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {activity.description}
                  </p>

                  {activity.previousValue && activity.newValue && (
                    <p className="mt-2 text-xs text-gray-500">
                      {activity.previousValue} → {activity.newValue}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-gray-400">
                    {formatDate(activity.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
