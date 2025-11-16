import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  DollarSign,
  Award,
  Home,
  Store,
  PieChart,
  CreditCard,
  Coins,
  Bell,
  User,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useTime } from '@hooks/useTime';
import LanguageSelector from '@components/common/LanguageSelector';

export default function Header({ sidebarCollapsed, onToggleSidebar }) {
  const navigate = useNavigate();
  const currentTime = useTime();

  const quickAccessButtons = [
    { Icon: Ticket, label: 'Tickets', path: '/tickets/crear' },
    { Icon: DollarSign, label: 'Ventas', path: '/ventas/dia' },
    { Icon: Award, label: 'Resultados', path: '/resultados' },
    { Icon: Home, label: 'Inicio', path: '/' },
    { Icon: Store, label: 'Bancas', path: '/bancas/lista' },
    { Icon: PieChart, label: 'Balances', path: '/balances/bancas' },
    { Icon: CreditCard, label: 'Pagos', path: '/cobros-pagos/lista' },
    { Icon: Coins, label: 'Sorteos', path: '/sorteos/lista' }
  ];

  return (
    <header 
      className="border-b flex items-center shadow-sm flex-shrink-0"
      style={{ 
        backgroundColor: '#e8e5e0', 
        borderColor: '#d0d0d0',
        height: '60px',
        padding: '0 8px'
      }}
    >
      {/* Botón de toggle del sidebar */}
      <button
        className="rounded-full shadow-lg hover:bg-gray-600 transition-all z-50 mr-2"
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: 'rgb(102, 97, 91)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none'
        }}
        onClick={onToggleSidebar}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>

      {/* Iconos de acceso rápido - alineados con el botón toggle */}
      <div className="flex items-center gap-1">
        {quickAccessButtons.map(({ Icon: IconComp, label, path }, idx) => (
          <button
            key={idx}
            className="hover:bg-gray-300 p-2 rounded transition-colors"
            title={label}
            style={{ 
              color: 'rgb(102, 97, 91)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px'
            }}
            onClick={() => navigate(path)}
          >
            <IconComp style={{ width: '32px', height: '32px' }} />
          </button>
        ))}
      </div>

      {/* Espaciador para empujar elementos a la derecha */}
      <div className="flex-1"></div>

      {/* Elementos del lado derecho */}
      <div className="flex items-center gap-3">
        <span style={{ 
          fontSize: '14px', 
          fontWeight: '700',
          color: 'rgb(102, 97, 91)'
        }}>{currentTime}</span>
        
        <span style={{ fontSize: '14px', color: 'rgb(102, 97, 91)' }}>oliver</span>
        
        <button className="hover:bg-gray-300 p-1 rounded" style={{ color: 'rgb(102, 97, 91)' }}>
          <Bell className="w-5 h-5" />
        </button>
        
        <button className="hover:bg-gray-300 p-1 rounded" style={{ color: 'rgb(102, 97, 91)' }}>
          <User className="w-5 h-5" />
        </button>
        
        <LanguageSelector />
      </div>
    </header>
  );
}

