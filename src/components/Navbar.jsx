import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import OrderSidebar from './OrderSidebar';

const Navbar = ({ setIsOrderOpen, isOrderOpen, setIsAuthOpen }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const [chosenServices, setChosenServices] = useState([]);
  const [tempSelection, setTempSelection] = useState([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const servicesData = [
    { title: t("S1_T") }, { title: t("S2_T") }, { title: t("S3_T") },
    { title: t("S4_T") }, { title: t("S5_T") }, { title: t("S6_T") },
    { title: t("S7_T") }, { title: t("S8_T") }, { title: t("S9_T") },
    { title: t("S10_T") }
  ];

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
    const handleScroll = () => {
      if (window.innerWidth < 768 && isOpen) {
        setIsScrolling(window.scrollY > 10);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  const handleMobileClick = (e, targetId) => {
    setIsOpen(false);
    setIsServicesOpen(false);
    setIsContactOpen(false);
    if (targetId.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(targetId === '#' ? 'body' : targetId);
      if (element) {
        const offset = 80;
        window.scrollTo({
          top: targetId === '#' ? 0 : element.getBoundingClientRect().top - document.body.getBoundingClientRect().top - offset,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <>
      <nav className="bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-50 text-white text-sm border-b border-blue-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center z-10">
              <a href="#" className="flex items-center gap-2 group">
                <img src="/img/logo.png" alt="logo" className="w-[50px] h-[50px] object-contain" />
                <span className="text-s font-black tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">CONNECTOR</span>
              </a>
            </div>

            <div className="hidden md:flex items-center space-x-12">
              <a href="#" className="relative font-medium tracking-widest hover:text-blue-400 transition-all group uppercase">{t('ГЛАВНАЯ')}<span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-blue-500 transition-all group-hover:w-full"></span></a>
              
              <div className="relative group/dropdown">
                <button className="relative font-medium tracking-widest hover:text-blue-400 transition-all flex items-center gap-1 cursor-default uppercase">
                  {t('УСЛУГИ')}
                  <svg className="w-4 h-4 transition-transform group-hover/dropdown:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-blue-500 transition-all group-hover/dropdown:w-full"></span>
                </button>
                <div className="absolute left-0 mt-2 w-72 bg-[#0a0a0a] border border-blue-500/20 rounded-xl py-4 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 z-[60] shadow-2xl backdrop-blur-xl">
                  {servicesList.map((sKey) => (
                    <a 
                        key={sKey} 
                        href={`#services?service=${t(sKey)}`} 
                        className="block px-6 py-2 text-[10px] uppercase tracking-widest text-white/70 hover:text-blue-400 hover:bg-white/5 transition-colors"
                        onClick={() => { window.location.hash = `services?service=${t(sKey)}`; }}
                    >
                        {t(sKey)}
                    </a>
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
              
              <button 
                onClick={() => setIsAuthOpen(true)} 
                className="hidden md:flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:border-blue-500/50 transition-all group"
              >
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="text-[10px] font-bold uppercase tracking-widest">{t("Вход")}</span>
              </button>

              <button onClick={() => { setIsOpen(!isOpen); setIsServicesOpen(false); setIsContactOpen(false); }} className="md:hidden p-2 text-blue-400"><svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg></button>
            </div>
          </div>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] border-t border-blue-500/20' : 'max-h-0'}`} style={{ backgroundColor: isScrolling ? 'rgba(10, 10, 10, 0.5)' : 'rgba(10, 10, 10, 1)' }}>
          <div className="py-8 px-6 flex flex-col space-y-6">
            <a href="#" className="text-sm font-medium tracking-[0.2em] hover:text-blue-400 transition-all duration-300 hover:translate-x-2" onClick={(e) => handleMobileClick(e, '#')}>{t('ГЛАВНАЯ')}</a>
            
            <div className="flex flex-col w-full">
              <button onClick={() => setIsServicesOpen(!isServicesOpen)} className="text-sm font-medium tracking-[0.2em] text-blue-400 mb-2 uppercase flex items-center justify-between w-full">{t('УСЛУГИ')}<svg className={`w-4 h-4 transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></button>
              <div className={`flex flex-col space-y-1 w-full overflow-hidden transition-all duration-500 ease-in-out ${isServicesOpen ? 'max-h-[600px] mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                {servicesList.map((sKey) => (
                  <a 
                    key={sKey} 
                    href={`#services?service=${t(sKey)}`} 
                    className="text-[11px] tracking-widest text-white/60 hover:text-blue-400 transition-all duration-300 py-3 px-4 border-l border-blue-500/10 hover:border-blue-500/5 hover:translate-x-2 uppercase" 
                    onClick={() => { setIsOpen(false); setIsServicesOpen(false); }}
                  >
                    {t(sKey)}
                  </a>
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
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="w-14 h-14 flex items-center justify-center border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-2xl text-blue-400 shadow-2xl active:scale-90 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </button>

              <button 
                onClick={() => setIsOrderOpen(true)} 
                className="flex items-center gap-3 px-6 py-4 bg-blue-500 border border-blue-400/50 text-white rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95 transition-all animate-[slideRight_0.6s_ease-out]"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{t("Заказать проект")}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
         </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideRight {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}} />

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
        brandGradient="bg-gradient-to-r from-blue-600 to-blue-400"
      />
    </>
  );
};

export default Navbar;