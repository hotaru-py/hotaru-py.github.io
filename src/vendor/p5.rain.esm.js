// Copied from github.com/hotaru-py/p5-rain at 3046446 (dist/p5.rain.esm.js, built
// from src/ with `npm run build`). Update by copying a fresh build over this file.
/*! p5.rain v0.1.0 | MIT | NASA IMERG precipitation for p5.js | data: NASA GPM IMERG via GIBS */

// src/util.js
var COLS = 240;
var ROWS = 120;
var N = COLS * ROWS;
var CELL_DEG = 1.5;
var MIN_RATE = 0.1;
var MAX_RATE = 50;
var clamp = (v, a, b) => v < a ? a : v > b ? b : v;
var lerp = (a, b, t) => a + (b - a) * t;
var mix = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t), lerp(p[2], q[2], t)];
var css = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
var logR = (r) => Math.log1p(r * 10);
var rateLevel = (r) => clamp(Math.log(r / MIN_RATE) / Math.log(MAX_RATE / MIN_RATE), 0, 1);
function ramp(stops, t) {
  t = clamp(t, 0, 1) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(t));
  return mix(stops[i], stops[i + 1], t - i);
}
var rowOfLat = (lat) => clamp(Math.round((90 - lat) / CELL_DEG), 0, ROWS);
var latOfRow = (row) => 90 - (row + 0.5) * CELL_DEG;
var lonOfCol = (col) => -180 + (col + 0.5) * CELL_DEG;

// src/colormap.js
var attr = (s, name) => {
  const m = s.match(new RegExp("\\b" + name + '="([^"]*)"'));
  return m ? m[1] : null;
};
function parseColormap(xml) {
  const table = /* @__PURE__ */ new Map();
  const entries = [];
  const mapRe = /<ColorMap\b([^>]*)>([\s\S]*?)<\/ColorMap>/g;
  let m;
  while (m = mapRe.exec(xml)) {
    const title = attr(m[1], "title") || "";
    if (/classif/i.test(title)) continue;
    const snow = /snow/i.test(title);
    const entryRe = /<ColorMapEntry\b([^>]*?)\/?>/g;
    let e;
    while (e = entryRe.exec(m[2])) {
      const a = e[1];
      if (attr(a, "transparent") === "true") continue;
      const rgb = attr(a, "rgb"), value = attr(a, "value");
      if (!rgb || !value) continue;
      const range = value.match(/[[(]([^,]+),([^)\]]+)/);
      if (!range) continue;
      let lo = parseFloat(range[1]), hi = parseFloat(range[2]);
      if (!isFinite(lo)) lo = hi;
      if (!isFinite(hi)) hi = lo * 1.06;
      const [r, g, b] = rgb.split(",").map(Number);
      const v = { rate: Math.sqrt(lo * hi), snow };
      table.set(r << 16 | g << 8 | b, v);
      entries.push({ r, g, b, v });
    }
  }
  if (!entries.length) throw new Error("p5.rain: the colour map has no rain entries");
  return { table, entries };
}
function lookup(cm, r, g, b) {
  const key = r << 16 | g << 8 | b;
  let v = cm.table.get(key);
  if (v !== void 0) return v;
  let best = Infinity;
  for (const e of cm.entries) {
    const d = (e.r - r) ** 2 + (e.g - g) ** 2 + (e.b - b) ** 2;
    if (d < best) {
      best = d;
      v = e.v;
    }
  }
  cm.table.set(key, v);
  return v;
}
function decodePixels(px, width, height, cm) {
  const rate = new Float32Array(N), snow = new Uint8Array(N);
  let any = false;
  for (let y = 0; y < height; y++) {
    const row = Math.floor(y * ROWS / height) * COLS;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (px[i + 3] < 128) continue;
      const v = lookup(cm, px[i], px[i + 1], px[i + 2]);
      if (!v) continue;
      any = true;
      const c = row + Math.floor(x * COLS / width);
      if (v.rate > rate[c]) {
        rate[c] = v.rate;
        snow[c] = v.snow ? 1 : 0;
      }
    }
  }
  return { rate, snow, any };
}

// src/gibs.js
var GIBS_WMS = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi";
var COLORMAP_URL = "https://gibs.earthdata.nasa.gov/colormaps/v1.3/GPM_Precipitation_Rate.xml";
var IMERG_LAYER = "IMERG_Precipitation_Rate_30min";
var SRC_W = COLS * 2;
var SRC_H = ROWS * 2;
var isoTime = (d) => d.toISOString().slice(0, 19) + "Z";
function imergUrl(time, width = SRC_W, height = SRC_H) {
  const p = {
    SERVICE: "WMS",
    REQUEST: "GetMap",
    VERSION: "1.3.0",
    CRS: "EPSG:4326",
    BBOX: "-90,-180,90,180",
    WIDTH: width,
    HEIGHT: height,
    FORMAT: "image/png",
    TRANSPARENT: "TRUE",
    LAYERS: IMERG_LAYER,
    TIME: isoTime(time)
  };
  return GIBS_WMS + "?" + Object.entries(p).map(([k, v]) => k + "=" + encodeURIComponent(v)).join("&");
}
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("p5.rain: could not load " + url));
    img.src = url;
  });
}
var scratch = null;
var sctx = null;
function imagePixels(img) {
  if (!scratch) {
    scratch = document.createElement("canvas");
    scratch.width = SRC_W;
    scratch.height = SRC_H;
    sctx = scratch.getContext("2d", { willReadFrequently: true });
  }
  sctx.clearRect(0, 0, SRC_W, SRC_H);
  sctx.imageSmoothingEnabled = false;
  sctx.drawImage(img, 0, 0, SRC_W, SRC_H);
  return sctx.getImageData(0, 0, SRC_W, SRC_H).data;
}
var colormapPromise = null;
function fetchColormap(url = COLORMAP_URL) {
  if (!colormapPromise) {
    colormapPromise = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`p5.rain: colour map request failed (${r.status})`);
      return r.text();
    }).then(parseColormap).catch((e) => {
      colormapPromise = null;
      throw e;
    });
  }
  return colormapPromise;
}
async function fetchFrame(time, cm) {
  const img = await loadImage(imergUrl(time));
  return decodePixels(imagePixels(img), SRC_W, SRC_H, cm);
}

// src/snapshot.js
var SNAPSHOT_FORMAT = "p5rain-snapshot";
var TOP = 530;
var encodeLevel = (rate) => clamp(Math.round(1 + 126 * Math.log(rate / MIN_RATE) / Math.log(TOP)), 1, 127);
var decodeLevel = (q) => MIN_RATE * Math.pow(TOP, ((q & 127) - 1) / 126);
function encodeFrame(rate, snow) {
  let n = 0;
  for (let c = 0; c < N; c++) if (rate[c] >= MIN_RATE) n++;
  const buf = new Uint8Array(4 + n * 3);
  const dv = new DataView(buf.buffer);
  dv.setUint32(0, n, true);
  let k = 0;
  for (let c = 0; c < N; c++) {
    if (rate[c] < MIN_RATE) continue;
    dv.setUint16(4 + k * 2, c, true);
    buf[4 + n * 2 + k] = encodeLevel(rate[c]) | (snow[c] ? 128 : 0);
    k++;
  }
  return buf;
}
function decodeFrame(bytes, o = 0) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (o + 4 > bytes.length) throw new Error("p5.rain: snapshot data is truncated");
  const rate = new Float32Array(N), snow = new Uint8Array(N);
  const n = dv.getUint32(o, true);
  const qo = o + 4 + n * 2;
  if (qo + n > bytes.length) throw new Error("p5.rain: snapshot data is truncated");
  for (let k = 0; k < n; k++) {
    const c = dv.getUint16(o + 4 + k * 2, true), q = bytes[qo + k];
    rate[c] = decodeLevel(q);
    snow[c] = q >> 7;
  }
  return { rate, snow, next: qo + n };
}
function encodeSnapshot(d, opts = {}) {
  const parts = [];
  let size = 0;
  for (let i = 0; i < d.frames.length; i++) {
    const buf = encodeFrame(d.frames[i], d.snow[i]);
    parts.push(buf);
    size += buf.length;
  }
  const bytes = new Uint8Array(size);
  let o = 0;
  for (const p of parts) {
    bytes.set(p, o);
    o += p.length;
  }
  const encoding = opts.encoding || "binary";
  const name = opts.name || "rain";
  const meta = {
    format: SNAPSHOT_FORMAT,
    version: 1,
    start: d.times[0].toISOString(),
    hours: d.frames.length,
    cols: COLS,
    rows: ROWS,
    encoding,
    data: encoding === "base64" ? `${name}.b64.txt` : `${name}.bin`,
    source: opts.source || "NASA GPM IMERG 30-min precipitation via GIBS",
    exported: (/* @__PURE__ */ new Date()).toISOString()
  };
  const out = { meta, bytes };
  if (encoding === "base64") out.text = toBase64(bytes);
  return out;
}
function decodeSnapshot(meta, bytes) {
  if (meta.format && meta.format !== SNAPSHOT_FORMAT) throw new Error("p5.rain: not a p5.rain snapshot");
  if (meta.cols && meta.cols !== COLS || meta.rows && meta.rows !== ROWS) throw new Error("p5.rain: snapshot grid size not supported");
  const start = new Date(meta.start).getTime();
  const frames = [], snow = [], times = [];
  let o = 0;
  for (let i = 0; i < meta.hours; i++) {
    const f = decodeFrame(bytes, o);
    frames.push(f.rate);
    snow.push(f.snow);
    times.push(new Date(start + i * 36e5));
    o = f.next;
  }
  return { frames, snow, times };
}
function toBase64(bytes) {
  let s = "";
  for (let k = 0; k < bytes.length; k += 32768) s += String.fromCharCode.apply(null, bytes.subarray(k, k + 32768));
  return btoa(s);
}
function fromBase64(text) {
  const raw = atob(text.trim());
  const bytes = new Uint8Array(raw.length);
  for (let k = 0; k < raw.length; k++) bytes[k] = raw.charCodeAt(k);
  return bytes;
}
async function fetchSnapshot(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`p5.rain: snapshot ${url} not found (${res.status})`);
  const meta = await res.json();
  const dataUrl = new URL(meta.data, new URL(url, location.href)).href;
  const r2 = await fetch(dataUrl);
  if (!r2.ok) throw new Error(`p5.rain: snapshot data ${meta.data} not found (${r2.status})`);
  const bytes = meta.encoding === "base64" ? fromBase64(await r2.text()) : new Uint8Array(await r2.arrayBuffer());
  return { meta, ...decodeSnapshot(meta, bytes) };
}

// src/motion.js
var TILE = 6;
var SEARCH = 4;
var BASE = 3;
var TX = COLS / TILE;
var TY = ROWS / TILE;
function computeMotion(A, B, span) {
  const la = new Float32Array(N), lb = new Float32Array(N);
  for (let c = 0; c < N; c++) {
    la[c] = logR(A[c]);
    lb[c] = logR(B[c]);
  }
  const W = 2 * SEARCH + 1;
  const tvx = new Float32Array(TX * TY), tvy = new Float32Array(TX * TY), tw = new Float32Array(TX * TY);
  const cost = new Float32Array(W * W);
  for (let ty = 0; ty < TY; ty++) {
    for (let tx = 0; tx < TX; tx++) {
      let mass = 0;
      for (let y = ty * TILE; y < ty * TILE + TILE; y++) for (let x = tx * TILE; x < tx * TILE + TILE; x++) mass += la[y * COLS + x];
      if (mass < 3) continue;
      let best = Infinity, bx = 0, by = 0;
      for (let dy = -SEARCH; dy <= SEARCH; dy++) {
        for (let dx = -SEARCH; dx <= SEARCH; dx++) {
          let s = 0;
          for (let y = ty * TILE; y < ty * TILE + TILE; y++) {
            const yy = y + dy;
            if (yy < 0 || yy >= ROWS) {
              s += 2 * TILE;
              continue;
            }
            for (let x = tx * TILE; x < tx * TILE + TILE; x++) {
              s += Math.abs(la[y * COLS + x] - lb[yy * COLS + (x + dx + COLS) % COLS]);
            }
          }
          cost[(dy + SEARCH) * W + dx + SEARCH] = s;
          if (s < best - 1e-9 || Math.abs(s - best) <= 1e-9 && dx * dx + dy * dy < bx * bx + by * by) {
            best = s;
            bx = dx;
            by = dy;
          }
        }
      }
      const at = (dx, dy) => cost[(dy + SEARCH) * W + dx + SEARCH];
      let fx = bx, fy = by;
      if (Math.abs(bx) < SEARCH) {
        const l = at(bx - 1, by), r = at(bx + 1, by), d = l - 2 * best + r;
        if (d > 1e-6) fx += clamp((l - r) / (2 * d), -0.5, 0.5);
      }
      if (Math.abs(by) < SEARCH) {
        const u = at(bx, by - 1), dn = at(bx, by + 1), d = u - 2 * best + dn;
        if (d > 1e-6) fy += clamp((u - dn) / (2 * d), -0.5, 0.5);
      }
      const t = ty * TX + tx;
      tvx[t] = fx / span;
      tvy[t] = fy / span;
      tw[t] = mass;
    }
  }
  const svx = new Float32Array(TX * TY), svy = new Float32Array(TX * TY);
  for (let ty = 0; ty < TY; ty++) {
    for (let tx = 0; tx < TX; tx++) {
      let sx = 0, sy = 0, sw = 0;
      for (let oy = -1; oy <= 1; oy++) {
        const yy = ty + oy;
        if (yy < 0 || yy >= TY) continue;
        for (let ox = -1; ox <= 1; ox++) {
          const t = yy * TX + (tx + ox + TX) % TX, w = tw[t] * (ox || oy ? 0.5 : 1);
          sx += tvx[t] * w;
          sy += tvy[t] * w;
          sw += w;
        }
      }
      if (sw > 0) {
        svx[ty * TX + tx] = sx / sw;
        svy[ty * TX + tx] = sy / sw;
      }
    }
  }
  const vx = new Float32Array(N), vy = new Float32Array(N);
  for (let y = 0; y < ROWS; y++) {
    const gy = clamp((y + 0.5) / TILE - 0.5, 0, TY - 1), y0 = Math.floor(gy), y1 = Math.min(TY - 1, y0 + 1), fy = gy - y0;
    for (let x = 0; x < COLS; x++) {
      const gx = (x + 0.5) / TILE - 0.5, x0f = Math.floor(gx), fx = gx - x0f;
      const x0 = (x0f + TX) % TX, x1 = (x0 + 1) % TX;
      const c = y * COLS + x;
      vx[c] = lerp(lerp(svx[y0 * TX + x0], svx[y0 * TX + x1], fx), lerp(svx[y1 * TX + x0], svx[y1 * TX + x1], fx), fy);
      vy[c] = lerp(lerp(svy[y0 * TX + x0], svy[y0 * TX + x1], fx), lerp(svy[y1 * TX + x0], svy[y1 * TX + x1], fx), fy);
    }
  }
  return { vx, vy };
}

// src/data.js
var cache = /* @__PURE__ */ new Map();
var HOUR = 36e5;
var WEEKLY_URL = "https://hotaru-py.github.io/p5-rain/data/week.json";
function resolveSource(source) {
  if (source === "weekly") return { snapshot: WEEKLY_URL, fallback: "live" };
  return source;
}
var RainData = class _RainData {
  /**
   * Get (or start loading) shared data.
   * @param {'live'|'weekly'|{snapshot: string, fallback?: 'live'|object}} [source='live']
   * @param {{hours?: number, poll?: number|false, concurrency?: number}} [opts]
   *        hours: window length (2..336, default 168 = 7 days)
   *        poll: minutes between checks for a new hour (live only; default 10; false = never)
   */
  static get(source = "live", opts = {}) {
    source = resolveSource(source);
    const key = JSON.stringify([source, opts.hours || 168]);
    let d = cache.get(key);
    if (!d) {
      d = new _RainData(source, opts);
      cache.set(key, d);
      d._start();
    }
    return d;
  }
  constructor(source, opts = {}) {
    this.source = source;
    this.hours = Math.max(2, Math.min(336, Math.round(opts.hours || 168)));
    this.poll = opts.poll === void 0 ? 10 : opts.poll;
    this.concurrency = opts.concurrency || 8;
    this.frames = [];
    this.snow = [];
    this.times = [];
    this.total = new Float32Array(N);
    this.totalMax = 1;
    this.loaded = 0;
    this.ready = false;
    this.error = null;
    this.version = 0;
    this.snapshot = null;
    this.mode = null;
    this.fellBack = null;
    this._listeners = {};
    this._motion = /* @__PURE__ */ new Map();
    this._cm = null;
    this._timer = null;
  }
  /** Subscribe to 'progress', 'ready', 'update' (new hour arrived) or 'error'. Returns an unsubscribe function. */
  on(type, fn) {
    var _a;
    ((_a = this._listeners)[type] || (_a[type] = /* @__PURE__ */ new Set())).add(fn);
    if (type === "ready" && this.ready) fn(this);
    if (type === "error" && this.error) fn(this.error);
    return () => this._listeners[type].delete(fn);
  }
  _emit(type, detail) {
    (this._listeners[type] || []).forEach((fn) => {
      try {
        fn(detail);
      } catch (e) {
        console.error(e);
      }
    });
  }
  /** Fraction loaded, 0..1. */
  get progress() {
    return this.ready ? 1 : this.loaded / this.hours;
  }
  /** Time of the newest frame. */
  get latest() {
    return this.times[this.times.length - 1] || null;
  }
  /** Time of the oldest frame. */
  get earliest() {
    return this.times[0] || null;
  }
  async _start() {
    try {
      await this._load(this.source);
      this._finish();
      this.ready = true;
      this._emit("progress", this);
      this._emit("ready", this);
      if (this.poll && this.mode === "live") {
        this._timer = setInterval(() => this._pollNewHour(), this.poll * 6e4);
      }
    } catch (e) {
      this.error = e;
      console.error(e);
      this._emit("error", e);
    }
  }
  async _load(src) {
    if (src === "live") {
      this.mode = "live";
      return this._loadLive();
    }
    if (src && typeof src === "object" && src.snapshot) {
      try {
        this.mode = "snapshot";
        return await this._loadSnapshot(src.snapshot);
      } catch (e) {
        if (!src.fallback) throw e;
        console.warn(`${e.message}; using ${typeof src.fallback === "string" ? src.fallback : "the fallback"} instead`);
        this.fellBack = e.message;
        this.frames = [];
        this.snow = [];
        this.times = [];
        this.loaded = 0;
        return this._load(src.fallback);
      }
    }
    throw new Error('p5.rain: source must be "live", "weekly" or { snapshot: "file.json" }');
  }
  async _loadSnapshot(url) {
    const s = await fetchSnapshot(url);
    const keep = Math.min(this.hours, s.frames.length);
    const from = s.frames.length - keep;
    this.frames = s.frames.slice(from);
    this.snow = s.snow.slice(from);
    this.times = s.times.slice(from);
    this.hours = keep;
    this.snapshot = s.meta;
    this.loaded = keep;
  }
  async _loadLive() {
    this._cm = await fetchColormap();
    const t = /* @__PURE__ */ new Date();
    t.setUTCMinutes(0, 0, 0);
    t.setUTCHours(t.getUTCHours() - 3);
    let latest = null;
    for (let k = 0; k < 18 && !latest; k++) {
      const f = await fetchFrame(t, this._cm);
      if (f.any) latest = { t: new Date(t), f };
      else t.setUTCHours(t.getUTCHours() - 1);
    }
    if (!latest) throw new Error("p5.rain: no recent IMERG frame found on NASA GIBS");
    const H = this.hours;
    this.times = Array.from({ length: H }, (_, i) => new Date(latest.t.getTime() - (H - 1 - i) * HOUR));
    this.frames = new Array(H).fill(null);
    this.snow = new Array(H).fill(null);
    this.frames[H - 1] = latest.f.rate;
    this.snow[H - 1] = latest.f.snow;
    this.loaded = 1;
    this._emit("progress", this);
    const queue = [];
    for (let i = H - 2; i >= 0; i--) queue.push(i);
    const worker = async () => {
      while (queue.length) {
        const i = queue.shift();
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const f = await fetchFrame(this.times[i], this._cm);
            this.frames[i] = f.rate;
            this.snow[i] = f.snow;
            break;
          } catch (e) {
          }
        }
        this.loaded++;
        if (this.loaded % 8 === 0) this._emit("progress", this);
      }
    };
    await Promise.all(Array.from({ length: this.concurrency }, worker));
    for (let i = 0; i < H; i++) {
      if (this.frames[i]) continue;
      for (let d = 1; d < H; d++) {
        const j = this.frames[i - d] ? i - d : this.frames[i + d] ? i + d : -1;
        if (j >= 0) {
          this.frames[i] = this.frames[j];
          this.snow[i] = this.snow[j];
          break;
        }
      }
    }
  }
  async _pollNewHour() {
    if (this._polling || !this.ready) return;
    this._polling = true;
    try {
      const next = new Date(this.latest.getTime() + HOUR);
      const f = await fetchFrame(next, this._cm);
      if (!f.any) return;
      this.frames.push(f.rate);
      this.snow.push(f.snow);
      this.times.push(next);
      let shifted = 0;
      while (this.frames.length > this.hours) {
        this.frames.shift();
        this.snow.shift();
        this.times.shift();
        shifted++;
      }
      this._finish();
      this._emit("update", { data: this, added: 1, shifted });
    } catch (e) {
    } finally {
      this._polling = false;
    }
  }
  _finish() {
    const nz = [];
    for (let c = 0; c < N; c++) {
      let s = 0;
      for (let i = 0; i < this.frames.length; i++) s += this.frames[i][c];
      this.total[c] = s;
      if (s > 0) nz.push(s);
    }
    nz.sort((a, b) => a - b);
    this.totalMax = nz.length ? nz[Math.floor(nz.length * 0.98)] : 1;
    this.version++;
    this._motion.clear();
  }
  /** Motion field (cells/hour) for hour i, cached. */
  motion(i) {
    let m = this._motion.get(i);
    if (m) return m;
    const j = Math.min(this.frames.length - 1, i + BASE);
    m = computeMotion(this.frames[i], this.frames[j], Math.max(1, j - i));
    this._motion.set(i, m);
    if (this._motion.size > 16) this._motion.delete(this._motion.keys().next().value);
    return m;
  }
  /** Rain rate (mm/h) at hour index i (fractional = linear blend) for a cell. */
  rateAt(i, c) {
    const a = Math.max(0, Math.min(this.frames.length - 1, Math.floor(i)));
    const b = Math.min(this.frames.length - 1, a + 1), fr = i - a;
    const r = this.frames[a][c] + (this.frames[b][c] - this.frames[a][c]) * fr;
    return r < MIN_RATE ? 0 : r;
  }
  /** Export the current window as a snapshot ({ meta, bytes, text? }). */
  toSnapshot(opts) {
    if (!this.ready) throw new Error("p5.rain: data is not loaded yet");
    return encodeSnapshot(this, opts);
  }
  /** Stop polling for new hours. */
  stop() {
    clearInterval(this._timer);
    this._timer = null;
  }
};

// src/palettes.js
var BACKGROUNDS = { dark: [7, 9, 14], light: [244, 240, 231] };
var PALETTES = {
  ocean: {
    dark: {
      stain: [24, 58, 104],
      rain: [[30, 80, 140], [42, 127, 212], [53, 182, 232], [127, 227, 240], [214, 251, 255], [255, 255, 255], [255, 95, 162]],
      snow: [[110, 92, 200], [185, 168, 255], [242, 236, 255]]
    },
    light: {
      stain: [176, 196, 220],
      rain: [[158, 194, 230], [92, 148, 210], [47, 109, 184], [29, 74, 143], [19, 40, 94], [10, 20, 51], [226, 71, 95]],
      snow: [[176, 166, 232], [130, 112, 210], [72, 54, 156]]
    }
  },
  moss: {
    dark: {
      stain: [36, 62, 30],
      rain: [[40, 78, 34], [62, 120, 42], [112, 168, 46], [176, 212, 58], [228, 238, 112], [252, 252, 214], [255, 150, 60]],
      snow: [[56, 110, 112], [120, 190, 182], [214, 244, 238]]
    },
    light: {
      stain: [208, 214, 172],
      rain: [[200, 214, 150], [156, 188, 92], [108, 152, 50], [72, 114, 32], [46, 80, 22], [28, 50, 14], [212, 98, 28]],
      snow: [[160, 206, 200], [88, 156, 150], [32, 96, 96]]
    }
  },
  ember: {
    dark: {
      stain: [74, 24, 28],
      rain: [[96, 22, 30], [148, 30, 34], [204, 50, 38], [240, 98, 52], [255, 168, 104], [255, 232, 200], [255, 255, 255]],
      snow: [[86, 92, 138], [154, 160, 212], [228, 232, 255]]
    },
    light: {
      stain: [230, 200, 190],
      rain: [[238, 186, 174], [222, 128, 112], [198, 70, 58], [160, 36, 36], [114, 18, 26], [66, 8, 16], [24, 4, 10]],
      snow: [[176, 182, 216], [118, 126, 184], [58, 66, 128]]
    }
  }
};
var isRGB = (c) => Array.isArray(c) && c.length >= 3 && c.every((v) => typeof v === "number");
function checkSide(side, where) {
  if (!side || !isRGB(side.stain)) throw new Error(`p5.rain: palette ${where}.stain must be [r, g, b]`);
  for (const k of ["rain", "snow"]) {
    if (!Array.isArray(side[k]) || side[k].length < 2 || !side[k].every(isRGB)) {
      throw new Error(`p5.rain: palette ${where}.${k} must be a list of at least two [r, g, b] stops`);
    }
  }
}
function addPalette(name, def) {
  const dark = def.dark || def.light || def;
  const light = def.light || def.dark || def;
  checkSide(dark, name + ".dark");
  checkSide(light, name + ".light");
  PALETTES[name] = { dark, light };
  lutCache.clear();
  return PALETTES[name];
}
var lutCache = /* @__PURE__ */ new Map();
function paletteLUT(mode, from, to, pm, stainAmt, rainAmt) {
  const mq = Math.round(mode * 60), pq = Math.round(pm * 30);
  const key = `${mq}|${pq}|${from}|${to}|${stainAmt}|${rainAmt}`;
  let T = lutCache.get(key);
  if (T) return T;
  if (lutCache.size > 600) lutCache.clear();
  const t = mq / 60, p = pq / 30;
  const A = PALETTES[from] || PALETTES.ocean, B = PALETTES[to] || PALETTES.ocean;
  const bg = mix(BACKGROUNDS.dark, BACKGROUNDS.light, t);
  const side = (P, key2, u) => mix(
    key2 === "stain" ? P.dark.stain : ramp(P.dark[key2], u),
    key2 === "stain" ? P.light.stain : ramp(P.light[key2], u),
    t
  );
  const pick = (key2, u) => mix(side(A, key2, u), side(B, key2, u), p);
  T = { bg: css(bg), bgRGB: bg, rain: [], snow: [], rainRaw: [], snowRaw: [], stain: [], stainRaw: "" };
  for (let i = 0; i < 64; i++) {
    const u = i / 63, r = pick("rain", u), s = pick("snow", u);
    T.rainRaw.push(css(r));
    T.snowRaw.push(css(s));
    T.rain.push(css(mix(bg, r, rainAmt)));
    T.snow.push(css(mix(bg, s, rainAmt)));
  }
  const stain = pick("stain", 0);
  T.stainRaw = css(stain);
  for (let i = 0; i < 32; i++) T.stain.push(css(mix(bg, stain, i / 31 * stainAmt)));
  lutCache.set(key, T);
  return T;
}

// src/field.js
var STYLES = ["breathe", "flow"];
var GRIDS = ["snap", "free"];
var THEMES = ["dark", "light", "auto"];
var FITS = ["cover", "contain"];
var DEFAULTS = Object.freeze({
  source: "live",
  // 'live' (NASA GIBS) | 'weekly' (the repo's published week) | { snapshot: url, fallback? }
  hours: 168,
  // window length when loading (7 days)
  poll: 10,
  // minutes between checks for a new hour (live); false = never
  palette: "ocean",
  // 'ocean' | 'moss' | 'ember' | any name registered with addPalette()
  theme: "dark",
  // 'dark' | 'light' | 'auto' (follows prefers-color-scheme)
  style: "breathe",
  // 'breathe' | 'flow'
  grid: "free",
  // 'snap' | 'free'
  speed: 2,
  // data-hours per second
  band: [90, -90],
  // [north, south] latitudes to show
  fit: "cover",
  // 'cover' crops to fill the rect, 'contain' shows the whole band
  cellSize: null,
  // fixed cell size in px (overrides fit)
  stain: 0.55,
  // strength of the window-total stain, 0..1
  intensity: 1,
  // strength of the rain colours, 0..1
  lens: true,
  // hover/touch bulge; true | false | { radius, strength }
  background: true,
  // paint the theme background; false = transparent
  reducedMotion: "respect",
  // 'respect' (speed 0 when the viewer asks) | 'ignore'
  start: 0
  // hour index to start at (0 = oldest); 'latest' = newest
});
var prefersLight = () => typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: light)").matches;
var prefersReduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
var trackers = /* @__PURE__ */ new WeakMap();
function trackPointer(p) {
  const canvas = p.canvas;
  let t = trackers.get(canvas);
  if (t) return t;
  t = { x: NaN, y: NaN, inside: false };
  const at = (e) => {
    const r = canvas.getBoundingClientRect();
    t.x = (e.clientX - r.left) * (p.width / r.width);
    t.y = (e.clientY - r.top) * (p.height / r.height);
    t.inside = true;
  };
  const leave = () => {
    t.inside = false;
  };
  canvas.addEventListener("pointermove", at, { passive: true });
  canvas.addEventListener("pointerdown", at, { passive: true });
  canvas.addEventListener("pointerleave", leave);
  canvas.addEventListener("pointercancel", leave);
  canvas.addEventListener("pointerup", (e) => {
    if (e.pointerType !== "mouse") leave();
  });
  trackers.set(canvas, t);
  return t;
}
var RainField = class {
  /**
   * @param {object} p        p5 instance (needs a 2D canvas)
   * @param {object} [options] see DEFAULTS; `data` may pass a RainData to share
   */
  constructor(p, options = {}) {
    if (!p || !p.canvas || !p.drawingContext) throw new Error("p5.rain: call createRain() after createCanvas()");
    if (typeof p.drawingContext.fillRect !== "function") {
      throw new Error("p5.rain: draws into a 2D canvas. Use createCanvas(w, h) without WEBGL, or draw into a createGraphics(w, h) buffer");
    }
    this.p = p;
    this.o = { ...DEFAULTS };
    this._apply(options);
    this.data = options.data instanceof RainData ? options.data : RainData.get(this.o.source, { hours: this.o.hours, poll: this.o.poll });
    const mode = this._themeTarget();
    this.st = { f: 0, i: 0, fr: 0, started: false, paused: false, mode, palFrom: this.o.palette, palTo: this.o.palette, pm: 1 };
    this.rate = new Float32Array(N);
    this.snowNow = new Uint8Array(N);
    this.dl = new Float32Array(N);
    this.lm = new Float32Array(N);
    this.flowX = new Float32Array(N);
    this.flowY = new Float32Array(N);
    this.dispX = new Float32Array(N);
    this.dispY = new Float32Array(N);
    this.boost = new Float32Array(N);
    this._cachedI = -1;
    this._cachedV = -1;
    this._g = null;
    this._rect = null;
    this._manual = null;
    this._tracker = typeof document !== "undefined" ? trackPointer(p) : null;
    this.MAXP = 2e4;
    this.px = new Float32Array(this.MAXP);
    this.py = new Float32Array(this.MAXP);
    this.pa = new Float32Array(this.MAXP);
    this.plv = new Float32Array(this.MAXP);
    this.psn = new Uint8Array(this.MAXP);
    this.occ = new Uint32Array(N);
    this.pn = 0;
    this.stamp = 0;
    this._off = this.data.on("update", (e) => {
      if (e.shifted) this.st.f = Math.max(0, this.st.f - e.shifted);
      this._cachedI = -1;
    });
  }
  // ---------------------------------------------------------------------------
  // options
  // ---------------------------------------------------------------------------
  // Validate on a copy and commit only if every option is valid, so a rejected
  // set() leaves the field exactly as it was.
  _apply(opts) {
    const o = { ...this.o };
    for (const [k, v] of Object.entries(opts || {})) {
      if (k === "data") continue;
      if (!(k in DEFAULTS)) throw new Error(`p5.rain: unknown option "${k}"`);
      o[k] = v;
    }
    const oneOf = (k, list) => {
      if (!list.includes(o[k])) throw new Error(`p5.rain: ${k} must be one of ${list.map((s) => `'${s}'`).join(", ")}`);
    };
    oneOf("style", STYLES);
    oneOf("grid", GRIDS);
    oneOf("theme", THEMES);
    oneOf("fit", FITS);
    if (!PALETTES[o.palette]) throw new Error(`p5.rain: unknown palette "${o.palette}". Built in: ${Object.keys(PALETTES).join(", ")}`);
    if (!Array.isArray(o.band) || o.band.length !== 2 || !(o.band[0] > o.band[1])) throw new Error("p5.rain: band must be [north, south] latitudes, north first");
    o.speed = Number(o.speed) || 0;
    o.stain = clamp(Number(o.stain) || 0, 0, 1);
    o.intensity = clamp(o.intensity == null ? 1 : Number(o.intensity), 0, 1);
    this.o = o;
    if (this._g) this._layout(this._g.w, this._g.h);
  }
  /** Change options after creation (palette and theme crossfade). Returns this. */
  set(options) {
    if (options && ("source" in options || "hours" in options || "poll" in options)) {
      throw new Error("p5.rain: source, hours and poll are fixed at creation; create a new field instead");
    }
    this._apply(options);
    return this;
  }
  /** Current options (a copy). */
  get options() {
    return { ...this.o };
  }
  get ready() {
    return this.data.ready;
  }
  get progress() {
    return this.data.progress;
  }
  get error() {
    return this.data.error;
  }
  get paused() {
    return this.st.paused;
  }
  pause() {
    this.st.paused = true;
    return this;
  }
  play() {
    this.st.paused = false;
    return this;
  }
  /** Jump to a Date, or to an hour index within the window. */
  seek(t) {
    if (!this.data.ready) return this;
    const span = this.data.frames.length - 1.001;
    const f = t instanceof Date ? (t.getTime() - this.data.earliest.getTime()) / 36e5 : Number(t);
    this.st.f = clamp(f || 0, 0, span);
    this.st.started = true;
    return this;
  }
  /** Time currently shown (Date), or null before data arrives. */
  time() {
    return this.data.ready ? new Date(this.data.earliest.getTime() + this.st.f * 36e5) : null;
  }
  /** Drive the lens from code: pointer(x, y) in canvas pixels; pointer(null) returns to the mouse. */
  pointer(x, y) {
    this._manual = x == null ? null : { x, y };
    return this;
  }
  /** Stop listening for data updates. */
  remove() {
    if (this._off) this._off();
    this._off = null;
    this._stainCache = null;
  }
  // ---------------------------------------------------------------------------
  // simulation
  // ---------------------------------------------------------------------------
  _themeTarget() {
    if (this.o.theme === "auto") return prefersLight() ? 1 : 0;
    return this.o.theme === "light" ? 1 : 0;
  }
  _layout(w, h) {
    const r0 = rowOfLat(this.o.band[0]), r1 = Math.max(r0 + 1, rowOfLat(this.o.band[1]));
    const rows = Math.min(ROWS - r0, r1 - r0);
    let cell;
    if (this.o.cellSize) cell = Math.max(1, Math.round(this.o.cellSize));
    else if (this.o.fit === "contain") cell = Math.max(1, Math.floor(Math.min(w / COLS, h / rows)));
    else cell = Math.max(2, Math.ceil(Math.max(w / COLS, h / rows)));
    this._g = { w, h, cell, ox: Math.floor((w - COLS * cell) / 2), oy: Math.floor((h - rows * cell) / 2), r0, rows };
  }
  /**
   * Advance time. Call once per frame before draw().
   * @param {number} [dt] seconds; defaults to p5's deltaTime
   */
  update(dt) {
    if (dt == null) dt = (this.p.deltaTime || 16.7) / 1e3;
    dt = clamp(dt, 0, 0.1);
    const st = this.st, o = this.o, d = this.data;
    const target = this._themeTarget();
    st.mode += (target - st.mode) * Math.min(1, dt * 4);
    if (Math.abs(target - st.mode) < 4e-3) st.mode = target;
    if (o.palette !== st.palTo) {
      st.palFrom = st.pm < 0.5 ? st.palFrom : st.palTo;
      st.palTo = o.palette;
      st.pm = 0;
    }
    st.pm = Math.min(1, st.pm + dt * 3);
    if (!d.ready) return this;
    if (!this._g) this._layout(this.p.width, this.p.height);
    const span = d.frames.length - 1.001;
    if (!st.started) {
      st.started = true;
      st.f = o.start === "latest" ? span : clamp(Number(o.start) || 0, 0, span);
    }
    const still = st.paused || o.reducedMotion === "respect" && prefersReduced();
    const dh = still ? 0 : o.speed * dt;
    st.f = ((st.f + dh) % span + span) % span;
    this._updateField(dt);
    this._applyLens();
    if (o.style === "flow") this._stepParticles(dh);
    else this.pn = 0;
    return this;
  }
  _updateField(dt) {
    const d = this.data, st = this.st, g = this._g;
    const i = Math.min(d.frames.length - 2, Math.floor(st.f)), fr = st.f - i;
    st.i = i;
    st.fr = fr;
    const A = d.frames[i], B = d.frames[i + 1];
    if (i !== this._cachedI || d.version !== this._cachedV) {
      this._cachedI = i;
      this._cachedV = d.version;
      for (let c = 0; c < N; c++) {
        const la = logR(A[c]), lb = logR(B[c]);
        this.dl[c] = lb - la;
        this.lm[c] = (la + lb) * 0.5;
      }
    }
    const SA = d.snow[i], SB = d.snow[i + 1], dl = this.dl, lm = this.lm;
    const k = Math.min(1, dt * 1.5), dir = this.o.speed < 0 ? -1 : 1;
    const y0 = Math.max(0, g.r0 - 1), y1 = Math.min(ROWS, g.r0 + g.rows + 1);
    for (let y = y0; y < y1; y++) {
      const row = y * COLS;
      for (let x = 0; x < COLS; x++) {
        const c = row + x;
        this.rate[c] = A[c] + (B[c] - A[c]) * fr;
        this.snowNow[c] = fr < 0.5 ? SA[c] : SB[c];
        const gx = (lm[row + (x + 1) % COLS] - lm[row + (x + COLS - 1) % COLS]) * 0.5;
        const gy = (lm[y < ROWS - 1 ? c + COLS : c] - lm[y > 0 ? c - COLS : c]) * 0.5;
        const g2 = gx * gx + gy * gy;
        let vx = 0, vy = 0;
        if (g2 > 0.01 && dl[c] !== 0) {
          const s = -dl[c] * 0.6 * dir / (g2 + 0.3);
          vx = s * gx;
          vy = s * gy;
          const m = Math.hypot(vx, vy);
          if (m > 0.8) {
            vx *= 0.8 / m;
            vy *= 0.8 / m;
          }
        }
        this.flowX[c] += (vx - this.flowX[c]) * k;
        this.flowY[c] += (vy - this.flowY[c]) * k;
      }
    }
  }
  _applyLens() {
    const { dispX, dispY, boost } = this;
    dispX.fill(0);
    dispY.fill(0);
    boost.fill(0);
    this._lensBox = null;
    const lens = this.o.lens;
    if (!lens) return;
    const R = lens && lens.radius || 120, S = lens && lens.strength != null ? lens.strength : 7;
    const ptr = this._manual || (this._tracker && this._tracker.inside ? this._tracker : null);
    if (!ptr) return;
    const rect = this._rect || { x: 0, y: 0 };
    const g = this._g, cell = g.cell;
    const px = ptr.x - rect.x, py = ptr.y - rect.y;
    if (px < -R || py < -R || px > g.w + R || py > g.h + R) return;
    const push = this.o.grid !== "snap";
    const c0 = Math.max(0, Math.floor((px - g.ox - R) / cell)), c1 = Math.min(COLS - 1, Math.floor((px - g.ox + R) / cell));
    const r0 = Math.max(0, Math.floor((py - g.oy - R) / cell)), r1 = Math.min(g.rows - 1, Math.floor((py - g.oy + R) / cell));
    if (push && c0 <= c1 && r0 <= r1) this._lensBox = { c0, c1, r0, r1 };
    for (let yy = r0; yy <= r1; yy++) {
      for (let x = c0; x <= c1; x++) {
        const dx = g.ox + x * cell + cell / 2 - px, dy = g.oy + yy * cell + cell / 2 - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= R) continue;
        const q = (1 - dist / R) ** 2;
        const c = (g.r0 + yy) * COLS + x;
        if (push && dist > 0.01) {
          dispX[c] = dx / dist * q * S;
          dispY[c] = dy / dist * q * S;
        }
        boost[c] = q * 0.5;
      }
    }
  }
  _stepParticles(dh) {
    const FADE_IN = 1.2, FADE_OUT = 0.9, EASE = 1.6;
    const d = this.data, st = this.st, g = this._g;
    const { px, py, pa, plv, psn, occ, rate, snowNow } = this;
    const fresh = this.pn === 0;
    const m0 = d.motion(st.i), m1 = d.motion(Math.min(d.frames.length - 2, st.i + 1));
    const yLo = g.r0 - 1, yHi = g.r0 + g.rows + 1, fr = st.fr;
    const stamp = ++this.stamp;
    let w = 0;
    for (let k = 0; k < this.pn; k++) {
      let x = px[k], y = py[k];
      const ci = Math.round(y) * COLS + (Math.round(x) % COLS + COLS) % COLS;
      if (ci >= 0 && ci < N) {
        x += lerp(m0.vx[ci], m1.vx[ci], fr) * dh;
        y += lerp(m0.vy[ci], m1.vy[ci], fr) * dh;
      }
      x = (x % COLS + COLS) % COLS;
      if (y < yLo || y > yHi) continue;
      const cr = Math.round(y), cc = Math.round(x) % COLS;
      if (cr < 0 || cr >= ROWS) continue;
      const c = cr * COLS + cc;
      const claimed = occ[c] === stamp;
      occ[c] = stamp;
      const r = rate[c];
      const alive = r >= MIN_RATE && !claimed;
      let a = pa[k] + (alive ? FADE_IN : -FADE_OUT) * Math.abs(dh);
      if (a <= 0) continue;
      if (a > 1) a = 1;
      let lv = plv[k];
      if (alive) lv += (rateLevel(r) - lv) * Math.min(1, Math.abs(dh) * EASE);
      px[w] = x;
      py[w] = y;
      pa[w] = a;
      plv[w] = lv;
      psn[w] = alive ? snowNow[c] : psn[k];
      w++;
    }
    this.pn = w;
    for (let y = Math.max(0, g.r0); y < Math.min(ROWS, g.r0 + g.rows); y++) {
      for (let x = 0; x < COLS; x++) {
        const c = y * COLS + x;
        if (occ[c] === stamp || rate[c] < MIN_RATE || this.pn >= this.MAXP) continue;
        occ[c] = stamp;
        const n = this.pn++;
        px[n] = x;
        py[n] = y;
        pa[n] = fresh ? 1 : 0;
        plv[n] = rateLevel(rate[c]);
        psn[n] = snowNow[c];
      }
    }
  }
  // ---------------------------------------------------------------------------
  // drawing
  // ---------------------------------------------------------------------------
  /**
   * Draw into a rectangle of the canvas (default: the whole canvas).
   */
  draw(x = 0, y = 0, w = this.p.width, h = this.p.height) {
    if (!this._g || this._g.w !== w || this._g.h !== h) this._layout(w, h);
    this._rect = { x, y, w, h };
    const ctx = this.p.drawingContext, o = this.o, st = this.st, g = this._g;
    const T = paletteLUT(st.mode, st.palFrom, st.palTo, st.pm, o.stain, o.intensity);
    const solid = o.background;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.translate(x, y);
    if (solid) {
      ctx.fillStyle = T.bg;
      ctx.fillRect(0, 0, w, h);
    }
    if (this.data.ready) {
      const cell = g.cell;
      const xa = Math.max(0, Math.floor(-g.ox / cell)), xb = Math.min(COLS, Math.ceil((w - g.ox) / cell));
      const ya = Math.max(0, Math.floor(-g.oy / cell)), yb = Math.min(g.rows, Math.ceil((h - g.oy) / cell));
      this._drawStain(ctx, T, solid, xa, xb, ya, yb);
      if (o.style === "flow") this._drawFlow(ctx, T, solid);
      else this._drawBreathe(ctx, T, solid, xa, xb, ya, yb);
    }
    ctx.restore();
    return this;
  }
  // The stain (total over the window) only changes with the data, layout or colours, so it
  // is drawn once into an offscreen canvas and copied each frame: redrawing ~28 800 cells
  // was over half the frame. Inside the lens box cells move, so that patch is drawn live.
  _drawStain(ctx, T, solid, xa, xb, ya, yb) {
    if (this.o.stain <= 0) return;
    const g = this._g, cell = g.cell, w = g.w, h = g.h;
    const m = typeof ctx.getTransform === "function" ? ctx.getTransform() : null;
    if (!m || typeof document === "undefined") {
      this._stainCells(ctx, T, solid, xa, xb, ya, yb, true);
      return;
    }
    const sx = Math.hypot(m.a, m.b), sy = Math.hypot(m.c, m.d);
    const key = `${this.data.version}|${w}|${h}|${cell}|${g.ox}|${g.oy}|${g.r0}|${solid}|${this.o.stain}|${sx}|${sy}`;
    let S = this._stainCache;
    if (!S || S.key !== key || S.T !== T) {
      if (!S) S = this._stainCache = { cv: document.createElement("canvas") };
      const cw = Math.max(1, Math.ceil(w * sx)), ch = Math.max(1, Math.ceil(h * sy));
      if (S.cv.width !== cw || S.cv.height !== ch) {
        S.cv.width = cw;
        S.cv.height = ch;
      }
      const sc = S.cv.getContext("2d", { willReadFrequently: true });
      sc.setTransform(1, 0, 0, 1, 0, 0);
      sc.clearRect(0, 0, cw, ch);
      sc.setTransform(sx, 0, 0, sy, 0, 0);
      this._stainCells(sc, T, solid, xa, xb, ya, yb, false);
      S.key = key;
      S.T = T;
    }
    const box = this._lensBox;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (box) {
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.rect(g.ox + box.c0 * cell, g.oy + box.r0 * cell, (box.c1 - box.c0 + 1) * cell, (box.r1 - box.r0 + 1) * cell);
      ctx.clip("evenodd");
    }
    ctx.drawImage(S.cv, 0, 0, w, h);
    ctx.restore();
    if (box) {
      this._stainCells(ctx, T, solid, Math.max(xa, box.c0), Math.min(xb, box.c1 + 1), Math.max(ya, box.r0), Math.min(yb, box.r1 + 1), true);
    }
  }
  _stainCells(ctx, T, solid, xa, xb, ya, yb, displace) {
    const g = this._g, cell = g.cell, inner = Math.max(1, cell - 1), d = this.data;
    const { dispX, dispY } = this;
    if (!solid) ctx.fillStyle = T.stainRaw;
    for (let yy = ya; yy < yb; yy++) {
      const y = g.r0 + yy;
      for (let x = xa; x < xb; x++) {
        const c = y * COLS + x, tot = d.total[c];
        if (tot < 2) continue;
        const lvl = Math.min(31, Math.sqrt(tot / d.totalMax) * 31 | 0);
        if (solid) ctx.fillStyle = T.stain[lvl];
        else ctx.globalAlpha = lvl / 31 * this.o.stain;
        if (displace) ctx.fillRect(g.ox + x * cell + Math.round(dispX[c]), g.oy + yy * cell + Math.round(dispY[c]), inner, inner);
        else ctx.fillRect(g.ox + x * cell, g.oy + yy * cell, inner, inner);
      }
    }
    ctx.globalAlpha = 1;
  }
  _drawBreathe(ctx, T, solid, xa, xb, ya, yb) {
    const g = this._g, cell = g.cell, inner = Math.max(1, cell - 1);
    const { rate, snowNow, dl, flowX, flowY, dispX, dispY, boost } = this;
    const rain = solid ? T.rain : T.rainRaw, snow = solid ? T.snow : T.snowRaw;
    const drift = this.o.grid === "snap" ? 0 : cell;
    if (!solid) ctx.globalAlpha = this.o.intensity;
    for (let yy = ya; yy < yb; yy++) {
      const y = g.r0 + yy;
      for (let x = xa; x < xb; x++) {
        const c = y * COLS + x, r = rate[c];
        if (r < MIN_RATE) continue;
        const lv = clamp(rateLevel(r) + boost[c] * 0.4, 0, 1);
        const pulse = 1 + clamp(dl[c] * 0.12, -0.15, 0.2);
        const s = clamp(Math.round((0.3 + 0.7 * Math.sqrt(lv)) * inner * pulse * (1 + boost[c])), 1, cell + 3);
        const cx = g.ox + x * cell + Math.round(dispX[c]) + inner / 2 + flowX[c] * drift;
        const cy = g.oy + yy * cell + Math.round(dispY[c]) + inner / 2 + flowY[c] * drift;
        ctx.fillStyle = (snowNow[c] ? snow : rain)[lv * 63 | 0];
        ctx.fillRect(Math.round(cx - s / 2), Math.round(cy - s / 2), s, s);
      }
    }
    ctx.globalAlpha = 1;
  }
  _drawFlow(ctx, T, solid) {
    const g = this._g, cell = g.cell, inner = Math.max(1, cell - 1), snap = this.o.grid === "snap";
    const { px, py, pa, plv, psn, dispX, dispY, boost } = this;
    const rain = solid ? T.rain : T.rainRaw, snow = solid ? T.snow : T.snowRaw;
    const scale = solid ? 1 : this.o.intensity;
    let lastA = -1;
    for (let k = 0; k < this.pn; k++) {
      const gx = snap ? Math.round(px[k]) % COLS : px[k], gy = snap ? Math.round(py[k]) : py[k];
      const sx = g.ox + gx * cell, sy = g.oy + (gy - g.r0) * cell;
      if (sx < -cell || sy < -cell || sx > g.w || sy > g.h) continue;
      const c = Math.round(py[k]) * COLS + Math.round(px[k]) % COLS;
      const b = c >= 0 && c < N ? boost[c] : 0;
      const a = Math.round(pa[k] * scale * 20) / 20;
      if (a !== lastA) {
        ctx.globalAlpha = a;
        lastA = a;
      }
      ctx.fillStyle = (psn[k] ? snow : rain)[clamp(plv[k] + b * 0.4, 0, 1) * 63 | 0];
      ctx.fillRect(sx + (b ? dispX[c] : 0), sy + (b ? dispY[c] : 0), inner, inner);
    }
    ctx.globalAlpha = 1;
  }
  // ---------------------------------------------------------------------------
  // reading values
  // ---------------------------------------------------------------------------
  /**
   * What is under a canvas point (as last drawn).
   * @returns {{lat, lon, col, row, rate, snow, trend, total, time} | null}
   *   rate mm/h now, trend mm/h change per hour, total mm over the window
   */
  pick(x, y) {
    const g = this._g, rect = this._rect, d = this.data;
    if (!g || !rect || !d.ready) return null;
    const lx = x - rect.x - g.ox, ly = y - rect.y - g.oy;
    if (x < rect.x || y < rect.y || x >= rect.x + rect.w || y >= rect.y + rect.h) return null;
    const col = Math.floor(lx / g.cell), row = g.r0 + Math.floor(ly / g.cell);
    if (col < 0 || col >= COLS || row < g.r0 || row >= g.r0 + g.rows) return null;
    const c = row * COLS + col, i = this.st.i;
    const rate = d.rateAt(this.st.f, c);
    return {
      lat: latOfRow(row),
      lon: lonOfCol(col),
      col,
      row,
      rate,
      snow: rate > 0 && !!this.snowNow[c],
      trend: d.frames[i + 1][c] - d.frames[i][c],
      total: d.total[c],
      time: this.time()
    };
  }
};

// src/index.js
var VERSION = "0.1.0";
function p5rainAddon(p5, fn, lifecycles) {
  fn.createRain = function(options) {
    const field = new RainField(this, options);
    (this._p5rainFields || (this._p5rainFields = [])).push(field);
    return field;
  };
  fn.loadRainData = function(source, options) {
    return RainData.get(source, options);
  };
  const cleanup = function() {
    (this._p5rainFields || []).forEach((f) => f.remove());
    this._p5rainFields = [];
  };
  if (lifecycles) lifecycles.remove = cleanup;
  else if (fn.registerMethod) fn.registerMethod("remove", cleanup);
}
function install(p5) {
  if (!p5 || p5.__p5rain) return;
  p5.__p5rain = true;
  if (typeof p5.registerAddon === "function") p5.registerAddon(p5rainAddon);
  else p5rainAddon(p5, p5.prototype, null);
}
if (typeof window !== "undefined" && window.p5) install(window.p5);
export {
  BACKGROUNDS,
  CELL_DEG,
  COLORMAP_URL,
  COLS,
  DEFAULTS,
  IMERG_LAYER,
  MAX_RATE,
  MIN_RATE,
  PALETTES,
  ROWS,
  RainData,
  RainField,
  SNAPSHOT_FORMAT,
  VERSION,
  WEEKLY_URL,
  addPalette,
  computeMotion,
  decodeFrame,
  decodePixels,
  decodeSnapshot,
  encodeFrame,
  encodeSnapshot,
  fetchSnapshot,
  fromBase64,
  imergUrl,
  install,
  lookup,
  p5rainAddon,
  paletteLUT,
  parseColormap,
  rateLevel,
  resolveSource,
  toBase64
};
