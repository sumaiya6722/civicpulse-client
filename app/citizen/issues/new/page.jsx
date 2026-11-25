
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Image from "next/image";
import dynamic from "next/dynamic";


const LocationPicker = dynamic(
  () => import("@/components/LocationPicker"),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-gray-500">
        Loading map...
      </p>
    ),
  }
);


const LocationMap = dynamic(
  () => import("@/components/LocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-87.5 items-center justify-center rounded-xl bg-gray-100">
        Loading map...
      </div>
    ),
  }
);

const categories = [
  { value: "road", label: "Road Damage" },
  { value: "streetlight", label: "Streetlight" },
  { value: "drainage", label: "Drainage" },
  { value: "waste", label: "Waste Management" },
  { value: "water_supply", label: "Water Supply" },
  { value: "public_property", label: "Public Property" },
  { value: "other", label: "Other" },
];

export default function NewIssuePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const previewUrlRef = useRef(null);

  // Clean up the preview URL when the page is unmounted
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  // Handle ordinary form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle image selection and preview
  const handleImageChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image.");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      e.target.value = "";
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const imagePreview = URL.createObjectURL(selectedFile);

    previewUrlRef.current = imagePreview;

    setImage(selectedFile);
    setPreview(imagePreview);
    setError("");
  };

  // Convert GPS coordinates into a readable address
  const getAddressFromCoordinates = async (latitude, longitude) => {
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(latitude),
      lon: String(longitude),
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params}`
    );

    if (!response.ok) {
      throw new Error("Unable to find the address for your location.");
    }

    const data = await response.json();

    if (!data.display_name) {
      throw new Error("No address could be found for these coordinates.");
    }

    return data.display_name;
  };

  // Detect current GPS location and automatically retrieve its address
  const handleGetLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Save GPS coordinates first
        setFormData((previous) => ({
          ...previous,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));

        try {
          // Retrieve readable address using reverse geocoding
          const address = await getAddressFromCoordinates(
            latitude,
            longitude
          );

          setFormData((previous) => ({
            ...previous,
            address,
          }));
        } catch (error) {
          setError(
            `${error.message} Your GPS coordinates were saved. You can enter the address manually.`
          );
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        let message = "Unable to retrieve your location.";

        if (error.code === error.PERMISSION_DENIED) {
          message = "Location permission was denied. Please allow location access.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Your current location is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out. Please try again.";
        }

        setError(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };


  const handleMapLocationSelect = async ({ latitude, longitude }) => {
    setFormData((prev) => ({
      ...prev,
      latitude: String(latitude),
      longitude: String(longitude),
    }));

    setLocationLoading(true);
    setError("");

    try {
      const address = await getAddressFromCoordinates(
        latitude,
        longitude
      );

      setFormData((prev) => ({
        ...prev,
        address,
      }));
    } catch (error) {
      console.error("Issue location error:", error);

      setError(
        "Coordinates selected, but we couldn't find the address. Please enter it manually."
      );
    } finally {
      setLocationLoading(false);
    }
  };


  // Submit issue report
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.category ||
      !formData.address.trim() ||
      formData.latitude === "" ||
      formData.longitude === ""
    ) {
      setError("Please complete all required fields.");
      return;
    }

    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      setError("Please enter a valid latitude between -90 and 90.");
      return;
    }

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError("Please enter a valid longitude between -180 and 180.");
      return;
    }

    const submissionData = new FormData();

    submissionData.append("title", formData.title.trim());
    submissionData.append("description", formData.description.trim());
    submissionData.append("category", formData.category);

    submissionData.append(
      "location",
      JSON.stringify({
        address: formData.address.trim(),
        latitude,
        longitude,
      })
    );

    if (image) {
      submissionData.append("image", image);
    }

    try {
      setLoading(true);

      await apiFetch("/issues", {
        method: "POST",
        body: submissionData,
      });

      // Reset form after successful submission
      setFormData({
        title: "",
        description: "",
        category: "",
        address: "",
        latitude: "",
        longitude: "",
      });

      setImage(null);
      setPreview("");

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }

      router.push("/citizen/dashboard");

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <Link
          href="/citizen/dashboard"
          className="text-sm text-gray-500 hover:text-blue-600"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Report an Issue
        </h1>

        <p className="mt-2 text-gray-600">
          Help improve your community by reporting an infrastructure problem.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {/* Issue Title */}
        <div>
          <label className="mb-2 block font-medium text-gray-800">
            Issue Title *
          </label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Example: Large pothole on the main road"
            maxLength={150}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block font-medium text-gray-800">
            Description *
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the problem in detail..."
            rows={5}
            maxLength={2000}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 block font-medium text-gray-800">
            Issue Category *
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Select a category</option>

            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className="mb-2 block font-medium text-gray-800">
            Issue Photograph (Optional)
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full rounded-lg border border-gray-300 p-3"
          />

          <p className="mt-2 text-sm text-gray-500">
            Maximum image size: 5 MB.
          </p>

          {preview && (
            <div className="relative mt-4 h-56 w-full overflow-hidden rounded-lg">
              <Image
                src={preview}
                alt="Selected issue photograph"
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}
        </div>

        {/* Location */}
        <div className="border-t border-gray-200 pt-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Issue Location
          </h2>

          <p className="mb-5 text-sm text-gray-500">
            Provide the address and GPS coordinates of the problem.
          </p>

          <div className="mb-4">
            <label className="mb-2 block font-medium">
              Select the issue location on the map
            </label>

            <p className="mb-3 text-sm text-gray-500">
              Click anywhere on the map to select where the problem is located.
            </p>

            <LocationMap
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationSelect={handleMapLocationSelect}
            />
          </div>


          <button
            type="button"
            onClick={handleGetLocation}
            disabled={locationLoading}
            className="mb-5 rounded-lg border border-blue-600 px-4 py-2.5 font-medium text-blue-600 transition hover:bg-blue-50 disabled:opacity-60"
          >
            {locationLoading
              ? "Detecting Location and Address..."
              : "Use My Current Location"}
          </button>

          <LocationPicker
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationSelect={handleMapLocationSelect}
          />
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block font-medium text-gray-800">
                Address *
              </label>

              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter the issue address"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-gray-800">
                  Latitude *
                </label>

                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="Example: 23.8103"
                  step="any"
                  min="-90"
                  max="90"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-800">
                  Longitude *
                </label>

                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="Example: 90.4125"
                  step="any"
                  min="-180"
                  max="180"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || locationLoading}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Submitting Report..." : "Submit Issue Report"}
        </button>
      </form>
    </div>
  );
}
