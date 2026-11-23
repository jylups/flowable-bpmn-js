import BpmnNavigatedViewer from 'bpmn-js/lib/NavigatedViewer';

import flowableDescriptor from '@jylups/flowable-bpmn-moddle';

import FlowableXMLModule from './xml/index.js';


/**
 * A bpmn-js viewer with zoom and scroll, for Flowable models.
 *
 * @param {Object} [options] - as for bpmn-js' NavigatedViewer
 */
export default class NavigatedViewer extends BpmnNavigatedViewer {}

NavigatedViewer.prototype._modules = [
  ...BpmnNavigatedViewer.prototype._modules,
  FlowableXMLModule
];

NavigatedViewer.prototype._moddleExtensions = {
  flowable: flowableDescriptor
};
