import { afterEach, describe, expect, it } from 'vitest';

import BpmnViewer from 'bpmn-js/lib/Viewer';
import BpmnNavigatedViewer from 'bpmn-js/lib/NavigatedViewer';

import { NavigatedViewer, Viewer } from '../index.js';

import { cleanUp, create } from './helper.js';

import xml from './fixtures/activiti.bpmn?raw';


[
  [ 'Viewer', Viewer, BpmnViewer ],
  [ 'NavigatedViewer', NavigatedViewer, BpmnNavigatedViewer ]
].forEach(([ name, Type, BpmnType ]) => {

  describe(name, function() {

    afterEach(cleanUp);


    it(`is a bpmn-js ${ name }`, function() {

      // when
      const { instance } = create(Type);

      // then
      expect(instance).toBeInstanceOf(BpmnType);
      expect(instance.get('modeling', false)).toBeFalsy();
      expect(instance.get('propertiesPanel', false)).toBeFalsy();
    });


    it('reads Activiti spellings as Flowable', async function() {

      // given
      const { instance } = create(Type);

      // when
      const { warnings } = await instance.importXML(xml);

      // then
      // moddle notes the attributes of unknown elements, which it keeps
      expect(warnings.map(warning => warning.message)).toEqual([ 'unknown attribute <color>' ]);
      expect(instance.get('elementRegistry').get('UserTask_1').businessObject.get('flowable:assignee')).toBe('${initiator}');
    });


    it('writes the flowable prefix', async function() {

      // given
      const { instance } = create(Type);

      await instance.importXML(xml);

      // when
      const { xml: saved } = await instance.saveXML();

      // then
      expect(saved).not.toContain('xmlns:activiti');
      expect(saved).toContain('<flowable:designerHint color="blue">keep</flowable:designerHint>');
      expect(saved).toContain('<error id="notFound" errorCode="notFound" />');
    });

  });

});
