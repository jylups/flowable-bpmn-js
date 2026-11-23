import BpmnModeler from 'bpmn-js/lib/Modeler';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule
} from 'bpmn-js-properties-panel';

import { FlowablePropertiesProviderModule } from '@jylups/bpmn-js-properties-panel-flowable';
import { FlowableBehaviorsModule } from '@jylups/flowable-bpmn-js-behaviors';
import flowableDescriptor from '@jylups/flowable-bpmn-moddle';

import FlowableXMLModule from './xml/index.js';
import TypedTasksModule from './features/typed-tasks/index.js';


/**
 * A bpmn-js modeler for Flowable models, with the Flowable moddle
 * descriptor, the Flowable modeling behaviors, the bpmn.io properties
 * panel with the Flowable properties provider, and palette and replace menu
 * entries for the typed service tasks. Models are read and written
 * as described in FlowableXML.
 *
 * Give the properties panel a place with `propertiesPanel: { parent }`, or
 * attach it later with `modeler.get('propertiesPanel').attachTo(parent)`.
 *
 * @param {Object} [options] - as for bpmn-js' Modeler
 */
export default class Modeler extends BpmnModeler {}

Modeler.prototype._flowableModules = [
  FlowableXMLModule,
  FlowableBehaviorsModule,
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  FlowablePropertiesProviderModule,
  TypedTasksModule
];

Modeler.prototype._modules = [
  ...BpmnModeler.prototype._modules,
  ...Modeler.prototype._flowableModules
];

Modeler.prototype._moddleExtensions = {
  flowable: flowableDescriptor
};
