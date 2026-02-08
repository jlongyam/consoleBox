import consoleBox from '../dist/es/consoleBox.js';

window.defaultConsole = window.console
delete window.console;
window.console = consoleBox;

if(location.protocol === 'https') {
  let link_0 = document.querySelector('link');
  console.log(location.origin);
}

let preview = document.querySelector('#preview');

console.dirxml(preview);
console.dir(preview);