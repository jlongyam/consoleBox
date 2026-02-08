window.addEventListener('load', function () {

  window.defaultConsole = window.console
  delete window.console;
  window.console = consoleBox;

  let console_bar = document.querySelector('#console_bar');

  console.dirxml(console_bar);
  console.dir(console_bar);

});
