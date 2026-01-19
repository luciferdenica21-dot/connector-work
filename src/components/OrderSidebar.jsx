import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ordersAPI } from '../config/api';

const OrderSidebar = ({ 
  isOrderOpen, 
  setIsOrderOpen, 
  brandGradient,
  user,           
  setIsAuthOpen   
}) => {
  const { t } = useTranslation();

  const [chosenServices, setChosenServices] = useState([]);
  const [tempSelection, setTempSelection] = useState([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [contact, setContact] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // Состояние для модалки успеха
  const [showSuccess, setShowSuccess] = useState(false);

  // ВАЖНО: Сбрасываем успех, когда открываем сайдбар заново
  useEffect(() => {
    if (isOrderOpen) {
      setShowSuccess(false);
      // Заполняем данные из профиля пользователя, если доступны
      if (user) {
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setContact(user.phone || '');
      }
    }
  }, [isOrderOpen, user]);

  const servicesData = [
    { title: t("S1_T") }, { title: t("S2_T") }, { title: t("S3_T") },
    { title: t("S4_T") }, { title: t("S5_T") }, { title: t("S6_T") },
    { title: t("S7_T") }, { title: t("S8_T") }, { title: t("S9_T") },
    { title: t("S10_T") }
  ];

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (chosenServices.length === 0) {
      alert(t("Выберите хотя бы одну услугу"));
      return;
    }

    if (!firstName || !lastName || !contact) {
      alert(t("Пожалуйста, заполните все обязательные поля"));
      return;
    }

    setLoading(true);

    try {
      await ordersAPI.create({
        firstName,
        lastName,
        contact,
        services: chosenServices,
        comment: comment || ""
      });

      // ЛОГИКА ТУТ: Сначала показываем успех, потом закрываем форму
      setShowSuccess(true);
      setIsOrderOpen(false);
      
      // Очистка полей
      setChosenServices([]);
      setTempSelection([]);
      setComment("");
      setContact("");
      setFirstName(user?.firstName || "");
      setLastName(user?.lastName || "");
    } catch (error) {
      console.error("Order Error:", error);
      alert("Ошибка: " + (error.message || "Не удалось отправить заказ"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* МОДАЛКА УСПЕХА — Она теперь рендерится всегда, если showSuccess true */}
      {showSuccess && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center px-6">
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            onClick={() => setShowSuccess(false)}
          ></div>
          <div className="relative bg-[#0a0a0a] border border-blue-500/30 p-8 md:p-10 rounded-[2rem] max-w-[400px] w-full text-center shadow-[0_0_80px_rgba(0,112,255,0.25)] animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-white text-base font-bold uppercase tracking-[0.2em] mb-4">
              {t("Успешно")}
            </h3>
            
            <p className="text-white/60 text-[11px] md:text-xs uppercase tracking-widest leading-relaxed mb-10">
              {t("Ваша форма на заказ успешно отправлена")} <br/>
              <span className="text-blue-400">{t("менеджер обязательно с вами свяжеться !!!")}</span>
            </p>

            <button 
              onClick={() => setShowSuccess(false)}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            >
              {t("ОТЛИЧНО")}
            </button>
          </div>
        </div>
      )}

      {/* САЙДБАР С ФОРМОЙ */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-[#0a0a0a] border-l border-blue-500/20 z-[150] shadow-2xl transform transition-transform duration-500 ease-in-out ${isOrderOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col pt-24 pb-12 px-8 overflow-y-auto custom-scrollbar">
          <button onClick={() => setIsOrderOpen(false)} className="absolute top-8 right-8 text-blue-400 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <h2 className="text-white text-2xl font-light uppercase tracking-[0.3em] mb-8 border-b border-white/10 pb-4">{t("Оформить заказ")}</h2>
          
          {!user ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6">
                  <p className="text-white/40 text-[10px] uppercase tracking-widest leading-relaxed">
                    {t("Пожалуйста, войдите в свой аккаунт, чтобы оформить заказ")}
                  </p>
                  <button type="button" onClick={() => { setIsAuthOpen(true); setIsOrderOpen(false); }} className="px-8 py-4 bg-blue-600 rounded-xl text-white text-[10px] uppercase font-bold tracking-widest">{t("Войти")}</button>
              </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmitOrder}>
              <div className="space-y-3">
                <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">{t("Выбранные услуги")}</label>
                <button type="button" onClick={() => setIsSelectorOpen(!isSelectorOpen)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between group hover:border-blue-500/50 transition-all">
                  <span className="text-white/60 text-[10px] uppercase tracking-widest">{t("Добавить услуги")}</span>
                  <div className="flex flex-col gap-1">
                      <div className={`w-4 h-[1px] bg-blue-400 transition-all ${isSelectorOpen ? 'rotate-45 translate-y-1' : ''}`}></div>
                      <div className={`w-4 h-[1px] bg-blue-400 ${isSelectorOpen ? 'opacity-0' : ''}`}></div>
                      <div className={`w-4 h-[1px] bg-blue-400 transition-all ${isSelectorOpen ? '-rotate-45 -translate-y-1' : ''}`}></div>
                  </div>
                </button>

                {isSelectorOpen && (
                  <div className="bg-[#111] border border-white/10 rounded-xl p-4 space-y-3 shadow-2xl">
                    <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                      {servicesData.map((s, idx) => (
                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" checked={tempSelection.includes(s.title)} onChange={() => setTempSelection(prev => prev.includes(s.title) ? prev.filter(t => t !== s.title) : [...prev, s.title])} className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-0" />
                          <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">{s.title}</span>
                        </label>
                      ))}
</div>
                    <button 
                      type="button" 
                      onClick={() => { setChosenServices(tempSelection); setIsSelectorOpen(false); }} 
                      className="w-full py-2 bg-blue-500/20 text-blue-400 text-[9px] uppercase font-bold rounded-lg border border-blue-500/30"
                    >
                      {t("ПРИМЕНИТЬ")}
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-2">
                  {chosenServices.map((s, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-[9px] text-blue-400 uppercase tracking-widest flex items-center gap-2">
                      {s}
                      <button type="button" onClick={() => { setChosenServices(prev => prev.filter(t => t !== s)); setTempSelection(prev => prev.filter(t => t !== s)); }} className="hover:text-white">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">{t("Имя")} *</label>
                  <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">{t("Фамилия")} *</label>
                  <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                  <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">{t("Контактные данные")} *</label>
                  <input type="text" required value={contact} onChange={(e) => setContact(e.target.value)} placeholder={user?.phone || "+995 123 456 789"} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-all" />
              </div>

              <div className="space-y-2">
                  <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">{t("Комментарий к заказу")}</label>
                  <textarea rows="4" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-all resize-none"></textarea>
              </div>

              <div className="pt-4 flex justify-start">
                  <button 
                      type="submit"
                      disabled={loading}
                      className={`w-auto px-10 ${brandGradient || 'bg-blue-600'} text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] hover:shadow-[0_0_25px_rgba(0,163,255,0.4)] transition-all disabled:opacity-50`}
                  >
                      {loading ? t("Отправка...") : t("Заказать проект")}
                  </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderSidebar;