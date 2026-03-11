// Shared validation utilities for SSSMS Academic Portal

export const isValidPhone = (v) => !v || /^\d{10}$/.test(v);
export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isValidAadhar = (v) => !v || /^\d{12}$/.test(v);
export const isValidPAN = (v) => !v || /^[A-Z]{5}\d{4}[A-Z]$/.test(v.toUpperCase());
export const isValidBloodGroup = (v) => !v || /^(A|B|AB|O)[+-]$/.test(v);
export const isNameValid = (v) => /^[A-Za-z\s]{2,50}$/.test(v);
export const isOptionalName = (v) => !v || /^[A-Za-z\s]{1,50}$/.test(v);
export const isValidSGPA = (v) => {
    const n = parseFloat(v);
    return !isNaN(n) && n >= 0 && n <= 10;
};
export const isMarksValid = (marks, maxMarks) => {
    const m = parseFloat(marks);
    const max = parseFloat(maxMarks);
    return !isNaN(m) && m >= 0 && m <= max;
};
export const isFileSizeValid = (file, maxMB = 10) => file && file.size <= maxMB * 1024 * 1024;
export const isDateInPast = (d) => d && new Date(d) < new Date();
export const isDateNotFuture = (d) => d && new Date(d) <= new Date();
export const isFutureDate = (d) => d && new Date(d) > new Date();
export const isDateBefore = (a, b) => !a || !b || new Date(a) <= new Date(b);
export const isRequired = (v) => v !== null && v !== undefined && String(v).trim() !== '';
export const isPositiveNumber = (v) => {
    const n = parseFloat(v);
    return !isNaN(n) && n > 0;
};
export const maxLength = (v, len) => !v || v.length <= len;

