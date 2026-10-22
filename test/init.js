import consoleBox from "../src/console.js";

window.addEventListener('load', function () {

  window.defaultConsole = window.console
  delete window.console;
  window.console = consoleBox;

});
