# ConsoleBox

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
