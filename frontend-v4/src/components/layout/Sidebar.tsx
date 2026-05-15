import React, { useState, useCallback, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import lottobookLogo from '@/assets/images/lottobook-logo.png';
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
import useUserPermissions from '@/hooks/useUserPermissions';

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
  const { hasPermission } = useUserPermissions();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Hide items whose required permission the user doesn't have.
  //   - Items without a `permission` field are visible by default.
  //   - permission can be a single code or an array (any-of).
  //   - Parent items with a submenu also require their own permission (if set)
  //     AND at least one visible child.
  const holdsPermission = useCallback((req: string | string[] | undefined): boolean => {
    if (!req) return true;
    if (Array.isArray(req)) return req.some(c => hasPermission(c));
    return hasPermission(req);
  }, [hasPermission]);

  const isItemVisible = useCallback((item: MenuItem): boolean => {
    if (!holdsPermission(item.permission)) return false;
    if (item.submenu && item.submenu.length > 0) {
      return item.submenu.some(isItemVisible);
    }
    return true;
  }, [holdsPermission]);

  const visibleMenu = React.useMemo(
    () => MENU_ITEMS
      .filter(isItemVisible)
      .map(item => item.submenu
        ? { ...item, submenu: item.submenu.filter(isItemVisible) }
        : item),
    [isItemVisible]
  );

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
            padding: '8px 20px',
            height: '80px',
            minHeight: '80px',
            maxHeight: '80px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
            boxSizing: 'border-box',
            justifyContent: 'flex-start'
          }}
        >
          <Box
            component="img"
            src={lottobookLogo}
            alt="Lottobook"
            sx={{ width: 60, height: 60, objectFit: 'contain', marginRight: 2 }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <Typography
              sx={{
                fontSize: '0.95rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#fff',
                fontFamily: '"Montserrat","Helvetica Neue",Arial,sans-serif',
                WebkitFontSmoothing: 'antialiased',
                textRendering: 'optimizeLegibility',
                lineHeight: 1.1,
              }}
            >
              LOTTOBOOK
            </Typography>
            <Typography
              sx={{
                fontSize: '0.7rem',
                fontWeight: 400,
                textTransform: 'uppercase',
                color: '#cbd5e1',
                fontFamily: '"Montserrat","Helvetica Neue",Arial,sans-serif',
                WebkitFontSmoothing: 'antialiased',
                textRendering: 'optimizeLegibility',
                lineHeight: 1.1,
                letterSpacing: '0.5px',
              }}
            >
              LOTTERY SYSTEM
            </Typography>
          </Box>
        </Box>

        {/* Menu Items */}
        <List sx={{ padding: 0, paddingTop: '20px' }}>
          {visibleMenu.map((item) => {
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
          padding: showExpandedContent ? '6px 20px' : '6px 8px',
          height: '72px',
          minHeight: '72px',
          maxHeight: '72px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
          boxSizing: 'border-box',
          transition: 'padding 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)',
          justifyContent: showExpandedContent ? 'flex-start' : 'center'
        }}
      >
        <Box
          component="img"
          src={lottobookLogo}
          alt="Lottobook"
          sx={{
            width: 56,
            height: 56,
            objectFit: 'contain',
            marginRight: showExpandedContent ? 2 : 0,
            transition: 'margin 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)'
          }}
        />
        {showExpandedContent && (
          <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, overflow: 'hidden' }}>
            <Typography
              sx={{
                fontSize: '0.95rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#fff',
                fontFamily: '"Montserrat","Helvetica Neue",Arial,sans-serif',
                WebkitFontSmoothing: 'antialiased',
                textRendering: 'optimizeLegibility',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
              }}
            >
              LOTTOBOOK
            </Typography>
            <Typography
              sx={{
                fontSize: '0.7rem',
                fontWeight: 400,
                textTransform: 'uppercase',
                color: '#cbd5e1',
                fontFamily: '"Montserrat","Helvetica Neue",Arial,sans-serif',
                WebkitFontSmoothing: 'antialiased',
                textRendering: 'optimizeLegibility',
                lineHeight: 1.1,
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
              }}
            >
              LOTTERY SYSTEM
            </Typography>
          </Box>
        )}
      </Box>

      {/* Menu Items */}
      <List sx={{ padding: 0, paddingTop: '20px' }}>
        {visibleMenu.map((item) => {
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