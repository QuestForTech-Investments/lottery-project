import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { MENU_ITEMS } from '@constants/menuItems';

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedSubmenu, setSelectedSubmenu] = useState(null);
  
  // Verificar si hay submenús expandidos para ajustar el ancho
  const hasExpandedSubmenus = MENU_ITEMS.some(item => 
    item.submenu && expandedMenus[item.id]
  );
  
  // Ancho dinámico: más ancho si hay submenús expandidos
  const getSidebarWidth = () => {
    if (!collapsed) return '247px'; // Aumentado de 242px a 247px (+5px)
    if (hasExpandedSubmenus) return '80px'; // Ancho para mostrar letras
    return '60px'; // Ancho mínimo
  };

  const handleMenuClick = (item) => {
    if (item.submenu) {
      setExpandedMenus((prev) => {
        const newState = {
          ...prev,
          [item.id]: !prev[item.id]
        };
        
        // Si se está colapsando la sección, limpiar la selección del submenú
        if (prev[item.id]) {
          // La sección se está colapsando, limpiar selección
          setSelectedSubmenu(null);
          console.log(`Colapsando sección ${item.id}, limpiando selección de submenú`);
        }
        
        return newState;
      });
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleSubmenuClick = (parentId, subitem) => {
    if (subitem.path) {
      // Guardar la selección del submenú
      setSelectedSubmenu(subitem.id);
      navigate(subitem.path);
    }
    if (!expandedMenus[parentId]) {
      setExpandedMenus((prev) => ({ ...prev, [parentId]: true }));
    }
  };

  const isActive = (item) => {
    if (item.path) {
      return location.pathname === item.path;
    }
    if (item.submenu) {
      return item.submenu.some(sub => sub.path === location.pathname);
    }
    return false;
  };

  return (
    <>
      <div
        className="flex flex-col overflow-y-auto flex-shrink-0 transition-all duration-300 sidebar-scrollbar"
        style={{ 
          width: getSidebarWidth(),
          backgroundColor: '#1a1a1a',
          color: 'rgb(255, 255, 255)',
          position: 'relative'
        }}
      >
        {/* Logo */}
        <div className="flex items-center border-b" style={{ 
          padding: '10px 0px',
          margin: '0px 12px 0px 10px',
          borderColor: 'rgba(255, 255, 255, 0.6)',
          minHeight: '40px'
        }}>
          <div 
            className="rounded-full flex items-center justify-center mr-2"
            style={{ 
              backgroundColor: '#ffffff', 
              color: '#1a1a1a',
              fontSize: '16px',
              fontWeight: '700',
              width: '32px',
              height: '32px'
            }}
          >
            L
          </div>
          {!collapsed && (
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '700', 
              textTransform: 'uppercase',
              lineHeight: '1',
              display: 'flex',
              alignItems: 'center',
              height: '40px'
            }}>
              LOTTERY
            </span>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-1 overflow-y-auto">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            const isExpanded = expandedMenus[item.id];
            const isHovered = hoveredItem === item.id;
            
            return (
              <div key={item.id}>
                <button
                  className="w-full transition-colors"
                  style={{
                    fontSize: '11px',
                    fontWeight: active || isHovered ? '700' : '400',
                    padding: '12px 8px',
                    margin: '0px 17px 0px 0px',
                    backgroundColor: 'transparent',
                    color: active ? 'rgb(107, 208, 152)' : (isHovered ? 'rgb(255, 255, 255)' : 'rgb(255, 255, 255)'),
                    borderRadius: '0px',
                    textTransform: 'uppercase',
                    display: 'grid',
                    gridTemplateColumns: collapsed ? '1fr' : 'auto 1fr auto',
                    alignItems: 'center',
                    gap: '12px',
                    minHeight: '52px'
                  }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => handleMenuClick(item)}
                >
                  <Icon 
                    style={{ 
                      color: active ? 'rgb(107, 208, 152)' : (isHovered ? 'rgb(255, 255, 255)' : 'rgba(255, 255, 255, 0.4)'),
                      width: '28px',
                      height: '28px',
                      justifySelf: 'center',
                      transition: 'color 0.2s ease-in-out'
                    }} 
                  />
                  {!collapsed && (
                    <>
                      <span 
                        style={{
                          textAlign: 'left',
                          lineHeight: '1.2',
                          display: 'flex',
                          alignItems: 'center',
                          color: active ? 'rgb(107, 208, 152)' : (isHovered ? 'rgb(255, 255, 255)' : 'rgb(255, 255, 255)'),
                          transition: 'color 0.2s ease-in-out'
                        }}
                      >
                        {item.label}
                      </span>
                      {item.submenu && (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {isExpanded ? (
                            <ChevronUp 
                              className="w-3 h-3" 
                              style={{
                                color: active ? 'rgb(107, 208, 152)' : (isHovered ? 'rgb(255, 255, 255)' : 'rgba(255, 255, 255, 0.4)'),
                                transition: 'color 0.2s ease-in-out'
                              }}
                            />
                          ) : (
                            <ChevronDown 
                              className="w-3 h-3" 
                              style={{
                                color: active ? 'rgb(107, 208, 152)' : (isHovered ? 'rgb(255, 255, 255)' : 'rgba(255, 255, 255, 0.4)'),
                                transition: 'color 0.2s ease-in-out'
                              }}
                            />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </button>

                {/* Submenu - Modo expandido */}
                {item.submenu && isExpanded && !collapsed && (
                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
                    {item.submenu.map((subitem) => {
                      const isSubActive = selectedSubmenu === subitem.id && location.pathname === subitem.path;
                      const isSubHovered = hoveredItem === subitem.id;
                      return (
                        <button
                          key={subitem.id}
                          className="w-full text-left transition-colors flex items-start"
                          style={{
                            fontSize: '12px',
                            fontWeight: isSubActive || isSubHovered ? '700' : '400',
                            padding: '3px 8px 3px 8px',
                            margin: '0px 17px 0px 0px',
                            backgroundColor: 'transparent',
                            color: isSubActive ? 'rgb(107, 208, 152)' : (isSubHovered ? 'rgb(255, 255, 255)' : 'rgb(255, 255, 255)'),
                            borderRadius: '0px',
                            textTransform: 'capitalize'
                          }}
                          onMouseEnter={() => setHoveredItem(subitem.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                          onClick={() => handleSubmenuClick(item.id, subitem)}
                        >
                          {subitem.shortcut && (
                            <span 
                              className="font-semibold flex-shrink-0" 
                              style={{ 
                                textTransform: 'uppercase',
                                color: isSubActive ? 'rgb(107, 208, 152)' : (isSubHovered ? 'rgb(255, 255, 255)' : 'rgba(255, 255, 255, 0.35)'),
                                width: '18px',
                                display: 'inline-block',
                                marginRight: '12px',
                                textAlign: 'center',
                                transition: 'color 0.2s ease-in-out'
                              }}
                            >
                              {subitem.shortcut}
                            </span>
                          )}
                          <span style={{ 
                            paddingLeft: subitem.shortcut ? '0px' : '30px',
                            color: isSubActive ? 'rgb(107, 208, 152)' : (isSubHovered ? 'rgb(255, 255, 255)' : 'rgb(255, 255, 255)'),
                            transition: 'color 0.2s ease-in-out'
                          }}>
                            {subitem.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Submenu - Modo colapsado (solo letras) */}
                {item.submenu && isExpanded && collapsed && (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 0px',
                    width: '100%'
                  }}>
                    {item.submenu.map((subitem) => {
                      const isSubActive = selectedSubmenu === subitem.id && location.pathname === subitem.path;
                      return (
                        <button
                          key={subitem.id}
                          className="transition-colors"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '4px',
                            backgroundColor: isSubActive ? 'rgba(107, 208, 152, 0.2)' : 'transparent',
                            color: isSubActive ? 'rgb(107, 208, 152)' : 'rgba(255, 255, 255, 0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: isSubActive ? '700' : '500',
                            textTransform: 'uppercase',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out'
                          }}
                          onClick={() => handleSubmenuClick(item.id, subitem)}
                        >
                          {subitem.shortcut || subitem.label.charAt(0).toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </nav>
        
        {/* Triángulo indicador del elemento activo - DESACTIVADO */}
        {false && (() => {
          // Encontrar el elemento activo
          let activeItem = null;
          let activeSubItem = null;
          
          for (const item of MENU_ITEMS) {
            if (item.path && location.pathname === item.path) {
              activeItem = item;
              break;
            }
            if (item.submenu) {
              const subItem = item.submenu.find(sub => sub.path === location.pathname);
              if (subItem) {
                activeItem = item;
                activeSubItem = subItem;
                break;
              }
            }
          }
          
          // Debug: mostrar información del elemento activo
          console.log('Triángulo Debug:', {
            activeItem: activeItem?.id,
            activeSubItem: activeSubItem?.id,
            currentPath: location.pathname,
            expandedMenus
          });
          
          if (activeItem) {
            // Calcular la posición del triángulo
            const activeIndex = MENU_ITEMS.findIndex(item => item === activeItem);
            let triangleTop = 80 + (activeIndex * 52) + 26; // 80px para el logo + (índice * altura del elemento) + 26px para centrar en el elemento
            
            // Si es un submenú activo, ajustar la posición
            if (activeSubItem && expandedMenus[activeItem.id]) {
              const subIndex = activeItem.submenu.findIndex(sub => sub === activeSubItem);
              // Ajustar la posición: altura del elemento principal + altura de subelementos + centrado
              triangleTop += 52 + (subIndex * 32) + 16; // 32px altura de submenú + 16px para centrar
              
              console.log('Posición del triángulo:', {
                activeIndex,
                subIndex,
                triangleTop,
                submenuHeight: 32,
                centerOffset: 16
              });
            }
            
            return (
              <div
                style={{
                  position: 'absolute',
                  right: '-6px',
                  top: `${triangleTop}px`,
                  width: '0',
                  height: '0',
                  borderTop: '12px solid transparent',
                  borderBottom: '12px solid transparent',
                  borderLeft: '12px solid white',
                  transform: 'translateY(-50%)',
                  zIndex: 10
                }}
              />
            );
          }
          return null;
        })()}
      </div>

    </>
  );
}

