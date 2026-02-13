
import { NetworkMessage } from '../types';

declare global {
  interface Window {
    Peer: any;
  }
}

class NetworkService {
  private peer: any = null;
  private connections: any[] = [];
  private onMessageCallback: ((msg: NetworkMessage) => void) | null = null;
  private myPeerId: string = '';
  private isHost: boolean = false;

  // Initialize Peer
  private initPeer(id: string | null): Promise<string> {
    return new Promise((resolve, reject) => {
      const peerId = id ? `absolute-cinema-${id}` : undefined;
      
      // Use public STUN servers to ensure connectivity over internet
      const config = {
        debug: 1,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        }
      };

      this.peer = new window.Peer(peerId, config);

      this.peer.on('open', (id: string) => {
        this.myPeerId = id;
        console.log('My Peer ID:', id);
        resolve(id);
      });

      this.peer.on('error', (err: any) => {
        console.error('Peer error:', err);
        // Only reject if we are still initializing. 
        // If error happens later (like connection lost), we handle it elsewhere.
        if (!this.myPeerId) {
             reject(err);
        }
      });

      // Handle incoming connections (If I am Host)
      this.peer.on('connection', (conn: any) => {
        this.setupConnection(conn);
      });
    });
  }

  // Setup data listeners for a connection
  private setupConnection(conn: any) {
    this.connections.push(conn);
    
    conn.on('data', (data: NetworkMessage) => {
      console.log('Received:', data);
      
      if (this.onMessageCallback) {
        this.onMessageCallback(data);
      }

      // If I am Host, I need to relay this message to everyone else (Broadcast)
      if (this.isHost) {
        this.broadcast(data, conn.peer);
      }
    });

    conn.on('close', () => {
      this.connections = this.connections.filter(c => c !== conn);
      // Optional: Notify others that a player left?
    });
    
    conn.on('error', (err: any) => {
        console.error("Connection error:", err);
        this.connections = this.connections.filter(c => c !== conn);
    });
  }

  // Send to everyone (Host function)
  private broadcast(msg: NetworkMessage, excludePeerId?: string) {
    this.connections.forEach(conn => {
        if (conn.peer !== excludePeerId && conn.open) {
            conn.send(msg);
        }
    });
  }

  // --- Public Methods ---

  // Special Host Init
  async startHosting(roomCode: string, onMessage: (msg: NetworkMessage) => void): Promise<boolean> {
      this.disconnect(); // Clear previous session if any
      this.isHost = true;
      this.onMessageCallback = onMessage;
      try {
        await this.initPeer(roomCode);
        return true;
      } catch (e) {
        console.error("Hosting failed", e);
        return false;
      }
  }

  // Special Join Init
  async joinRoom(roomCode: string, onMessage: (msg: NetworkMessage) => void): Promise<boolean> {
      this.disconnect(); // Clear previous session if any
      this.isHost = false;
      this.onMessageCallback = onMessage;
      try {
          // Init myself with random ID first
          await this.initPeer(null); 
          
          return new Promise((resolve) => {
              console.log(`Connecting to absolute-cinema-${roomCode}...`);
              const conn = this.peer.connect(`absolute-cinema-${roomCode}`, { reliable: true });
              
              // Set a timeout for connection
              const timeout = setTimeout(() => {
                  console.error("Connection timeout");
                  resolve(false);
              }, 5000);

              conn.on('open', () => {
                  clearTimeout(timeout);
                  this.setupConnection(conn);
                  console.log("Connected to Host!");
                  resolve(true);
              });
              
              conn.on('error', (err: any) => {
                  clearTimeout(timeout);
                  console.error("Connection failed", err);
                  resolve(false);
              });

              // Also listen to peer-level errors that might indicate target doesn't exist
              this.peer.on('error', (err: any) => {
                  if (err.type === 'peer-unavailable') {
                      clearTimeout(timeout);
                      console.error("Room not found");
                      resolve(false);
                  }
              });
          });
      } catch (e) {
          console.error("Join failed initialization", e);
          return false;
      }
  }

  send(msg: NetworkMessage) {
    this.connections.forEach(conn => {
        if (conn.open) conn.send(msg);
    });
  }

  disconnect() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
      this.connections = [];
      this.myPeerId = '';
    }
  }
}

export const network = new NetworkService();
