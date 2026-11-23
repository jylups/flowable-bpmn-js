/**
 * @jylups/flowable-bpmn-js
 *
 * A bpmn-js modeler and viewers for Flowable BPMN models, with the Flowable
 * moddle descriptor, modeling behaviors and properties panel built in:
 *
 *   import { Modeler } from '@jylups/flowable-bpmn-js';
 *
 *   const modeler = new Modeler({
 *     container: '#canvas',
 *     propertiesPanel: { parent: '#properties' }
 *   });
 *
 *   await modeler.importXML(xml);
 */
export { default as Modeler } from './lib/Modeler.js';
export { default as Viewer } from './lib/Viewer.js';
export { default as NavigatedViewer } from './lib/NavigatedViewer.js';

export { default as FlowableXMLModule } from './lib/xml/index.js';
export { default as FlowableDrawModule } from './lib/draw/index.js';
export { default as TouchModule } from './lib/features/touch/index.js';
export { default as FlowableLintModule } from './lib/lint/module.js';

export {
  FLOWABLE_RULES,
  createFlowableLinterConfig,
  flowableLintConfig
} from './lib/lint/index.js';
