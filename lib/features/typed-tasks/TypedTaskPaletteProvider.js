import { TASK_TYPES, createDefaultFields } from './TypedTasks.js';


/**
 * Adds a palette entry per typed service task, in its own group after the
 * bpmn-js entries.
 */
export default class TypedTaskPaletteProvider {

  constructor(palette, create, elementFactory, bpmnFactory, translate) {
    this._create = create;
    this._elementFactory = elementFactory;
    this._bpmnFactory = bpmnFactory;
    this._translate = translate;

    palette.registerProvider(this);
  }

  getPaletteEntries() {
    return entries => {
      const added = {};

      TASK_TYPES.forEach(taskType => {
        const start = event => this._create.start(event, this.createShape(taskType.type));

        added[`create.flowable-${ taskType.type }-task`] = {
          group: 'flowable-tasks',
          className: `flowable-icon flowable-icon-${ taskType.type }`,
          title: this._translate(`Create ${ lowerFirst(taskType.label) }`),
          action: { dragstart: start, click: start }
        };
      });

      return { ...entries, ...added };
    };
  }

  /**
   * A new service task shape of a type, with its default fields.
   *
   * @param {string} type - e.g. 'mail'
   */
  createShape(type) {
    const taskType = TASK_TYPES.find(candidate => candidate.type === type);

    if (!taskType) {
      throw new Error(`unknown task type <${ type }>`);
    }

    const businessObject = this._bpmnFactory.create('bpmn:ServiceTask', { 'flowable:type': type });
    const fields = createDefaultFields(this._bpmnFactory, taskType);

    if (fields.length) {
      const extensionElements = this._bpmnFactory.create('bpmn:ExtensionElements', { values: fields });

      extensionElements.$parent = businessObject;
      fields.forEach(field => {
        field.$parent = extensionElements;
      });

      businessObject.set('extensionElements', extensionElements);
    }

    return this._elementFactory.createShape({ type: 'bpmn:ServiceTask', businessObject });
  }
}

TypedTaskPaletteProvider.$inject = [ 'palette', 'create', 'elementFactory', 'bpmnFactory', 'translate' ];


/**
 * 'Mail task' -> 'mail task'; acronyms such as 'HTTP task' stay.
 */
function lowerFirst(label) {
  return /^[A-Z][A-Z]/.test(label) ? label : label.charAt(0).toLowerCase() + label.slice(1);
}
