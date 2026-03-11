import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { UserPlus, Save, XCircle, CheckCircle, GraduationCap, ArrowLeft } from "lucide-react";
import { isValidPhone, isValidEmail, isValidAadhar, isValidPAN, isNameValid, isOptionalName, isRequired, isDateInPast, isDateNotFuture, isDateBefore } from "../../utils/validators";

const EnrollFaculty = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    dob: "",
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
    if (!isRequired(formData.dob)) e.dob = 'Date of birth is required.';
    else if (!isDateInPast(formData.dob)) e.dob = 'Date of birth must be in the past.';
    if (!isRequired(formData.joiningDate)) e.joiningDate = 'Joining date is required.';
    else if (!isDateNotFuture(formData.joiningDate)) e.joiningDate = 'Joining date cannot be in the future.';
    if (formData.phoneNumber && !isValidPhone(formData.phoneNumber)) e.phoneNumber = 'Must be exactly 10 digits.';
    if (!isValidAadhar(formData.aadharNo)) e.aadharNo = 'Must be exactly 12 digits.';
    if (!isValidPAN(formData.panCardNo)) e.panCardNo = 'Format: ABCDE1234F (5 letters, 4 digits, 1 letter).';
    if (formData.coaValidFrom && formData.coaValidTill && !isDateBefore(formData.coaValidFrom, formData.coaValidTill)) {
      e.coaValidTill = 'Valid Till must be after Valid From.';
    }
    return e;
  };

  const fieldError = (name) => errors[name] ? <p className="text-red-500 text-xs mt-1">{errors[name]}</p> : null;
  const ic = (name, extra = '') => `w-full p-2 border rounded ${errors[name] ? 'border-red-400 bg-red-50' : ''} ${extra}`;

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
      const response = await api.post("/admin/enroll-faculty", formData);
      setStatus({
        type: "success",
        message: typeof response.data === 'string' ? response.data : "Faculty member enrolled successfully!",
      });
      setFormData({
        ...formData,
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        dob: "",
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
        <button onClick={() => navigate('/admin/dashboard')} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </button>
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
                <div><label className="block text-sm font-medium mb-1">First Name</label><input name="firstName" value={formData.firstName} onChange={handleChange} className={ic('firstName')} required />{fieldError('firstName')}</div>
                <div><label className="block text-sm font-medium mb-1">Middle Name</label><input name="middleName" value={formData.middleName} onChange={handleChange} className={ic('middleName')} />{fieldError('middleName')}</div>
                <div><label className="block text-sm font-medium mb-1">Last Name</label><input name="lastName" value={formData.lastName} onChange={handleChange} className={ic('lastName')} required />{fieldError('lastName')}</div>

                <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Email Address</label><input type="email" name="email" value={formData.email} onChange={handleChange} className={ic('email')} required />{fieldError('email')}</div>
                <div><label className="block text-sm font-medium mb-1">Date of Birth</label><input type="date" name="dob" value={formData.dob} onChange={handleChange} className={ic('dob')} required />{fieldError('dob')}</div>

                <div><label className="block text-sm font-medium mb-1">Phone Number</label><input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={ic('phoneNumber')} maxLength={10} />{fieldError('phoneNumber')}</div>

                <div><label className="block text-sm font-medium mb-1">Aadhar Number</label><input name="aadharNo" value={formData.aadharNo} onChange={handleChange} className={ic('aadharNo')} maxLength={12} />{fieldError('aadharNo')}</div>
                <div><label className="block text-sm font-medium mb-1">PAN Card</label><input name="panCardNo" value={formData.panCardNo} onChange={handleChange} className={ic('panCardNo')} maxLength={10} />{fieldError('panCardNo')}</div>
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
                <div><label className="block text-sm font-medium mb-1">Joining Date</label><input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className={ic('joiningDate')} required />{fieldError('joiningDate')}</div>

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
                <div><label className="block text-sm font-medium mb-1">Valid Till</label><input type="date" name="coaValidTill" value={formData.coaValidTill} onChange={handleChange} className={ic('coaValidTill')} />{fieldError('coaValidTill')}</div>
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