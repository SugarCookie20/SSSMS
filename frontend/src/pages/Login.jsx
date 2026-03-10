import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { User, GraduationCap, UserCog, Mail, Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);

    if (result.success) {
      if (selectedRole === "student") {
        navigate("/student/dashboard");
      } else if (selectedRole === "faculty") {
        navigate("/faculty/dashboard");
      } else if (selectedRole === "admin") {
        navigate("/admin/dashboard");
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Branding */}
      <div className="flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex flex-col justify-center items-center text-white p-8">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white rounded-lg p-4">
              <img
                src="/sssms-logo.png"
                alt="SSSMS College of Architecture Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4">SSSMS Portal</h1>
          <p className="text-xl mb-8 text-blue-100">College of Architecture</p>

          <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold mb-2">Welcome Back!</h2>
            <p className="text-blue-200">Please sign in to continue</p>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600">Access your academic portal</p>
          </div>

          {/* Role Selection */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setSelectedRole("student")}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all ${
                selectedRole === "student"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("faculty")}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all ${
                selectedRole === "faculty"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Faculty
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("admin")}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all ${
                selectedRole === "admin"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <UserCog className="w-4 h-4 mr-2" />
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`${selectedRole}@example.com`}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-1"></p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-1"></p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} SSSMS College of Architecture. All
            rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
