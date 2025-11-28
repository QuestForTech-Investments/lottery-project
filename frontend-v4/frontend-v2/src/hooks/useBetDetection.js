/**
 * Hook para detectar automáticamente el tipo de apuesta basándose en el formato del número ingresado
 * Replica la lógica de la aplicación Vue.js original
 */

export const useBetDetection = (input) => {
  if (!input || typeof input !== 'string') {
    return {
      betType: null,
      betTypeCode: null,
      section: null,
      isValid: false,
      displayName: '',
      needsAmount: true
    };
  }

  const trimmedInput = input.trim();

  // 1. Verificar generadores especiales primero
  if (trimmedInput.endsWith('q')) {
    const number = trimmedInput.slice(0, -1);
    if (number.length === 3) {
      return {
        betType: 'CASH3_COMBINATIONS',
        betTypeCode: 'CASH3_STRAIGHT',
        section: 'CASH 3',
        isValid: true,
        displayName: 'Cash3 Combinaciones',
        needsAmount: true,
        generator: 'combinations'
      };
    }
    if (number.length === 4) {
      return {
        betType: 'PLAY4_COMBINATIONS',
        betTypeCode: 'PLAY4_STRAIGHT',
        section: 'PLAY 4 & PICK 5',
        isValid: true,
        displayName: 'Play4 Combinaciones',
        needsAmount: true,
        generator: 'combinations'
      };
    }
  }

  if (trimmedInput.endsWith('.')) {
    const number = trimmedInput.slice(0, -1);
    if (number.length === 2) {
      return {
        betType: 'DIRECTO_COMBINATIONS',
        betTypeCode: 'DIRECTO',
        section: 'DIRECTO',
        isValid: true,
        displayName: 'Directo Combinaciones',
        needsAmount: true,
        generator: 'combinations'
      };
    }
    if (number.length === 4) {
      return {
        betType: 'PALE_COMBINATIONS',
        betTypeCode: 'PALE',
        section: 'PALE & TRIPLETA',
        isValid: true,
        displayName: 'Palé Combinaciones',
        needsAmount: true,
        generator: 'combinations'
      };
    }
    if (number.length === 6) {
      return {
        betType: 'TRIPLETA_COMBINATIONS',
        betTypeCode: 'TRIPLETA',
        section: 'PALE & TRIPLETA',
        isValid: true,
        displayName: 'Tripleta Combinaciones',
        needsAmount: true,
        generator: 'combinations'
      };
    }
  }

  // Generador de secuencia de pares (ej: 33d66)
  if (trimmedInput.includes('d')) {
    const parts = trimmedInput.split('d');
    if (parts.length === 2 && parts[0].length === 2 && parts[1].length === 2) {
      return {
        betType: 'DIRECTO_SEQUENCE',
        betTypeCode: 'DIRECTO',
        section: 'DIRECTO',
        isValid: true,
        displayName: 'Directo Secuencia',
        needsAmount: true,
        generator: 'sequence_pairs',
        sequenceStart: parts[0],
        sequenceEnd: parts[1]
      };
    }
  }

  // Generador +100 para Cash 3 (ej: 123-10)
  if (trimmedInput.endsWith('-10')) {
    const number = trimmedInput.slice(0, -3);
    if (number.length === 3) {
      return {
        betType: 'CASH3_PLUS_100',
        betTypeCode: 'CASH3_STRAIGHT',
        section: 'CASH 3',
        isValid: true,
        displayName: 'Cash3 +100',
        needsAmount: true,
        generator: 'plus_100'
      };
    }
  }

  // Generador de secuencia (ej: 345+348)
  if (trimmedInput.includes('+') && !trimmedInput.endsWith('+')) {
    const parts = trimmedInput.split('+');
    if (parts.length === 2 && parts[0].length === 3 && parts[1].length === 3) {
      return {
        betType: 'CASH3_SEQUENCE',
        betTypeCode: 'CASH3_STRAIGHT',
        section: 'CASH 3',
        isValid: true,
        displayName: 'Cash3 Secuencia',
        needsAmount: true,
        generator: 'sequence',
        sequenceStart: parts[0],
        sequenceEnd: parts[1]
      };
    }
  }

  // 2. Verificar modificadores de posición (F, B)
  if (trimmedInput.endsWith('F+')) {
    const number = trimmedInput.slice(0, -2);
    if (number.length === 3) {
      return {
        betType: 'CASH3_FRONT_BOX',
        betTypeCode: 'CASH3_FRONT_BOX',
        section: 'CASH 3',
        isValid: true,
        displayName: 'Cash3 Front Box',
        needsAmount: true
      };
    }
  }

  if (trimmedInput.endsWith('F')) {
    const number = trimmedInput.slice(0, -1);
    if (number.length === 3) {
      return {
        betType: 'CASH3_FRONT_STRAIGHT',
        betTypeCode: 'CASH3_FRONT_STRAIGHT',
        section: 'CASH 3',
        isValid: true,
        displayName: 'Cash3 Front Straight',
        needsAmount: true
      };
    }
    if (number.length === 2) {
      return {
        betType: 'PICK_TWO_FRONT',
        betTypeCode: 'PICK_TWO_FRONT',
        section: 'PLAY 4 & PICK 5',
        isValid: true,
        displayName: 'Pick Two Front',
        needsAmount: true
      };
    }
  }

  if (trimmedInput.endsWith('B+')) {
    const number = trimmedInput.slice(0, -2);
    if (number.length === 3) {
      return {
        betType: 'CASH3_BACK_BOX',
        betTypeCode: 'CASH3_BACK_BOX',
        section: 'CASH 3',
        isValid: true,
        displayName: 'Cash3 Back Box',
        needsAmount: true
      };
    }
  }

  if (trimmedInput.endsWith('B')) {
    const number = trimmedInput.slice(0, -1);
    if (number.length === 3) {
      return {
        betType: 'CASH3_BACK_STRAIGHT',
        betTypeCode: 'CASH3_BACK_STRAIGHT',
        section: 'CASH 3',
        isValid: true,
        displayName: 'Cash3 Back Straight',
        needsAmount: true
      };
    }
    if (number.length === 2) {
      return {
        betType: 'PICK_TWO_BACK',
        betTypeCode: 'PICK_TWO_BACK',
        section: 'PLAY 4 & PICK 5',
        isValid: true,
        displayName: 'Pick Two Back',
        needsAmount: true
      };
    }
  }

  // 3. Verificar modificadores de rango (+1, +2, -1, -2, -3)
  if (trimmedInput.endsWith('+1')) {
    const number = trimmedInput.slice(0, -2);
    if (number.length === 2) {
      return {
        betType: 'BOLITA_RANGE_1',
        betTypeCode: 'BOLITA',
        section: 'CASH 3',
        isValid: true,
        displayName: 'Bolita Rango 1',
        needsAmount: true
      };
    }
  }

  if (trimmedInput.endsWith('+2')) {
    const number = trimmedInput.slice(0, -2);
    if (number.length === 2) {
      return {
        betType: 'BOLITA_RANGE_2',
        betTypeCode: 'BOLITA',
        section: 'CASH 3',
        isValid: true,
        displayName: 'Bolita Rango 2',
        needsAmount: true
      };
    }
  }

  if (trimmedInput.endsWith('-1')) {
    const number = trimmedInput.slice(0, -2);
    if (number.length === 1) {
      return {
        betType: 'SINGULACION_RANGE_1',
        betTypeCode: 'SINGULACION',
        section: 'CASH 3',
        isValid: true,
        displayName: 'Singulación Rango 1',
        needsAmount: true
      };
    }
  }

  if (trimmedInput.endsWith('-2')) {
    const number = trimmedInput.slice(0, -2);
    if (number.length === 1) {
      return {
        betType: 'SINGULACION_RANGE_2',
        betTypeCode: 'SINGULACION',
        section: 'CASH 3',
        isValid: true,
        displayName: 'Singulación Rango 2',
        needsAmount: true
      };
    }
  }

  if (trimmedInput.endsWith('-3')) {
    const number = trimmedInput.slice(0, -2);
    if (number.length === 1) {
      return {
        betType: 'SINGULACION_RANGE_3',
        betTypeCode: 'SINGULACION',
        section: 'CASH 3',
        isValid: true,
        displayName: 'Singulación Rango 3',
        needsAmount: true
      };
    }
    if (number.length === 2) {
      return {
        betType: 'PICK_TWO_MIDDLE',
        betTypeCode: 'PICK_TWO_MIDDLE',
        section: 'PLAY 4 & PICK 5',
        isValid: true,
        displayName: 'Pick Two Middle',
        needsAmount: true
      };
    }
  }

  // 4. Verificar modificadores básicos (+, -)
  if (trimmedInput.endsWith('+')) {
    const number = trimmedInput.slice(0, -1);
    if (number.length === 3) {
      return {
        betType: 'CASH3_BOX',
        betTypeCode: 'CASH3_BOX',
        section: 'CASH 3',
        isValid: true,
        displayName: 'Cash3 Box',
        needsAmount: true
      };
    }
    if (number.length === 4) {
      return {
        betType: 'PLAY4_BOX',
        betTypeCode: 'PLAY4_BOX',
        section: 'PLAY 4 & PICK 5',
        isValid: true,
        displayName: 'Play4 Box',
        needsAmount: true
      };
    }
    if (number.length === 5) {
      return {
        betType: 'PICK5_BOX',
        betTypeCode: 'PICK5_BOX',
        section: 'PLAY 4 & PICK 5',
        isValid: true,
        displayName: 'Pick5 Box',
        needsAmount: true
      };
    }
  }

  if (trimmedInput.endsWith('-')) {
    const number = trimmedInput.slice(0, -1);
    if (number.length === 4) {
      // Ambigüedad: podría ser Play4 Straight o Panamá
      // Por defecto usamos Play4 Straight
      return {
        betType: 'PLAY4_STRAIGHT',
        betTypeCode: 'PLAY4_STRAIGHT',
        section: 'PLAY 4 & PICK 5',
        isValid: true,
        displayName: 'Play4 Straight',
        needsAmount: true
      };
    }
    if (number.length === 5) {
      return {
        betType: 'PICK5_STRAIGHT',
        betTypeCode: 'PICK5_STRAIGHT',
        section: 'PLAY 4 & PICK 5',
        isValid: true,
        displayName: 'Pick5 Straight',
        needsAmount: true
      };
    }
  }

  // 5. Detección por longitud (sin modificadores)
  const length = trimmedInput.length;

  if (length === 1) {
    return {
      betType: null,
      betTypeCode: null,
      section: null,
      isValid: false,
      displayName: 'Singulación requiere rango (-1, -2, -3)',
      needsAmount: true
    };
  }

  if (length === 2) {
    // Puede ser Directo o Pick Two - por defecto Directo
    return {
      betType: 'DIRECTO',
      betTypeCode: 'DIRECTO',
      section: 'DIRECTO',
      isValid: true,
      displayName: 'Directo',
      needsAmount: true
    };
  }

  if (length === 3) {
    return {
      betType: 'CASH3_STRAIGHT',
      betTypeCode: 'CASH3_STRAIGHT',
      section: 'CASH 3',
      isValid: true,
      displayName: 'Cash3 Straight',
      needsAmount: true
    };
  }

  if (length === 4) {
    // Puede ser Palé o Super Palé - por defecto Palé
    return {
      betType: 'PALE',
      betTypeCode: 'PALE',
      section: 'PALE & TRIPLETA',
      isValid: true,
      displayName: 'Palé',
      needsAmount: true
    };
  }

  if (length === 6) {
    return {
      betType: 'TRIPLETA',
      betTypeCode: 'TRIPLETA',
      section: 'PALE & TRIPLETA',
      isValid: true,
      displayName: 'Tripleta',
      needsAmount: true
    };
  }

  // Formato no válido
  return {
    betType: null,
    betTypeCode: null,
    section: null,
    isValid: false,
    displayName: 'Formato no válido',
    needsAmount: true
  };
};

export default useBetDetection;
