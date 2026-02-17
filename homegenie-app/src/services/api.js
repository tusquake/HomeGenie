import { API_BASE_MAINTENANCE, API_BASE_USER } from '../utils/constants';

export const fetchRequests = async (authFetch, user) => {
    const endpoint = user.role === 'ADMIN'
        ? `${API_BASE_MAINTENANCE}/maintenance`
        : user.role === 'TECHNICIAN'
            ? `${API_BASE_MAINTENANCE}/maintenance/technician/${user.userId}`
            : `${API_BASE_MAINTENANCE}/maintenance/user/${user.userId}`;

    const res = await authFetch(endpoint);
    if (!res.ok) throw new Error('Failed to load requests');

    const data = await res.json();
    return Array.isArray(data) ? data : data.content || [];
};

export const fetchStatistics = async (authFetch) => {
    const res = await authFetch(`${API_BASE_MAINTENANCE}/maintenance/statistics`);
    if (!res.ok) throw new Error('Failed to load statistics');
    return res.json();
};

export const fetchTechnicians = async (authFetch) => {
    const res = await authFetch(`${API_BASE_MAINTENANCE}/maintenance/technicians`);
    if (!res.ok) throw new Error('Failed to load technicians');
    return res.json();
};

export const createRequest = async (authFetch, userId, requestData) => {
    const res = await authFetch(`${API_BASE_MAINTENANCE}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': userId.toString() },
        body: JSON.stringify(requestData)
    });
    if (!res.ok) throw new Error('Failed to create request');
    return res.json();
};

export const updateRequest = async (authFetch, requestId, updateData) => {
    const res = await authFetch(`${API_BASE_MAINTENANCE}/maintenance/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
    });
    if (!res.ok) throw new Error('Failed to update request');
    return res.json();
};

export const deleteRequest = async (authFetch, requestId) => {
    const res = await authFetch(`${API_BASE_MAINTENANCE}/maintenance/${requestId}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete request');
};

export const fetchAllUsers = async (authFetch) => {
    const res = await authFetch(`${API_BASE_USER}/users`);
    if (!res.ok) throw new Error('Failed to load users');
    return res.json();
};
