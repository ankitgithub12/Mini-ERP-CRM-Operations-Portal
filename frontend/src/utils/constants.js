export const ROLES = {
  ADMIN: 'Admin',
  SALES: 'Sales',
  WAREHOUSE: 'Warehouse',
  ACCOUNTS: 'Accounts',
};

export const CUSTOMER_TYPES = ['Retail', 'Wholesale', 'Distributor'];
export const CUSTOMER_STATUSES = ['Lead', 'Active', 'Inactive'];
export const CHALLAN_STATUSES = ['DRAFT', 'CONFIRMED', 'CANCELLED'];
export const MOVEMENT_TYPES = ['IN', 'OUT'];

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Accessories',
  'Peripherals',
  'Lighting',
  'Furniture',
  'Office Supplies',
  'Other',
];

// Role permissions for navigation visibility
export const ROLE_PERMISSIONS = {
  Admin: {
    dashboard: true,
    customers: { view: true, create: true, edit: true, delete: true },
    followups: { view: true, create: true },
    products: { view: true, create: true, edit: true },
    stockIn: true,
    stockOut: true,
    challans: { view: true, create: true, confirm: true },
    users: true,
  },
  Sales: {
    dashboard: true,
    customers: { view: true, create: true, edit: true, delete: false },
    followups: { view: true, create: true },
    products: { view: true, create: false, edit: false },
    stockIn: false,
    stockOut: false,
    challans: { view: true, create: true, confirm: true },
    users: false,
  },
  Warehouse: {
    dashboard: true,
    customers: { view: true, create: false, edit: false, delete: false },
    followups: { view: false, create: false },
    products: { view: true, create: true, edit: true },
    stockIn: true,
    stockOut: true,
    challans: { view: true, create: false, confirm: false },
    users: false,
  },
  Accounts: {
    dashboard: true,
    customers: { view: true, create: false, edit: false, delete: false },
    followups: { view: true, create: false },
    products: { view: true, create: false, edit: false },
    stockIn: false,
    stockOut: false,
    challans: { view: true, create: false, confirm: false },
    users: false,
  },
};
