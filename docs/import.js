
import { consoleBox } from 'https://cdn.jsdelivr.net/gh/jlongyam/consoleBox@main/dist/es/consoleBox.js';

let preview = document.querySelector('#preview');

window.defaultConsole = window.console
delete window.console;
window.console = consoleBox;



console.dirxml(preview);
console.dir(preview);
