import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { 
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc
} from 'firebase/firestore';

const ChatWidget = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const chatId = user?.uid; 

  useEffect(() => {
    if (!isOpen || !chatId) return;
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsubscribe();
  }, [isOpen, chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: message,
        senderId: user.uid,
        senderEmail: user.email,
        createdAt: serverTimestamp()
      });

      await setDoc(doc(db, "chats", chatId), {
        lastMessage: message,
        lastUpdate: serverTimestamp(),
        userEmail: user.email,
        unread: true
      }, { merge: true });

      setMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[150]">
      <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[320px] h-[450px] bg-[#0a0a0a] border border-blue-500/20 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-fadeIn">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
            <span className="text-white text-[10px] uppercase font-bold tracking-widest">Support Chat</span>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">✕</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs ${
                  msg.senderId === user.uid ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/10 text-white/80 rounded-tl-none'
                }`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-white/5 flex gap-2">
            <input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Сообщение..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-blue-500/50"
            />
            <button type="submit" className="text-blue-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;