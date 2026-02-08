import consoleBox from 'https://cdn.jsdelivr.net/gh/jlongyam/consoleBox/dist/es/consoleBox.js';

let preview = document.querySelector('#preview');

preview.innerHTML += typeof window.console + '\n'
window.defaultConsole = window.console
delete window.console;
window.console = consoleBox;



console.dirxml(preview);
console.dir(preview);
