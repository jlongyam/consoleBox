import consoleBox from 'https://cdn.jsdelivr.net/gh/jlongyam/consoleBox/dist/es/consoleBox.js';

window.defaultConsole = window.console
delete window.console;
window.console = consoleBox;

let preview = document.querySelector('#preview');

console.dirxml(preview);
console.dir(preview);
