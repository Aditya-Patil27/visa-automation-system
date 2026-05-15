import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const SidebarNav = ({ items, activeRoute, onNavigate }) => {
  const navigate = useNavigate();
  const handleNav = (route) => { if (onNavigate) onNavigate(route); else navigate(route); };

  return (
    <nav className="flex-1 px-4 space-y-1 mt-4">
      {items.map((item) => (
        <Button key={item.route} variant="nav" active={activeRoute === item.route}
          onClick={() => handleNav(item.route)} icon={item.icon} className="w-full !justify-start">
          {item.label}
        </Button>
      ))}
    </nav>
  );
};

export default SidebarNav;
