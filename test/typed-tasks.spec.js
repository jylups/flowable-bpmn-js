import { afterEach, describe, expect, it } from 'vitest';

import { Modeler } from '../index.js';

import { TASK_TYPES } from '../lib/features/typed-tasks/TypedTasks.js';

import { cleanUp, create, nextFrame } from './helper.js';

import xml from './fixtures/tasks.bpmn?raw';


async function open() {
  const { instance, container } = create(Modeler);

  await instance.importXML(xml);

  return {
    instance,
    container,
    get: name => instance.get(name),
    element: id => instance.get('elementRegistry').get(id)
  };
}

function values(businessObject) {
  const extensionElements = businessObject.get('extensionElements');

  return (extensionElements && extensionElements.get('values')) || [];
}

function types(businessObject) {
  return values(businessObject).map(value => value.$type);
}

function fields(businessObject) {
  return Object.fromEntries(values(businessObject)
    .filter(value => value.$type === 'flowable:Field')
    .map(field => [ field.get('name'), field.get('string') ]));
}

/**
 * The replace menu entries the typed task provider adds for an element.
 */
function replaceEntries(get, element) {
  return get('typedTaskReplaceMenuProvider').getPopupMenuEntries(element)({});
}

async function undoRedo(commandStack, { before, after }) {
  after();
  commandStack.undo();
  before();
  commandStack.redo();
  after();
}


describe('typed service tasks', function() {

  afterEach(cleanUp);


  describe('palette', function() {

    it('has an entry per type', async function() {

      // given
      const { get } = await open();

      // when
      const entries = get('palette').getEntries();

      // then
      TASK_TYPES.forEach(({ type }) => {
        const entry = entries[`create.flowable-${ type }-task`];

        expect(entry, type).toBeDefined();
        expect(entry.group).toBe('flowable-tasks');
        expect(entry.className).toContain(`flowable-icon-${ type }`);
      });

      expect(entries['create.flowable-http-task'].title).toBe('Create HTTP task');
      expect(entries['create.flowable-mail-task'].title).toBe('Create mail task');
    });


    it('shows the entries', async function() {

      // given
      const { container } = await open();

      // then
      expect(container.querySelectorAll('.djs-palette [data-action^="create.flowable-"]')).toHaveLength(TASK_TYPES.length);
    });


    it('creates a typed task with its default fields', async function() {

      // given
      const { get, element } = await open();
      const shape = get('typedTaskPaletteProvider').createShape('http');

      // when
      const created = get('modeling').createShape(shape, { x: 300, y: 300 }, element('Process_1'));

      // then
      expect(created.businessObject.get('flowable:type')).toBe('http');
      expect(fields(created.businessObject)).toEqual({ requestMethod: 'GET' });

      const { xml: saved } = await get('bpmnjs').saveXML();

      expect(saved).toMatch(/<serviceTask id="[^"]+" flowable:type="http">\s*<extensionElements>\s*<flowable:field name="requestMethod">\s*<flowable:string>GET<\/flowable:string>/);
    });


    it('creates a typed task without default fields', async function() {

      // given
      const { get, element } = await open();

      // when
      const created = get('modeling').createShape(get('typedTaskPaletteProvider').createShape('mail'), { x: 300, y: 300 }, element('Process_1'));

      // then
      expect(created.businessObject.get('flowable:type')).toBe('mail');
      expect(created.businessObject.get('extensionElements')).toBeUndefined();
    });

  });


  describe('replace menu', function() {

    it('offers every type for a task', async function() {

      // given
      const { get, element } = await open();

      // when
      const entries = replaceEntries(get, element('UserTask_1'));

      // then
      expect(Object.keys(entries)).toEqual(TASK_TYPES.map(({ type }) => `replace-with-flowable-${ type }-task`));
      expect(entries['replace-with-flowable-dmn-task'].label).toBe('Decision task');
      expect(entries['replace-with-flowable-dmn-task'].group.name).toBe('Flowable tasks');
    });


    it('offers the other types and a plain service task for a typed task', async function() {

      // given
      const { get, element } = await open();

      // when
      const entries = replaceEntries(get, element('HttpTask'));

      // then
      expect(entries['replace-with-flowable-service-task']).toBeDefined();
      expect(entries['replace-with-flowable-http-task']).toBeUndefined();
      expect(entries['replace-with-flowable-mail-task']).toBeDefined();
    });


    it('shows the entries in the popup menu', async function() {

      // given
      const { get, element } = await open();

      // when
      get('popupMenu').open(element('UserTask_1'), 'bpmn-replace', { x: 100, y: 100 });
      await nextFrame();

      // then
      const labels = [ ...document.querySelectorAll('.djs-popup-results .entry') ].map(entry => entry.textContent.trim());

      expect(labels).toContain('Mail task');
      expect(labels).toContain('External worker task');

      get('popupMenu').close();
    });


    it('replaces a user task with a mail task in one step', async function() {

      // given
      const { get, element } = await open();

      // when
      const mailTask = replaceEntries(get, element('UserTask_1'))['replace-with-flowable-mail-task'].action();

      // then
      undoRedo(get('commandStack'), {
        before: () => {
          const businessObject = element('UserTask_1').businessObject;

          expect(businessObject.$type).toBe('bpmn:UserTask');
          expect(businessObject.get('flowable:assignee')).toBe('${initiator}');
        },
        after: () => {
          const businessObject = element(mailTask.id).businessObject;

          expect(businessObject.$type).toBe('bpmn:ServiceTask');
          expect(businessObject.get('flowable:type')).toBe('mail');
          expect(businessObject.get('flowable:assignee')).toBeUndefined();
          expect(businessObject.get('flowable:async')).toBe(true);
          expect(types(businessObject)).toEqual([ 'flowable:ExecutionListener' ]);
        }
      });
    });


    it('changes the type of a typed task and drops the old implementation', async function() {

      // given
      const { get, element } = await open();
      const httpTask = element('HttpTask');

      // when
      const result = replaceEntries(get, httpTask)['replace-with-flowable-mail-task'].action();

      // then
      expect(result).toBe(httpTask);

      undoRedo(get('commandStack'), {
        before: () => {
          const businessObject = httpTask.businessObject;

          expect(businessObject.get('flowable:type')).toBe('http');
          expect(businessObject.get('flowable:parallelInSameTransaction')).toBe(true);
          expect(types(businessObject)).toEqual([ 'flowable:Field', 'flowable:HttpRequestHandler', 'flowable:ExecutionListener' ]);
        },
        after: () => {
          const businessObject = httpTask.businessObject;

          expect(businessObject.get('flowable:type')).toBe('mail');
          expect(businessObject.get('flowable:parallelInSameTransaction')).toBeUndefined();
          expect(types(businessObject)).toEqual([ 'flowable:ExecutionListener' ]);
        }
      });
    });


    it('gives a new type its default fields', async function() {

      // given
      const { get, element } = await open();

      // when
      replaceEntries(get, element('MailTask'))['replace-with-flowable-http-task'].action();

      // then
      expect(fields(element('MailTask').businessObject)).toEqual({ requestMethod: 'GET' });
    });


    it('turns a Java class task into a shell task', async function() {

      // given
      const { get, element } = await open();

      // when
      replaceEntries(get, element('ClassTask'))['replace-with-flowable-shell-task'].action();

      // then
      const businessObject = element('ClassTask').businessObject;

      expect(businessObject.get('flowable:type')).toBe('shell');
      expect(businessObject.get('flowable:class')).toBeUndefined();
      expect(businessObject.get('extensionElements')).toBeUndefined();
    });


    it('turns a typed task into a plain service task', async function() {

      // given
      const { get, element } = await open();

      // when
      replaceEntries(get, element('MailTask'))['replace-with-flowable-service-task'].action();

      // then
      const businessObject = element('MailTask').businessObject;

      expect(businessObject.get('flowable:type')).toBeUndefined();
      expect(businessObject.get('extensionElements')).toBeUndefined();

      get('commandStack').undo();

      expect(fields(businessObject)).toEqual({ to: 'kermit@example.org' });
    });

  });

});
