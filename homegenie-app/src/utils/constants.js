const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export const API_BASE_USER = `${API_GATEWAY_URL}/api`;
export const API_BASE_MAINTENANCE = `${API_GATEWAY_URL}/api`;

export const PRIORITY_COLORS = {
    LOW: '#10B981',
    MODERATE: '#F59E0B',
    HIGH: '#EF4444',
    CRITICAL: '#7C3AED'
};

export const CATEGORY_ICONS = {
    PLUMBING: '🔧',
    ELECTRICAL: '⚡',
    CLEANING: '🧹',
    SECURITY: '🔒',
    CARPENTRY: '🪚',
    PAINTING: '🎨',
    HVAC: '❄️',
    OTHERS: '📋'
};