import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import OrderSidebar from './OrderSidebar';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import OrderButton from './OrderButton';

const Services = ({ user, setIsAuthOpen }) => {
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

  const handleLogout = () => {
    signOut(auth);
  };

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

          <nav className="bg-[#0a0a0a]/90 backdrop-blur-md fixed top-0 left-0 right-0 z-[110] text-white text-sm border-b border-blue-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
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
                    <div className="absolute left-0 mt-2 w-72 bg-[#0a0a0a] border border-blue-500/20 rounded-xl py-4 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 z-[120] shadow-2xl backdrop-blur-xl">
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
                    <div className="absolute left-0 mt-2 w-48 bg-[#0a0a0a] border border-blue-500/20 rounded-xl py-4 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 z-[120] shadow-2xl backdrop-blur-xl">
                      {contactLinks.map((contact) => (
                        <a key={contact.name} href={contact.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-2 text-[10px] uppercase tracking-widest text-white/70 hover:text-blue-400 hover:bg-white/5 transition-colors">{contact.icon}{contact.name}</a>
                      ))}
                    </div>
                  </div>

                  <OrderButton 
                    user={user} 
                    setIsOrderOpen={setIsOrderOpen} 
                    setIsAuthOpen={setIsAuthOpen} 
                    className="hidden md:block bg-blue-500/10 border border-blue-500/50 text-blue-400 px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                  <div className="hidden md:block">
                    <select onChange={changeLanguage} value={i18n.language} className="bg-transparent border border-blue-500/30 rounded-lg px-2 py-1 outline-none text-xs cursor-pointer"><option value="ru" className="bg-[#0a0a0a]">RU</option><option value="en" className="bg-[#0a0a0a]">ENG</option><option value="ka" className="bg-[#0a0a0a]">GEO</option></select>
                  </div>
                  {user ? (
                    <button onClick={handleLogout} className="hidden md:flex items-center gap-2 px-4 py-2 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-all group">
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">{t("Выйти")}</span>
                    </button>
                  ) : (
                    <button onClick={() => setIsAuthOpen(true)} className="hidden md:flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:border-blue-500/50 transition-all group">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">{t("Войти")}</span>
                    </button>
                  )}

                  <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
                  </button>
                </div>
              </div>

              <div className={`md:hidden absolute w-full bg-[#0a0a0a] border-b border-blue-500/20 transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}>
                <div className="px-4 pt-2 pb-6 space-y-1">
                  <div>
                    <button onClick={() => setIsServicesOpen(!isServicesOpen)} className="w-full flex items-center justify-between px-3 py-4 text-[10px] font-bold uppercase tracking-widest text-white/70 border-b border-white/5">
                      {t('УСЛУГИ')}
                      <svg className={`w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <div className={`bg-white/5 rounded-xl overflow-hidden transition-all duration-300 ${isServicesOpen ? 'max-h-[500px] my-2' : 'max-h-0'}`}>
                      {servicesList.map((sKey) => (
                        <button 
                          key={sKey} 
                          onClick={() => { setSelectedService(servicesData.find(s => s.title === t(sKey))); setIsOpen(false); }}
                          className="block w-full text-left px-6 py-3 text-[9px] uppercase tracking-widest text-white/50 hover:text-blue-400"
                        >
                          {t(sKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <button onClick={() => setIsContactOpen(!isContactOpen)} className="w-full flex items-center justify-between px-3 py-4 text-[10px] font-bold uppercase tracking-widest text-white/70 border-b border-white/5">
                      {t('КОНТАКТЫ')}
                      <svg className={`w-4 h-4 transition-transform ${isContactOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <div className={`bg-white/5 rounded-xl overflow-hidden transition-all duration-300 ${isContactOpen ? 'max-h-[500px] my-2' : 'max-h-0'}`}>
                      {contactLinks.map((contact) => (
                        <a key={contact.name} href={contact.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 text-[9px] uppercase tracking-widest text-white/50 hover:text-blue-400">{contact.icon}{contact.name}</a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <div className="relative z-10 w-full max-w-5xl mt-32 px-4 pb-32">
            <div className="flex flex-col gap-8">
              <div className="relative aspect-video rounded-[3rem] overflow-hidden border border-white/10">
                <img src={selectedService.img} alt={selectedService.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>

              <div className="bg-white/[0.03] p-8 md:p-12 rounded-[2rem] border border-white/5 shadow-inner mb-12 flex flex-col items-start gap-8">
                <div className="text-white/80 text-sm md:text-lg font-light leading-relaxed whitespace-pre-line text-left">
                  {selectedService.fullDesc}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedService && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[120] bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-white/10 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {user ? (
                <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-red-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  <span className="text-[8px] font-bold uppercase">{t("Выйти")}</span>
                </button>
              ) : (
                <button onClick={() => setIsAuthOpen(true)} className="flex flex-col items-center gap-1 text-blue-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  <span className="text-[8px] font-bold uppercase">{t("Войти")}</span>
                </button>
              )}

              <div className="flex flex-col items-center gap-1 relative">
                <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 7.31 16.5 3 19" /></svg>
                <select onChange={changeLanguage} value={i18n.language} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer">
                  <option value="ru">RU</option>
                  <option value="en">EN</option>
                  <option value="ka">KA</option>
                </select>
                <span className="text-[8px] font-bold uppercase text-white/70">{i18n.language.toUpperCase()}</span>
              </div>
            </div>

            <OrderButton 
              user={user} 
              setIsOrderOpen={setIsOrderOpen} 
              setIsAuthOpen={setIsAuthOpen} 
              className="bg-blue-600 text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/40 active:scale-95 transition-transform"
            />

            <button onClick={closeModal} className="flex flex-col items-center gap-1 text-white/70">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span className="text-[8px] font-bold uppercase tracking-tighter">{t('ГЛАВНАЯ')}</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>

      <OrderSidebar 
        isOrderOpen={isOrderOpen} 
        setIsOrderOpen={setIsOrderOpen} 
        user={user} 
        setIsAuthOpen={setIsAuthOpen}
        brandGradient={brandGradient}
      />
    </section>
  );
};

export default Services;