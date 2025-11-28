import { useEffect } from 'react';

export interface KeyboardShortcutHandlers {
  onClearFields?: () => void
  onCancelTicket?: () => void
  onChangeLottery?: () => void
  onPrint?: () => void
  onDuplicate?: () => void
  onMarkAsPaid?: () => void
}

/**
 * Hook para manejar atajos de teclado globales
 * Replica el comportamiento de la aplicación Vue.js original
 */
export const useKeyboardShortcuts = (handlers: KeyboardShortcutHandlers): void => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if the user is en un textarea o input type text/number
      const target = e.target as HTMLElement | null;
      const isInputField = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';

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

    // Add el event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers]);
};

export default useKeyboardShortcuts;
