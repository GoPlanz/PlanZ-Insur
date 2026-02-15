export const STORAGE_KEYS = {
  USER_PROFILE: 'wtg_user_profile',
  LAST_UPDATED: 'wtg_last_updated',
  REPORTS: 'wtg_reports',
  REF_INVITE_ID: 'wtg_ref_invite_id',
  REF_INVITE_COMPLETED: 'wtg_ref_invite_completed',
} as const;

export function clearAllUserData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.LAST_UPDATED);
  } catch (error) {
    console.error('Failed to clear user data from localStorage:', error);
  }
}

export function clearAllLocalStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear all localStorage:', error);
  }
}
