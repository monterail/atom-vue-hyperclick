"use babel"

import parseCode from './parse-code'

export function isVue(textEditor) {
    const { scopeName } = textEditor.getGrammar()
    return scopeName === 'text.html.vue';
}

export default function makeCache(subscriptions) {
    const editors = new WeakMap()
    const data = new WeakMap()

    function watchEditor(editor) {
        if (!editors.has(editor)) {
            editors.set(editor, null)
            subscriptions.add(editor.onDidStopChanging(() => {
                data.delete(editor)
            }))
        }
    }


    return {
        get(editor) {
            watchEditor(editor)
            if (!data.has(editor)) {
                data.set(editor, parseCode(editor.getText(), isVue(editor)))
            }

            return data.get(editor)
        }
    }
}
