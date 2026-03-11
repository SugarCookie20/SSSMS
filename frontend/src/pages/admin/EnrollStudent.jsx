import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { UserPlus, Save, XCircle, ArrowLeft } from "lucide-react";
import { isValidPhone, isValidEmail, isValidAadhar, isValidBloodGroup, isNameValid, isOptionalName, isRequired } from "../../utils/validators";

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
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: null }));
  };

  const validate = () => {
    const e = {};
    if (!isRequired(formData.firstName) || !isNameValid(formData.firstName)) e.firstName = 'Required. Letters only, 2–50 chars.';
    if (!isOptionalName(formData.middleName)) e.middleName = 'Letters only if provided.';
    if (!isRequired(formData.lastName) || !isNameValid(formData.lastName)) e.lastName = 'Required. Letters only, 2–50 chars.';
    if (!isRequired(formData.email) || !isValidEmail(formData.email)) e.email = 'Valid email is required.';
    if (!isRequired(formData.prn)) e.prn = 'PRN is required.';
    if (!isRequired(formData.dob)) {
      e.dob = 'Date of birth is required.';
    } else {
      const dob = new Date(formData.dob);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dob >= today) {
        e.dob = 'Date of birth must be in the past.';
      } else {
        const age = today.getFullYear() - dob.getFullYear() - (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
        if (age < 15) e.dob = 'Student must be at least 15 years old.';
        if (age > 100) e.dob = 'Please enter a valid date of birth.';
      }
    }
    if (formData.phoneNumber && !isValidPhone(formData.phoneNumber)) e.phoneNumber = 'Must be exactly 10 digits.';
    if (formData.parentPhoneNumber && !isValidPhone(formData.parentPhoneNumber)) e.parentPhoneNumber = 'Must be exactly 10 digits.';
    if (formData.phoneNumber && formData.parentPhoneNumber && formData.phoneNumber === formData.parentPhoneNumber) {
      e.parentPhoneNumber = 'Parent and student numbers cannot be the same.';
    }
    if (!isValidAadhar(formData.aadharNo)) e.aadharNo = 'Must be exactly 12 digits.';
    if (!isValidBloodGroup(formData.bloodGroup)) e.bloodGroup = 'Invalid. Use format like A+, O-, AB+.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatus({ type: "error", message: "Please fix the highlighted errors." });
      return;
    }
    setErrors({});
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await api.post("/admin/enroll-student", formData);
      setStatus({ type: "success", message: typeof response.data === 'string' ? response.data : "Student enrolled successfully!" });
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        prn: "",
        department: "Architecture",
        academicYear: formData.academicYear,
        phoneNumber: "",
        address: "",
        dob: "",
        coaEnrollmentNo: "",
        grNo: "",
        aadharNo: "",
        abcId: "",
        bloodGroup: "",
        parentPhoneNumber: "",
        admissionCategory: formData.admissionCategory,
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

  const fieldError = (name) => errors[name] ? <p className="text-red-500 text-xs mt-1">{errors[name]}</p> : null;
  const inputClass = (name, extra = '') => `w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-300'} ${extra}`;

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
                    className={inputClass('firstName')}
                    required
                />
                {fieldError('firstName')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <input
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className={inputClass('middleName')}
                />
                {fieldError('middleName')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={inputClass('lastName')}
                    required
                />
                {fieldError('lastName')}
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
                    className={inputClass('dob')}
                    max={new Date().toISOString().split('T')[0]}
                    required
                />
                {fieldError('dob')}
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
                    className={inputClass('bloodGroup')}
                />
                {fieldError('bloodGroup')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhar Number
                </label>
                <input
                    name="aadharNo"
                    value={formData.aadharNo}
                    onChange={handleChange}
                    className={inputClass('aadharNo')}
                />
                {fieldError('aadharNo')}
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
                    className={inputClass('email')}
                    required
                />
                {fieldError('email')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Mobile Number
                </label>
                <input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={inputClass('phoneNumber')}
                    maxLength={10}
                />
                {fieldError('phoneNumber')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Mobile Number
                </label>
                <input
                    name="parentPhoneNumber"
                    value={formData.parentPhoneNumber}
                    onChange={handleChange}
                    className={inputClass('parentPhoneNumber')}
                    maxLength={10}
                />
                {fieldError('parentPhoneNumber')}
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
                    className={inputClass('prn', 'font-mono')}
                    required
                />
                {fieldError('prn')}
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