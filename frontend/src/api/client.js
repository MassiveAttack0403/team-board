// Version: 0.6.0
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const getMembers = () => api.get('/members').then(r => r.data);
export const getTasks = () => api.get('/tasks').then(r => r.data);
export const getAbsences = () => api.get('/absences').then(r => r.data);
export const getStandups = () => api.get('/standups').then(r => r.data);

export const createTask = (payload) => api.post('/tasks', payload).then(r => r.data);
export const copyTask = (id, payload) => api.post(`/tasks/${id}/copy`, payload).then(r => r.data);
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
export const setPlanRange = (payload) => api.post('/plan/range', payload).then(r => r.data);
export const deletePlanEntry = (memberId, date) => api.delete(`/plan/${memberId}/${date}`).then(r => r.data);
export const importPlanCsv = (payload) => api.post('/plan/import-csv', payload).then(r => r.data);

export const getPartners = () => api.get('/partners').then(r => r.data);
export const createPartner = (payload) => api.post('/partners', payload).then(r => r.data);
export const updatePartner = (id, payload) => api.patch(`/partners/${id}`, payload).then(r => r.data);
export const deletePartner = (id) => api.delete(`/partners/${id}`).then(r => r.data);
