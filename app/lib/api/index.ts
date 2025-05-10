// Re-export API modules
import { getImageUrlWithSize } from './apiClient';

// Re-export all API services
export { authAPI } from './auth';
export { userAPI } from './user';
export { presentationsAPI } from './presentations';
export { designsAPI } from './designs';
export { foldersAPI } from './folders';
export { assetsAPI } from './assets';

// Re-export the image URL utility function
export { getImageUrlWithSize };