import BpmnModeler from 'bpmn-js/lib/Modeler.js';
import BpmnNavigatedViewer from 'bpmn-js/lib/NavigatedViewer.js';
import BpmnViewer from 'bpmn-js/lib/Viewer.js';

import type { ModuleDeclaration } from 'didi';

/**
 * A bpmn-js modeler for Flowable models, with the Flowable moddle
 * descriptor, the Flowable modeling behaviors, and the bpmn.io properties
 * panel with the Flowable properties provider.
 *
 * Give the properties panel a place with `propertiesPanel: { parent }`.
 */
export class Modeler<ServiceMap = null> extends BpmnModeler<ServiceMap> {}

/**
 * A bpmn-js viewer for Flowable models.
 */
export class Viewer<ServiceMap = null> extends BpmnViewer<ServiceMap> {}

/**
 * A bpmn-js viewer with zoom and scroll, for Flowable models.
 */
export class NavigatedViewer<ServiceMap = null> extends BpmnNavigatedViewer<ServiceMap> {}

/**
 * Reads and writes Flowable models: Activiti namespace migration and unknown
 * flowable:* elements on import, definitions for references by code or name,
 * and the flowable prefix on save. Included in Modeler, Viewer and
 * NavigatedViewer.
 */
export const FlowableXMLModule: ModuleDeclaration;
