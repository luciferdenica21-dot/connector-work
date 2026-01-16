import './i18n';
import { useState } from 'react' 
import { useTranslation } from 'react-i18next'; 
import './App.css'
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Contact from './components/Contact';
import OrderSidebar from './components/OrderSidebar';


function App() {
  const { i18n } = useTranslation(); 
  
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false); // Новое состояние для авторизации
  
  const [chosenServices, setChosenServices] = useState([]);
  const [tempSelection, setTempSelection] = useState([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const servicesData = []; 

  return (
    <div className={`min-h-screen flex flex-col ${i18n.language === 'ka' ? 'font-georgian' : 'font-sans'}`}>
      {/* Передаем setIsAuthOpen в Navbar */}
      <Navbar setIsOrderOpen={setIsOrderOpen} setIsAuthOpen={setIsAuthOpen} />
      
      <main className="flex-grow">
        <Hero />
        <Services />
        <Contact />
      </main>

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


    </div>
  )
}

export default App