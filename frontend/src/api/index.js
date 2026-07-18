import axios from 'axios'
const api = axios.create({ baseURL: '/api' })
export const getWords = (q) => api.get('/words', { params: q ? { q } : {} })
export const addWord = (data) => api.post('/words', data)
export const deleteWord = (id) => api.delete('/words/' + id)
export const getPracticeWords = (limit=10) => api.get('/words/practice',{params:{limit}})
export const reviewWord = (id, quality) => api.patch('/words/'+id+'/review',{quality})
export const getStats = () => api.get('/words/stats')
export default api
