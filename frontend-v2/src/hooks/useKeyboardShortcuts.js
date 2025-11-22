import { useEffect } from 'react';

/**
 * Hook para manejar atajos de teclado globales
 * Replica el comportamiento de la aplicación Vue.js original
 */
export const useKeyboardShortcuts = (handlers) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorar si el usuario está en un textarea o input type text/number
      const target = e.target;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Teclas que funcionan incluso en campos de entrada
      const alwaysActiveKeys = ['ArrowUp'];

      // Si es un campo de entrada y no es una tecla "always active", salir
      if (isInputField && !alwaysActiveKeys.includes(e.key)) {
        return;
      }

      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handlers.onClearFields?.();
          break;

        case 'L':
        case 'l':
          if (!isInputField) {
            e.preventDefault();
            handlers.onCancelTicket?.();
          }
          break;

        case '/':
          if (!isInputField) {
            e.preventDefault();
            handlers.onChangeLottery?.();
          }
          break;

        case '*':
          if (!isInputField) {
            e.preventDefault();
            handlers.onPrint?.();
          }
          break;

        case 'c':
        case 'C':
          if (!isInputField) {
            e.preventDefault();
            handlers.onDuplicate?.();
          }
          break;

        case 'P':
        case 'p':
          if (!isInputField) {
            e.preventDefault();
            handlers.onMarkAsPaid?.();
          }
          break;

        default:
          break;
      }
    };

    // Agregar el event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers]);
};

export default useKeyboardShortcuts;
