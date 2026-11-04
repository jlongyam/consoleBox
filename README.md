# ConsoleBox

[![](https://data.jsdelivr.com/v1/package/gh/jlongyam/consoleBox/badge)](https://www.jsdelivr.com/package/gh/jlongyam/consoleBox)

Dev Console in HTML

Standard: <https://console.spec.whatwg.org/>

## Usage

- container should have `relative` position
- container should have specific `height`

- Basic

```js
consoleBox.log('Todo');
```

- Override

```js
window.defaultConsole = window.console
delete window.console;
// use
window.console = consoleBox;
// restore
window.console = window.defaultConsole;
```

## Roadmap

- [ ] CTRL+Enter for multiline
- [ ] remember variable

## License

[MIT](./LICENSE)
