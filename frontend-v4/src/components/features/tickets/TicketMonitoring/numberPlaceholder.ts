// Derives the placeholder shown in the "Número" input from the selected bet type.
// Uses GameType.game_type_code first (most accurate), falling back to numberLength
// for unknown codes.
//
// Examples:
//  DIRECTO          → "##"
//  PALE             → "##-##"
//  SUPER_PALE       → "##-##"
//  TRIPLETA         → "##-##-##"
//  PANAMA           → "##-##-##"
//  CASH3_*          → "###"
//  PLAY4_*          → "####"
//  PICK5_*          → "#####"
//  PICK2_*          → "##"
//  BOLITA / SINGULACION → "##"
export const placeholderForBetType = (
  code: string | undefined | null,
  numberLength: number = 2,
): string => {
  if (!code) return '';
  const c = code.toUpperCase();
  if (c.startsWith('PALE') || c === 'SUPER_PALE') return '##-##';
  if (c === 'TRIPLETA' || c === 'PANAMA') return '##-##-##';
  if (c.startsWith('CASH3')) return '###';
  if (c.startsWith('PLAY4')) return '####';
  if (c.startsWith('PICK5')) return '#####';
  if (c.startsWith('PICK2')) return '##';
  if (c === 'DIRECTO' || c === 'BOLITA' || c === 'SINGULACION') return '##';
  // Fallback: repeat # by numberLength.
  return '#'.repeat(Math.max(1, numberLength));
};
