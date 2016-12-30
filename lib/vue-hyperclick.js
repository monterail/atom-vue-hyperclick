"use babel"

import { CompositeDisposable } from 'atom'
import padCode from './parse-code'

const isVueGrammar = (grammar) => grammar.scopeName === 'text.html.vue'

const patchedEditors = new WeakMap()
function patchEditor(editor) {
    if (patchedEditors.has(editor)) {
        return patchedEditors.get(editor)
    }

    function patchGetGrammar (...args) {
        // force js-hyperclick to accept vue file
        const grammar = editor.getGrammar(...args)
        if (isVueGrammar(grammar)) {
            return {
                ...grammar,
                scopeName: 'source.js'
            }
        }
        return grammar
    }

    function patchGetText (...args) {
        // strip vue files to plain javascript for  js-hyperclick
        const text = editor.getText(...args)
        const isVue = isVueGrammar(editor.getGrammar())
        if (isVue) {
            return padCode(text)
        }
        return text
    }

    const patched = new Proxy(editor, {
        get (target, key) {
            if (key === 'getGrammar') {
                return patchGetGrammar
            }
            else if (key === 'getText') {
                return patchGetText
            }
            return target[key]
        }
    })

    patchedEditors.set(editor, patched)
    return patched
}

function makeProvider(ctx) {
    const jsHyperclick = require('../../js-hyperclick')
    const provider = jsHyperclick.getProvider.call(ctx)

    return {
        ...provider,
        priority: 2, // larger than js-hyperclick
        providerName:'vue-hyperclick',
        getSuggestionForWord(textEditor, text, range) {
            const result = provider.getSuggestionForWord(patchEditor(textEditor), text, range)

            if (result && result.callback) {
                // patch editor returned from async atom.workspace.open
                return {
                    ...result,
                    callback (...args) {
                        const origOpen = atom.workspace.open
                        try {
                            atom.workspace.open = function (...args) {
                                return origOpen.apply(this, args).then(patchEditor)
                            }
                            const ret = result.callback.apply(this, args)
                            return ret
                        }
                        finally {
                            atom.workspace.open = origOpen
                        }
                    }
                }
            }

            return result
        }
    }
}

module.exports = {
    activate() {
        this.subscriptions = new CompositeDisposable()
    },
    getProvider() {
        if(atom.packages.isPackageLoaded('js-hyperclick')) {
            return makeProvider(this)
        }
        else {
            atom.notifications.addError('vue-hyperclick: This package requires js-hyperclick to function.');
            return null;
        }
    },
    deactivate() {
        this.subscriptions.dispose()
    }
}
