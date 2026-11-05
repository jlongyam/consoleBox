# ConsoleBox

[![](https://data.jsdelivr.com/v1/package/gh/jlongyam/consoleBox/badge)](https://www.jsdelivr.com/package/gh/jlongyam/consoleBox)

Dev Console in HTML

## Features

- zero dependency
- using [standard](https://console.spec.whatwg.org/)
- adapt to parent
- console style
- ANSI escape friendly

## Usage

### HTML

- container should have `relative` position
- container should have specific `height`
- if no consoleBox skeleton it will use `body`
- consoleBox skeleton is `absolute` cover style

Skeleton:

```html
<div id="any_relative_container">
  <!-- skeleton -->
  <div id="console_box">
    <div id="console_output">
      <div id="console_out"></div>
    </div>
    <div id="console_input">
      <input id="console_in" type="text" autocapitalize="none" autocomplete="off">
    </div>
  </div>
</div>
```

Programatic:

```js
window.console = consoleBox(PARENT_NODE);
```

### JS

Basic

```js
consoleBox.log('Todo');
```

Overriding

```js
window.defaultConsole = window.console
delete window.console;
// use
window.console = consoleBox;
// restore
window.console = window.defaultConsole;
```

## Roadmap

- [x] console.[log,info,warn,debug,error]
- [x] console.dir[xml]
- [x] console.group[End|Collapse]
- [x] console.table
- [x] console.time[End|log|stamp|line[End]]
- [x] console.count[Reset]
- [x] console.trace
- [x] console.memory
- [x] console.profile[End]
- [x] console.clear
- [ ] console.context
- [ ] console.createTask
- [x] console.markTimeline +
- [x] console.exception +
- [ ] CTRL+Enter for multiline
- [ ] remember variable

## License

[MIT](./LICENSE)
