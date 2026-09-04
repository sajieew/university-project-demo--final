import { useFormContext } from 'react-hook-form';

const PROGRAMMES = ['B.E.', 'B.Tech.', 'M.E.', 'M.Tech.', 'MCA', 'MBA'];
const BRANCHES = [
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'VLSI Design',
  'Software Engineering',
  'Embedded Systems',
  'Power Systems Engineering',
  'Communications Systems',
  'Human Resource Management',
  'Finance',
  'Marketing',
];
const CATEGORIES = ['Merit', 'Management', 'NRI', 'Other'];
const GENDERS   = ['Male', 'Female', 'Transgender'];
const YEARS     = ['2024-25', '2023-24', '2022-23', '2021-22', '2025-26'];

function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="label">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
}

export default function StudentDetailsForm() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="form-section">
      <h2 className="section-title">Section A — Student Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Application No." error={errors.applicationNo} required>
          <input
            {...register('applicationNo', { required: 'Application Number is required' })}
            placeholder="e.g. APP-2024-001"
            className={`input-field ${errors.applicationNo ? 'input-field-error' : ''}`}
          />
        </Field>

        <Field label="Admission No." error={errors.admissionNo}>
          <input
            {...register('admissionNo')}
            placeholder="e.g. ADM-2024-001"
            className="input-field"
          />
        </Field>

        <Field label="Academic Year" error={errors.academicYear} required>
          <select {...register('academicYear', { required: 'Academic Year is required' })} className={`input-field ${errors.academicYear ? 'input-field-error' : ''}`}>
            <option value="">Select Year</option>
            {YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
        </Field>

        <Field label="Name of the Student" error={errors.name} required>
          <input
            {...register('name', { required: 'Student name is required' })}
            placeholder="Full name as per certificate"
            className={`input-field ${errors.name ? 'input-field-error' : ''}`}
          />
        </Field>

        <Field label="Date of Birth" error={errors.dob} required>
          <input
            type="date"
            {...register('dob', { required: 'Date of birth is required' })}
            className={`input-field ${errors.dob ? 'input-field-error' : ''}`}
          />
        </Field>

        <Field label="Gender" error={errors.gender} required>
          <select {...register('gender', { required: 'Gender is required' })} className={`input-field ${errors.gender ? 'input-field-error' : ''}`}>
            <option value="">Select Gender</option>
            {GENDERS.map(g => <option key={g}>{g}</option>)}
          </select>
        </Field>

        <Field label="Programme Applied" error={errors.programme} required>
          <select {...register('programme', { required: 'Programme is required' })} className={`input-field ${errors.programme ? 'input-field-error' : ''}`}>
            <option value="">Select Programme</option>
            {PROGRAMMES.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>

        <Field label="Branch / Specialization" error={errors.branch} required>
          <select {...register('branch', { required: 'Branch is required' })} className={`input-field ${errors.branch ? 'input-field-error' : ''}`}>
            <option value="">Select Branch</option>
            {BRANCHES.map(b => <option key={b}>{b}</option>)}
          </select>
        </Field>

        <Field label="Admission Category" error={errors.category} required>
          <select {...register('category', { required: 'Category is required' })} className={`input-field ${errors.category ? 'input-field-error' : ''}`}>
            <option value="">Select Category</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Mobile Number" error={errors.mobile} required>
          <input
            {...register('mobile', {
              required: 'Mobile number is required',
              pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit Indian mobile number' },
            })}
            placeholder="10-digit mobile number"
            maxLength={10}
            className={`input-field ${errors.mobile ? 'input-field-error' : ''}`}
          />
        </Field>

        <Field label="Email ID" error={errors.email} required>
          <input
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
            })}
            placeholder="student@email.com"
            className={`input-field ${errors.email ? 'input-field-error' : ''}`}
          />
        </Field>
      </div>
    </div>
  );
}
