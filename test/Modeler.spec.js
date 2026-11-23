import { afterEach, describe, expect, it } from 'vitest';

import BpmnModeler from 'bpmn-js/lib/Modeler';

import { Modeler } from '../index.js';

import { cleanUp, create, nextFrame } from './helper.js';

import xml from './fixtures/activiti.bpmn?raw';


describe('Modeler', function() {

  afterEach(cleanUp);


  it('is a bpmn-js modeler', function() {

    // when
    const { instance } = create(Modeler);

    // then
    expect(instance).toBeInstanceOf(BpmnModeler);
    expect(instance.get('modeling')).toBeDefined();
  });


  describe('import', function() {

    it('reads Activiti spellings as Flowable', async function() {

      // given
      const { instance } = create(Modeler);

      // when
      const { warnings } = await instance.importXML(xml);

      // then
      // moddle notes the attributes of unknown elements, which it keeps
      expect(warnings.map(warning => warning.message)).toEqual([ 'unknown attribute <color>' ]);

      const task = instance.get('elementRegistry').get('UserTask_1').businessObject;

      expect(task.get('flowable:assignee')).toBe('${initiator}');
      expect(task.get('extensionElements').get('values').map(value => value.$type)).toEqual([
        'flowable:TaskListener',
        'flowable:DesignerHint'
      ]);
    });


    it('creates definitions for references by code', async function() {

      // given
      const { instance } = create(Modeler);

      // when
      await instance.importXML(xml);

      // then
      const definition = instance.get('elementRegistry').get('NotFound').businessObject.get('eventDefinitions')[0];

      expect(definition.get('errorRef').get('errorCode')).toBe('notFound');
    });

  });


  describe('save', function() {

    it('writes the flowable prefix and keeps unknown elements', async function() {

      // given
      const { instance } = create(Modeler);

      await instance.importXML(xml);

      // when
      const { xml: saved } = await instance.saveXML({ format: true });

      // then
      expect(saved).toContain('xmlns:flowable="http://flowable.org/bpmn"');
      expect(saved).not.toContain('xmlns:activiti');
      expect(saved).toContain('flowable:assignee="${initiator}"');
      expect(saved).toContain('<flowable:designerHint color="blue">keep</flowable:designerHint>');
      expect(saved).toContain('<error id="notFound" errorCode="notFound" />');
      expect(saved).toContain('errorRef="notFound"');
    });

  });


  describe('properties panel', function() {

    it('shows the Flowable groups', async function() {

      // given
      const { instance, panelParent } = create(Modeler, {}, { panel: true });

      await instance.importXML(xml);

      // when
      instance.get('selection').select(instance.get('elementRegistry').get('UserTask_1'));
      await nextFrame();

      // then
      expect(panelParent.querySelector('[data-group-id="group-flowable-assignment"]')).not.toBeNull();
      expect(panelParent.querySelector('[data-group-id="group-flowable-taskListeners"]')).not.toBeNull();
    });


    it('can be attached later', async function() {

      // given
      const { instance, panelParent } = create(Modeler);

      await instance.importXML(xml);

      // when
      instance.get('propertiesPanel').attachTo(panelParent);
      instance.get('selection').select(instance.get('elementRegistry').get('UserTask_1'));
      await nextFrame();

      // then
      expect(panelParent.querySelector('[data-group-id="group-flowable-assignment"]')).not.toBeNull();
    });

  });


  describe('behaviors', function() {

    it('clean up when an element is replaced', async function() {

      // given
      const { instance } = create(Modeler);

      await instance.importXML(xml);

      // when
      const serviceTask = instance.get('bpmnReplace').replaceElement(
        instance.get('elementRegistry').get('UserTask_1'),
        { type: 'bpmn:ServiceTask' }
      );

      // then
      const values = serviceTask.businessObject.get('extensionElements')?.get('values') || [];

      expect(values.map(value => value.$type)).not.toContain('flowable:TaskListener');
    });

  });


  describe('options', function() {

    it('keeps other moddle extensions next to Flowable', async function() {

      // given
      const { instance } = create(Modeler, {
        moddleExtensions: {
          example: {
            name: 'Example',
            uri: 'http://example.org/schema',
            prefix: 'example',
            xml: { tagAlias: 'lowerCase' },
            types: [
              { name: 'Tagged', extends: [ 'bpmn:BaseElement' ], properties: [ { name: 'tag', isAttr: true, type: 'String' } ] }
            ]
          }
        }
      });

      // when
      await instance.importXML(xml);

      // then
      const moddle = instance.get('moddle');

      expect(moddle.getPackage('flowable')).toBeDefined();
      expect(moddle.getPackage('example')).toBeDefined();
    });


    it('adds additional modules', async function() {

      // given
      const ExtraModule = {
        __init__: [ 'extra' ],
        extra: [ 'value', { name: 'extra' } ]
      };

      // when
      const { instance } = create(Modeler, { additionalModules: [ ExtraModule ] });

      // then
      expect(instance.get('extra').name).toBe('extra');
      expect(instance.get('propertiesPanel')).toBeDefined();
    });

  });

});
