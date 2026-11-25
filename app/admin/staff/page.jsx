
"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  LoaderCircle,
  AlertCircle,
  CheckCircle,
  Building2,
  Wrench,
} from "lucide-react";

import { apiFetch } from "@/lib/api";

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [accountTypeFilter, setAccountTypeFilter] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    accountType: "department",
    department: "",
    team: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load staff and departments
  useEffect(() => {
    let ignore = false;

    const loadPageData = async () => {
      try {
        const [staffResponse, departmentResponse] = await Promise.all([
          apiFetch("/staff"),
          apiFetch("/departments"),
        ]);

        if (!ignore) {
          setStaff(staffResponse.data || []);
          setDepartments(departmentResponse.data || []);
        }
      } catch (error) {
        if (!ignore) {
          setError(error.message || "Failed to load staff information.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadPageData();

    return () => {
      ignore = true;
    };
  }, []);

  // Load teams when a department is selected
  useEffect(() => {
    if (
      formData.accountType !== "maintenance" ||
      !formData.department
    ) {
      return;
    }

    let ignore = false;

    const fetchTeams = async () => {
      try {
        const response = await apiFetch(
          `/teams?department=${formData.department}`
        );

        if (!ignore) {
          setTeams(response.data || []);
        }
      } catch (error) {
        if (!ignore) {
          setError(error.message || "Failed to load maintenance teams.");
        }
      }
    };

    fetchTeams();

    return () => {
      ignore = true;
    };
  }, [formData.accountType, formData.department]);

  // Handle form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "accountType") {
        return {
          ...prev,
          accountType: value,
          department: "",
          team: "",
        };
      }

      if (name === "department") {
        return {
          ...prev,
          department: value,
          team: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });

    if (name === "accountType" || name === "department") {
      setTeams([]);
    }
  };

  // Create staff account
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (
      formData.accountType === "department" &&
      !formData.department
    ) {
      setError("Please select a department.");
      return;
    }

    if (
      formData.accountType === "maintenance" &&
      (!formData.department || !formData.team)
    ) {
      setError("Please select both a department and a maintenance team.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        accountType: formData.accountType,
        ...(formData.accountType === "department" && {
          department: formData.department,
        }),
        ...(formData.accountType === "maintenance" && {
          department: formData.department,
          team: formData.team,
        }),
      };

      await apiFetch("/staff", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setMessage("Staff account created successfully.");

      setFormData({
        name: "",
        email: "",
        password: "",
        accountType: "department",
        department: "",
        team: "",
      });

      setTeams([]);

      const response = await apiFetch("/staff");
      setStaff(response.data || []);
    } catch (error) {
      setError(error.message || "Failed to create staff account.");
    } finally {
      setSaving(false);
    }
  };

  const filteredStaff =
    accountTypeFilter === "all"
      ? staff
      : staff.filter(
          (member) => member.accountType === accountTypeFilter
        );

  return (
    <div className="min-h-screen bg-gray-100 p-5 md:p-8">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">
          Staff Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Create and manage department and maintenance staff accounts.
        </p>
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
        {/* Create staff form */}
        <section className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-1">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <UserPlus size={22} />
            </div>

            <div>
              <h2 className="font-semibold">Create Staff Account</h2>
              <p className="text-xs text-gray-500">
                Add a new staff member
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="staff@example.com"
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Temporary Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Enter a password"
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Staff Type
              </label>

              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="department">Department Staff</option>
                <option value="maintenance">Maintenance Staff</option>
              </select>
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

            {formData.accountType === "maintenance" && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Maintenance Team
                </label>

                <select
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  required
                  disabled={!formData.department}
                  className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
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
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus size={17} />
                  Create Staff Account
                </>
              )}
            </button>
          </form>
        </section>

        {/* Staff list */}
        <section className="overflow-hidden rounded-xl border bg-white shadow-sm lg:col-span-2">
          <div className="flex flex-col justify-between gap-4 border-b px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold">Registered Staff</h2>
              <p className="mt-1 text-sm text-gray-500">
                {filteredStaff.length} staff members
              </p>
            </div>

            <select
              value={accountTypeFilter}
              onChange={(e) => setAccountTypeFilter(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">All Staff</option>
              <option value="department">Department Staff</option>
              <option value="maintenance">Maintenance Staff</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoaderCircle
                className="animate-spin text-blue-600"
                size={30}
              />
              <span className="ml-3 text-gray-500">
                Loading staff...
              </span>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="py-20 text-center">
              <Users
                size={40}
                className="mx-auto mb-3 text-gray-300"
              />
              <p className="font-medium text-gray-700">
                No staff members found
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Staff accounts will appear here after creation.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-162.5 text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Staff Member</th>
                    <th className="px-5 py-4 font-medium">Account Type</th>
                    <th className="px-5 py-4 font-medium">Department</th>
                    <th className="px-5 py-4 font-medium">Team</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {member.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {member.email}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            member.accountType === "department"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {member.accountType === "department"
                            ? "Department"
                            : "Maintenance"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} />
                          {member.department?.name || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Wrench size={16} />
                          {member.team?.name || "—"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
