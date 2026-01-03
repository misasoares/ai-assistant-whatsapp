import { useState } from 'react';
import api from './api/axios';
import './App.css';

interface Message {
  id: string;
  pushName: string;
  message: {
    conversation?: string;
    imageMessage?: any;
    videoMessage?: any;
    extendedTextMessage?: any;
  };
  messageTimestamp: number;
  key: {
    fromMe: boolean;
    remoteJid: string;
    id: string;
  };
}

interface Chat {
  user: string;
  remoteJid: string;
  profilePicUrl?: string;
  messages: Message[];
}

function App() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [instanceName, setInstanceName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [fetchingMessages, setFetchingMessages] = useState(false);

  const handleGenerateQR = async () => {
    setLoading(true);
    setError(null);
    setQrCode(null);
    try {
      const response = await api.post('/evolution/create-instance', {
        instanceName: instanceName || `user-${Math.floor(Math.random() * 1000)}`,
      });

      if (response.data?.qrcode?.base64) {
        setQrCode(response.data.qrcode.base64);
      } else {
        setError('QR Code not returned from API');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate QR Code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentMessages = async () => {
    if (!instanceName) {
      setError('Please provide an instance name to fetch messages');
      return;
    }
    setFetchingMessages(true);
    setError(null);
    try {
      const response = await api.get(`/evolution/messages/recent/${instanceName}`);
      setRecentChats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
      console.error(err);
    } finally {
      setFetchingMessages(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageText = (msg: Message) => {
    if (msg.message?.conversation) return msg.message.conversation;
    if (msg.message?.extendedTextMessage?.text) return msg.message.extendedTextMessage.text;
    if (msg.message?.imageMessage) return '📷 Photo';
    if (msg.message?.videoMessage) return '🎥 Video';
    return 'Unsupported message type';
  };

  return (
    <div className="container">
      <header className="header">
        <h1>WhatsApp AI Assistant</h1>
        <p>Connect your WhatsApp to start using the AI agent</p>
      </header>

      <main className="main-content">
        <div className="card">
          <h2>Connection Setup</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="Instance Name (e.g. user-423)"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              className="name-input"
            />
            <button 
              onClick={handleGenerateQR} 
              disabled={loading}
              className="generate-btn"
            >
              {loading ? 'Generating...' : 'Generate QR Code'}
            </button>
          </div>

          <div className="fetch-chats-container">
            <button 
              onClick={loadRecentMessages} 
              disabled={fetchingMessages || !instanceName}
              className="fetch-btn"
            >
              {fetchingMessages ? 'Loading Messages...' : 'Load Recent 5 Messages from 5 Users'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="qr-container">
            {qrCode ? (
              <div className="qr-display">
                <p>Scan this QR Code with your WhatsApp:</p>
                <img src={qrCode} alt="WhatsApp QR Code" className="qr-image" />
                <button onClick={() => setQrCode(null)} className="clear-btn">Clear</button>
              </div>
            ) : (
              !loading && !recentChats.length && <div className="qr-placeholder">No QR Code generated / Chats loaded</div>
            )}
            {loading && <div className="loader"></div>}
          </div>
        </div>

        {recentChats.length > 0 && (
          <div className="chats-section">
            <h2>Recent Conversations</h2>
            {recentChats.map((chat) => (
              <div key={chat.remoteJid} className="chat-card">
                <div className="chat-header">
                  <div className="avatar">
                    {chat.profilePicUrl ? (
                      <img src={chat.profilePicUrl} alt={chat.user} />
                    ) : (
                      chat.user.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="user-info">
                    <h3>{chat.user}</h3>
                    <p>{chat.remoteJid}</p>
                  </div>
                </div>
                <div className="messages-list">
                  {chat.messages.slice(0).reverse().map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`message-bubble ${msg.key.fromMe ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        {getMessageText(msg)}
                      </div>
                      <span className="message-time">
                        {formatTimestamp(msg.messageTimestamp)}
                      </span>
                    </div>
                  ))}
                  {chat.messages.length === 0 && <p className="qr-placeholder">No messages found for this chat.</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2026 AI Assistant WhatsApp</p>
      </footer>
    </div>
  );
}

export default App;
