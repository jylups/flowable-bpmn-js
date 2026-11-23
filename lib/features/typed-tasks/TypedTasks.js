import { is } from 'bpmn-js/lib/util/ModelUtil';


/**
 * The typed service tasks: service tasks whose flowable:type selects an
 * engine implementation. `fields` are the <flowable:field> values a new task
 * of the type starts with.
 */
export const TASK_TYPES = [
  { type: 'mail', label: 'Mail task' },
  { type: 'http', label: 'HTTP task', fields: { requestMethod: 'GET' } },
  { type: 'shell', label: 'Shell task' },
  { type: 'camel', label: 'Camel task' },
  { type: 'dmn', label: 'Decision task' },
  { type: 'case', label: 'Case task' },
  { type: 'send-event', label: 'Send event task' },
  { type: 'external-worker', label: 'External worker task' }
];

/**
 * Service task attributes that belong to one implementation; changing the
 * type removes them.
 */
const IMPLEMENTATION_ATTRIBUTES = [
  'flowable:type',
  'flowable:class',
  'flowable:expression',
  'flowable:delegateExpression',
  'flowable:resultVariableName',
  'flowable:resultVariable',
  'flowable:useLocalScopeForResultVariable',
  'flowable:storeResultVariableAsTransient',
  'flowable:triggerable',
  'flowable:parallelInSameTransaction',
  'flowable:caseDefinitionKey',
  'flowable:caseInstanceName',
  'flowable:businessKey',
  'flowable:inheritBusinessKey',
  'flowable:inheritVariables',
  'flowable:fallbackToDefaultTenant',
  'flowable:idVariableName',
  'flowable:topic',
  'flowable:doNotIncludeVariables'
];

/**
 * Extension elements that belong to one implementation.
 */
const IMPLEMENTATION_ELEMENTS = [
  'flowable:Field',
  'flowable:HttpRequestHandler',
  'flowable:HttpResponseHandler',
  'flowable:In',
  'flowable:Out',
  'flowable:ExternalWorkerInParameter',
  'flowable:ExternalWorkerOutParameter',
  'flowable:EventInParameter',
  'flowable:EventOutParameter',
  'flowable:EventType',
  'flowable:TriggerEventType',
  'flowable:SendSynchronously',
  'flowable:TriggerEventCorrelationParameter',
  'flowable:ChannelKey',
  'flowable:SystemChannel'
];


export function getTaskType(type) {
  return TASK_TYPES.find(taskType => taskType.type === type);
}

/**
 * The flowable:type of a service task, if it is one of the typed tasks.
 */
export function getTypedTask(element) {
  const businessObject = element && element.businessObject;

  if (!is(businessObject, 'bpmn:ServiceTask')) {
    return null;
  }

  return getTaskType(businessObject.get('flowable:type')) || null;
}

/**
 * The <flowable:field> elements a new task of a type starts with.
 */
export function createDefaultFields(bpmnFactory, taskType) {
  return Object.entries(taskType.fields || {}).map(([ name, value ]) =>
    bpmnFactory.create('flowable:Field', { name, string: value })
  );
}

/**
 * Properties to set on a service task so it has a type's implementation,
 * and nothing left of another one: unset attributes, kept and added
 * extension elements.
 *
 * @param {ModdleElement} businessObject - a bpmn:ServiceTask
 * @param {Object|null} taskType - null for a plain service task
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {{ attributes: Object, values: ModdleElement[]|null }} values is
 *   null when the extension elements stay as they are
 */
export function getImplementationChange(businessObject, taskType, bpmnFactory) {
  const attributes = {};

  IMPLEMENTATION_ATTRIBUTES.forEach(name => {
    if (businessObject.get(name) !== undefined) {
      attributes[name] = undefined;
    }
  });

  if (taskType) {
    attributes['flowable:type'] = taskType.type;
  }

  const extensionElements = businessObject.get('extensionElements');
  const current = (extensionElements && extensionElements.get('values')) || [];
  const kept = current.filter(value => !IMPLEMENTATION_ELEMENTS.some(type => is(value, type)));
  const added = taskType ? createDefaultFields(bpmnFactory, taskType) : [];

  const values = kept.length === current.length && !added.length ? null : [ ...added, ...kept ];

  return { attributes, values };
}
