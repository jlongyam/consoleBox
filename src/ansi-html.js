// ansi-html.mjs
// Konversi string dengan escape ANSI (SGR) ke HTML.
// Tanpa dependency. Palet 16 warna bisa dikonfigurasi.

const DEFAULT_PALETTE = {
  30: '#000000', 31: '#ef476f', 32: '#06d6a0', 33: '#ffd166',
  34: '#118ab2', 35: '#8338ec', 36: '#00b4d8', 37: '#ffffff',
  90: '#555555', 91: '#ff5555', 92: '#55ff55', 93: '#ffff55',
  94: '#5555ff', 95: '#ff55ff', 96: '#55ffff', 97: '#ffffff',
};

// Palet 16 untuk background (sama dengan foreground, dipakai untuk bg)
const DEFAULT_BG_PALETTE = {
  40: '#000000', 41: '#ef476f', 42: '#06d6a0', 43: '#ffd166',
  44: '#118ab2', 45: '#8338ec', 46: '#00b4d8', 47: '#ffffff',
  100: '#555555', 101: '#ff5555', 102: '#55ff55', 103: '#ffff55',
  104: '#5555ff', 105: '#ff55ff', 106: '#55ffff', 107: '#ffffff',
};

function ansi256ToHex(n, palette = DEFAULT_PALETTE) {
  if (n < 16) {
    // 0-7 = standar, 8-15 = bright
    return n < 8 ? palette[30 + n] : palette[90 + (n - 8)];
  }
  if (n < 232) {
    const i = n - 16;
    const r = Math.floor(i / 36) * 51;
    const g = Math.floor((i % 36) / 6) * 51;
    const b = (i % 6) * 51;
    return rgbToHex(r, g, b);
  }
  const gray = (n - 232) * 10 + 8;
  return rgbToHex(gray, gray, gray);
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createState() {
  return { bold: false, italic: false, underline: false, invert: false, strike: false, fg: null, bg: null };
}

function applySgr(state, params, palette) {
  const codes = params.split(';').filter(Boolean).map(Number);
  if (codes.length === 0) codes.push(0);

  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    if (code === 0) {
      state.bold = state.italic = state.underline = state.invert = state.strike = false;
      state.fg = state.bg = null;
    } else if (code === 1) state.bold = true;
    else if (code === 3) state.italic = true;
    else if (code === 4) state.underline = true;
    else if (code === 7) state.invert = true;
    else if (code === 9) state.strike = true;
    else if (code === 22) state.bold = false;
    else if (code === 23) state.italic = false;
    else if (code === 24) state.underline = false;
    else if (code === 27) state.invert = false;
    else if (code === 29) state.strike = false;
    else if (code >= 30 && code <= 37) state.fg = palette[code];
    else if (code >= 90 && code <= 97) state.fg = palette[code];
    else if (code >= 40 && code <= 47) state.bg = DEFAULT_BG_PALETTE[code];
    else if (code >= 100 && code <= 107) state.bg = DEFAULT_BG_PALETTE[code];
    else if (code === 39) state.fg = null;
    else if (code === 49) state.bg = null;
    else if (code === 38 || code === 48) {
      if (codes[i + 1] === 5) {
        const hex = ansi256ToHex(codes[i + 2], palette);
        if (code === 38) state.fg = hex; else state.bg = hex;
        i += 2;
      } else if (codes[i + 1] === 2) {
        const hex = rgbToHex(codes[i + 2], codes[i + 3], codes[i + 4]);
        if (code === 38) state.fg = hex; else state.bg = hex;
        i += 4;
      }
    }
  }
}

function styleToString(state) {
  const parts = [];
  let fg = state.fg, bg = state.bg;
  if (state.invert) {
    const tmp = fg; fg = bg || '#000'; bg = tmp || '#fff';
  }
  if (fg) parts.push(`color:${fg}`);
  if (bg) parts.push(`background-color:${bg}`);
  if (state.bold) parts.push('font-weight:bold');
  if (state.italic) parts.push('font-style:italic');
  if (state.underline) parts.push('text-decoration:underline');
  if (state.strike) parts.push('text-decoration:line-through');
  return parts.join(';');
}

const SGR_REGEX = /\x1b\[([0-9;]*)m/g;

export function ansiToHtml(input, options = {}) {
  const palette = options.palette || DEFAULT_PALETTE;
  let state = createState();
  let result = '';
  let lastIndex = 0;
  let match;

  SGR_REGEX.lastIndex = 0;
  while ((match = SGR_REGEX.exec(input)) !== null) {
    const text = input.slice(lastIndex, match.index);
    if (text) {
      const style = styleToString(state);
      result += style ? `<span style="${style}">${escapeHtml(text)}</span>` : escapeHtml(text);
    }
    applySgr(state, match[1], palette);
    lastIndex = SGR_REGEX.lastIndex;
  }

  const remaining = input.slice(lastIndex);
  if (remaining) {
    const style = styleToString(state);
    result += style ? `<span style="${style}">${escapeHtml(remaining)}</span>` : escapeHtml(remaining);
  }

  return result;
}

export { DEFAULT_PALETTE, DEFAULT_BG_PALETTE, escapeHtml };
export default ansiToHtml;