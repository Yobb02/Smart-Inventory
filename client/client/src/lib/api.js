import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('sims_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const saveSession = data => { localStorage.setItem('sims_token', data.token); localStorage.setItem('sims_user', JSON.stringify(data.user)); };
export const user = () => JSON.parse(localStorage.getItem('sims_user') || 'null');
export const logout = () => { localStorage.removeItem('sims_token'); localStorage.removeItem('sims_user'); };
export async function downloadReport() {
  const response = await api.get('/dashboard/report.csv', { responseType: 'blob' });
  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'smart-inventory-report.csv';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
