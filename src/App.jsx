import './i18n';
import { useState, useEffect } from 'react' 
import { useTranslation } from 'react-i18next'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Contact from './components/Contact';
import OrderSidebar from './components/OrderSidebar';
import AuthModal from './components/AuthModal';
import ChatWidget from './components/ChatWidget';
import ManagerPanel from './components/ManagerPanel';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

function App() {
  const { i18n } = useTranslation(); 
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            setUserRole('user');
          }
        } catch (error) {
          console.error("Role fetch error:", error);
          setUserRole('user');
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ background: '#050a18', color: 'white', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
    </div>
  );

  const MainSite = () => (
    <div className={`min-h-screen flex flex-col ${i18n.language === 'ka' ? 'font-georgian' : 'font-sans'}`}>
      <Navbar 
        setIsOrderOpen={setIsOrderOpen} 
        isOrderOpen={isOrderOpen} 
        setIsAuthOpen={setIsAuthOpen}
        user={user} 
      />
      <main className="flex-grow">
        <Hero />
        <Services user={user} setIsAuthOpen={setIsAuthOpen} setIsOrderOpen={setIsOrderOpen} />
        <Contact />
      </main>
      
      {!user && <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />}
      
      {/* ИСПРАВЛЕНИЕ: Теперь передаем user, чтобы Sidebar видел авторизацию */}
      <OrderSidebar 
        isOrderOpen={isOrderOpen} 
        setIsOrderOpen={setIsOrderOpen} 
        user={user} 
        setIsAuthOpen={setIsAuthOpen} 
      />
      
      {user && userRole !== 'admin' && <ChatWidget user={user} />}
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route 
          path="/manager" 
          element={
            user && userRole === 'admin' ? (
              <ManagerPanel />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;