/**
 * Each call activity names the process it calls.
 */
export default function calledElement() {

  function check(node, reporter) {
    if (!node.$instanceOf('bpmn:CallActivity')) {
      return;
    }

    const called = node.get('calledElement');

    if (!called || !called.trim()) {
      reporter.report(node.id, 'Call activity has no called element');
    }
  }

  return { check };
}
