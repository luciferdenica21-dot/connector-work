import React from 'react';
import { useTranslation } from 'react-i18next';

const OrderButton = ({ user, setIsOrderOpen, setIsAuthOpen, className }) => {
  const { t } = useTranslation();

  const handleOrderClick = () => {
    if (user) {
      setIsOrderOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  };

  return (
    <button 
      onClick={handleOrderClick} 
      className={className}
    >
      {t("Заказать проект")}
    </button>
  );
};

export default OrderButton;