import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Box,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import { MENU_ITEMS } from '@constants/menuItems';

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleMenuClick = (item) => {
    if (item.submenu) {
      setExpandedMenus((prev) => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleSubmenuClick = (subitem) => {
    if (subitem.path) {
      navigate(subitem.path);
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

  const isSubActive = (subitem) => {
    return location.pathname === subitem.path;
  };

  const getMenuLabel = (item) => {
    if (item.id === 'inicio') {
      return t('menu.inicio');
    }
    return item.label;
  };

  const drawerWidth = collapsed ? 60 : 280;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1a1a1a',
          color: 'white',
          transition: 'width 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
          overflowX: 'hidden',
          WebkitFontSmoothing: 'antialiased',
          textRendering: 'optimizeLegibility',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 1300
        },
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '14px 8px' : '14px 20px',
          height: '60px',
          minHeight: '60px',
          maxHeight: '60px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          boxSizing: 'border-box',
          transition: 'padding 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)'
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'white',
            color: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            marginRight: collapsed ? 0 : 2
          }}
        >
          L
        </Box>
        {!collapsed && (
          <Typography
            variant="h6"
            sx={{
              fontSize: '1rem',
              fontWeight: 400,
              textTransform: 'uppercase',
              color: '#fff',
              fontFamily: '"Montserrat","Helvetica Neue",Arial,sans-serif',
              WebkitFontSmoothing: 'antialiased',
              textRendering: 'optimizeLegibility',
              lineHeight: '30px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              transition: 'all 300ms ease 0s',
              display: 'block',
              opacity: 1,
              padding: '11px 0 8px',
              transform: 'translate3d(0px, 0, 0)',
              WebkitTextSizeAdjust: '100%',
              WebkitTapHighlightColor: 'rgba(0,0,0,0)',
              backgroundColor: 'transparent',
              boxSizing: 'border-box'
            }}
          >
            LOTTERY
          </Typography>
        )}
      </Box>

      {/* Menu Items */}
      <List sx={{ padding: 0 }}>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          const isExpanded = expandedMenus[item.id];
          const isHovered = hoveredItem === item.id;
          const isNucleoIcon = typeof item.icon === 'string';

          return (
            <React.Fragment key={item.id}>
              <ListItem disablePadding>
                {collapsed ? (
                  <Tooltip title={getMenuLabel(item)} placement="right">
                    <ListItemButton
                      onClick={() => handleMenuClick(item)}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      sx={{
                        minHeight: 40,
                        justifyContent: 'center',
                        backgroundColor: active ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)'
                        }
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          justifyContent: 'center',
                          color: active ? 'rgb(107, 208, 152)' : (isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'),
                          transition: 'color 0.2s ease-in-out'
                        }}
                      >
                        {isNucleoIcon ? (
                          <i className={`nc-icon ${item.icon}`} style={{ fontSize: '24px' }}></i>
                        ) : (
                          <Icon size={24} />
                        )}
                      </ListItemIcon>
                    </ListItemButton>
                  </Tooltip>
                ) : (
                  <ListItemButton
                    onClick={() => handleMenuClick(item)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    sx={{
                      minHeight: 48,
                      backgroundColor: active ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)'
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: active ? 'rgb(107, 208, 152)' : (isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'),
                        transition: 'color 0.2s ease-in-out'
                      }}
                    >
                      {isNucleoIcon ? (
                        <i className={`nc-icon ${item.icon}`} style={{ fontSize: '24px' }}></i>
                      ) : (
                        <Icon size={24} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={getMenuLabel(item)}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '14px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          color: active ? 'rgb(107, 208, 152)' : (isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'),
                          fontFamily: '"Montserrat","Helvetica Neue",Arial,sans-serif',
                          WebkitFontSmoothing: 'antialiased',
                          textRendering: 'optimizeLegibility',
                          lineHeight: '1px',
                          whiteSpace: 'nowrap',
                          transition: 'all 300ms ease 0s',
                          WebkitTextSizeAdjust: '100%',
                          WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                          boxSizing: 'border-box',
                          cursor: 'pointer',
                          position: 'relative',
                          display: 'block',
                          height: 'auto',
                          margin: 0
                        }
                      }}
                    />
                    {item.submenu && (
                      <Box sx={{ 
                        color: active ? 'rgb(107, 208, 152)' : (isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'),
                        transition: 'color 0.2s ease-in-out'
                      }}>
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </Box>
                    )}
                  </ListItemButton>
                )}
              </ListItem>

              {/* Submenu */}
              {item.submenu && !collapsed && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.submenu.map((subitem) => {
                      const subActive = isSubActive(subitem);
                      const isSubHovered = hoveredItem === subitem.id;
                      return (
                        <ListItem key={subitem.id} disablePadding>
                          <ListItemButton
                            onClick={() => handleSubmenuClick(subitem)}
                            onMouseEnter={() => setHoveredItem(subitem.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                            sx={{
                              pl: 4,
                              minHeight: 26,
                              backgroundColor: subActive ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)'
                              }
                            }}
                          >
                            {subitem.shortcut && (
                              <Typography
                                sx={{
                                  color: subActive ? 'rgb(107, 208, 152)' : (isSubHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'),
                                  fontSize: '10px',
                                  fontWeight: (subActive || isSubHovered) ? 'bold' : 'normal',
                                  marginRight: 1,
                                  textTransform: 'uppercase',
                                  minWidth: '20px',
                                  textAlign: 'center',
                                  transition: 'color 0.2s ease-in-out'
                                }}
                              >
                                {subitem.shortcut}
                              </Typography>
                            )}
                            <ListItemText
                              primary={subitem.label}
                              sx={{
                                '& .MuiListItemText-primary': {
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  color: subActive ? 'rgb(107, 208, 152)' : (isSubHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'),
                                  fontFamily: '"Montserrat","Helvetica Neue",Arial,sans-serif',
                                  WebkitFontSmoothing: 'antialiased',
                                  textRendering: 'optimizeLegibility',
                                  lineHeight: '1px',
                                  whiteSpace: 'nowrap',
                                  transition: 'all 300ms ease 0s',
                                  WebkitTextSizeAdjust: '100%',
                                  WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                                  boxSizing: 'border-box',
                                  cursor: 'pointer',
                                  position: 'relative',
                                  display: 'block',
                                  height: 'auto',
                                  margin: 0
                                }
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}

              {/* Collapsed submenu */}
              {item.submenu && collapsed && isExpanded && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
                  {item.submenu.map((subitem) => {
                    const subActive = isSubActive(subitem);
                    const isSubHovered = hoveredItem === subitem.id;
                    return (
                      <Tooltip key={subitem.id} title={subitem.label} placement="right">
                        <IconButton
                          onClick={() => handleSubmenuClick(subitem)}
                          onMouseEnter={() => setHoveredItem(subitem.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                          sx={{
                            width: 32,
                            height: 32,
                            margin: '2px 0',
                            backgroundColor: subActive ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
                            color: subActive ? 'rgb(107, 208, 152)' : (isSubHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'),
                            fontSize: '12px',
                            fontWeight: (subActive || isSubHovered) ? 'bold' : 'normal',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                          }}
                        >
                          {subitem.shortcut || subitem.label.charAt(0).toUpperCase()}
                        </IconButton>
                      </Tooltip>
                    );
                  })}
                </Box>
              )}
            </React.Fragment>
          );
        })}
      </List>
    </Drawer>
  );
}