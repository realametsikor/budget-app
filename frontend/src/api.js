import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://budget-app-backend-gn8r.onrender.com/api',
});
