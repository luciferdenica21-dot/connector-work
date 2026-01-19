import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken } from '../config/api';
import { chatsAPI, messagesAPI, ordersAPI, filesAPI } from '../config/api';
import { initSocket, getSocket, disconnectSocket } from '../config/socket';
import { 
  LogOut, Send, ChevronLeft, User, Mail, Phone, MapPin,
  Plus, Trash2, X, FileText, Info, Settings, MessageSquare, 
  CheckCircle, XCircle, Download, Paperclip, Bell, Search, Filter
} from 'lucide-react';

const ManagerPanel = ({ user }) => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState('all'); // all, unread, read
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('chats'); 
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showSettings, setShowSettings] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize socket
  useEffect(() => {
    if (user?._id) {
      initSocket(user._id, 'admin', user.email);
    }
    return () => disconnectSocket();
  }, [user]);

  // Load chats
  useEffect(() => {
    const loadChats = async () => {
      try {
        const data = await chatsAPI.getAll();
        setChats(data);
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    };

    loadChats();
    const interval = setInterval(loadChats, 5000); // Refresh every 5 seconds

    // Socket listener for new messages
    const socket = getSocket();
    if (socket) {
      const handleNewChatMessage = (data) => {
        loadChats(); // Reload chats when new message arrives
      };
      socket.on('new-chat-message', handleNewChatMessage);
      return () => {
        socket.off('new-chat-message', handleNewChatMessage);
        clearInterval(interval);
      };
    }

    return () => clearInterval(interval);
  }, []);

  // Load messages when active chat changes
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const msgs = await chatsAPI.getMessages(activeId);
        setMessages(msgs);
        // Mark as read
        await chatsAPI.markAsRead(activeId);
        // Update local chat state
        setChats(prev => prev.map(c => c.chatId === activeId ? { ...c, unread: false } : c));
        
        // Join socket room
        const socket = getSocket();
        if (socket) {
          socket.emit('join-chat', activeId);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();

    // Socket listener for new messages in this chat
    const socket = getSocket();
    if (socket) {
      const handleNewMessage = (newMsg) => {
        if (newMsg.chatId === activeId || newMsg.chatId?.toString() === activeId) {
          setMessages(prev => [...prev, newMsg]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      };

      socket.on('new-message', handleNewMessage);
      return () => {
        socket.off('new-message', handleNewMessage);
        if (socket) {
          socket.emit('leave-chat', activeId);
        }
      };
    }
  }, [activeId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [messages]);

  const [scripts, setScripts] = useState([
    { id: 1, title: 'Приветствие', text: 'Здравствуйте! Чем я могу вам помочь сегодня?' },
    { id: 2, title: 'Уточнение заказа', text: 'Подскажите, пожалуйста, номер вашего заказа для проверки статуса.' }
  ]);
  const [isAddingScript, setIsAddingScript] = useState(false);
  const [newScript, setNewScript] = useState({ title: '', text: '' });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const allOrders = useMemo(() => {
    const orders = [];
    chats.forEach(chat => {
      if (chat.orders && chat.orders.length > 0) {
        chat.orders.forEach((order, index) => orders.push({ 
          ...order, 
          userEmail: chat.userEmail,
          userInfo: chat.userInfo,
          chatId: chat.chatId,
          orderIndex: index 
        }));
      }
    });
    return orders;
  }, [chats]);

  const filteredChats = useMemo(() => {
    let filtered = chats;

    // Filter by status
    if (filterStatus === 'unread') {
      filtered = filtered.filter(c => c.unread);
    } else if (filterStatus === 'read') {
      filtered = filtered.filter(c => !c.unread);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.userEmail?.toLowerCase().includes(query) ||
        c.lastMessage?.toLowerCase().includes(query) ||
        c.userInfo?.firstName?.toLowerCase().includes(query) ||
        c.userInfo?.lastName?.toLowerCase().includes(query) ||
        c.userInfo?.phone?.toLowerCase().includes(query) ||
        c.userInfo?.city?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [chats, filterStatus, searchQuery]);

  const activeChat = useMemo(() => chats.find(c => c.chatId === activeId), [chats, activeId]);

  const unreadCount = useMemo(() => chats.filter(c => c.unread).length, [chats]);

  const executeSend = async (textOverride) => {
    const textToSend = textOverride || inputText;
    if (!activeId || !textToSend.trim()) return;
    
    try {
      const socket = getSocket();
      if (socket) {
        socket.emit('send-message', { chatId: activeId, text: textToSend });
      } else {
        await messagesAPI.send(activeId, textToSend);
        const msgs = await chatsAPI.getMessages(activeId);
        setMessages(msgs);
      }
      
      // Update local state
      setChats(prev => prev.map(c => c.chatId === activeId ? { ...c, lastMessage: textToSend, unread: false } : c));
      
      if (!textOverride) setInputText("");
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) { 
      console.error('Error sending message:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeId) return;

    setUploading(true);
    try {
      await filesAPI.upload(file, activeId);
      const msgs = await chatsAPI.getMessages(activeId);
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Ошибка загрузки файла');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const updateOrderStatus = async (chatId, orderIndex, status) => {
    try {
      await ordersAPI.updateStatus(chatId, orderIndex, status);
      // Reload chats to get updated orders
      const data = await chatsAPI.getAll();
      setChats(data);
      setIsOrderModalOpen(false); 
      setSelectedOrder(null);
    } catch (err) { 
      console.error("Ошибка обновления статуса:", err);
      alert('Ошибка обновления статуса заказа');
    }
  };

  const deleteOrder = async (chatId, orderIndex) => {
    if (!window.confirm("Удалить этот заказ безвозвратно?")) return;
    try {
      await ordersAPI.delete(chatId, orderIndex);
      // Reload chats
      const data = await chatsAPI.getAll();
      setChats(data);
      setIsOrderModalOpen(false);
      setSelectedOrder(null);
    } catch (err) { 
      console.error("Ошибка удаления заказа:", err);
      alert('Ошибка удаления заказа');
    }
  };

  const deleteMessage = async (msgId) => {
    if (!activeId || !window.confirm("Удалить это сообщение?")) return;
    // Note: Delete message endpoint would need to be added to API
    alert('Функция удаления сообщений будет доступна в следующей версии');
  };

  const downloadOrderPDF = () => {
    if (!selectedOrder) return;
    const printWindow = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>Order_${selectedOrder.userEmail}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            h1 { color: #38bdf8; border-bottom: 2px solid #38bdf8; padding-bottom: 10px; }
            .info { margin-bottom: 20px; }
            .label { font-weight: bold; color: #666; font-size: 12px; }
            .value { font-size: 16px; margin-bottom: 10px; }
            .services { display: flex; gap: 5px; flex-wrap: wrap; }
            .service-tag { background: #eee; padding: 5px 10px; border-radius: 4px; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>ДЕТАЛИ ЗАКАЗА</h1>
          <div class="info">
            <div class="label">КЛИЕНТ</div>
            <div class="value">${selectedOrder.userEmail}</div>
            ${selectedOrder.userInfo ? `
            <div class="label">ИМЯ И ФАМИЛИЯ</div>
            <div class="value">${selectedOrder.userInfo.firstName || ''} ${selectedOrder.userInfo.lastName || ''}</div>
            <div class="label">ТЕЛЕФОН</div>
            <div class="value">${selectedOrder.userInfo.phone || 'Не указан'}</div>
            <div class="label">ГОРОД</div>
            <div class="value">${selectedOrder.userInfo.city || 'Не указан'}</div>
            ` : ''}
            <div class="label">КОНТАКТ</div>
            <div class="value">${selectedOrder.contact}</div>
            <div class="label">СТАТУС</div>
            <div class="value">${selectedOrder.status === 'accepted' ? 'Принят' : selectedOrder.status === 'declined' ? 'Отклонен' : 'Ожидает'}</div>
            <div class="label">УСЛУГИ</div>
            <div class="services">
              ${selectedOrder.services?.map(s => `<span class="service-tag">${s}</span>`).join('')}
            </div>
            <div class="label" style="margin-top:20px">КОММЕНТАРИЙ</div>
            <div class="value">${selectedOrder.comment || "Нет комментария"}</div>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const deleteChat = async (id) => {
    if (!window.confirm("Удалить чат?")) return;
    // Note: Delete chat endpoint would need to be added to API
    alert('Функция удаления чатов будет доступна в следующей версии');
  };

  const addScript = () => {
    if (!newScript.title || !newScript.text) return;
    setScripts([...scripts, { ...newScript, id: Date.now() }]);
    setNewScript({ title: '', text: '' });
    setIsAddingScript(false);
  };

  const handleLogout = () => {
    removeToken();
    disconnectSocket();
    navigate('/');
  };

  const getFileUrl = (filename) => {
    return filesAPI.getFileUrl(filename);
  };

  const theme = {
    bg: '#020617', sidebar: '#0f172a', card: 'rgba(30, 41, 59, 0.5)',
    accent: '#38bdf8', border: 'rgba(56, 189, 248, 0.1)',
    textMain: '#f8fafc', textMuted: '#94a3b8', danger: '#ef4444', success: '#10b981'
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: theme.bg, color: theme.textMain, fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      
      {/* ЛЕВАЯ НАВИГАЦИЯ */}
      <div style={{ width: isMobile ? '60px' : '80px', background: '#020617', borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '20px', zIndex: 100 }}>
        <div style={{ width: '40px', height: '40px', background: theme.accent, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <User color="#000" size={24}/>
        </div>
        
        <button onClick={() => { setActiveTab('chats'); }} style={{ background: activeTab === 'chats' ? 'rgba(56, 189, 248, 0.1)' : 'transparent', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', color: activeTab === 'chats' ? theme.accent : theme.textMuted, position: 'relative' }}>
          <MessageSquare/>
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', background: theme.accent, borderRadius: '50%', border: `2px solid ${theme.sidebar}` }}></span>
          )}
        </button>
        
        <button onClick={() => { setActiveTab('orders'); setActiveId(null); }} style={{ background: activeTab === 'orders' ? 'rgba(56, 189, 248, 0.1)' : 'transparent', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', color: activeTab === 'orders' ? theme.accent : theme.textMuted }}>
          <FileText/>
        </button>
        
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'transparent', border: 'none', padding: '12px', color: theme.textMuted, cursor: 'pointer' }}>
          <Settings/>
        </button>
        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', padding: '12px', color: theme.danger, cursor: 'pointer' }}>
          <LogOut/>
        </button>
      </div>

      {/* ВТОРАЯ ПАНЕЛЬ */}
      <div style={{ 
        width: isMobile ? (activeId ? '0' : 'calc(100% - 60px)') : '400px', 
        display: isMobile && activeId ? 'none' : 'flex',
        background: theme.sidebar, 
        borderRight: `1px solid ${theme.border}`,
        flexDirection: 'column',
        transition: '0.3s ease'
      }}>
        <div style={{ padding: '24px', borderBottom: `1px solid ${theme.border}` }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: theme.accent, letterSpacing: '1px', marginBottom: '16px' }}>
            {activeTab === 'chats' ? 'ЧАТЫ' : 'ЗАКАЗЫ'}
          </h2>
          
          {/* Search and Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.textMuted }} />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: '100%', 
                  background: theme.bg, 
                  border: `1px solid ${theme.border}`, 
                  borderRadius: '10px', 
                  padding: '10px 12px 10px 36px', 
                  color: theme.textMain,
                  outline: 'none',
                  fontSize: '12px'
                }}
              />
            </div>
            
            {activeTab === 'chats' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setFilterStatus('all')}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    background: filterStatus === 'all' ? theme.accent : 'transparent',
                    border: `1px solid ${filterStatus === 'all' ? theme.accent : theme.border}`,
                    borderRadius: '8px',
                    color: filterStatus === 'all' ? '#000' : theme.textMuted,
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Все
                </button>
                <button
                  onClick={() => setFilterStatus('unread')}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    background: filterStatus === 'unread' ? theme.accent : 'transparent',
                    border: `1px solid ${filterStatus === 'unread' ? theme.accent : theme.border}`,
                    borderRadius: '8px',
                    color: filterStatus === 'unread' ? '#000' : theme.textMuted,
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: theme.accent, color: '#000', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      {unreadCount}
                    </span>
                  )}
                  Непрочитанные
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {activeTab === 'chats' ? (
            filteredChats.map(c => (
              <div 
                key={c.chatId} 
                onClick={() => setActiveId(c.chatId)} 
                style={{ 
                  padding: '16px', 
                  borderRadius: '16px', 
                  marginBottom: '12px', 
                  cursor: 'pointer', 
                  background: activeId === c.chatId ? 'rgba(56, 189, 248, 0.08)' : theme.card, 
                  border: `1px solid ${activeId === c.chatId ? theme.accent : 'transparent'}`,
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: theme.textMain }}>
                      {c.userInfo?.firstName && c.userInfo?.lastName 
                        ? `${c.userInfo.firstName} ${c.userInfo.lastName}`
                        : c.userEmail?.split('@')[0]}
                    </div>
                    {c.userInfo && (
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '11px', color: theme.textMuted }}>
                        {c.userInfo.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={12} />
                            {c.userInfo.phone}
                          </div>
                        )}
                        {c.userInfo.city && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} />
                            {c.userInfo.city}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {c.unread && (
                    <div style={{ width: '10px', height: '10px', background: theme.accent, borderRadius: '50%', flexShrink: 0, marginLeft: '8px' }}></div>
                  )}
                  <Trash2 
                    size={14} 
                    color={theme.danger} 
                    onClick={(e) => { e.stopPropagation(); deleteChat(c.chatId); }}
                    style={{ cursor: 'pointer', marginLeft: '8px' }}
                  />
                </div>
                <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.lastMessage}
                </div>
                {c.orders && c.orders.length > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '10px', color: theme.accent, fontWeight: 600 }}>
                    {c.orders.length} заказ(ов)
                  </div>
                )}
              </div>
            ))
          ) : (
            allOrders.map((order, idx) => (
              <div 
                key={idx} 
                onClick={() => { setActiveTab('chats'); setActiveId(order.chatId); }} 
                style={{ 
                  padding: '16px', 
                  background: theme.card, 
                  borderRadius: '16px', 
                  marginBottom: '12px', 
                  cursor: 'pointer', 
                  border: `1px solid ${theme.border}`, 
                  position: 'relative' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: order.status === 'accepted' ? theme.success : order.status === 'declined' ? theme.danger : theme.textMuted }} />
                  <div style={{ fontSize: '13px', fontWeight: 700, color: theme.accent }}>{order.userEmail}</div>
                </div>
                <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px' }}>
                  {order.services?.length} услуг(и) • {order.status === 'accepted' ? 'Принят' : order.status === 'declined' ? 'Отклонен' : 'Ожидает'}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setIsOrderModalOpen(true); }}
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: theme.textMuted, cursor: 'pointer' }}
                >
                  <Info size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ТРЕТЬЯ ПАНЕЛЬ - CHAT MESSAGES */}
      <div style={{ flex: 1, display: isMobile && !activeId ? 'none' : 'flex', flexDirection: 'column', position: 'relative' }}>
        {activeId && activeChat ? (
          <>
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '15px' }}>
              {isMobile && <ChevronLeft onClick={() => setActiveId(null)} style={{ cursor: 'pointer' }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '16px' }}>
                  {activeChat.userInfo?.firstName && activeChat.userInfo?.lastName 
                    ? `${activeChat.userInfo.firstName} ${activeChat.userInfo.lastName}`
                    : activeChat.userEmail}
                </div>
                <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={12} />
                    {activeChat.userEmail}
                  </div>
                  {activeChat.userInfo?.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} />
                      {activeChat.userInfo.phone}
                    </div>
                  )}
                  {activeChat.userInfo?.city && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} />
                      {activeChat.userInfo.city}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Активен</div>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map(m => {
                const isManager = m.senderId === 'manager';
                return (
                  <div key={m._id || m.id} style={{ alignSelf: isManager ? 'flex-end' : 'flex-start', maxWidth: '80%', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', flexDirection: isManager ? 'row-reverse' : 'row' }}>
                      <div style={{ 
                        padding: '12px 16px', 
                        borderRadius: '14px', 
                        fontSize: '14px', 
                        background: isManager ? theme.accent : theme.card, 
                        color: isManager ? '#000' : '#fff'
                      }}>
                        <div>{m.text}</div>
                        {m.attachments && m.attachments.length > 0 && (
                          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {m.attachments.map((att, idx) => (
                              <a
                                key={idx}
                                href={getFileUrl(att.filename)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  color: isManager ? '#0066cc' : theme.accent,
                                  textDecoration: 'underline',
                                  fontSize: '12px'
                                }}
                              >
                                <Download size={14} />
                                {att.originalName || att.filename}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      {!isManager && (
                        <button 
                          onClick={() => deleteMessage(m._id || m.id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.3, padding: '4px' }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.3'}
                        >
                          <Trash2 size={12} color={theme.danger} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '10px 20px', display: 'flex', gap: '10px', overflowX: 'auto', background: 'rgba(0,0,0,0.2)' }}>
              {scripts.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => executeSend(s.text)} 
                  style={{ 
                    background: theme.card, 
                    border: `1px solid ${theme.border}`, 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    fontSize: '11px', 
                    color: theme.accent, 
                    whiteSpace: 'nowrap', 
                    cursor: 'pointer' 
                  }}
                >
                  {s.title}
                </button>
              ))}
            </div>

            <div style={{ padding: '20px', background: theme.sidebar, borderTop: `1px solid ${theme.border}`, display: 'flex', gap: '12px' }}>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                accept="*/*"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  background: 'transparent',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  color: uploading ? theme.textMuted : theme.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Прикрепить файл"
              >
                {uploading ? (
                  <div style={{ width: '20px', height: '20px', border: `2px solid ${theme.accent}`, borderTop: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                ) : (
                  <Paperclip size={20} />
                )}
              </button>
              <input 
                value={inputText} 
                onChange={e => setInputText(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && !e.shiftKey && executeSend()} 
                placeholder="Введите сообщение..." 
                style={{ 
                  flex: 1, 
                  background: theme.bg, 
                  border: `1px solid ${theme.border}`, 
                  color: '#fff', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  outline: 'none' 
                }} 
              />
              <button 
                onClick={() => executeSend()} 
                style={{ 
                  background: theme.accent, 
                  border: 'none', 
                  width: '45px', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Send size={20} color="#000" />
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted }}>
            {activeTab === 'chats' ? 'Выберите чат для начала работы' : 'Выберите заказ для перехода к переписке'}
          </div>
        )}
      </div>

      {/* ПАНЕЛЬ НАСТРОЕК */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={() => setShowSettings(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }} />
          <div style={{ width: isMobile ? '100%' : '400px', background: theme.sidebar, position: 'relative', height: '100%', padding: '30px', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: theme.accent }}>НАСТРОЙКИ АДМИНА</h3>
              <X onClick={() => setShowSettings(false)} style={{ cursor: 'pointer' }} />
            </div>
            
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', color: theme.textMuted, fontWeight: 700 }}>УПРАВЛЕНИЕ СКРИПТАМИ</span>
                <Plus size={18} color={theme.accent} onClick={() => setIsAddingScript(!isAddingScript)} style={{ cursor: 'pointer' }} />
              </div>

              {isAddingScript && (
                <div style={{ background: theme.bg, padding: '16px', borderRadius: '16px', marginBottom: '20px', border: `1px solid ${theme.accent}44` }}>
                  <input 
                    placeholder="Название скрипта" 
                    value={newScript.title} 
                    onChange={e => setNewScript({...newScript, title: e.target.value})} 
                    style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${theme.border}`, color: '#fff', marginBottom: '15px', padding: '8px 0' }} 
                  />
                  <textarea 
                    placeholder="Текст ответа..." 
                    value={newScript.text} 
                    onChange={e => setNewScript({...newScript, text: e.target.value})} 
                    style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', height: '80px', resize: 'none' }} 
                  />
                  <button 
                    onClick={addScript} 
                    style={{ width: '100%', background: theme.accent, border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', marginTop: '10px' }}
                  >
                    СОХРАНИТЬ
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {scripts.map(s => (
                  <div key={s.id} style={{ padding: '16px', background: theme.card, borderRadius: '12px', border: `1px solid ${theme.border}`, position: 'relative' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: theme.accent, marginBottom: '5px' }}>{s.title}</div>
                    <div style={{ fontSize: '12px', color: theme.textMuted }}>{s.text}</div>
                    <Trash2 
                      size={14} 
                      color={theme.danger} 
                      style={{ position: 'absolute', top: '16px', right: '16px', cursor: 'pointer' }} 
                      onClick={() => setScripts(scripts.filter(x => x.id !== s.id))} 
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* МОДАЛКА ДЕТАЛЕЙ ЗАКАЗА */}
      {isOrderModalOpen && selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '500px', background: '#0a0a0a', borderRadius: '24px', border: `1px solid ${theme.accent}33`, overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '14px' }}>ДЕТАЛИ ЗАКАЗА</span>
                <Download size={18} color={theme.accent} onClick={downloadOrderPDF} style={{ cursor: 'pointer' }} title="Скачать PDF" />
                <Trash2 size={18} color={theme.danger} onClick={() => deleteOrder(selectedOrder.chatId, selectedOrder.orderIndex)} style={{ cursor: 'pointer' }} title="Удалить заказ" />
              </div>
              <X onClick={() => setIsOrderModalOpen(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => updateOrderStatus(selectedOrder.chatId, selectedOrder.orderIndex, 'accepted')}
                  style={{ flex: 1, background: selectedOrder.status === 'accepted' ? theme.success : 'transparent', border: `1px solid ${theme.success}`, color: selectedOrder.status === 'accepted' ? '#000' : theme.success, padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
                >
                  <CheckCircle size={18}/> ПРИНЯТЬ
                </button>
                <button 
                  onClick={() => updateOrderStatus(selectedOrder.chatId, selectedOrder.orderIndex, 'declined')}
                  style={{ flex: 1, background: selectedOrder.status === 'declined' ? theme.danger : 'transparent', border: `1px solid ${theme.danger}`, color: selectedOrder.status === 'declined' ? '#fff' : theme.danger, padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
                >
                  <XCircle size={18}/> ОТКЛОНИТЬ
                </button>
              </div>
              
              <div style={{ height: '1px', background: theme.border }} />

              <div><label style={{ fontSize: '10px', color: theme.textMuted }}>КЛИЕНТ</label><div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedOrder.userEmail}</div></div>
              
              {selectedOrder.userInfo && (
                <>
                  {(selectedOrder.userInfo.firstName || selectedOrder.userInfo.lastName) && (
                    <div><label style={{ fontSize: '10px', color: theme.textMuted }}>ИМЯ И ФАМИЛИЯ</label><div>{selectedOrder.userInfo.firstName} {selectedOrder.userInfo.lastName}</div></div>
                  )}
                  {selectedOrder.userInfo.phone && (
                    <div><label style={{ fontSize: '10px', color: theme.textMuted }}>ТЕЛЕФОН</label><div>{selectedOrder.userInfo.phone}</div></div>
                  )}
                  {selectedOrder.userInfo.city && (
                    <div><label style={{ fontSize: '10px', color: theme.textMuted }}>ГОРОД</label><div>{selectedOrder.userInfo.city}</div></div>
                  )}
                </>
              )}
              
              <div>
                <label style={{ fontSize: '10px', color: theme.textMuted }}>УСЛУГИ</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {selectedOrder.services?.map((s, i) => (
                    <span key={i} style={{ background: 'rgba(56, 189, 248, 0.1)', color: theme.accent, padding: '4px 10px', borderRadius: '6px', fontSize: '11px' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div><label style={{ fontSize: '10px', color: theme.textMuted }}>ИМЯ</label><div>{selectedOrder.firstName}</div></div>
                <div><label style={{ fontSize: '10px', color: theme.textMuted }}>ФАМИЛИЯ</label><div>{selectedOrder.lastName}</div></div>
              </div>
              <div><label style={{ fontSize: '10px', color: theme.textMuted }}>КОНТАКТ</label><div>{selectedOrder.contact}</div></div>
              <div><label style={{ fontSize: '10px', color: theme.textMuted }}>КОММЕНТАРИЙ</label><div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', fontSize: '13px' }}>{selectedOrder.comment || "Нет комментария"}</div></div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ManagerPanel;