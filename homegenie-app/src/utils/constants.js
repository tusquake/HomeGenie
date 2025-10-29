// constants.js
export const API_BASE_USER = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8081/api';
export const API_BASE_MAINTENANCE = import.meta.env.VITE_MAINTENANCE_SERVICE_URL || 'http://localhost:8082/api';

export const PRIORITY_COLORS = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-300',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
    MODERATE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    LOW: 'bg-green-100 text-green-800 border-green-300'
};

export const CATEGORY_ICONS = {
    PLUMBING: '🚰',
    ELECTRICAL: '⚡',
    CLEANING: '🧹',
    SECURITY: '🔒',
    CARPENTRY: '🔨',
    PAINTING: '🎨',
    HVAC: '❄️',
    OTHERS: '📦'
};

export const TECHNICIANS = [
    { id: 2, name: 'Rajesh Kumar', specialty: 'Plumber' },
    { id: 3, name: 'Amit Sharma', specialty: 'Electrician' },
    { id: 4, name: 'Vikram Patel', specialty: 'Cleaner' },
    { id: 5, name: 'Suresh Reddy', specialty: 'Carpenter' },
    { id: 6, name: 'Arjun Mehta', specialty: 'HVAC Technician' }
];