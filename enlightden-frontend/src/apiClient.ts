import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://localhost:5203', // Your backend's base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
