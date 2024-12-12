export const GENDER_CHOICES = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not_say', label: 'Prefer not to say' },
] as const;

export const EDUCATION_CHOICES = [
  { value: 'high_school_or_less', label: 'High School or Less' },
  { value: 'college', label: 'College Education' },
  { value: 'bachelor', label: "Bachelor's Degree" },
  { value: 'graduate', label: 'Graduate Degree' },
] as const; 