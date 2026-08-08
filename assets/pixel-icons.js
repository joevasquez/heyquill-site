// pixel-icons.js
// Pixel-art icon set in the Quill owl's visual language (same 1px grid, same
// palette roles as quill-owl-sprite.js). Each icon is a 12x12 char grid; the
// renderer emits one <rect> per lit pixel so icons stay crisp at any size and
// inherit the mode accent colour.
//
//   import { pixelIcon, ICONS } from './pixel-icons.js';
//   el.innerHTML = pixelIcon('mic', '#4ab1ff');
//
// Char roles (mirroring the owl sprite's palette keys):
//   .  transparent      k  outline #241d2c     A  accent (mode colour)
//   w  paper #f8f3e6    W  paper edge #d8d0bd  i  ink #5b4a72
//   g  monocle gold #ffd97a                    Z  quill rachis #7d6a4e
//   Q  vane light #fdfaf2                      q  vane shade #d4c7ab

export const GRID = 12;

const ROLES = {
  k: '#241d2c',   // outline
  H: '#544a6e',   // hat highlight
  f: '#c99a63',   // feathers (Warm buff)
  e: '#fffaf0',   // eye white
  y: '#f0a83c',   // beak
  o: '#c0741f',   // beak shadow
  w: '#f8f3e6',   // paper
  W: '#d8d0bd',   // paper edge
  i: '#5b4a72',   // ink
  g: '#ffd97a',   // monocle gold
  Z: '#7d6a4e',   // quill rachis
  Q: '#fdfaf2',   // vane light
  q: '#d4c7ab',   // vane shade
};

export const ICONS = {
  // The owl himself, reduced to a 12x12 face — for the nav mark and favicon,
  // where the 48x48 sprite has no room to be legible. Same palette, same hat.
  owl: [
    '...kkkkkk...',
    '...kHHHHk...',
    '...kAAAAk...',
    '.kkkkkkkkkk.',
    '..ffffffff..',
    '.feeffffeef.',
    '.fekffffkef.',
    '..fffyyfff..',
    '..fffoofff..',
    '..ffffffff..',
    '...ffffff...',
    '............',
  ],

  // Dictate — condenser mic on an arc stand
  mic: [
    '............',
    '....kkkk....',
    '...kAAAAk...',
    '...kAAAAk...',
    '...kAAAAk...',
    '...kAAAAk...',
    '...kAAAAk...',
    '..k.kkkk.k..',
    '..k......k..',
    '...kkAAkk...',
    '.....AA.....',
    '...kkkkkk...',
  ],

  // Auto — a big gold sparkle and a small accent one, the "it decides" mark
  sparkles: [
    '....g.......',
    '....g.......',
    '...ggg......',
    '.ggggggg....',
    '...ggg......',
    '....g.......',
    '....g.......',
    '.........A..',
    '........AAA.',
    '.......AAAAA',
    '........AAA.',
    '.........A..',
  ],

  // Edit — the owl's own quill, nib down, rewriting two lines
  quill: [
    '........QQQ.',
    '.......QQQQQ',
    '......QQQQQ.',
    '.....QQqqQ..',
    '....QQqq....',
    '...ZZq......',
    '..ZZ........',
    '.ZZ.........',
    'kk..........',
    '............',
    '..AAAAAAAA..',
    '..AAAA......',
  ],

  // Act — bolt
  bolt: [
    '............',
    '......AAA...',
    '.....AAA....',
    '....AAA.....',
    '...AAAAAA...',
    '......AAA...',
    '.....AAA....',
    '....AAA.....',
    '...AAA......',
    '..AAA.......',
    '............',
    '............',
  ],

  // MCP / Connections — a plug going into a socket
  plug: [
    '....A..A....',
    '....A..A....',
    '..AAAAAAAA..',
    '..AAAAAAAA..',
    '..AAAAAAAA..',
    '...AAAAAA...',
    '....AAAA....',
    '.....AA.....',
    '.....AA.....',
    '....kkkk....',
    '....kkkk....',
    '............',
  ],

  // Notes — ruled pad with one accent line
  notepad: [
    '..WWWWWWWW..',
    '..WwwwwwwW..',
    '..WwiiiiwW..',
    '..WwwwwwwW..',
    '..WwiiiiwW..',
    '..WwwwwwwW..',
    '..WwAAAAwW..',
    '..WwwwwwwW..',
    '..WwiiwwwW..',
    '..WwwwwwwW..',
    '..WWWWWWWW..',
    '............',
  ],

  // Routines — clock
  clock: [
    '....kkkk....',
    '..kkAAAAkk..',
    '.kAAAAAAAAk.',
    '.kAAAkAAAAk.',
    'kAAAAkAAAAAk',
    'kAAAAkAAAAAk',
    'kAAAAkkkAAAk',
    'kAAAAAAAAAAk',
    '.kAAAAAAAAk.',
    '.kAAAAAAAAk.',
    '..kkAAAAkk..',
    '....kkkk....',
  ],

  // Memory — bookmark
  bookmark: [
    '..AAAAAAAA..',
    '..AAAAAAAA..',
    '..AAAAAAAA..',
    '..AAAAAAAA..',
    '..AAAAAAAA..',
    '..AAAAAAAA..',
    '..AAAAAAAA..',
    '..AAAAAAAA..',
    '..AAA..AAA..',
    '..AA....AA..',
    '..A......A..',
    '............',
  ],

  // Privacy — padlock, shackle in outline so it reads at small sizes
  lock: [
    '....kkkk....',
    '...kk..kk...',
    '...k....k...',
    '...k....k...',
    '.AAAAAAAAAA.',
    '.AAAAAAAAAA.',
    '.AAAAkkAAAA.',
    '.AAAAkkAAAA.',
    '.AAAAkkAAAA.',
    '.AAAAAAAAAA.',
    '.AAAAAAAAAA.',
    '............',
  ],

  // Confirm — the check that stands between a command and anything happening
  check: [
    '............',
    '............',
    '.........AA.',
    '........AA..',
    '.......AA...',
    '..A...AA....',
    '..AA.AA.....',
    '...AAAA.....',
    '....AA......',
    '............',
    '............',
    '............',
  ],

  // --- Theme toggle. These are drawn with accent 'currentColor' so they
  // inherit the button's text colour in both themes.

  // Light — the rays need to sit one pixel off the disc and include the
  // diagonals, or at 18px it reads as a blob with specks beside it.
  sun: [
    '............',
    '.....AA.....',
    '.A...AA...A.',
    '....AAAA....',
    '...AAAAAA...',
    'AA.AAAAAA.AA',
    'AA.AAAAAA.AA',
    '...AAAAAA...',
    '....AAAA....',
    '.A...AA...A.',
    '.....AA.....',
    '............',
  ],

  // Dark
  moon: [
    '....AAAA....',
    '..AAAAAA....',
    '..AAAAA.....',
    '.AAAAA......',
    '.AAAA.......',
    '.AAAA.......',
    '.AAAA.......',
    '.AAAAA......',
    '..AAAAA.....',
    '..AAAAAA....',
    '....AAAA....',
    '............',
  ],

  // Auto — half-filled disc, the usual "follow the system" mark
  contrast: [
    '....AAAA....',
    '..AAAA..AA..',
    '.AAAAA...AA.',
    '.AAAAA....A.',
    'AAAAAA....AA',
    'AAAAAA....AA',
    'AAAAAA....AA',
    'AAAAAA....AA',
    '.AAAAA....A.',
    '.AAAAA...AA.',
    '..AAAA..AA..',
    '....AAAA....',
  ],

  // Sync — two devices, one thought
  devices: [
    'AAAAAAAA....',
    'A......A....',
    'A......A....',
    'A......A.AAA',
    'A......A.A.A',
    'AAAAAAAA.A.A',
    '..AAAA...A.A',
    '.AAAAAA..A.A',
    '.........AAA',
    '............',
    '...AAAAAA...',
    '....A..A....',
  ],
};

/**
 * Render an icon as an inline SVG string.
 * @param {string} name  key in ICONS
 * @param {string} accent  colour for the 'A' role (a mode colour)
 * @param {number} size  rendered px (the grid stays 12x12 regardless)
 */
export function pixelIcon(name, accent = '#8663e6', size = 24) {
  const rows = ICONS[name];
  if (!rows) return '';
  const pal = { ...ROLES, A: accent };
  let out = '';
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c === '.') continue;
      const col = pal[c];
      if (!col) continue;
      // Merge horizontal runs of the same colour into one rect — roughly a
      // third the node count, and it removes the hairline seams that show up
      // between adjacent rects when the SVG is scaled to a fractional size.
      let run = 1;
      while (x + run < row.length && row[x + run] === c) run++;
      out += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${col}"/>`;
      x += run - 1;
    }
  }
  return `<svg viewBox="0 0 ${GRID} ${GRID}" width="${size}" height="${size}" `
       + `shape-rendering="crispEdges" aria-hidden="true" focusable="false">${out}</svg>`;
}

/**
 * Hydrate every <span data-pixel="name" data-accent="#hex" data-size="24">.
 */
export function mountPixelIcons(root = document) {
  root.querySelectorAll('[data-pixel]').forEach((el) => {
    el.innerHTML = pixelIcon(
      el.dataset.pixel,
      el.dataset.accent || getComputedStyle(el).getPropertyValue('--icon-accent').trim() || '#8663e6',
      Number(el.dataset.size) || 24
    );
  });
}
