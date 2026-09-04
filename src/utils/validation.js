export const validateEmail = (value) => {
  if (!value) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
  return true;
};

export const validateMobile = (value) => {
  if (!value) return 'Mobile number is required';
  if (!/^[6-9]\d{9}$/.test(value)) return 'Enter a valid 10-digit Indian mobile number';
  return true;
};

export const validateRequired = (fieldName) => (value) => {
  if (!value || (typeof value === 'string' && !value.trim())) return `${fieldName} is required`;
  return true;
};

export const isUGProgramme = (programme) =>
  ['B.E.', 'B.Tech.'].includes(programme);

export const isPGProgramme = (programme) =>
  ['M.E.', 'M.Tech.', 'MCA', 'MBA'].includes(programme);

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const generateId = () => `STU${Date.now()}`;
