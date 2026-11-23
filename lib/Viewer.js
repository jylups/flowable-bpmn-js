import BpmnViewer from 'bpmn-js/lib/Viewer';

import flowableDescriptor from '@jylups/flowable-bpmn-moddle';

import FlowableXMLModule from './xml/index.js';
import FlowableDrawModule from './draw/index.js';


/**
 * A bpmn-js viewer for Flowable models: the Flowable moddle descriptor is
 * registered, and models are read and written as described in
 * FlowableXML.
 *
 * @param {Object} [options] - as for bpmn-js' Viewer
 */
export default class Viewer extends BpmnViewer {}

Viewer.prototype._modules = [
  ...BpmnViewer.prototype._modules,
  FlowableXMLModule,
  FlowableDrawModule
];

Viewer.prototype._moddleExtensions = {
  flowable: flowableDescriptor
};
