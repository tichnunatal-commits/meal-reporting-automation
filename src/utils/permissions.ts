/**
 * Centralized Permissions & Authorization Module
 * Single Source of Truth (SSOT) for all role-based access control in the system.
 * All UI components must reference these functions instead of inline role checks.
 */

import { UserRole, User } from '../types';

// ─── Role hierarchy constants ───
const ADMIN_ROLES: ReadonlySet<UserRole> = new Set(['system_admin']);
const APPROVER_ROLES: ReadonlySet<UserRole> = new Set(['police_ramtal', 'food_dept_reviewer', 'system_admin']);
const REPORTER_ROLES: ReadonlySet<UserRole> = new Set(['supplier_reporter']);
const VIEWER_ROLES: ReadonlySet<UserRole> = new Set(['viewer_finance']);

// ─── Core permission checks ───

/** Is the user a system administrator? */
export const isAdmin = (user: User): boolean => ADMIN_ROLES.has(user.role);

/** Is the user a supplier reporter? */
export const isSupplier = (user: User): boolean => REPORTER_ROLES.has(user.role);

/** Is the user a Ramtal approver? */
export const isRamtal = (user: User): boolean => user.role === 'police_ramtal';

/** Is the user a Food Department reviewer? */
export const isFoodDept = (user: User): boolean => user.role === 'food_dept_reviewer';

/** Is the user in a read-only finance viewer role? */
export const isViewerOnly = (user: User): boolean => VIEWER_ROLES.has(user.role);

/** Can the user approve/reject daily report rows? (Ramtal, Food Dept, Admin) */
export const canApproveRows = (user: User): boolean => APPROVER_ROLES.has(user.role);

/** Can the user write/edit daily reports? (Suppliers + Admin) */
export const canEditReports = (user: User): boolean =>
  isSupplier(user) || isAdmin(user);

/** Can the user perform admin actions (reset, delete, toggle kitchens)? */
export const canPerformAdminActions = (user: User): boolean => isAdmin(user);

/** Can the user modify app_config (disabled kitchens, settings)? */
export const canModifyAppConfig = (user: User): boolean => isAdmin(user);

/** Can the user access a given tab? */
export type TabKey = 'supplier' | 'ramtal' | 'food_dept' | 'clock_sync' | 'admin';

export const getAllowedTabs = (role: UserRole): TabKey[] => {
  switch (role) {
    case 'supplier_reporter':
      return ['supplier'];
    case 'police_ramtal':
      return ['ramtal'];
    case 'food_dept_reviewer':
      return ['ramtal', 'food_dept', 'clock_sync'];
    case 'viewer_finance':
      return ['food_dept', 'clock_sync'];
    case 'system_admin':
    default:
      return ['supplier', 'ramtal', 'food_dept', 'clock_sync', 'admin'];
  }
};

/**
 * Check if a supplier user owns a specific kitchen (by supplierId match)
 */
export const supplierOwnsKitchen = (
  user: User,
  kitchenSupplierId: number
): boolean => {
  if (!isSupplier(user)) return false;
  return user.supplierId === kitchenSupplierId;
};
