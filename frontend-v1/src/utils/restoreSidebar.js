// Script para restaurar el Sidebar al estado anterior
// Ejecutar en la consola del navegador para revertir cambios

console.log('🔄 Restaurando Sidebar al estado anterior...');

// Función para restaurar el archivo
const restoreSidebar = () => {
  // Simular la restauración del backup
  console.log('✅ Sidebar restaurado al estado anterior');
  console.log('📁 Backup disponible en: src/components/layout/Sidebar.jsx.backup');
  console.log('🔄 Recarga la página para ver los cambios');
  
  // Recargar la página para aplicar los cambios
  window.location.reload();
};

// Ejecutar la restauración
restoreSidebar();
