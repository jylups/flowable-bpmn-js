import { is } from 'bpmn-js/lib/util/ModelUtil';

import { getImplementationChange } from './TypedTasks.js';


/**
 * Command 'flowable.replaceWithTypedTask': makes an element a typed service
 * task, or a plain service task (taskType null), in one undo step.
 *
 * An element that is not a service task is replaced with one first (the
 * Flowable behaviors drop what a service task can't hold). Then whatever the
 * previous implementation set is removed, and the type and its default
 * fields are set.
 *
 * Context: { element, taskType }; after execution also { newElement }.
 */
export default class ReplaceWithTypedTaskHandler {

  constructor(bpmnReplace, modeling, bpmnFactory) {
    this._bpmnReplace = bpmnReplace;
    this._modeling = modeling;
    this._bpmnFactory = bpmnFactory;
  }

  preExecute(context) {
    const { element, taskType } = context;

    const serviceTask = is(element, 'bpmn:ServiceTask')
      ? element
      : this._bpmnReplace.replaceElement(element, { type: 'bpmn:ServiceTask' });

    const businessObject = serviceTask.businessObject;
    const { attributes, values } = getImplementationChange(businessObject, taskType, this._bpmnFactory);

    if (Object.keys(attributes).length) {
      this._modeling.updateModdleProperties(serviceTask, businessObject, attributes);
    }

    if (values) {
      this._setExtensionValues(serviceTask, businessObject, values);
    }

    context.newElement = serviceTask;
  }

  _setExtensionValues(element, businessObject, values) {
    let extensionElements = businessObject.get('extensionElements');

    if (!extensionElements) {
      extensionElements = this._bpmnFactory.create('bpmn:ExtensionElements', { values: [] });
      extensionElements.$parent = businessObject;
    }

    values.forEach(value => {
      value.$parent = extensionElements;
    });

    // the Flowable behaviors attach a new container and remove an empty one
    this._modeling.updateModdleProperties(element, extensionElements, { values });
  }
}

ReplaceWithTypedTaskHandler.$inject = [ 'bpmnReplace', 'modeling', 'bpmnFactory' ];
