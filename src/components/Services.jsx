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

  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const servicesList = [
    "S1_T", "S2_T", "S3_T", "S4_T", "S5_T", "S6_T", "S7_T", "S8_T", "S9_T", "S10_T"
  ];

  const contactLinks = [
    { name: 'Telegram', url: 'https://t.me/@MichaelPiliaev', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" /></svg> },
    { name: 'WhatsApp', url: 'https://wa.me/+995593450833', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" /></svg> },
    { name: 'Instagram', url: 'https://instagram.com/connector', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="12" cy="12" r="3" /><line x1="16.5" y1="7.5" x2="16.5" y2="7.501" /></svg> },
    { name: 'Gmail', url: 'mailto:luciferdenica21@gmail.com', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" /><path d="M3 7l9 6l9 -6" /></svg> }
  ];

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  useEffect(() => {
    if (selectedService) {
      setChosenServices([selectedService.title]);
      setTempSelection([selectedService.title]);
    }
  }, [selectedService]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('service=')) {
        const serviceTitleFromUrl = decodeURIComponent(hash.split('service=')[1]).trim().toLowerCase();
        const service = servicesData.find(s => s.title.trim().toLowerCase() === serviceTitleFromUrl);
        if (service) {
          setSelectedService(service);
          window.history.replaceState(null, null, '#services');
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [servicesData]);

  const closeModal = () => {
    setSelectedService(null);
    setIsOrderOpen(false);
    setIsSelectorOpen(false);
    setChosenServices([]);
    setIsOpen(false);
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

          <nav className="bg-[#0a0a0a]/90 backdrop-blur-md fixed top-0 left-0 right-0 z-50 text-white text-sm border-b border-blue-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-20">
                <div className="flex items-center z-10">
                  <button onClick={closeModal} className="flex items-center gap-2 group">
                    <img src="/img/logo.png" alt="logo" className="w-[50px] h-[50px] object-contain" />
                    <span className="text-s font-black tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">CONNECTOR</span>
                  </button>
                </div>

                <div className="hidden md:flex items-center space-x-12">
                  <button onClick={closeModal} className="relative font-medium tracking-widest hover:text-blue-400 transition-all group uppercase">{t('ГЛАВНАЯ')}<span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-blue-500 transition-all group-hover:w-full"></span></button>
                  
                  <div className="relative group/dropdown">
                    <button className="relative font-medium tracking-widest hover:text-blue-400 transition-all flex items-center gap-1 cursor-default uppercase">
                      {t('УСЛУГИ')}
                      <svg className="w-4 h-4 transition-transform group-hover/dropdown:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-blue-500 transition-all group-hover/dropdown:w-full"></span>
                    </button>
                    <div className="absolute left-0 mt-2 w-72 bg-[#0a0a0a] border border-blue-500/20 rounded-xl py-4 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 z-[60] shadow-2xl backdrop-blur-xl">
                      {servicesList.map((sKey) => (
                        <button key={sKey} onClick={() => { setSelectedService(servicesData.find(s => s.title === t(sKey))); }} className="block w-full text-left px-6 py-2 text-[10px] uppercase tracking-widest text-white/70 hover:text-blue-400 hover:bg-white/5 transition-colors">{t(sKey)}</button>
                      ))}
                    </div>
                  </div>

                  <div className="relative group/dropdown">
                    <button className="relative font-medium tracking-widest hover:text-blue-400 transition-all flex items-center gap-1 cursor-default uppercase">
                      {t('КОНТАКТЫ')}
                      <svg className="w-4 h-4 transition-transform group-hover/dropdown:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-blue-500 transition-all group-hover/dropdown:w-full"></span>
                    </button>
                    <div className="absolute left-0 mt-2 w-48 bg-[#0a0a0a] border border-blue-500/20 rounded-xl py-4 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 z-[60] shadow-2xl backdrop-blur-xl">
                      {contactLinks.map((contact) => (
                        <a key={contact.name} href={contact.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-2 text-[10px] uppercase tracking-widest text-white/70 hover:text-blue-400 hover:bg-white/5 transition-colors">{contact.icon}{contact.name}</a>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => setIsOrderOpen(true)} className="hidden md:block bg-blue-500/10 border border-blue-500/50 text-blue-400 px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">{t("Заказать проект")}</button>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                  <select onChange={changeLanguage} value={i18n.language} className="bg-transparent border border-blue-500/30 rounded-lg px-2 py-1 outline-none text-xs cursor-pointer"><option value="ru" className="bg-[#0a0a0a]">RU</option><option value="en" className="bg-[#0a0a0a]">ENG</option><option value="ka" className="bg-[#0a0a0a]">GEO</option></select>
                  
                  <button className="hidden md:flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:border-blue-500/50 transition-all group">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t("Вход")}</span>
                  </button>

                  <button onClick={() => { setIsOpen(!isOpen); setIsServicesOpen(false); setIsContactOpen(false); }} className="md:hidden p-2 text-blue-400"><svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg></button>
                </div>
              </div>
            </div>

            <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] border-t border-blue-500/20' : 'max-h-0'}`} style={{ backgroundColor: 'rgba(10, 10, 10, 1)' }}>
              <div className="py-8 px-6 flex flex-col space-y-6">
                <button onClick={closeModal} className="text-left text-sm font-medium tracking-[0.2em] hover:text-blue-400 transition-all duration-300 hover:translate-x-2 uppercase">{t('ГЛАВНАЯ')}</button>
                <div className="flex flex-col w-full">
                  <button onClick={() => setIsServicesOpen(!isServicesOpen)} className="text-sm font-medium tracking-[0.2em] text-blue-400 mb-2 uppercase flex items-center justify-between w-full">{t('УСЛУГИ')}<svg className={`w-4 h-4 transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></button>
                  <div className={`flex flex-col space-y-1 w-full overflow-hidden transition-all duration-500 ease-in-out ${isServicesOpen ? 'max-h-[600px] mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {servicesList.map((sKey) => (
                      <button key={sKey} onClick={() => { setSelectedService(servicesData.find(s => s.title === t(sKey))); setIsOpen(false); }} className="text-left text-[11px] tracking-widest text-white/60 hover:text-blue-400 transition-all duration-300 py-3 px-4 border-l border-blue-500/10 hover:border-blue-500/5 hover:translate-x-2 uppercase">{t(sKey)}</button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col w-full">
                  <button onClick={() => setIsContactOpen(!isContactOpen)} className="text-sm font-medium tracking-[0.2em] text-blue-400 mb-2 uppercase flex items-center justify-between w-full">{t('КОНТАКТЫ')}<svg className={`w-4 h-4 transition-transform duration-300 ${isContactOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></button>
                  <div className={`flex flex-row justify-center items-center gap-6 w-full overflow-hidden transition-all duration-500 ease-in-out ${isContactOpen ? 'max-h-[100px] mt-4 py-4 border-y border-blue-500/10 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {contactLinks.map((contact) => (
                      <a key={contact.name} href={contact.url} target="_blank" rel="noopener noreferrer" className="p-3 text-white/60 hover:text-blue-400 hover:scale-110 transition-all duration-300 bg-white/5 rounded-lg border border-blue-500/5">{contact.icon}</a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <div className={`md:hidden fixed inset-x-0 bottom-0 z-40 pointer-events-none transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
            <div className="max-w-7xl mx-auto px-6 pb-10">
                <div className="flex justify-between items-center pointer-events-auto">
                  <button className="w-14 h-14 flex items-center justify-center border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-2xl text-blue-400 shadow-2xl active:scale-90 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </button>
                  <button onClick={() => setIsOrderOpen(true)} className="flex items-center gap-3 px-6 py-4 bg-blue-500 border border-blue-400/50 text-white rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95 transition-all animate-[slideRight_0.6s_ease-out]">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{t("Заказать проект")}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                </div>
            </div>
          </div>

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
        @keyframes slideRight { from { transform: translateX(-50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
};

export default Services;