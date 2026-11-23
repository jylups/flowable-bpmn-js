/**
 * New Flowable process diagrams.
 */

const ID_PATTERN = /^[A-Za-z_][\w.-]*$/;

/**
 * The target namespace Flowable's own modeler gives new processes.
 */
export const FLOWABLE_TARGET_NAMESPACE = 'http://www.flowable.org/processdef';

/**
 * The XML of a new process: one executable process with a start event, the
 * Flowable namespace declared, and Flowable's default target namespace.
 *
 * @param {Object} [options]
 * @param {string} [options.processId] - the process key; Process_ and a
 *   random suffix by default
 * @param {string} [options.processName]
 *
 * @return {string}
 */
export function createNewDiagramXML(options = {}) {
  const processId = options.processId || `Process_${ randomSuffix() }`;
  const processName = options.processName;

  if (!ID_PATTERN.test(processId)) {
    throw new Error(`invalid process id <${ processId }>: use letters, digits, _, - and ., starting with a letter or _`);
  }

  const name = processName ? ` name="${ escapeXML(processName) }"` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
             xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
             xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
             xmlns:flowable="http://flowable.org/bpmn"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xmlns:xsd="http://www.w3.org/2001/XMLSchema"
             typeLanguage="http://www.w3.org/2001/XMLSchema"
             expressionLanguage="http://www.w3.org/1999/XPath"
             targetNamespace="${ FLOWABLE_TARGET_NAMESPACE }"
             id="Definitions_${ randomSuffix() }">
  <process id="${ processId }"${ name } isExecutable="true">
    <startEvent id="StartEvent_1" />
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${ processId }">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>
`;
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 9);
}

function escapeXML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
