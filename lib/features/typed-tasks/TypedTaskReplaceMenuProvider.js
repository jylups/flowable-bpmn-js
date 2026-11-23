import { isAny } from 'bpmn-js/lib/util/ModelUtil';

import { TASK_TYPES, getTypedTask } from './TypedTasks.js';

const GROUP = { id: 'flowable-tasks', name: 'Flowable tasks' };


/**
 * Adds the typed service tasks to the replace menu of tasks and call
 * activities, and a plain service task entry for typed tasks (bpmn-js hides
 * its own, since the element already is a service task).
 */
export default class TypedTaskReplaceMenuProvider {

  constructor(popupMenu, commandStack, rules, translate) {
    this._commandStack = commandStack;
    this._rules = rules;
    this._translate = translate;

    popupMenu.registerProvider('bpmn-replace', this);
  }

  getPopupMenuEntries(target) {
    return entries => ({ ...entries, ...this._getEntries(target) });
  }

  _getEntries(target) {
    if (Array.isArray(target) || !isAny(target, [ 'bpmn:Task', 'bpmn:CallActivity' ]) ||
      !this._rules.allowed('shape.replace', { element: target })) {
      return {};
    }

    const translate = this._translate;
    const current = getTypedTask(target);
    const group = { id: GROUP.id, name: translate(GROUP.name) };
    const entries = {};

    if (current) {
      entries['replace-with-flowable-service-task'] = {
        label: translate('Service task'),
        className: 'bpmn-icon-service',
        group,
        action: () => this._replace(target, null)
      };
    }

    TASK_TYPES
      .filter(taskType => taskType !== current)
      .forEach(taskType => {
        entries[`replace-with-flowable-${ taskType.type }-task`] = {
          label: translate(taskType.label),
          className: `flowable-icon flowable-icon-${ taskType.type }`,
          group,
          action: () => this._replace(target, taskType)
        };
      });

    return entries;
  }

  _replace(element, taskType) {
    const context = { element, taskType };

    this._commandStack.execute('flowable.replaceWithTypedTask', context);

    return context.newElement;
  }
}

TypedTaskReplaceMenuProvider.$inject = [ 'popupMenu', 'commandStack', 'rules', 'translate' ];

