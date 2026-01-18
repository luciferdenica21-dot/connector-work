import React, { useState, useEffect, useMemo } from 'react';
import { db, auth } from '../firebase'; 
import { 
  collection, query, onSnapshot, doc, 
  updateDoc, addDoc, orderBy, 
  serverTimestamp, deleteDoc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Send, ChevronLeft, User, Mail, 
  Plus, Trash2, X, FileText, Info, Settings, MessageSquare, CheckCircle, XCircle, Download
} from 'lucide-react';

const ManagerPanel = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  
  const [activeTab, setActiveTab] = useState('chats'); 
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      if (chat.orders) {
        chat.orders.forEach((order, index) => orders.push({ 
          ...order, 
          userEmail: chat.userEmail, 
          chatId: chat.chatId,
          orderIndex: index 
        }));
      }
    });
    return orders;
  }, [chats]);

  useEffect(() => {
    const qChats = query(collection(db, "chats"), orderBy("lastUpdate", "desc"));
    const unsubChats = onSnapshot(qChats, (snap) => {
      setChats(snap.docs.map(doc => ({ ...doc.data(), chatId: doc.id })));
    });
    return () => unsubChats();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const qMsgs = query(collection(db, "chats", activeId, "messages"), orderBy("createdAt", "asc"));
    const unsubMsgs = onSnapshot(qMsgs, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubMsgs();
  }, [activeId]);

  const activeChat = useMemo(() => chats.find(c => c.chatId === activeId), [chats, activeId]);

  const executeSend = async (textOverride) => {
    const textToSend = textOverride || inputText;
    if (!activeId || !textToSend.trim()) return;
    try {
      await addDoc(collection(db, "chats", activeId, "messages"), {
        text: textToSend, senderId: 'manager', createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, "chats", activeId), { lastMessage: textToSend, lastUpdate: serverTimestamp(), unread: false });
      if (!textOverride) setInputText("");
    } catch (err) { console.error(err); }
  };

  const updateOrderStatus = async (chatId, orderIndex, status) => {
    const chatRef = doc(db, "chats", chatId);
    const chatData = chats.find(c => c.chatId === chatId);
    if (!chatData) return;

    const updatedOrders = [...chatData.orders];
    updatedOrders[orderIndex] = { ...updatedOrders[orderIndex], status: status };

    try {
      await updateDoc(chatRef, { orders: updatedOrders });
      setIsOrderModalOpen(false); 
      setSelectedOrder(null);
    } catch (err) { console.error("Ошибка обновления статуса:", err); }
  };

  const deleteOrder = async (chatId, orderIndex) => {
    if (!window.confirm("Удалить этот заказ безвозвратно?")) return;
    const chatRef = doc(db, "chats", chatId);
    const chatData = chats.find(c => c.chatId === chatId);
    if (!chatData) return;

    const updatedOrders = chatData.orders.filter((_, idx) => idx !== orderIndex);
    try {
      await updateDoc(chatRef, { orders: updatedOrders });
      setIsOrderModalOpen(false);
      setSelectedOrder(null);
    } catch (err) { console.error("Ошибка удаления заказа:", err); }
  };

  const deleteMessage = async (msgId) => {
    if (!activeId || !window.confirm("Удалить это сообщение?")) return;
    try {
      await deleteDoc(doc(db, "chats", activeId, "messages", msgId));
    } catch (err) { console.error("Ошибка удаления сообщения:", err); }
  };

  const downloadOrderPDF = () => {
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
            <div class="label">ИМЯ И ФАМИЛИЯ</div>
            <div class="value">${selectedOrder.firstName} ${selectedOrder.lastName}</div>
            <div class="label">КОНТАКТ</div>
            <div class="value">${selectedOrder.contact}</div>
            <div class="label">СТАТУС</div>
            <div class="value">${selectedOrder.status || 'Ожидает'}</div>
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
    if (window.confirm("Удалить чат?")) await deleteDoc(doc(db, "chats", id));
  };

  const addScript = () => {
    if (!newScript.title || !newScript.text) return;
    setScripts([...scripts, { ...newScript, id: Date.now() }]);
    setNewScript({ title: '', text: '' });
    setIsAddingScript(false);
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
        <div style={{ width: '40px', height: '40px', background: theme.accent, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}><User color="#000" size={24}/></div>
        
        <button onClick={() => { setActiveTab('chats'); }} style={{ background: activeTab === 'chats' ? 'rgba(56, 189, 248, 0.1)' : 'transparent', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', color: activeTab === 'chats' ? theme.accent : theme.textMuted }}><MessageSquare/></button>
        
        <button onClick={() => { setActiveTab('orders'); setActiveId(null); }} style={{ background: activeTab === 'orders' ? 'rgba(56, 189, 248, 0.1)' : 'transparent', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', color: activeTab === 'orders' ? theme.accent : theme.textMuted }}><FileText/></button>
        
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'transparent', border: 'none', padding: '12px', color: theme.textMuted, cursor: 'pointer' }}><Settings/></button>
        <button onClick={() => signOut(auth)} style={{ background: 'transparent', border: 'none', padding: '12px', color: theme.danger, cursor: 'pointer' }}><LogOut/></button>
      </div>

      {/* ВТОРАЯ ПАНЕЛЬ */}
      <div style={{ 
        width: isMobile ? (activeId ? '0' : 'calc(100% - 60px)') : '350px', 
        display: isMobile && activeId ? 'none' : 'flex',
        background: theme.sidebar, 
        borderRight: `1px solid ${theme.border}`,
        flexDirection: 'column',
        transition: '0.3s ease'
      }}>
        <div style={{ padding: '24px', borderBottom: `1px solid ${theme.border}` }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: theme.accent, letterSpacing: '1px' }}>
            {activeTab === 'chats' ? 'ЧАТЫ' : 'ЗАКАЗЫ'}
          </h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {activeTab === 'chats' ? (
            chats.map(c => (
              <div key={c.chatId} onClick={() => setActiveId(c.chatId)} style={{ padding: '16px', borderRadius: '16px', marginBottom: '12px', cursor: 'pointer', background: activeId === c.chatId ? 'rgba(56, 189, 248, 0.08)' : theme.card, border: `1px solid ${activeId === c.chatId ? theme.accent : 'transparent'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{c.userEmail?.split('@')[0]}</span>
                  <Trash2 size={14} color={theme.danger} onClick={(e) => { e.stopPropagation(); deleteChat(c.chatId); }} />
                </div>
                <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage}</div>
              </div>
            ))
          ) : (
            allOrders.map((order, idx) => (
              <div key={idx} onClick={() => { setSelectedOrder(order); setIsOrderModalOpen(true); }} style={{ padding: '16px', background: theme.card, borderRadius: '16px', marginBottom: '12px', cursor: 'pointer', border: `1px solid ${theme.border}`, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: order.status === 'accepted' ? theme.success : order.status === 'declined' ? theme.danger : theme.textMuted }} />
                    <div style={{ fontSize: '13px', fontWeight: 700, color: theme.accent }}>{order.userEmail}</div>
                </div>
                <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px' }}>{order.services?.length} услуг(и) • {order.status === 'accepted' ? 'Принят' : order.status === 'declined' ? 'Отклонен' : 'Ожидает'}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ТРЕТЬЯ ПАНЕЛЬ */}
      <div style={{ flex: 1, display: isMobile && !activeId ? 'none' : 'flex', flexDirection: 'column', position: 'relative' }}>
        {activeId ? (
          <>
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '15px' }}>
              {isMobile && <ChevronLeft onClick={() => setActiveId(null)} />}
              <div>
                <div style={{ fontWeight: 700 }}>{activeChat?.userEmail}</div>
                <div style={{ fontSize: '11px', color: '#10b981' }}>Активен</div>
              </div>
            </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map(m => (
                <div key={m.id} style={{ alignSelf: m.senderId === 'manager' ? 'flex-end' : 'flex-start', maxWidth: '80%', position: 'relative', group: 'true' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: m.senderId === 'manager' ? 'row-reverse' : 'row' }}>
                    <div style={{ padding: '12px 16px', borderRadius: '14px', fontSize: '14px', background: m.senderId === 'manager' ? theme.accent : theme.card, color: m.senderId === 'manager' ? '#000' : '#fff' }}>{m.text}</div>
                    <button 
                      onClick={() => deleteMessage(m.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.3, padding: '4px' }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.3'}
                    >
                      <Trash2 size={12} color={theme.danger} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '10px 20px', display: 'flex', gap: '10px', overflowX: 'auto', background: 'rgba(0,0,0,0.2)' }}>
                {scripts.map(s => (
                    <button key={s.id} onClick={() => executeSend(s.text)} style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: '6px 12px', borderRadius: '20px', fontSize: '11px', color: theme.accent, whiteSpace: 'nowrap', cursor: 'pointer' }}>
                        {s.title}
                    </button>
                ))}
            </div>

            <div style={{ padding: '20px', background: theme.sidebar, borderTop: `1px solid ${theme.border}`, display: 'flex', gap: '12px' }}>
              <input value={inputText} onChange={e => setInputText(e.target.value)} onKeyPress={e => e.key === 'Enter' && executeSend()} placeholder="Введите сообщение..." style={{ flex: 1, background: theme.bg, border: `1px solid ${theme.border}`, color: '#fff', padding: '12px', borderRadius: '12px', outline: 'none' }} />
              <button onClick={() => executeSend()} style={{ background: theme.accent, border: 'none', width: '45px', borderRadius: '12px', cursor: 'pointer' }}><Send size={20} color="#000" /></button>
            </div>
          </>
        ) : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted }}>
              {activeTab === 'chats' ? 'Выберите чат для начала работы' : 'Выберите заказ для просмотра деталей'}
            </div>}
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
                        <input placeholder="Название скрипта" value={newScript.title} onChange={e => setNewScript({...newScript, title: e.target.value})} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${theme.border}`, color: '#fff', marginBottom: '15px', padding: '8px 0' }} />
                        <textarea placeholder="Текст ответа..." value={newScript.text} onChange={e => setNewScript({...newScript, text: e.target.value})} style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', height: '80px', resize: 'none' }} />
                        <button onClick={addScript} style={{ width: '100%', background: theme.accent, border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', marginTop: '10px' }}>СОХРАНИТЬ</button>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {scripts.map(s => (
                        <div key={s.id} style={{ padding: '16px', background: theme.card, borderRadius: '12px', border: `1px solid ${theme.border}`, position: 'relative' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: theme.accent, marginBottom: '5px' }}>{s.title}</div>
                            <div style={{ fontSize: '12px', color: theme.textMuted }}>{s.text}</div>
                            <Trash2 size={14} color={theme.danger} style={{ position: 'absolute', top: '16px', right: '16px', cursor: 'pointer' }} onClick={() => setScripts(scripts.filter(x => x.id !== s.id))} />
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
            <div id="order-details-content" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
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
                <div>
                    <label style={{ fontSize: '10px', color: theme.textMuted }}>УСЛУГИ</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        {selectedOrder.services?.map((s, i) => <span key={i} style={{ background: 'rgba(56, 189, 248, 0.1)', color: theme.accent, padding: '4px 10px', borderRadius: '6px', fontSize: '11px' }}>{s}</span>)}
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
    </div>
  );
};

export default ManagerPanel;