import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const OrderSidebar = ({ 
  isOrderOpen, 
  setIsOrderOpen, 
  brandGradient 
}) => {
  const { t } = useTranslation();

  // Внутренние состояния для независимой работы логики выбора
  const [chosenServices, setChosenServices] = useState([]);
  const [tempSelection, setTempSelection] = useState([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Данные услуг теперь определяются внутри для автономности
  const servicesData = [
    { title: t("S1_T") }, { title: t("S2_T") }, { title: t("S3_T") },
    { title: t("S4_T") }, { title: t("S5_T") }, { title: t("S6_T") },
    { title: t("S7_T") }, { title: t("S8_T") }, { title: t("S9_T") },
    { title: t("S10_T") }
  ];

  const toggleTempService = (title) => {
    setTempSelection(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title) 
        : [...prev, title]
    );
  };

  const confirmSelection = () => {
    setChosenServices(tempSelection);
    setIsSelectorOpen(false);
  };

  const removeService = (title) => {
    const updated = prev => prev.filter(t => t !== title);
    setChosenServices(updated);
    setTempSelection(updated);
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-[#0a0a0a] border-l border-blue-500/20 z-[150] shadow-2xl transform transition-transform duration-500 ease-in-out ${isOrderOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col pt-24 pb-12 px-8 overflow-y-auto custom-scrollbar">
        <button onClick={() => setIsOrderOpen(false)} className="absolute top-8 right-8 text-blue-400 hover:text-white transition-colors">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-white text-2xl font-light uppercase tracking-[0.3em] mb-8 border-b border-white/10 pb-4">{t("Оформить заказ")}</h2>
        
        <form className="space-y-6">
          <div className="space-y-3">
            <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">{t("Выбранные услуги")}</label>
            
            <button 
              type="button"
              onClick={() => setIsSelectorOpen(!isSelectorOpen)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between group hover:border-blue-500/50 transition-all"
            >
              <span className="text-white/60 text-[10px] uppercase tracking-widest">{t("Добавить услуги")}</span>
              <div className="flex flex-col gap-1">
                <div className={`w-4 h-[1px] bg-blue-400 transition-all ${isSelectorOpen ? 'rotate-45 translate-y-1' : ''}`}></div>
                <div className={`w-4 h-[1px] bg-blue-400 ${isSelectorOpen ? 'opacity-0' : ''}`}></div>
                <div className={`w-4 h-[1px] bg-blue-400 transition-all ${isSelectorOpen ? '-rotate-45 -translate-y-1' : ''}`}></div>
              </div>
            </button>

            {isSelectorOpen && (
              <div className="bg-[#111] border border-white/10 rounded-xl p-4 space-y-3 animate-fadeIn shadow-2xl">
                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                  {servicesData.map((s, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={tempSelection.includes(s.title)}
                        onChange={() => toggleTempService(s.title)}
                        className="w-4 h-4 rounded border-white/20 bg-black text-blue-500 focus:ring-0"
                      />
                      <span className={`text-[10px] uppercase tracking-wider transition-colors ${tempSelection.includes(s.title) ? 'text-blue-400' : 'text-white/40 group-hover:text-white'}`}>
                        {s.title}
                      </span>
                    </label>
                  ))}
                </div>
                <button 
                  type="button"
                  onClick={confirmSelection}
                  className="w-full py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 text-[9px] uppercase font-bold tracking-[0.2em] rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                >
                  {t("Подтвердить выбор")}
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {chosenServices.map((service, i) => (
                <div key={i} className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-lg group/tag">
                  <span className="text-blue-400 text-[9px] uppercase tracking-widest leading-none">{service}</span>
                  <button 
                    type="button"
                    onClick={() => removeService(service)}
                    className="text-blue-500/50 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                  <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">{t("Имя")}</label>
                  <input type="text" placeholder={t("Введите имя")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-all" />
              </div>
              <div className="space-y-2">
                  <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">{t("Фамилия")}</label>
                  <input type="text" placeholder={t("Введите фамилию")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-all" />
              </div>
          </div>

          <div className="space-y-2">
              <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">{t("Контактные данные")}</label>
              <input type="text" placeholder={t("Телефон или Email")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-all" />
          </div>

          <div className="space-y-2">
              <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">{t("Техническое задание / Чертеж")}</label>
              <div className="relative group">
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="w-full bg-white/5 border border-dashed border-white/20 rounded-xl px-4 py-6 text-center group-hover:border-blue-500/50 transition-all">
                      <svg className="w-6 h-6 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                      <p className="text-white/60 text-[10px] uppercase tracking-widest">{t("Выберите файл или перетащите")}</p>
                  </div>
              </div>
          </div>

          <div className="space-y-2">
              <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">{t("Комментарий к заказу")}</label>
              <textarea rows="4" placeholder={t("Опишите детали проекта...")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-all resize-none"></textarea>
          </div>

          <div className="pt-4">
              <button 
                  type="button"
                  className={`w-full ${brandGradient} text-white py-5 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] hover:shadow-[0_0_25px_rgba(0,163,255,0.4)] transition-all`}
              >
                  {t("Подтвердить заказ")}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderSidebar;