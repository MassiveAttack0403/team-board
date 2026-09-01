// Version: 0.4.0
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const getMembers = () => api.get('/members').then(r => r.data);
export const getTasks = () => api.get('/tasks').then(r => r.data);
export const getAbsences = () => api.get('/absences').then(r => r.data);
export const getStandups = () => api.get('/standups').then(r => r.data);

export const createTask = (payload) => api.post('/tasks', payload).then(r => r.data);
export const moveTask = (id, payload) => api.patch(`/tasks/${id}/move`, payload).then(r => r.data);
export const updateTask = (id, payload) => api.patch(`/tasks/${id}`, payload).then(r => r.data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`).then(r => r.data);

export const createAbsence = (payload) => api.post('/absences', payload).then(r => r.data);
export const deleteAbsence = (id) => api.delete(`/absences/${id}`).then(r => r.data);

export const createMember = (payload) => api.post('/members', payload).then(r => r.data);
export const deleteMember = (id) => api.delete(`/members/${id}`).then(r => r.data);

export const createStandup = (payload) => api.post('/standups', payload).then(r => r.data);

export const getPlan = (from, to) => api.get('/plan', { params: { from, to } }).then(r => r.data);
export const getHolidays = (from, to) => api.get('/plan/holidays', { params: { from, to } }).then(r => r.data);
export const setPlanEntry = (memberId, date, data) => api.put(`/plan/${memberId}/${date}`, data).then(r => r.data);
export const deletePlanEntry = (memberId, date) => api.delete(`/plan/${memberId}/${date}`).then(r => r.data);
