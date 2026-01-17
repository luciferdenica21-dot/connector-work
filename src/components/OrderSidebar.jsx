import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const OrderSidebar = ({ 
  isOrderOpen, 
  setIsOrderOpen, 
  brandGradient 
}) => {
  const { t } = useTranslation();

  // Блокировка скролла body
  useEffect(() => {
    if (isOrderOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOrderOpen]);

  const [chosenServices, setChosenServices] = useState([]);
  const [tempSelection, setTempSelection] = useState([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

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
    setChosenServices(prev => prev.filter(t => t !== title));
    setTempSelection(prev => prev.filter(t => t !== title));
  };

  return (
    <>
      {/* Overlay: z-[100] чтобы точно перекрыть нижние кнопки (z-40) */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-500 ${isOrderOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOrderOpen(false)}
      />

      {/* Main Modal: z-[110] */}
      <div className={`
        fixed z-[110] bg-[#0a0a0a] backdrop-blur-xl border border-blue-500/20 shadow-2xl transition-all duration-500 ease-in-out flex flex-col overflow-hidden
        /* Mobile: От Navbar (top-20) до самого низа (bottom-0) на весь экран */
        top-20 bottom-0 left-0 right-0 rounded-t-3xl
        /* PC: Справа с отступами */
        md:top-24 md:bottom-10 md:right-8 md:left-auto md:w-[480px] md:rounded-3xl
        ${isOrderOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none md:translate-x-full md:translate-y-0'}
      `}>
        
        {/* Кнопка закрытия */}
        <button onClick={() => setIsOrderOpen(false)} className="absolute top-6 right-6 text-blue-400 hover:text-white transition-colors z-50">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Контент со скроллом */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-12">
          <h2 className="text-white text-xl md:text-2xl font-light uppercase tracking-[0.3em] mb-8 border-b border-white/10 pb-4">
            {t("Оформить заказ")}
          </h2>
          
          <div className="space-y-6 pb-10">
            {/* Селектор услуг */}
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
                <div className="bg-[#111] border border-white/10 rounded-xl p-4 space-y-3 shadow-2xl">
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
                  <div key={i} className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-lg">
                    <span className="text-blue-400 text-[9px] uppercase tracking-widest leading-none">{service}</span>
                    <button type="button" onClick={() => removeService(service)} className="text-blue-500/50 hover:text-red-400 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Поля ввода */}
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
              <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">{t("Техническое задание")}</label>
              <div className="relative group">
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="w-full bg-white/5 border border-dashed border-white/20 rounded-xl px-4 py-6 text-center group-hover:border-blue-500/50 transition-all">
                  <svg className="w-6 h-6 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <p className="text-white/60 text-[10px] uppercase tracking-widest">{t("Выберите файл")}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">{t("Комментарий")}</label>
              <textarea rows="3" placeholder={t("Опишите детали...")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-all resize-none"></textarea>
            </div>

            <div className="pt-4">
              <button 
                type="button"
                className={`w-full ${brandGradient} text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] shadow-lg hover:shadow-blue-500/20 transition-all`}
              >
                {t("Подтвердить заказ")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSidebar;