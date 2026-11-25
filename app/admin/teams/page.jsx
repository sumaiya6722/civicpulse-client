
"use client";

import { useEffect, useState } from "react";
import {
  Wrench,
  Plus,
  Pencil,
  Ban,
  X,
  Building2,
  LoaderCircle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import { apiFetch } from "@/lib/api";

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load teams and departments
  useEffect(() => {
    let ignore = false;

    const fetchPageData = async () => {
      try {
        const [teamResponse, departmentResponse] = await Promise.all([
          apiFetch("/teams"),
          apiFetch("/departments"),
        ]);

        if (!ignore) {
          setTeams(teamResponse.data || []);
          setDepartments(departmentResponse.data || []);
        }
      } catch (error) {
        if (!ignore) {
          setError(error.message || "Failed to load maintenance teams.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchPageData();

    return () => {
      ignore = true;
    };
  }, []);

  // Handle form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open create form
  const openCreateForm = () => {
    setEditingId(null);

    setFormData({
      name: "",
      description: "",
      department: "",
    });

    setError("");
    setMessage("");
    setShowForm(true);
  };

  // Open edit form
  const openEditForm = (team) => {
    setEditingId(team._id);

    setFormData({
      name: team.name,
      description: team.description || "",
      department: team.department?._id || team.department || "",
    });

    setError("");
    setMessage("");
    setShowForm(true);
  };

  // Create or update team
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingId) {
        await apiFetch(`/teams/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });

        setMessage("Maintenance team updated successfully.");
      } else {
        await apiFetch("/teams", {
          method: "POST",
          body: JSON.stringify(formData),
        });

        setMessage("Maintenance team created successfully.");
      }

      setShowForm(false);
      setEditingId(null);

      setFormData({
        name: "",
        description: "",
        department: "",
      });

      const response = await apiFetch("/teams");
      setTeams(response.data || []);
    } catch (error) {
      setError(error.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // Deactivate team
  const handleDeactivate = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this maintenance team?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await apiFetch(`/teams/${id}/deactivate`, {
        method: "PATCH",
      });

      setTeams((prev) =>
        prev.map((team) =>
          team._id === id ? { ...team, isActive: false } : team
        )
      );

      setMessage("Maintenance team deactivated successfully.");
    } catch (error) {
      setError(error.message || "Failed to deactivate maintenance team.");
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);

    setFormData({
      name: "",
      description: "",
      department: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5 md:p-8">
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Maintenance Team Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage teams assigned to departments.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={19} />
          Add Team
        </button>
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

      {/* Create / Edit form */}
      {showForm && (
        <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {editingId ? "Edit Maintenance Team" : "Create Maintenance Team"}
            </h2>

            <button
              onClick={closeForm}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Close form"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Team Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Road Repair Team"
                required
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Department
              </label>

              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select a department</option>

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

              {departments.filter((department) => department.isActive)
                .length === 0 && (
                <p className="mt-2 text-xs text-red-500">
                  No active departments available. Create or activate a
                  department first.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the responsibilities of this team..."
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={
                  saving ||
                  departments.filter((department) => department.isActive)
                    .length === 0
                }
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Team"}
              </button>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teams list */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="font-semibold">All Maintenance Teams</h2>
            <p className="mt-1 text-sm text-gray-500">
              {teams.length} teams registered
            </p>
          </div>

          <Wrench className="text-blue-600" size={23} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoaderCircle className="animate-spin text-blue-600" size={30} />
            <span className="ml-3 text-gray-500">
              Loading maintenance teams...
            </span>
          </div>
        ) : teams.length === 0 ? (
          <div className="py-20 text-center">
            <Wrench
              size={40}
              className="mx-auto mb-3 text-gray-300"
            />
            <p className="font-medium text-gray-700">
              No maintenance teams found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Create your first maintenance team to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-187.5 text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Team</th>
                  <th className="px-5 py-4 font-medium">Department</th>
                  <th className="px-5 py-4 font-medium">Description</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {teams.map((team) => (
                  <tr key={team._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
                          <Wrench size={20} />
                        </div>

                        <span className="font-medium text-gray-900">
                          {team.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 size={16} />
                        {team.department?.name || "Department unavailable"}
                      </div>
                    </td>

                    <td className="max-w-xs px-5 py-4 text-gray-600">
                      {team.description || "No description"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          team.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {team.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(team)}
                          className="rounded-lg border p-2 text-blue-600 hover:bg-blue-50"
                          title="Edit team"
                        >
                          <Pencil size={17} />
                        </button>

                        {team.isActive && (
                          <button
                            onClick={() => handleDeactivate(team._id)}
                            className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                            title="Deactivate team"
                          >
                            <Ban size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
