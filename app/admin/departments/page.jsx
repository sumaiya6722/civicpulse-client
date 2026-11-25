
"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  Pencil,
  Ban,
  X,
  LoaderCircle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import { apiFetch } from "@/lib/api";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch departments
  useEffect(() => {
    let ignore = false;

    const fetchDepartments = async () => {
      try {
        const response = await apiFetch("/departments");

        if (!ignore) {
          setDepartments(response.data || []);
        }
      } catch (error) {
        if (!ignore) {
          setError(error.message || "Failed to load departments.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchDepartments();

    return () => {
      ignore = true;
    };
  }, []);

  // Handle form input
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
    });
    setError("");
    setMessage("");
    setShowForm(true);
  };

  // Open edit form
  const openEditForm = (department) => {
    setEditingId(department._id);

    setFormData({
      name: department.name,
      description: department.description || "",
    });

    setError("");
    setMessage("");
    setShowForm(true);
  };

  // Create or update department
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingId) {
        await apiFetch(`/departments/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });

        setMessage("Department updated successfully.");
      } else {
        await apiFetch("/departments", {
          method: "POST",
          body: JSON.stringify(formData),
        });

        setMessage("Department created successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", description: "" });

      const response = await apiFetch("/departments");
      setDepartments(response.data || []);
    } catch (error) {
      setError(error.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // Deactivate department
  const handleDeactivate = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this department?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await apiFetch(`/departments/${id}/deactivate`, {
        method: "PATCH",
      });

      setDepartments((prev) =>
        prev.map((department) =>
          department._id === id
            ? { ...department, isActive: false }
            : department
        )
      );

      setMessage("Department deactivated successfully.");
    } catch (error) {
      setError(error.message || "Failed to deactivate department.");
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5 md:p-8">
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Department Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage CivicPulse departments.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={19} />
          Add Department
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
              {editingId ? "Edit Department" : "Create Department"}
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
                Department Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Road Maintenance Department"
                required
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
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
                placeholder="Describe the responsibilities of this department..."
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Department"}
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

      {/* Departments list */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="font-semibold">All Departments</h2>
            <p className="mt-1 text-sm text-gray-500">
              {departments.length} departments registered
            </p>
          </div>

          <Building2 className="text-blue-600" size={23} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoaderCircle className="animate-spin text-blue-600" size={30} />
            <span className="ml-3 text-gray-500">
              Loading departments...
            </span>
          </div>
        ) : departments.length === 0 ? (
          <div className="py-20 text-center">
            <Building2
              size={40}
              className="mx-auto mb-3 text-gray-300"
            />
            <p className="font-medium text-gray-700">
              No departments found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Create your first department to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-162.5 text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Department</th>
                  <th className="px-5 py-4 font-medium">Description</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {departments.map((department) => (
                  <tr key={department._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                          <Building2 size={20} />
                        </div>

                        <span className="font-medium text-gray-900">
                          {department.name}
                        </span>
                      </div>
                    </td>

                    <td className="max-w-xs px-5 py-4 text-gray-600">
                      {department.description || "No description"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          department.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {department.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(department)}
                          className="rounded-lg border p-2 text-blue-600 hover:bg-blue-50"
                          title="Edit department"
                        >
                          <Pencil size={17} />
                        </button>

                        {department.isActive && (
                          <button
                            onClick={() =>
                              handleDeactivate(department._id)
                            }
                            className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                            title="Deactivate department"
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
