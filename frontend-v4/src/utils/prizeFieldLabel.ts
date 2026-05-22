/**
 * Translate a prize/commission field label coming from the API.
 *
 * Backend stores the display name in Spanish (e.g. "Directo - Primer Pago")
 * but the `fieldCode` is a stable identifier with the pattern
 * `{GAME_TYPE}_{FIELD_SUFFIX}` (e.g. `DIRECTO_PRIMER_PAGO`, `CASH3_BOX_SIX_WAY`).
 *
 * This helper extracts the suffix and resolves it to an i18n key under
 * `myGroupAdmin.prizeFields.*`. Unknown codes fall back to the API's
 * Spanish `fieldName` so the UI never goes blank.
 *
 * Special case: Play4 Box's `SIX_WAY` means "6-Way: 2 identical" rather than
 * the Cash3 Box "6-Way: 3 unique", so we disambiguate by prefix.
 */

type TFunction = (key: string, opts?: Record<string, unknown>) => string;

// Field suffix → translation key under `myGroupAdmin.prizeFields.*`
// Ordered longest-first when iterated so e.g. `TWENTY_FOUR_WAY` wins over `WAY`.
const SUFFIX_TO_KEY: ReadonlyArray<readonly [string, string]> = [
  ['ONE_TWENTY_WAY', 'oneTwentyWay'],
  ['TWENTY_FOUR_WAY', 'twentyFourWay'],
  ['TODOS_EN_SECUENCIA', 'todosSecuencia'],
  ['TODOS_SECUENCIA', 'todosSecuencia'],
  ['SECUENCIA', 'todosSecuencia'],
  ['THIRTY_WAY', 'thirtyWay'],
  ['TWELVE_WAY', 'twelveWay'],
  ['TWENTY_WAY', 'twentyWay'],
  ['THREE_WAY', 'threeWay'],
  ['FOUR_WAY', 'fourWay'],
  ['FIVE_WAY', 'fiveWay'],
  ['SIXTY_WAY', 'sixtyWay'],
  ['SIX_WAY', 'sixWay'],
  ['TEN_WAY', 'tenWay'],
  ['PRIMER_PAGO', 'primerPago'],
  ['SEGUNDO_PAGO', 'segundoPago'],
  ['TERCER_PAGO', 'tercerPago'],
  ['DOBLES', 'dobles'],
  ['TRIPLES', 'triples'],
];

/**
 * Strip the "{Game Type} - " prefix from a Spanish `fieldName` so callers can
 * fall back to a clean label when no translation is available.
 */
const stripPrefix = (fieldName: string): string =>
  fieldName.includes(' - ') ? fieldName.split(' - ').slice(1).join(' - ') : fieldName;

export const translatePrizeFieldLabel = (
  fieldCode: string | undefined,
  fieldName: string,
  t: TFunction,
): string => {
  if (!fieldCode) return stripPrefix(fieldName);

  // Play4 Box's SIX_WAY conflicts with Cash3 Box's SIX_WAY (different meaning).
  if (fieldCode.startsWith('PLAY4_BOX_') && fieldCode.endsWith('_SIX_WAY')) {
    const translated = t('myGroupAdmin.prizeFields.sixWayPlay4');
    if (translated && translated !== 'myGroupAdmin.prizeFields.sixWayPlay4') return translated;
    return stripPrefix(fieldName);
  }

  for (const [suffix, key] of SUFFIX_TO_KEY) {
    if (fieldCode === suffix || fieldCode.endsWith('_' + suffix)) {
      const translated = t(`myGroupAdmin.prizeFields.${key}`);
      if (translated && translated !== `myGroupAdmin.prizeFields.${key}`) return translated;
      break;
    }
  }
  return stripPrefix(fieldName);
};
