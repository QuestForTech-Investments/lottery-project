import React, { useState, useCallback, memo } from 'react';
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
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { MENU_ITEMS, type MenuItem } from '@constants/menuItems';

interface SidebarProps {
  collapsed: boolean;
  hovered: boolean;
  onToggleCollapse: () => void;
  onHoverChange: (hovered: boolean) => void;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function Sidebar({ collapsed, hovered, onHoverChange, isMobile = false, mobileOpen = false, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleMenuClick = useCallback((item: MenuItem) => {
    if (item.submenu) {
      setExpandedMenus((prev) => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
    } else if (item.path) {
      navigate(item.path);
      // Close mobile drawer after navigation
      if (isMobile && onMobileClose) {
        onMobileClose();
      }
    }
  }, [navigate, isMobile, onMobileClose]);

  const handleSubmenuClick = useCallback((subitem: MenuItem) => {
    if (subitem.path) {
      navigate(subitem.path);
      // Close mobile drawer after navigation
      if (isMobile && onMobileClose) {
        onMobileClose();
      }
    }
  }, [navigate, isMobile, onMobileClose]);

  const isActive = useCallback((item: MenuItem): boolean => {
    if (item.path) {
      return location.pathname === item.path;
    }
    if (item.submenu) {
      return item.submenu.some(sub => sub.path === location.pathname);
    }
    return false;
  }, [location.pathname]);

  const isSubActive = useCallback((subitem: MenuItem): boolean => {
    return location.pathname === subitem.path;
  }, [location.pathname]);

  const getMenuLabel = useCallback((item: MenuItem): string => {
    if (item.id === 'inicio') {
      return t('menu.inicio');
    }
    return item.label;
  }, [t]);

  // Handlesr hover del sidebar
  const handleMouseEnter = useCallback(() => {
    if (collapsed) {
      onHoverChange(true);
    }
  }, [collapsed, onHoverChange]);

  const handleMouseLeave = useCallback(() => {
    if (collapsed) {
      onHoverChange(false);
    }
  }, [collapsed, onHoverChange]);

  const handleItemHover = useCallback((id: string | null) => {
    setHoveredItem(id);
  }, []);

  // El drawer se expande si está en hover (cuando collapsed)
  const drawerWidth = collapsed
    ? (hovered ? 280 : 91)
    : 280;

  // Show contenido expandido si NO está colapsado O si está colapsado pero con hover
  // On mobile, always show expanded content
  const showExpandedContent = isMobile || !collapsed || hovered;

  // On mobile, don't render the permanent drawer
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            overflowY: 'auto',
            WebkitFontSmoothing: 'antialiased',
            textRendering: 'optimizeLegibility',
          },
        }}
      >
        {/* Logo Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 20px',
            height: '64px',
            minHeight: '64px',
            maxHeight: '64px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
            boxSizing: 'border-box',
            justifyContent: 'flex-start'
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #319795 0%, #2c7a7b 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              marginRight: 2,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            }}
          >
            L
          </Box>
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
            }}
          >
            LOTTERY
          </Typography>
        </Box>

        {/* Menu Items */}
        <List sx={{ padding: 0, paddingTop: '20px' }}>
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            const isExpanded = expandedMenus[item.id];
            const isHovered = hoveredItem === item.id;

            return (
              <React.Fragment key={item.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleMenuClick(item)}
                    onMouseEnter={() => handleItemHover(item.id)}
                    onMouseLeave={() => handleItemHover(null)}
                    sx={{
                      minHeight: 16,
                      py: 0.3,
                      margin: '1px 8px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      '&:hover': {
                        backgroundColor: 'rgba(49, 151, 149, 0.15)',
                        transform: 'translateX(4px)'
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: active ? '#38b2ac' : (isHovered ? '#ffffff' : '#ffffff'),
                        transition: 'all 0.3s ease-in-out'
                      }}
                    >
                      {Icon && <Icon sx={{ fontSize: 24 }} />}
                    </ListItemIcon>
                    <ListItemText
                      primary={getMenuLabel(item)}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '11.5px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          color: active ? '#38b2ac' : (isHovered ? '#ffffff' : '#ffffff'),
                          fontFamily: '"Montserrat","Helvetica Neue",Arial,sans-serif',
                          WebkitFontSmoothing: 'antialiased',
                          textRendering: 'optimizeLegibility',
                          lineHeight: '1px',
                          whiteSpace: 'nowrap',
                        }
                      }}
                    />
                    {item.submenu && (
                      <Box sx={{
                        color: active ? '#38b2ac' : (isHovered ? '#ffffff' : '#ffffff'),
                        transition: 'all 0.3s ease-in-out'
                      }}>
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </Box>
                    )}
                  </ListItemButton>
                </ListItem>

                {/* Submenu */}
                {item.submenu && (
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.submenu.map((subitem) => {
                        const subActive = isSubActive(subitem);
                        const isSubHovered = hoveredItem === subitem.id;
                        return (
                          <ListItem key={subitem.id} disablePadding>
                            <ListItemButton
                              onClick={() => handleSubmenuClick(subitem)}
                              onMouseEnter={() => handleItemHover(subitem.id)}
                              onMouseLeave={() => handleItemHover(null)}
                              sx={{
                                pl: 4,
                                minHeight: 16,
                                py: 0.2,
                                margin: '1px 8px 1px 12px',
                                borderRadius: '8px',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                '&:hover': {
                                  backgroundColor: 'rgba(49, 151, 149, 0.1)',
                                  transform: 'translateX(4px)'
                                },
                              }}
                            >
                              {subitem.shortcut && (
                                <Typography
                                  sx={{
                                    color: subActive ? '#38b2ac' : (isSubHovered ? '#ffffff' : '#ffffff'),
                                    fontSize: '10.5px',
                                    fontWeight: (subActive || isSubHovered) ? 'bold' : 'normal',
                                    marginRight: 1,
                                    textTransform: 'uppercase',
                                    minWidth: '20px',
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease-in-out'
                                  }}
                                >
                                  {subitem.shortcut}
                                </Typography>
                              )}
                              <ListItemText
                                primary={subitem.label}
                                sx={{
                                  '& .MuiListItemText-primary': {
                                    fontSize: '10.5px',
                                    fontWeight: 600,
                                    color: subActive ? '#38b2ac' : (isSubHovered ? '#ffffff' : '#ffffff'),
                                    fontFamily: '"Montserrat","Helvetica Neue",Arial,sans-serif',
                                    WebkitFontSmoothing: 'antialiased',
                                    textRendering: 'optimizeLegibility',
                                    lineHeight: '1px',
                                    whiteSpace: 'nowrap',
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
              </React.Fragment>
            );
          })}
        </List>
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: 'width 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)',
          overflowX: 'hidden',
          overflowY: 'auto',
          WebkitFontSmoothing: 'antialiased',
          textRendering: 'optimizeLegibility',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 1300,
          borderRadius: 0,
          // Hide scrollbar by default
          scrollbarWidth: 'none', // Firefox
          '&::-webkit-scrollbar': {
            width: '0px',
          },
          // Show scrollbar on hover
          '&:hover': {
            scrollbarWidth: 'thin', // Firefox
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(255, 255, 255, 0.5)',
            },
          },
        },
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: showExpandedContent ? '14px 20px' : '14px 8px',
          height: '64px',
          minHeight: '64px',
          maxHeight: '64px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
          boxSizing: 'border-box',
          transition: 'padding 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)',
          justifyContent: showExpandedContent ? 'flex-start' : 'center'
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            marginRight: showExpandedContent ? 2 : 0,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            transition: 'margin 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)'
          }}
        >
          L
        </Box>
        {showExpandedContent && (
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
      <List sx={{ padding: 0, paddingTop: '20px' }}>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          const isExpanded = expandedMenus[item.id];
          const isHovered = hoveredItem === item.id;

          return (
            <React.Fragment key={item.id}>
              <ListItem disablePadding>
                {!showExpandedContent ? (
                  <Tooltip title={getMenuLabel(item)} placement="right">
                    <ListItemButton
                      onClick={() => handleMenuClick(item)}
                      onMouseEnter={() => handleItemHover(item.id)}
                      onMouseLeave={() => handleItemHover(null)}
                      sx={{
                        minHeight: 16,
                        py: 0.3,
                        justifyContent: 'center',
                        margin: '1px 8px',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          justifyContent: 'center',
                          color: active ? '#c084fc' : (isHovered ? '#cbd5e1' : '#94a3b8'),
                          transition: 'all 0.3s ease-in-out'
                        }}
                      >
                        {Icon && <Icon sx={{ fontSize: 24 }} />}
                      </ListItemIcon>
                    </ListItemButton>
                  </Tooltip>
                ) : (
                  <ListItemButton
                    onClick={() => handleMenuClick(item)}
                    onMouseEnter={() => handleItemHover(item.id)}
                    onMouseLeave={() => handleItemHover(null)}
                    sx={{
                      minHeight: 16,
                      py: 0.3,
                      margin: '1px 8px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      '&:hover': {
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        transform: 'translateX(4px)'
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: active ? '#c084fc' : (isHovered ? '#ffffff' : '#ffffff'),
                        transition: 'all 0.3s ease-in-out'
                      }}
                    >
                      {Icon && <Icon sx={{ fontSize: 24 }} />}
                    </ListItemIcon>
                    <ListItemText
                      primary={getMenuLabel(item)}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '11.5px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          color: active ? '#c084fc' : (isHovered ? '#ffffff' : '#ffffff'),
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
                        color: active ? '#c084fc' : (isHovered ? '#ffffff' : '#ffffff'),
                        transition: 'all 0.3s ease-in-out'
                      }}>
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </Box>
                    )}
                  </ListItemButton>
                )}
              </ListItem>

              {/* Submenu */}
              {item.submenu && showExpandedContent && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.submenu.map((subitem) => {
                      const subActive = isSubActive(subitem);
                      const isSubHovered = hoveredItem === subitem.id;
                      return (
                        <ListItem key={subitem.id} disablePadding>
                          <ListItemButton
                            onClick={() => handleSubmenuClick(subitem)}
                            onMouseEnter={() => handleItemHover(subitem.id)}
                            onMouseLeave={() => handleItemHover(null)}
                            sx={{
                              pl: 4,
                              minHeight: 16,
                              py: 0.2,
                              margin: '1px 8px 1px 12px',
                              borderRadius: '8px',
                              transition: 'all 0.3s ease',
                              position: 'relative',
                              '&:hover': {
                                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                                transform: 'translateX(4px)'
                              },
                            }}
                          >
                            {subitem.shortcut && (
                              <Typography
                                sx={{
                                  color: subActive ? '#c084fc' : (isSubHovered ? '#ffffff' : '#ffffff'),
                                  fontSize: '10.5px',
                                  fontWeight: (subActive || isSubHovered) ? 'bold' : 'normal',
                                  marginRight: 1,
                                  textTransform: 'uppercase',
                                  minWidth: '20px',
                                  textAlign: 'center',
                                  transition: 'all 0.3s ease-in-out'
                                }}
                              >
                                {subitem.shortcut}
                              </Typography>
                            )}
                            <ListItemText
                              primary={subitem.label}
                              sx={{
                                '& .MuiListItemText-primary': {
                                  fontSize: '10.5px',
                                  fontWeight: 600,
                                  color: subActive ? '#c084fc' : (isSubHovered ? '#ffffff' : '#ffffff'),
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
              {item.submenu && !showExpandedContent && isExpanded && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 0.3 }}>
                  {item.submenu.map((subitem) => {
                    const subActive = isSubActive(subitem);
                    const isSubHovered = hoveredItem === subitem.id;
                    return (
                      <Tooltip key={subitem.id} title={subitem.label} placement="right">
                        <IconButton
                          onClick={() => handleSubmenuClick(subitem)}
                          onMouseEnter={() => handleItemHover(subitem.id)}
                          onMouseLeave={() => handleItemHover(null)}
                          sx={{
                            width: 28,
                            height: 22,
                            margin: '1px 0',
                            borderRadius: '6px',
                            backgroundColor: 'transparent',
                            color: subActive ? '#c084fc' : (isSubHovered ? '#ffffff' : '#ffffff'),
                            fontSize: '10.5px',
                            fontWeight: (subActive || isSubHovered) ? 'bold' : 'normal',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                              backgroundColor: 'rgba(99, 102, 241, 0.15)',
                              transform: 'scale(1.05)'
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

export default memo(Sidebar, (prev, next) =>
  prev.collapsed === next.collapsed &&
  prev.hovered === next.hovered &&
  prev.isMobile === next.isMobile &&
  prev.mobileOpen === next.mobileOpen
);