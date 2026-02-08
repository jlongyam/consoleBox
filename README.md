# ConsoleBox

[![](https://data.jsdelivr.com/v1/package/gh/jlongyam/consoleBox/badge)](https://www.jsdelivr.com/package/gh/jlongyam/consoleBox)

Dev Console in HTML

Standard: <https://console.spec.whatwg.org/>

## Usage

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

## Related project

- [Repo](https://github.com/jlongyam/repo)

[MIT](./LICENSE)
