window.defaultConsole = window.console
delete window.console;
window.console = displayConsole;

if(location.protocol === 'https') {
  let link_0 = document.querySelector('link');
  console.log(location.origin);
}

let preview = document.querySelector('#preview');

console.dirxml(preview);
console.dir(preview);