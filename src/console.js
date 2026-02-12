function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    ;
}
function ansiToHtml(text) {
  const ansiMap = {
    '30': 'color: black',
    '31': 'color: #ef476f',
    '32': 'color: #06d6a0',
    '33': 'color: #ffd166',
    '34': 'color: #118ab2',
    '35': 'color: #8338ec',
    '36': 'color: #00b4d8',
    '37': 'color: white',
    '40': 'background-color: black',
    '41': 'background-color: #ef476f',
    '42': 'background-color: #06d6a0',
    '43': 'background-color: #ffd166',
    '44': 'background-color: #118ab2',
    '45': 'background-color: #8338ec',
    '46': 'background-color: #00b4d8',
    '47': 'background-color: white',
    '90': 'color: rgb(85,85,85)',
    '91': 'color: rgb(255,85,85)',
    '92': 'color: rgb(85,255,85)',
    '93': 'color: rgb(255,255,85)',
    '94': 'color: rgb(85,85,255)',
    '95': 'color: rgb(255,85,255)',
    '96': 'color: rgb(85,255,255)',
    '97': 'color: rgb(255,255,255)',
    '1': 'font-weight: bold',
    '3': 'font-style: italic',
    '4': 'text-decoration: underline',
    '7': 'filter: invert(100%)',
    '9': 'text-decoration: line-through',
    '0': 'all: initial'
  };
  const ansiRegex = /\x1b\[([0-9;]*)m/g;
  let html = '';
  let stack = [];
  let lastIndex = 0;
  let match;
  while ((match = ansiRegex.exec(text)) !== null) {
    html += escapeHtml(text.slice(lastIndex, match.index));
    const codes = match[1].split(';').filter(code => code !== '');
    if (codes.length === 0) codes.push('0');
    for (const code of codes) {
      if (code === '0') {
        while (stack.length > 0) {
          html += '</span>';
          stack.pop();
        }
      } else if (ansiMap[code]) {
        html += `<span style="${ansiMap[code]}">`;
        stack.push(code);
      }
    }
    lastIndex = match.index + match[0].length;
  }
  html += escapeHtml(text.slice(lastIndex));
  while (stack.length > 0) {
    html += '</span>';
    stack.pop();
  }
  return html;
}
function formatArgs(args) {
  if (!args.length) return { formatted: [], styles: [] };
  var first = args[0];
  var rest = Array.prototype.slice.call(args, 1);
  var styles = [];
  if (typeof first === "string" && /%[sdifoOc]/.test(first)) {
    var i = 0;
    var nodes = [];
    var lastIndex = 0;
    var pattern = /%([sdifoOc%])/g;
    var match,
      str = first;
    while ((match = pattern.exec(str)) !== null) {
      if (match.index > lastIndex) {
        nodes.push(
          document.createTextNode(str.slice(lastIndex, match.index)),
        );
      }
      var type = match[1];
      if (type === "%") {
        nodes.push(document.createTextNode("%"));
      } else if (type === "c") {
        styles.push(rest[i++] || "");
      } else {
        var val = rest[i++];
        nodes.push(formatSingleArg(val));
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < str.length) {
      nodes.push(document.createTextNode(str.slice(lastIndex)));
    }
    for (; i < rest.length; i++) {
      nodes.push(document.createTextNode(" "));
      nodes.push(formatSingleArg(rest[i]));
    }
    return { formatted: nodes, styles };
  } else {
    var spans = Array.prototype.map.call(args, formatSingleArg);
    return { formatted: spans, styles: [] };
  }
}
function getTypeClass(arg) {
  if (arg === null) return "js-null";
  if (Array.isArray(arg)) return "js-array";
  switch (typeof arg) {
    case "string":
      return "js-string";
    case "number":
      return "js-number";
    case "boolean":
      return "js-boolean";
    case "undefined":
      return "js-undefined";
    case "function":
      return "js-function";
    case "symbol":
      return "js-symbol";
    case "bigint":
      return "js-bigint";
    case "object":
      return "js-object";
    default:
      return "";
  }
}
function formatSingleArg(arg) {
  var span = document.createElement("span");
  var typeClass = getTypeClass(arg);
  span.className = typeClass;
  if (typeClass === "js-string") {
    if (typeof arg === 'string' && arg.includes('\x1b[')) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = ansiToHtml(arg);
      while (tempDiv.firstChild) {
        span.appendChild(tempDiv.firstChild);
      }
    } else {
      span.textContent = arg;
    }
  } else if (typeClass === "js-null") {
    span.textContent = "null";
  } else if (typeClass === "js-undefined") {
    span.textContent = "undefined";
  } else if (typeClass === "js-array") {
    try {
      span.textContent = JSON.stringify(arg);
    } catch (e) {
      span.textContent = "[array]";
    }
  } else if (typeClass === "js-object") {
    try {
      span.textContent = JSON.stringify(arg);
    } catch (e) {
      span.textContent = "[object]";
    }
  } else if (typeClass === "js-function") {
    span.textContent = arg.toString();
  } else if (typeClass === "js-symbol") {
    span.textContent = arg.toString();
  } else if (typeClass === "js-bigint") {
    span.textContent = arg.toString() + "n";
  } else {
    span.textContent = String(arg);
  }
  return span;
}
var timers = {};
var counts = {};
var indentLevel = 0;
var indentString = "  ";
var groupStack = [];
function createGroup(label, isCollapsed) {
  var out = document.getElementById("console_out");
  if (!out) return;
  var targetContainer = out;
  if (groupStack.length > 0) {
    var currentGroup = groupStack[groupStack.length - 1];
    targetContainer = currentGroup.contentDiv;
  }
  var groupWrapper = document.createElement("div");
  groupWrapper.className = "console-group";
  var groupHeader = document.createElement("div");
  groupHeader.className = "console-group-header";
  var toggle = document.createElement("span");
  toggle.className = "dir-toggle";
  toggle.textContent = isCollapsed ? "▶" : "▼";
  var labelSpan = document.createElement("span");
  labelSpan.className = "console-group-label";
  labelSpan.innerHTML = ansiToHtml(label);
  groupHeader.appendChild(toggle);
  if (label) {
    groupHeader.appendChild(labelSpan);
  }
  var contentDiv = document.createElement("div");
  contentDiv.className = "console-group-content";
  if (isCollapsed) {
    contentDiv.classList.add("dir-hidden");
  }
  function doToggle(e) {
    e.stopPropagation();
    if (contentDiv.classList.contains("dir-hidden")) {
      contentDiv.classList.remove("dir-hidden");
      contentDiv.classList.add("dir-expanded");
      toggle.textContent = "▼";
    } else {
      contentDiv.classList.add("dir-hidden");
      contentDiv.classList.remove("dir-expanded");
      toggle.textContent = "▶";
    }
  }
  toggle.addEventListener("click", doToggle);
  toggle.addEventListener("touchstart", function (e) {
    e.preventDefault();
    doToggle(e);
  });
  groupWrapper.appendChild(groupHeader);
  groupWrapper.appendChild(contentDiv);
  targetContainer.appendChild(groupWrapper);
  groupStack.push({
    wrapper: groupWrapper,
    contentDiv: contentDiv,
    label: label,
  });
}
function isExpandable(val) {
  if (!val || typeof val !== "object") return false;
  if (Object.getOwnPropertyNames(val).length > 0) return true;
  for (var k in val) return true;
  return false;
}
function renderTree(obj, depth) {
  depth = depth || 0;
  var container = document.createElement("div");
  container.className = "dir-tree dir-indent-" + Math.min(depth, 9);
  if (typeof obj === "object" && obj !== null) {
    var keys = Object.getOwnPropertyNames(obj);
    for (var key in obj) {
      if (keys.indexOf(key) === -1) keys.push(key);
    }
    keys.sort();
    for (var j = 0; j < keys.length; j++) {
      var key = keys[j];
      var val;
      try {
        val = obj[key];
      } catch (e) {
        val = "<access denied>";
      }
      var item = renderTreeEntry(key, val, depth + 1);
      container.appendChild(item);
    }
  } else {
    var valSpan = document.createElement("span");
    valSpan.className = "dir-value";
    valSpan.textContent = String(obj);
    container.appendChild(valSpan);
  }
  return container;
}
function renderTreeEntry(key, val, depth) {
  var entry = document.createElement("div");
  entry.className = "dir-tree-entry dir-indent-" + Math.min(depth, 9);
  if (isExpandable(val)) {
    var collapsedLine = document.createElement("div");
    collapsedLine.className = "dir-collapsed-line";
    var toggle = document.createElement("span");
    toggle.className = "dir-toggle";
    toggle.textContent = "▶";
    var keySpan = document.createElement("span");
    keySpan.className = "dir-key";
    keySpan.textContent = key + ": ";
    var typeSpan = document.createElement("span");
    typeSpan.className = "dir-type";
    typeSpan.textContent = Array.isArray(val) && Object.getPrototypeOf(val) !== Object.prototype
      ? "Array(" + val.length + ")"
      : val && val.constructor && val.constructor !== Object
        ? val.constructor.name
        : "Object";
    collapsedLine.appendChild(toggle);
    collapsedLine.appendChild(keySpan);
    collapsedLine.appendChild(typeSpan);
    var expanded;
    function doToggle(e) {
      e.stopPropagation();
      if (!expanded) {
        expanded = renderTree(val, depth + 1);
        expanded.classList.add("dir-expanded");
        entry.appendChild(expanded);
        toggle.textContent = "▼";
      } else if (expanded.classList.contains("dir-hidden")) {
        expanded.classList.remove("dir-hidden");
        expanded.classList.add("dir-expanded");
        toggle.textContent = "▼";
      } else {
        expanded.classList.add("dir-hidden");
        expanded.classList.remove("dir-expanded");
        toggle.textContent = "▶";
      }
    }
    toggle.addEventListener("click", doToggle);
    toggle.addEventListener("touchstart", function (e) {
      e.preventDefault();
      doToggle(e);
    });
    entry.appendChild(collapsedLine);
  } else {
    var keySpan = document.createElement("span");
    keySpan.className = "dir-key";
    keySpan.textContent = key + ": ";
    var valSpan = document.createElement("span");
    valSpan.className = "dir-value";
    valSpan.textContent = String(val);
    entry.appendChild(keySpan);
    entry.appendChild(valSpan);
  }
  return entry;
}
function consolePrint(type, args, rawObj) {
  var indent = indentString.repeat(indentLevel);
  var out = document.getElementById("console_out");
  if (!out) return;
  var targetContainer = out;
  if (groupStack.length > 0) {
    var currentGroup = groupStack[groupStack.length - 1];
    targetContainer = currentGroup.contentDiv;
  }
  var div = document.createElement("div");
  div.className = type;
  if (
    (type === "log" || type === "info" || type === "warn" ||
      type === "error" || type === "debug") &&
    args.length > 0
  ) {
    var { formatted, styles } = formatArgs(args);
    if (styles.length > 0) {
      var spanIdx = 0;
      var styleIdx = 0;
      while (spanIdx < formatted.length) {
        var span = document.createElement("span");
        while (
          spanIdx < formatted.length &&
          !(formatted[spanIdx].nodeType === 3 && formatted[spanIdx].textContent === "")
        ) {
          span.appendChild(formatted[spanIdx]);
          spanIdx++;
        }
        if (styles[styleIdx]) span.setAttribute("style", styles[styleIdx]);
        div.appendChild(span);
        styleIdx++;
        spanIdx++;
      }
    } else {
      div.appendChild(document.createTextNode(indent));
      for (var i = 0; i < formatted.length; i++) {
        if (i > 0) div.appendChild(document.createTextNode(" "));
        if (formatted[i].nodeType === 3 && formatted[i].textContent.includes('\x1b[')) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = ansiToHtml(formatted[i].textContent);
          while (tempDiv.firstChild) {
            div.appendChild(tempDiv.firstChild);
          }
        } else {
          div.appendChild(formatted[i]);
        }
      }
    }
  } else if (type === "dir" && rawObj !== undefined) {
    var collapsedRoot = document.createElement("div");
    collapsedRoot.className = "dir-collapsed-line";
    var toggle = document.createElement("span");
    toggle.className = "dir-toggle";
    toggle.textContent = "▶";
    var typeSpan = document.createElement("span");
    typeSpan.className = "dir-type";
    if (Array.isArray(rawObj) && Object.getPrototypeOf(rawObj) !== Object.prototype) {
      typeSpan.textContent = "Array(" + rawObj.length + ")";
    } else if (
      rawObj &&
      rawObj.constructor &&
      rawObj.constructor !== Object
    ) {
      typeSpan.textContent = rawObj.constructor.name;
    } else {
      typeSpan.textContent = "Object";
    }
    collapsedRoot.appendChild(toggle);
    collapsedRoot.appendChild(typeSpan);
    var tree = renderTree(rawObj, 0);
    tree.classList.add("dir-hidden");
    function doToggle(e) {
      e.stopPropagation();
      if (tree.classList.contains("dir-hidden")) {
        tree.classList.remove("dir-hidden");
        tree.classList.add("dir-expanded");
        toggle.textContent = "▼";
      } else {
        tree.classList.add("dir-hidden");
        tree.classList.remove("dir-expanded");
        toggle.textContent = "▶";
      }
    }
    toggle.addEventListener("click", doToggle);
    toggle.addEventListener("touchstart", function (e) {
      e.preventDefault();
      doToggle(e);
    });
    div.appendChild(collapsedRoot);
    div.appendChild(tree);
  } else {
    var { formatted } = formatArgs(args);
    div.appendChild(document.createTextNode(indent));
    for (var i = 0; i < formatted.length; i++) {
      if (formatted[i].nodeType === 3 && formatted[i].textContent.includes('\x1b[')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = ansiToHtml(formatted[i].textContent);
        while (tempDiv.firstChild) {
          div.appendChild(tempDiv.firstChild);
        }
      } else {
        div.appendChild(formatted[i]);
      }
    }
  }
  targetContainer.appendChild(div);
}
var consoleBox = {
  log: function () {
    consolePrint("log", arguments);
  },
  info: function () {
    consolePrint("info", arguments);
  },
  warn: function () {
    consolePrint("warn", arguments);
  },
  error: function () {
    consolePrint("error", arguments);
  },
  debug: function () {
    consolePrint("debug", arguments);
  },
  assert: function (condition) {
    if (!condition) {
      var args = Array.prototype.slice.call(arguments, 1);
      consolePrint("assert", ["Assertion failed:"].concat(args));
    }
  },
  clear: function () {
    var out = document.getElementById("console_out");
    if (out) out.innerHTML = "";
  },
  count: function (label) {
    label = label || "default";
    counts[label] = (counts[label] || 0) + 1;
    consolePrint("count", [label + ": " + counts[label]]);
  },
  countReset: function (label) {
    label = label || "default";
    counts[label] = 0;
  },
  group: function (label) {
    createGroup(label || "", false);
  },
  groupCollapsed: function (label) {
    createGroup(label || "", true);
  },
  groupEnd: function () {
    if (groupStack.length > 0) {
      groupStack.pop();
    }
  },
  time: function (label) {
    label = label || "default";
    timers[label] = Date.now();
  },
  exception: function () {
    consolePrint("error", arguments);
  },
  markTimeline: function () { },
  timeline: function () { },
  timelineEnd: function () { },
  timeStamp: function (label) {
    consolePrint("timeStamp", [
      label ? String(label) : "Timestamp: " + new Date().toISOString(),
    ]);
  },
  context: function () { },
  memory: {},
  timeEnd: function (label) {
    label = label || "default";
    if (timers[label]) {
      var duration = Date.now() - timers[label];
      consolePrint("time", [label + ": " + duration + "ms"]);
      delete timers[label];
    }
  },
  timeLog: function (label) {
    label = label || "default";
    if (timers[label]) {
      var duration = Date.now() - timers[label];
      consolePrint("timeLog", [label + ": " + duration + "ms"]);
    }
  },
  trace: function () {
    var err = new Error();
    var stack = (err.stack || "").split("\n");
    if (stack.length > 1) stack = stack.slice(1);
    consolePrint("trace", ["Trace:", stack.join("\n")]);
  },
  table: function (data, columns) {
    var out = document.getElementById("console_out");
    if (!out) return;
    var div = document.createElement("div");
    div.className = "table";
    var formatValue = function (value) {
      if (value === undefined) return "undefined";
      if (value === null) return "null";
      if (typeof value === "string") return "'" + value + "'";
      if (typeof value === "object") {
        if (value.nodeType) return value.outerHTML || value.toString();
        try {
          var json = JSON.stringify(value);
          return json === "{}" ? value.toString() : json;
        } catch (e) {
          return value.toString();
        }
      }
      return String(value);
    };
    var table = document.createElement("table");
    table.className = "console-table";
    if (Array.isArray(data)) {
      var isAllArrays =
        data.length > 0 &&
        data.every(function (item) {
          return Array.isArray(item);
        });
      var isAllObjects =
        data.length > 0 &&
        data.every(function (item) {
          return item && typeof item === "object" && !Array.isArray(item);
        });
      var headers;
      if (isAllArrays) {
        var maxLength = Math.max.apply(
          Math,
          data.map(function (arr) {
            return Array.isArray(arr) ? arr.length : 0;
          }),
        );
        headers = ["(index)"];
        for (var i = 0; i < maxLength; i++) {
          headers.push(String(i));
        }
      } else if (isAllObjects) {
        var allKeys = new Set();
        data.forEach(function (item) {
          if (item && typeof item === "object" && !Array.isArray(item)) {
            Object.keys(item).forEach(function (k) {
              allKeys.add(k);
            });
          }
        });
        headers = ["(index)"].concat(Array.from(allKeys).sort());
      } else {
        headers = ["(index)", "Value"];
      }
      if (columns && Array.isArray(columns)) {
        var filteredHeaders = ["(index)"];
        columns.forEach(function (col) {
          if (headers.indexOf(col) !== -1) {
            filteredHeaders.push(col);
          }
        });
        headers = filteredHeaders;
      }
      var thead = document.createElement("thead");
      var headerRow = document.createElement("tr");
      headers.forEach(function (h) {
        var th = document.createElement("th");
        th.textContent = h;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      var tbody = document.createElement("tbody");
      data.forEach(function (item, index) {
        var row = document.createElement("tr");
        var indexCell = document.createElement("td");
        indexCell.textContent = index;
        row.appendChild(indexCell);
        headers.slice(1).forEach(function (header) {
          var cell = document.createElement("td");
          var value;
          if (header === "Value") {
            value = item;
          } else if (isAllArrays && Array.isArray(item)) {
            var arrayIndex = parseInt(header);
            value = item[arrayIndex];
          } else if (isAllObjects && item && typeof item === "object") {
            value = item[header];
          } else {
            value = undefined;
          }
          cell.textContent = formatValue(value);
          row.appendChild(cell);
        });
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
    } else if (typeof data === "object" && data !== null) {
      var props = new Set();
      for (var key in data) props.add(key);
      Object.getOwnPropertyNames(data).forEach(function (prop) {
        props.add(prop);
      });
      var thead = document.createElement("thead");
      var headerRow = document.createElement("tr");
      ["(index)", "Value"].forEach(function (h) {
        var th = document.createElement("th");
        th.textContent = h;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      var tbody = document.createElement("tbody");
      Array.from(props)
        .sort()
        .forEach(function (prop) {
          if (prop === "constructor") return;
          var row = document.createElement("tr");
          var propCell = document.createElement("td");
          propCell.textContent = prop;
          row.appendChild(propCell);
          var valueCell = document.createElement("td");
          try {
            valueCell.textContent = formatValue(data[prop]);
          } catch (e) {
            valueCell.textContent = "<access denied>";
          }
          row.appendChild(valueCell);
          tbody.appendChild(row);
        });
      table.appendChild(tbody);
    } else {
      div.textContent = formatValue(data);
      out.appendChild(div);
      return;
    }
    div.appendChild(table);
    out.appendChild(div);
  },
  dir: function (obj) {
    consolePrint("dir", [""], obj);
  },
  dirxml: function (obj) {
    function renderDomTree(node, depth) {
      depth = depth || 0;
      var container = document.createElement("div");
      container.className = "dir-tree dir-indent-" + Math.min(depth, 9);
      if (node.nodeType === 1) {
        var entry = document.createElement("div");
        entry.className = "dir-tree-entry dir-indent-" + Math.min(depth, 9);
        var collapsedLine = document.createElement("div");
        collapsedLine.className = "dir-collapsed-line";
        var toggle = document.createElement("span");
        toggle.className = "dir-toggle";
        toggle.textContent = node.childNodes.length > 0 ? "▶" : "";
        var tagSpan = document.createElement("span");
        tagSpan.className = "dir-key";
        tagSpan.textContent = "<" + node.nodeName.toLowerCase();
        for (var i = 0; i < node.attributes.length; i++) {
          var attr = node.attributes[i];
          tagSpan.textContent += " " + attr.name + '="' + attr.value + '"';
        }
        tagSpan.textContent += ">";
        if (toggle.textContent) collapsedLine.appendChild(toggle);
        collapsedLine.appendChild(tagSpan);
        var expanded = document.createElement("div");
        expanded.className = "dir-hidden";
        for (var j = 0; j < node.childNodes.length; j++) {
          expanded.appendChild(renderDomTree(node.childNodes[j], depth + 1));
        }
        if (node.childNodes.length > 0) {
          var closeTag = document.createElement("div");
          closeTag.className =
            "dir-tree-entry dir-indent-" + Math.min(depth + 1, 9);
          var closeSpan = document.createElement("span");
          closeSpan.className = "dir-key";
          closeSpan.textContent = "</" + node.nodeName.toLowerCase() + ">";
          closeTag.appendChild(closeSpan);
          expanded.appendChild(closeTag);
        }
        function doToggle(e) {
          e.stopPropagation();
          if (expanded.classList.contains("dir-hidden")) {
            expanded.classList.remove("dir-hidden");
            expanded.classList.add("dir-expanded");
            toggle.textContent = "▼";
          } else {
            expanded.classList.add("dir-hidden");
            expanded.classList.remove("dir-expanded");
            toggle.textContent = "▶";
          }
        }
        if (toggle.textContent) {
          toggle.addEventListener("click", doToggle);
          toggle.addEventListener("touchstart", function (e) {
            e.preventDefault();
            doToggle(e);
          });
        }
        entry.appendChild(collapsedLine);
        if (node.childNodes.length > 0) entry.appendChild(expanded);
        container.appendChild(entry);
      } else if (node.nodeType === 3) {
        var textContent = node.textContent.trim();
        if (textContent) {
          var textEntry = document.createElement("div");
          textEntry.className =
            "dir-tree-entry dir-indent-" + Math.min(depth, 9);
          var textSpan = document.createElement("span");
          textSpan.className = "dir-value";
          textSpan.textContent = textContent;
          textEntry.appendChild(textSpan);
          container.appendChild(textEntry);
        }
      } else if (node.nodeType === 8) {
        var commentEntry = document.createElement("div");
        commentEntry.className =
          "dir-tree-entry dir-indent-" + Math.min(depth, 9);
        var commentSpan = document.createElement("span");
        commentSpan.className = "dir-value";
        commentSpan.textContent = "<!-- " + node.textContent + " -->";
        commentEntry.appendChild(commentSpan);
        container.appendChild(commentEntry);
      } else if (node.nodeType === 9) {
        for (var k = 0; k < node.childNodes.length; k++) {
          container.appendChild(renderDomTree(node.childNodes[k], depth));
        }
      } else {
        var otherEntry = document.createElement("div");
        otherEntry.className =
          "dir-tree-entry dir-indent-" + Math.min(depth, 9);
        var otherSpan = document.createElement("span");
        otherSpan.className = "dir-value";
        otherSpan.textContent = node.nodeName;
        otherEntry.appendChild(otherSpan);
        container.appendChild(otherEntry);
      }
      return container;
    }
    if (typeof obj === "object" && obj && obj.nodeType) {
      var out = document.getElementById("console_out");
      if (!out) return;
      var div = document.createElement("div");
      div.className = "dirxml";
      div.appendChild(renderDomTree(obj, 0));
      out.appendChild(div);
    } else {
      consolePrint("dirxml", [""], obj);
    }
  },
  profile: function (label) { },
  profileEnd: function (label) { },
};
var console_box = document.getElementById('console_box');
if(!console_box) {
  let fragment = document.createDocumentFragment();
  let textHtml = `
    <div id="console_box">
      <div id="console_output">
        <div id="console_out"></div>
      </div>
      <div id="console_input">
        <input id="console_in" type="text" autocomplete="off" placeholder="Code ...">
      </div>
    </div>
  `
  let elTemp = document.createElement('div');
  elTemp.innerHTML = textHtml;
  let comp = elTemp.firstElementChild;
  fragment.appendChild(comp)
  document.body.appendChild(fragment);
}
var input = document.getElementById("console_in");
if (input) {
  var history = [];
  var historyIndex = -1;
  var tempInput = "";
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      var code = input.value;
      if (code.trim() !== "") {
        if (history.length === 0 || history[history.length - 1] !== code) {
          history.push(code);
        }
      }
      historyIndex = history.length;
      input.value = "";
      tempInput = "";
      try {
        var result = new Function('return ' + code)();
        if (result !== undefined) {
          console.log(result);
        }
      } catch (err) {
        if (err instanceof SyntaxError) {
          try {
            new Function(code)();
          } catch (e) {
            console.error(e);
          }
        } else {
          console.error(err);
        }
      }
    } else if (e.key === "ArrowUp") {
      if (history.length > 0 && historyIndex > 0) {
        if (historyIndex === history.length) tempInput = input.value;
        historyIndex--;
        input.value = history[historyIndex];
        setTimeout(function () {
          input.setSelectionRange(input.value.length, input.value.length);
        }, 0);
      }
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      if (history.length > 0 && historyIndex < history.length) {
        historyIndex++;
        if (historyIndex === history.length) {
          input.value = tempInput;
        } else {
          input.value = history[historyIndex];
        }
        setTimeout(function () {
          input.setSelectionRange(input.value.length, input.value.length);
        }, 0);
      }
      e.preventDefault();
    }
  });
  input.focus();
}
var out = document.getElementById("console_out");
if (out) {
  var observer = new MutationObserver(function () {
    out.scrollTop = out.scrollHeight;
  });
  observer.observe(out, { childList: true });
}
let i_toggle = document.querySelector('#i_toggle');
if(i_toggle) {
  i_toggle.addEventListener('click', function () {
    console_box.classList.toggle('hide');
    this.classList.toggle('hide');
  });
}
Object.defineProperty(consoleBox, "memory", {
  get: function () {
    return {};
  },
  configurable: true,
});

export default consoleBox;
