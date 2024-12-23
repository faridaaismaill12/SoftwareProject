"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function CreateStudentPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    studentLevel: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const token = Cookies.get("authToken");

      if (!token) {
        setError("You must log in first.");
        setTimeout(() => {
          router.push("/users/login");
        }, 3000);
        return;
      }

      try {
        const response = await axios.get("http://localhost:5010/users/get-role", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(response.data);
        const role = response.data;
        if (role !== "instructor") {
          setError("You do not have permission to access this page.");
          setTimeout(() => {
            router.push("http://localhost:4001/users/login");
          }, 3000);
        }
      } catch (err) {
        setError("Failed to verify access. Please log in again.");
        setTimeout(() => {
          router.push("/users/login");
        }, 3000);
      }
    };

    checkAccess();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const token = Cookies.get("authToken");

    if (!token) {
      setError("You must log in first.");
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      passwordHash: formData.password,
    };
    delete payload.password;

    try {
      const response = await axios.post(
        "http://localhost:5010/users/create-student",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess(response.data.message || "Student account created successfully!");
      setFormData({
        name: "",
        email: "",
        password: "",
        studentLevel: "",
        role: "student",
      });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Failed to create student account.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-semibold mb-4">Create Student Account</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
        {!error && (
          <form onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="mb-4">
              <label htmlFor="name" className="block font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                className="w-full p-2 border rounded"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email Field */}
            <div className="mb-4">
              <label htmlFor="email" className="block font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="w-full p-2 border rounded"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label htmlFor="password" className="block font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className="w-full p-2 border rounded"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Student Level Field */}
            <div className="mb-4">
              <label htmlFor="studentLevel" className="block font-medium mb-1">
                Student Level
              </label>
              <select
                name="studentLevel"
                id="studentLevel"
                className="w-full p-2 border rounded"
                value={formData.studentLevel}
                onChange={handleChange}
                required
              >
                <option value="">Select Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-2 rounded text-white transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {loading ? "Creating..." : "Create Student"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
