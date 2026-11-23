import LintingModule from 'bpmn-js-bpmnlint';

import FlowableLinting from './FlowableLinting.js';

/**
 * Lints the diagram with the Flowable rules while it is edited, with
 * bpmn-js-bpmnlint: issues show on the elements, and a button counts them
 * and turns the overlays on and off. Listen to `linting.completed` for the
 * issues, for example to list them in a problems view.
 */
export default {
  __depends__: [ LintingModule ],
  __init__: [ 'flowableLinting' ],
  flowableLinting: [ 'type', FlowableLinting ]
};
