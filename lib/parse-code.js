"use babel"

const splitRE = /\r?\n/g;

function padContent(block, fullSrc) {
  // make sure actual code blocks have preserved position (row, col, charId)
  var offsetLines = block.content.slice(0, block.start).split(splitRE).length;
  var offsetChars = block.start - offsetLines;
  return Array(offsetChars + 2).join(' ') +
      Array(offsetLines).join('\n') +
      fullSrc.slice(block.start, block.end);
}

export default function parseCode(code, isVue) {
    const compiler = require('vue-template-compiler')
    const jsParseCode = require('../../js-hyperclick/lib/parse-code');

    if(isVue) {
        const output = compiler.parseComponent(code);
        const jsCode = padContent(output.script, code);
        return jsParseCode(jsCode);
    }
    else {
        return jsParseCode(code);
    }
}
