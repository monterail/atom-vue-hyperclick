"use babel"

import { CompositeDisposable } from 'atom'
import makeCache, { isVue } from './make-cache'

function makeProvider(subscriptions) {
    const cache = makeCache(subscriptions)

    const {default: suggestions, isJavascript} = require('../../js-hyperclick/lib/suggestions.js');

    return {
        priority: 2, // larger than js-hyperclick
        providerName:'vue-hyperclick',
        wordRegExp: /[$0-9\w]+/g,
        getSuggestionForWord(textEditor, text, range) {
            if (isJavascript(textEditor) || isVue(textEditor)) {
                return suggestions(textEditor, text, range, cache)
            }
        }
    }
}

module.exports = {
    activate() {
        this.subscriptions = new CompositeDisposable()
    },
    getProvider() {
        if(atom.packages.isPackageLoaded('js-hyperclick')) {
            return makeProvider(this.subscriptions)
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
