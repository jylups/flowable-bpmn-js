import ReplaceWithTypedTaskHandler from './ReplaceWithTypedTaskHandler.js';
import TypedTaskPaletteProvider from './TypedTaskPaletteProvider.js';
import TypedTaskReplaceMenuProvider from './TypedTaskReplaceMenuProvider.js';

/**
 * Palette and replace menu entries for the typed service tasks (mail, HTTP,
 * shell, Camel, decision, case, send event and external worker).
 */
export default {
  __init__: [
    'typedTaskPaletteProvider',
    'typedTaskReplaceMenuProvider',
    [ 'commandStack', commandStack => commandStack.registerHandler('flowable.replaceWithTypedTask', ReplaceWithTypedTaskHandler) ]
  ],
  typedTaskPaletteProvider: [ 'type', TypedTaskPaletteProvider ],
  typedTaskReplaceMenuProvider: [ 'type', TypedTaskReplaceMenuProvider ]
};
