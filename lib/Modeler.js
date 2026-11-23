import BpmnModeler from 'bpmn-js/lib/Modeler';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule
} from 'bpmn-js-properties-panel';

import { FlowablePropertiesProviderModule } from '@jylups/bpmn-js-properties-panel-flowable';
import { FlowableBehaviorsModule } from '@jylups/flowable-bpmn-js-behaviors';
import flowableDescriptor from '@jylups/flowable-bpmn-moddle';

import FlowableXMLModule from './xml/index.js';
import { withThemeColors } from './Theme.js';
import { createNewDiagramXML } from './NewDiagram.js';
import FlowableDrawModule from './draw/index.js';
import TypedTasksModule from './features/typed-tasks/index.js';
import FlowableLintModule from './lint/module.js';


/**
 * A bpmn-js modeler for Flowable models, with the Flowable moddle
 * descriptor, the Flowable modeling behaviors, the bpmn.io properties
 * panel with the Flowable properties provider, palette and replace menu
 * entries for the typed service tasks, and linting with the Flowable rules.
 * Models are read and written as described in FlowableXML; createDiagram
 * opens a new Flowable process, and colors follow the theme hooks in Theme.
 *
 * Give the properties panel a place with `propertiesPanel: { parent }`, or
 * attach it later with `modeler.get('propertiesPanel').attachTo(parent)`.
 *
 * @param {Object} [options] - as for bpmn-js' Modeler
 */
export default class Modeler extends BpmnModeler {

  constructor(options) {
    super(withThemeColors(options));
  }

  /**
   * Opens a new Flowable process: an executable process with a start event
   * (see createNewDiagramXML).
   *
   * @param {Object} [options] - processId and processName
   */
  createDiagram(options) {
    return this.importXML(createNewDiagramXML(options));
  }
}

Modeler.prototype._flowableModules = [
  FlowableXMLModule,
  FlowableDrawModule,
  FlowableBehaviorsModule,
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  FlowablePropertiesProviderModule,
  TypedTasksModule,
  FlowableLintModule
];

Modeler.prototype._modules = [
  ...BpmnModeler.prototype._modules,
  ...Modeler.prototype._flowableModules
];

Modeler.prototype._moddleExtensions = {
  flowable: flowableDescriptor
};
