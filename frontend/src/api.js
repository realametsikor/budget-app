import axios from 'axios';
import { supabase } from './supabaseClient';

export const api = axios.create({
    baseURL: 'https://budget-app-backend-gn8r.onrender.com/api',
});

// Intercept every request and attach the Supabase token
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});
