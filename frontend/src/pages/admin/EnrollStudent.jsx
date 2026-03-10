import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { UserPlus, Save, XCircle, ArrowLeft } from "lucide-react";

const EnrollStudent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    prn: "",
    department: "Architecture",
    academicYear: "FIRST_YEAR",
    phoneNumber: "",
    address: "",
    dob: "",
    coaEnrollmentNo: "",
    grNo: "",
    aadharNo: "",
    abcId: "",
    bloodGroup: "",
    parentPhoneNumber: "",
    admissionCategory: "CAP_ROUND_1",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await api.post("/admin/enroll-student", formData);
      setStatus({ type: "success", message: typeof response.data === 'string' ? response.data : "Student enrolled successfully!" });
      setFormData({
        ...formData,
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        prn: "",
        aadharNo: "",
        abcId: "",
        grNo: "",
        coaEnrollmentNo: "",
        dob: "",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
            error.response?.data?.message ||
            "Failed to enroll student. Check PRN or Email.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/admin/dashboard')} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </button>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Enroll New Student
            </h1>
            <p className="text-gray-600 mt-1">
              Create a student profile and generate login credentials.
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-full">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        {status.message && (
            <div
                className={`p-4 mb-6 rounded-lg flex items-center ${
                    status.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                }`}
            >
              {status.type === "error" && <XCircle className="w-5 h-5 mr-2" />}
              {status.message}
            </div>
        )}

        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8 space-y-8"
        >
          {/* SECTION 1: Personal Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
            <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
              1
            </span>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <input
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                />
              </div>

              {/* Row 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <input
                    name="bloodGroup"
                    placeholder="e.g. O+"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhar Number
                </label>
                <input
                    name="aadharNo"
                    value={formData.aadharNo}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Contact Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
            <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
              2
            </span>
              Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Mobile Number
                </label>
                <input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Mobile Number
                </label>
                <input
                    name="parentPhoneNumber"
                    value={formData.parentPhoneNumber}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Academic Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
            <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
              3
            </span>
              Academic Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PRN Number
                </label>
                <input
                    name="prn"
                    value={formData.prn}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  COA Enrollment Number
                </label>
                <input
                    name="coaEnrollmentNo"
                    value={formData.coaEnrollmentNo}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GR Number
                </label>
                <input
                    name="grNo"
                    value={formData.grNo}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ABC / APAAR ID
                </label>
                <input
                    name="abcId"
                    value={formData.abcId}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admission Category
                </label>
                <select
                    name="admissionCategory"
                    value={formData.admissionCategory}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="CAP_ROUND_1">CAP Round I</option>
                  <option value="CAP_ROUND_2">CAP Round II</option>
                  <option value="CAP_ROUND_3">CAP Round III</option>
                  <option value="VACANCY_AGAINST_CAP">Vacancy Against CAP</option>
                  <option value="INSTITUTE_LEVEL">Institute Level Seat</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Year
                </label>
                <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="FIRST_YEAR">First Year</option>
                  <option value="SECOND_YEAR">Second Year</option>
                  <option value="THIRD_YEAR">Third Year</option>
                  <option value="FOURTH_YEAR">Fourth Year</option>
                  <option value="FIFTH_YEAR">Fifth Year</option>
                </select>

              </div>

              {/* Hidden Department */}
              <div className="hidden">
                <select name="department" value={formData.department} onChange={handleChange}>
                  <option value="Architecture">Architecture</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex justify-end">
            <button
                type="submit"
                disabled={loading}
                className="flex items-center bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-50"
            >
              {loading ? (
                  "Processing..."
              ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Enroll Student
                  </>
              )}
            </button>
          </div>
        </form>
      </div>
  );
};

export default EnrollStudent;