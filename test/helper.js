let current = [];

/**
 * Creates an instance of a modeler or viewer class in a fresh container and
 * removes it after the test (call cleanUp in afterEach).
 *
 * @param {Function} Type - Modeler, Viewer or NavigatedViewer
 * @param {Object} [options] - more constructor options
 * @param {Object} [config]
 * @param {boolean} [config.panel] - give the properties panel a parent
 */
export function create(Type, options = {}, { panel = false } = {}) {
  const container = document.createElement('div');
  container.style.cssText = 'width: 800px; height: 500px;';
  document.body.appendChild(container);

  const panelParent = document.createElement('div');
  document.body.appendChild(panelParent);

  const instance = new Type({
    container,
    ...(panel ? { propertiesPanel: { parent: panelParent } } : {}),
    ...options
  });

  current.push({ instance, container, panelParent });

  return { instance, container, panelParent };
}

export async function cleanUp() {
  for (const { instance, container, panelParent } of current) {

    // let scheduled context pad and panel updates run before the canvas goes
    await nextFrame();

    instance.destroy();
    container.remove();
    panelParent.remove();
  }

  current = [];
}

export function nextFrame() {
  return new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
}
