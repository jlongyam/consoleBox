window.defaultConsole = window.console
delete window.console;
window.console = consoleBox;

let preview = document.querySelector('#preview');

console.dirxml(preview);
console.dir(preview);