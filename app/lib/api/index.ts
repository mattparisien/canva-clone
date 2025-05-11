// Export all API modules from this central location
export * from './apiClient';
export * from './templates';
// Add other API exports as needed

// Re-export all API services
export { authAPI } from './auth';
export { userAPI } from './user';
export { presentationsAPI } from './presentations';
export { designsAPI } from './designs';
export { foldersAPI } from './folders';
export { assetsAPI } from './assets';