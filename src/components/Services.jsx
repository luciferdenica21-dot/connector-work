import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import OrderSidebar from './OrderSidebar';

const Services = () => {
  const { t, i18n } = useTranslation();

  const servicesData = [
    { title: t("S1_T"), img: "/gallery/Гибочные работы по металлам.jpg", desc: "", fullDesc: t("S1_D") },
    { title: t("S2_T"), img: "/gallery/Жидкостная окраска.jpg", desc: "", fullDesc: t("S2_D") },
    { title: t("S3_T"), img: "/gallery/Лазерная гравировка.jpg", desc: "", fullDesc: t("S3_D") },
    { title: t("S4_T"), img: "/gallery/Лазерная резка металлов.jpg", desc: "", fullDesc: t("S4_D") },
    { title: t("S5_T"), img: "/gallery/Лазерная резка неметаллических материалов.jpg", desc: "", fullDesc: t("S5_D") },
    { title: t("S6_T"), img: "/gallery/Порошковая окраска.jpg", desc: "", fullDesc: t("S6_D") },
    { title: t("S7_T"), img: "/gallery/Продажа материалов.jpg", desc: "", fullDesc: t("S7_D") },
    { title: t("S8_T"), img: "/gallery/Сварка.jpg", desc: "", fullDesc: t("S8_D") },
    { title: t("S9_T"), img: "/gallery/Токарные работы.jpg", desc: "", fullDesc: t("S9_D") },
    { title: t("S10_T"), img: "/gallery/ЧПУ фрезеровка и раскрой листовых материалов.jpg", desc: "", fullDesc: t("S10_D") }
  ];

  const [selectedService, setSelectedService] = useState(null);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [chosenServices, setChosenServices] = useState([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [tempSelection, setTempSelection] = useState([]);

  useEffect(() => {
    if (selectedService) {
      setChosenServices([selectedService.title]);
      setTempSelection([selectedService.title]);
    }
  }, [selectedService]);

  // Логика открытия услуги по ссылке из Navbar с улучшенным сопоставлением строк
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('service=')) {
        const serviceTitleFromUrl = decodeURIComponent(hash.split('service=')[1]).trim().toLowerCase();
        
        const service = servicesData.find(s => 
          s.title.trim().toLowerCase() === serviceTitleFromUrl
        );

        if (service) {
          setSelectedService(service);
          // Очистка хэша без перезагрузки для чистоты URL
          window.history.replaceState(null, null, '#services');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Проверка при загрузке
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [servicesData]);

  const closeModal = () => {
    setSelectedService(null);
    setIsOrderOpen(false);
    setIsSelectorOpen(false);
    setChosenServices([]);
  };

  const brandGradient = "bg-gradient-to-r from-[#00A3FF] to-[#0066CC]";

  return (
    <section id="services" className="relative py-24 px-4 bg-[#050505]">
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
        {servicesData.map((service, index) => (
          <div 
            key={index}
            onClick={() => setSelectedService(service)}
            className="group relative cursor-pointer overflow-hidden rounded-[2rem] bg-[#0a0a0a] border border-white/10 
                       transition-all duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            <div className="h-[340px] relative">
              <img src={service.img} alt={service.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white font-light text-sm tracking-[0.2em] uppercase leading-tight group-hover:text-cyan-400 transition-colors">
                  {service.title}
                </h3>
                <div className="w-8 group-hover:w-full h-[1px] bg-cyan-500 mt-4 transition-all duration-500 opacity-60"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedService && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black flex justify-center items-start animate-fadeIn scrollbar-hide">
          <div className="fixed inset-0 z-0 bg-[#050505]/95 backdrop-blur-3xl" />

         <nav className="fixed top-0 left-0 right-0 z-[110] bg-[#0a0a0a]/90 backdrop-blur-md border-b border-blue-500/20 h-20">
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                <div className="flex items-center gap-2 group">
                  <div className="relative">
                      <img src="/img/logo.png" alt="logo" className="relative w-[40px] h-[40px] md:w-[50px] md:h-[50px] object-contain" />
                  </div>
                  <span className="text-[10px] md:text-s font-black tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
                      CONNECTOR
                  </span>
                </div>

              <div className="flex items-center gap-2 md:gap-4">
                <button 
                  onClick={() => setIsOrderOpen(true)}
                  className={`${brandGradient} text-white px-3 py-2 md:px-6 md:py-3 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:shadow-[0_0_25px_rgba(0,163,255,0.4)] transition-all`}
                >
                  {t("Заказать проект")}
                </button>
                
                <button onClick={closeModal} className="p-1 md:p-2 text-blue-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </nav>

          <div className={`container relative z-10 mx-auto px-4 pb-12 pt-32 flex flex-col items-center transition-all duration-500 ease-in-out ${isOrderOpen ? 'lg:mr-[480px] lg:ml-0' : 'mx-auto'}`}>
            <div className="max-w-4xl w-full">
              <div className="mb-8 p-4 md:p-6 rounded-2xl border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-cyan-500/5 backdrop-blur-sm">
                <h4 className="text-white text-center text-lg md:text-2xl font-light uppercase tracking-[0.2em] leading-tight">
                  {selectedService.title}
                </h4>
              </div>

              <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl mb-10">
                <img src={selectedService.img} className="w-full h-auto max-h-[400px] object-cover" alt={selectedService.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>

              <div className="bg-white/[0.03] p-8 md:p-12 rounded-[2rem] border border-white/5 shadow-inner mb-12">
                <div className="text-white/80 text-sm md:text-lg font-light leading-relaxed whitespace-pre-line text-left">
                  {selectedService.fullDesc}
                </div>
              </div>
            </div>
          </div>

          <OrderSidebar 
            isOrderOpen={isOrderOpen}
            setIsOrderOpen={setIsOrderOpen}
            servicesData={servicesData}
            chosenServices={chosenServices}
            setChosenServices={setChosenServices}
            tempSelection={tempSelection}
            setTempSelection={setTempSelection}
            isSelectorOpen={isSelectorOpen}
            setIsSelectorOpen={setIsSelectorOpen}
            brandGradient={brandGradient}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 163, 255, 0.2); border-radius: 10px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
};

export default Services;