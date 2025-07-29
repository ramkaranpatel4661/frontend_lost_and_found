// frontend/src/utils/socket.js
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'https://backend-lost-found.onrender.com', {
  auth: {
    token: localStorage.getItem('token') // or however you store your JWT
  },
  transports: ['websocket'],
  withCredentials: true
});

export { socket };
