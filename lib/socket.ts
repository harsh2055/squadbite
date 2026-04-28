import { io, Socket } from 'socket.io-client';


class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      this.socket = io(backendUrl);
    }
    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
