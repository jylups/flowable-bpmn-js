import {
  getBody,
  hasExpression,
  isCron,
  isDate,
  isDuration,
  isRepeatingInterval
} from '../values.js';

/**
 * Dates, durations and cycles Flowable has to parse: a user task's due
 * date, a timer's date, duration, cycle and cycle end date, and an
 * activity's retry time cycle. A value with an expression is only known at
 * runtime and passes.
 */
export default function validDurations() {

  function check(node, reporter) {
    if (node.$instanceOf('bpmn:UserTask')) {
      checkValue(node, reporter, node.get('flowable:dueDate'),
        value => isDuration(value) || isDate(value),
        'Due date must be an ISO 8601 date or duration, for example P2DT4H');
    }

    if (node.$instanceOf('bpmn:TimerEventDefinition')) {
      checkTimer(node, reporter);
    }

    if (node.$instanceOf('bpmn:Activity')) {
      getExtensionElements(node, 'flowable:FailedJobRetryTimeCycle').forEach(cycle => {
        checkValue(node, reporter, getBody(cycle),
          value => isRepeatingInterval(value) || isCron(value),
          'Retry time cycle must be an ISO 8601 repeating interval, for example R5/PT10M');
      });
    }
  }

  function checkTimer(definition, reporter) {
    const event = definition.$parent;
    const id = event && event.id;

    if (!id) {
      return;
    }

    const date = definition.get('timeDate');
    const duration = definition.get('timeDuration');
    const cycle = definition.get('timeCycle');

    if (!date && !duration && !cycle) {
      reporter.report(id, 'Timer has no date, duration or cycle');

      return;
    }

    if (date) {
      checkValue(event, reporter, getBody(date), isDate,
        'Timer date must be an ISO 8601 date, for example 2026-12-31T17:00:00', true);
    }

    if (duration) {
      checkValue(event, reporter, getBody(duration), isDuration,
        'Timer duration must be an ISO 8601 duration, for example PT15M', true);
    }

    if (cycle) {
      checkValue(event, reporter, getBody(cycle), value => isRepeatingInterval(value) || isCron(value),
        'Timer cycle must be an ISO 8601 repeating interval or a cron expression, for example R3/PT1H', true);

      checkValue(event, reporter, cycle.get('flowable:endDate'), isDate,
        'Timer cycle end date must be an ISO 8601 date, for example 2026-12-31T17:00:00');
    }
  }

  return { check };
}


/**
 * Reports a value that is set, has no expression and doesn't pass the
 * check; with `required`, an empty value too.
 */
function checkValue(node, reporter, value, isValid, message, required = false) {
  if (!value || !value.trim()) {
    if (required) {
      reporter.report(node.id, message);
    }

    return;
  }

  if (!hasExpression(value) && !isValid(value)) {
    reporter.report(node.id, message);
  }
}

function getExtensionElements(node, type) {
  const extensionElements = node.get('extensionElements');
  const values = (extensionElements && extensionElements.get('values')) || [];

  return values.filter(value => value.$instanceOf(type));
}
