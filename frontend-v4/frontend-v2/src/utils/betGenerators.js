/**
 * Utilidades para generar combinaciones automáticas de apuestas
 * Implementa los generadores especiales del sistema original (q, ., d, -10, +xyz)
 */

/**
 * Genera todas las permutaciones de un número
 * Ejemplo: "123" → ["123", "132", "213", "231", "312", "321"]
 */
export const generatePermutations = (numStr) => {
  const digits = numStr.split('');
  const results = [];

  const permute = (arr, m = []) => {
    if (arr.length === 0) {
      results.push(m.join(''));
    } else {
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice();
        const next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    }
  };

  permute(digits);

  // Remover duplicados
  return [...new Set(results)];
};

/**
 * Genera secuencia de pares iguales
 * Ejemplo: "33d66" → ["33", "44", "55", "66"]
 */
export const generatePairsSequence = (start, end) => {
  const startNum = parseInt(start);
  const endNum = parseInt(end);

  if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
    return [];
  }

  // Verificar que sean pares iguales (11, 22, 33, etc.)
  if (start[0] !== start[1] || end[0] !== end[1]) {
    return [];
  }

  const results = [];
  const startDigit = parseInt(start[0]);
  const endDigit = parseInt(end[0]);

  for (let i = startDigit; i <= endDigit; i++) {
    results.push(`${i}${i}`);
  }

  return results;
};

/**
 * Genera incrementos de +100
 * Ejemplo: "123-10" → ["123", "223", "323", "423", "523", "623", "723", "823", "923"]
 */
export const generatePlus100 = (numStr) => {
  if (numStr.length !== 3) {
    return [];
  }

  const lastTwoDigits = numStr.substring(1);
  const results = [];

  for (let i = 1; i <= 9; i++) {
    results.push(`${i}${lastTwoDigits}`);
  }

  return results;
};

/**
 * Genera secuencia numérica
 * Ejemplo: "345+348" → ["345", "346", "347", "348"]
 */
export const generateNumberSequence = (startStr, endStr) => {
  const start = parseInt(startStr);
  const end = parseInt(endStr);

  if (isNaN(start) || isNaN(end) || start > end) {
    return [];
  }

  const results = [];
  const length = startStr.length;

  for (let i = start; i <= end; i++) {
    results.push(i.toString().padStart(length, '0'));
  }

  return results;
};

/**
 * Genera líneas de apuesta según el tipo de generador
 */
export const generateBetLines = (input, amount, selectedDraws, betInfo) => {
  const lines = [];
  let numbers = [];

  // Determinar qué generador usar
  if (betInfo.generator === 'combinations') {
    // Generador de permutaciones (q o .)
    const baseNumber = input.replace(/[q.]$/, '');
    numbers = generatePermutations(baseNumber);
  } else if (betInfo.generator === 'sequence_pairs') {
    // Generador de secuencia de pares (d)
    numbers = generatePairsSequence(betInfo.sequenceStart, betInfo.sequenceEnd);
  } else if (betInfo.generator === 'plus_100') {
    // Generador +100 (-10)
    const baseNumber = input.replace('-10', '');
    numbers = generatePlus100(baseNumber);
  } else if (betInfo.generator === 'sequence') {
    // Generador de secuencia (+xyz)
    numbers = generateNumberSequence(betInfo.sequenceStart, betInfo.sequenceEnd);
  } else {
    // Sin generador - solo el número tal cual
    // Remover modificadores
    let cleanNumber = input
      .replace(/[+\-FBq.]$/, '')
      .replace(/[+\-]\d$/, '');
    numbers = [cleanNumber];
  }

  // Crear líneas para cada número y cada sorteo seleccionado
  selectedDraws.forEach(draw => {
    numbers.forEach(number => {
      lines.push({
        id: Date.now() + Math.random(), // ID temporal único
        drawId: draw.drawId,
        drawName: draw.drawName,
        lotteryName: draw.lotteryName,
        betNumber: number,
        betType: betInfo.betTypeCode,
        betTypeName: betInfo.displayName,
        amount: parseFloat(amount),
        section: betInfo.section
      });
    });
  });

  return lines;
};

export default {
  generatePermutations,
  generatePairsSequence,
  generatePlus100,
  generateNumberSequence,
  generateBetLines
};
