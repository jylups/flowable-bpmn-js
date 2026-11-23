/**
 * Each service task needs an implementation: a Java class, an expression, a
 * delegate expression, a flowable:type, or a web service operation. A typed
 * task needs the setting its type can't run without.
 */

const IMPLEMENTATIONS = [ 'flowable:class', 'flowable:expression', 'flowable:delegateExpression', 'flowable:type' ];

/**
 * What a typed task can't run without: a check and the message when it
 * fails.
 */
const TYPE_REQUIREMENTS = {
  http: [ node => getField(node, 'requestUrl'), 'HTTP task has no request URL' ],
  shell: [ node => getField(node, 'command'), 'Shell task has no command' ],
  dmn: [ node => getField(node, 'decisionTableReferenceKey'), 'Decision task has no decision table key' ],
  case: [ node => node.get('flowable:caseDefinitionKey'), 'Case task has no case definition key' ],
  'send-event': [ node => getBodyElement(node, 'flowable:EventType'), 'Send event task has no event key' ],
  'external-worker': [ node => node.get('flowable:topic'), 'External worker task has no topic' ]
};

export default function serviceTaskImplementation() {

  function check(node, reporter) {
    if (!node.$instanceOf('bpmn:ServiceTask')) {
      return;
    }

    const hasImplementation = IMPLEMENTATIONS.some(name => isSet(node.get(name))) ||
      (node.get('implementation') === '##WebService' && node.get('operationRef'));

    if (!hasImplementation) {
      reporter.report(node.id, 'Service task has no implementation: set a Java class, an expression, a delegate expression or a type');

      return;
    }

    const requirement = TYPE_REQUIREMENTS[node.get('flowable:type')];

    if (requirement && !isSet(requirement[0](node))) {
      reporter.report(node.id, requirement[1]);
    }
  }

  return { check };
}


function isSet(value) {
  return typeof value === 'string' ? !!value.trim() : !!value;
}

function getExtensionElements(node, type) {
  const extensionElements = node.get('extensionElements');
  const values = (extensionElements && extensionElements.get('values')) || [];

  return values.filter(value => value.$instanceOf(type));
}

/**
 * The value of a <flowable:field>: its string or expression, as attribute or
 * child element.
 */
function getField(node, name) {
  const field = getExtensionElements(node, 'flowable:Field').find(candidate => candidate.get('name') === name);

  if (!field) {
    return null;
  }

  const expression = field.get('expressionElement');

  return field.get('string') || field.get('stringValue') || field.get('expression') ||
    (expression && expression.get('body')) || null;
}

function getBodyElement(node, type) {
  const element = getExtensionElements(node, type)[0];

  return element ? element.get('body') : null;
}
