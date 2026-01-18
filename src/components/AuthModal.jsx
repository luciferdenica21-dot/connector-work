import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAuth = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        // 1. Вход
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // 2. МГНОВЕННО закрываем окно, чтобы оно не открылось второй раз
        onClose(); 
        
        // 3. Получаем роль и редиректим
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          navigate('/manager');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: email,
          role: 'user',
          createdAt: serverTimestamp()
        });
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError("Ошибка: проверьте данные входа.");
      setLoading(false); // Оставляем кнопку активной только при ошибке
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-[#0a0f1d] border border-white/10 w-full max-w-md rounded-[2rem] p-8 shadow-2xl">
        <h2 className="text-xl font-light text-white mb-8 text-center uppercase tracking-[0.3em]">
          {isLogin ? t("Вход") : t("Регистрация")}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">{t("Пароль")}</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          {error && <p className="text-red-500 text-[10px] uppercase text-center font-bold tracking-wider">{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
          >
            {loading ? "..." : t("Войти")}
          </button>
        </form>
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-6 text-white/40 text-[10px] uppercase tracking-widest hover:text-white transition-colors"
        >
          {isLogin ? t("Нет аккаунта? Создать") : t("Уже есть аккаунт? Войти")}
        </button>
      </div>
    </div>
  );
};

export default AuthModal;