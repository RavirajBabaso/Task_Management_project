export const ROLES = {
  CHAIRMAN: 'CHAIRMAN',
  DIRECTOR: 'DIRECTOR',
  PROPERTY: 'PROPERTY',
  FINANCE: 'FINANCE',
  ADMIN: 'ADMIN',
  PRINCIPAL: 'PRINCIPAL',
  ADMISSION: 'ADMISSION',
  HR: 'HR',
  PURCHASE: 'PURCHASE',
  IT: 'IT',
  TRANSPORT: 'TRANSPORT'
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.CHAIRMAN]: 'Chairman',
  [ROLES.DIRECTOR]: 'Director',
  [ROLES.PROPERTY]: 'Property',
  [ROLES.FINANCE]: 'Finance',
  [ROLES.ADMIN]: 'Administration',
  [ROLES.PRINCIPAL]: 'Principal',
  [ROLES.ADMISSION]: 'Admission',
  [ROLES.HR]: 'Human Resources',
  [ROLES.PURCHASE]: 'Purchase',
  [ROLES.IT]: 'Information Technology',
  [ROLES.TRANSPORT]: 'Transport'
};

export const DEPARTMENT_HEAD_ROLES: Role[] = [
  ROLES.PROPERTY,
  ROLES.FINANCE,
  ROLES.ADMIN,
  ROLES.PRINCIPAL,
  ROLES.ADMISSION,
  ROLES.HR,
  ROLES.PURCHASE,
  ROLES.IT,
  ROLES.TRANSPORT
];
