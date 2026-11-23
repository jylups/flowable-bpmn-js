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

/**
 * Draws the typed service tasks (mail, HTTP, shell, Camel, decision, case,
 * send event, external worker) with their icons. Included in Modeler, Viewer
 * and NavigatedViewer.
 */
export const FlowableDrawModule: ModuleDeclaration;

/**
 * Touch editing for the modeler: tap, drag, pan, pinch zoom, double tap to
 * edit labels, and creating and connecting from the palette and context pad.
 * Optional: add it with `additionalModules`. It turns itself on only where
 * `(pointer: coarse)` matches; `assets/flowable-bpmn-js-touch.css` makes the
 * touch targets larger.
 */
export const TouchModule: ModuleDeclaration;

/**
 * Lints the diagram with the Flowable rules while it is edited
 * (bpmn-js-bpmnlint). Included in Modeler; `linting.active: false` hides the
 * issues, `linting.bpmnlint` sets another linter configuration.
 */
export const FlowableLintModule: ModuleDeclaration;

/**
 * The Flowable lint rules (bpmnlint rule factories) by name.
 */
export const FLOWABLE_RULES: Record<string, () => { check(node: any, reporter: any): void }>;

/**
 * A bpmnlint configuration with all Flowable rules as errors.
 */
export const flowableLintConfig: { rules: Record<string, string> };

/**
 * The `{ config, resolver }` that bpmn-js-bpmnlint takes, for a bpmnlint
 * configuration that uses `flowable/<rule>` rules.
 */
export function createFlowableLinterConfig(config?: object): { config: object; resolver: object };
