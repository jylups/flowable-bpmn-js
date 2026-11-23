/**
 * Value checks shared by the lint rules. The ISO 8601 patterns are the ones
 * the Flowable properties panel validates with, so the panel and the linter
 * agree.
 */

const ISO_DURATION = /^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+(\.\d+)?S)?)?$/;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

/**
 * A cron expression as Flowable's timers read it (Quartz style): six or
 * seven fields.
 */
const CRON = /^([0-9*?/,LW#A-Za-z-]+\s+){5,6}[0-9*?/,LW#A-Za-z-]+$/;

/**
 * Whether a value is, or contains, a ${…} or #{…} expression, which is only
 * known at runtime.
 */
export function hasExpression(value) {
  return /[$#]\{/.test(value || '');
}

export function isDuration(value) {
  return ISO_DURATION.test(value.trim());
}

export function isDate(value) {
  return ISO_DATE.test(value.trim());
}

/**
 * An ISO 8601 repeating interval, R[n]/ followed by a start and a duration,
 * a duration, a duration and an end, or a start and an end.
 */
export function isRepeatingInterval(value) {
  const parts = value.trim().split('/');

  if (!/^R\d*$/.test(parts[0])) {
    return false;
  }

  const rest = parts.slice(1);

  if (rest.length === 1) {
    return isDuration(rest[0]);
  }

  if (rest.length === 2) {
    const [ first, second ] = rest;

    return (isDate(first) && (isDuration(second) || isDate(second))) ||
      (isDuration(first) && isDate(second));
  }

  return false;
}

export function isCron(value) {
  return CRON.test(value.trim());
}

/**
 * The text of a body value, such as the body of a timer's timeDuration.
 */
export function getBody(element) {
  const body = element && element.get('body');

  return typeof body === 'string' ? body : '';
}
