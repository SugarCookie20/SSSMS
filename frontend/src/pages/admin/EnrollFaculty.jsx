import React, { useState } from "react";
import api from "../../api/axiosConfig";
import { UserPlus, Save, XCircle, CheckCircle, GraduationCap } from "lucide-react";

const EnrollFaculty = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "password123",
    designation: "Assistant Professor",
    department: "Architecture",
    qualification: "",
    phoneNumber: "",
    joiningDate: "",
    coaRegistrationNo: "",
    coaValidFrom: "",
    coaValidTill: "",
    aadharNo: "",
    panCardNo: "",
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
      await api.post("/admin/enroll-faculty", formData);
      setStatus({
        type: "success",
        message: "Faculty member enrolled successfully!",
      });
      setFormData({
        ...formData,
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        qualification: "",
        coaRegistrationNo: "",
        aadharNo: "",
        panCardNo: ""
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
            error.response?.data?.message ||
            "Failed to enroll faculty. Email may exist.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enroll Faculty</h1>
            <p className="text-gray-600 mt-1">
              Add teaching staff to the system.
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-full">
            <GraduationCap className="w-6 h-6 text-purple-600" />
          </div>
        </div>

        {status.message && (
            <div
                className={`p-4 mb-6 rounded-lg flex items-center ${
                    status.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                }`}
            >
              {status.type === "success" ? (
                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              ) : (
                  <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              )}
              {status.message}
            </div>
        )}

        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-8 space-y-8">

            {/* SECTION 1: Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
                1. Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><label className="block text-sm font-medium mb-1">First Name</label><input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                <div><label className="block text-sm font-medium mb-1">Middle Name</label><input name="middleName" value={formData.middleName} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                <div><label className="block text-sm font-medium mb-1">Last Name</label><input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-2 border rounded" required /></div>

                <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Email Address</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                <div><label className="block text-sm font-medium mb-1">Phone Number</label><input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full p-2 border rounded" /></div>

                <div><label className="block text-sm font-medium mb-1">Aadhar Number</label><input name="aadharNo" value={formData.aadharNo} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                <div><label className="block text-sm font-medium mb-1">PAN Card</label><input name="panCardNo" value={formData.panCardNo} onChange={handleChange} className="w-full p-2 border rounded" /></div>
              </div>
            </div>

            {/* SECTION 2: Professional Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
                2. Professional Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <select name="department" value={formData.department} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                    <option value="Architecture">Architecture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Designation</label>
                  <select name="designation" value={formData.designation} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                    <option>Assistant Professor</option>
                    <option>Associate Professor</option>
                    <option>Professor</option>
                    <option>HOD</option>
                    <option>Visiting Faculty</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Joining Date</label><input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className="w-full p-2 border rounded" required /></div>

                <div className="md:col-span-3"><label className="block text-sm font-medium mb-1">Qualification</label><input name="qualification" value={formData.qualification} onChange={handleChange} className="w-full p-2 border rounded" placeholder="e.g. M.Arch, PhD" /></div>
              </div>
            </div>

            {/* SECTION 3: COA Compliance */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
                3. Council of Architecture (COA) Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><label className="block text-sm font-medium mb-1">COA Registration No</label><input name="coaRegistrationNo" value={formData.coaRegistrationNo} onChange={handleChange} className="w-full p-2 border rounded font-mono" /></div>
                <div><label className="block text-sm font-medium mb-1">Valid From</label><input type="date" name="coaValidFrom" value={formData.coaValidFrom} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                <div><label className="block text-sm font-medium mb-1">Valid Till</label><input type="date" name="coaValidTill" value={formData.coaValidTill} onChange={handleChange} className="w-full p-2 border rounded" /></div>
              </div>
            </div>

          </div>

          <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex justify-end">
            <button
                type="submit"
                disabled={loading}
                className="flex items-center bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm disabled:opacity-50"
            >
              {loading ? (
                  "Processing..."
              ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Add Faculty Member
                  </>
              )}
            </button>
          </div>
        </form>
      </div>
  );
};

export default EnrollFaculty;