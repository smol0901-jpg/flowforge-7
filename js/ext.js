'use strict';
/* FlowForge Studio — расширения v2.7 (загружается после app.js, без сборки).
   Добавляет: импорт/экспорт .drawio, редактируемый SVG, DOT, HTML, 13 новых фигур,
   панель Outline, flowforge.config.json. Использует глобальные функции app.js. */
(() => {
  const XML_ESC = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const ver = '2.7';

  /* ================= 1. Новые фигуры ================= */
  const EXTRA = {
    delay:   ['Задержка', '#fab387', 'Задержка', '⏳'],
    display: ['Дисплей', '#89dceb', 'Дисплей', '🖥'],
    stored:  ['Хранимые данные', '#94e2d5', 'Хран. данные', '◖'],
    loop:    ['Начало цикла', '#f9e2af', 'Цикл', '⏢'],
    offpage: ['На другую страницу', '#bac2de', 'Др. страница', '⬓'],
    merge:   ['Слияние', '#b4befe', 'Слияние', '▽'],
    or:      ['', '#cba6f7', 'ИЛИ', '⊕'],
    sum:     ['', '#cba6f7', 'Сумма', '⊗'],
    cloud:   ['Облако', '#74c7ec', 'Облако', '☁'],
    ccp:     ['ККТ', '#f38ba8', 'ККТ (ХАССП)', '⯃'],
    tank:    ['Ёмкость', '#89b4fa', 'Ёмкость', '🛢'],
    store:   ['Склад', '#a6e3a1', 'Склад', '🏠'],
    equip:   ['Оборудование', '#f5c2e7', 'Оборудование', '⚙']
  };
  Object.entries(EXTRA).forEach(([k, [t, c, nm, ic]]) => { T[k] = [t, c]; NAMES[k] = nm; ICON[k] = ic; });

  const _shp = shp;
  shp = function (n, f, st, sw, da) {
    const { x, y, w, h } = n, a = `fill="${f}" stroke="${st}" stroke-width="${sw}"${da ? ` stroke-dasharray="${da}"` : ''}`;
    const P = d => `<path d="${d}" ${a}/>`;
    switch (n.type) {
      case 'delay': { const r = Math.min(h / 2, w / 2); return P(`M${x} ${y}H${x + w - r}A${r} ${h / 2} 0 0 1 ${x + w - r} ${y + h}H${x}Z`); }
      case 'display': { const s = Math.min(h * .3, w / 4); return P(`M${x} ${y + h / 2}L${x + s} ${y}H${x + w - s}A${s} ${h / 2} 0 0 1 ${x + w - s} ${y + h}H${x + s}Z`); }
      case 'stored': { const s = Math.min(h * .3, w / 5); return P(`M${x + s} ${y}H${x + w}Q${x + w - s} ${y + h / 2} ${x + w} ${y + h}H${x + s}Q${x} ${y + h / 2} ${x + s} ${y}Z`); }
      case 'loop': { const c = Math.min(14, h / 3); return P(`M${x + c} ${y}H${x + w - c}L${x + w} ${y + c}V${y + h}H${x}V${y + c}Z`); }
      case 'offpage': return P(`M${x} ${y}H${x + w}V${y + h * .68}L${x + w / 2} ${y + h}L${x} ${y + h * .68}Z`);
      case 'merge': return P(`M${x} ${y}H${x + w}L${x + w / 2} ${y + h}Z`);
      case 'or': case 'sum': {
        const cx = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2, k = n.type == 'or' ? 1 : .7071;
        const L = n.type == 'or' ? `M${cx} ${y}V${y + h}M${x} ${cy}H${x + w}` : `M${cx - rx * k} ${cy - ry * k}L${cx + rx * k} ${cy + ry * k}M${cx + rx * k} ${cy - ry * k}L${cx - rx * k} ${cy + ry * k}`;
        return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${a}/><path d="${L}" fill="none" stroke="${st}" stroke-width="${sw}"/>`;
      }
      case 'cloud': return P(`M${x + w * .22} ${y + h * .85}C${x - w * .06} ${y + h * .85} ${x - w * .04} ${y + h * .46} ${x + w * .18} ${y + h * .43}C${x + w * .12} ${y + h * .1} ${x + w * .45} ${y + h * .02} ${x + w * .5} ${y + h * .22}C${x + w * .6} ${y} ${x + w * .92} ${y + h * .1} ${x + w * .82} ${y + h * .4}C${x + w * 1.04} ${y + h * .46} ${x + w * 1.02} ${y + h * .87} ${x + w * .78} ${y + h * .85}Z`);
      case 'ccp': { const s = Math.min(w, h) * .3; return P(`M${x + s} ${y}H${x + w - s}L${x + w} ${y + s}V${y + h - s}L${x + w - s} ${y + h}H${x + s}L${x} ${y + h - s}V${y + s}Z`); }
      case 'tank': return P(`M${x} ${y}H${x + w}V${y + h * .72}Q${x + w} ${y + h} ${x + w / 2} ${y + h}Q${x} ${y + h} ${x} ${y + h * .72}Z`) + `<path d="M${x} ${y + 10}H${x + w}" fill="none" stroke="${st}" stroke-width="${sw}"/>`;
      case 'store': return P(`M${x} ${y + h * .32}L${x + w / 2} ${y}L${x + w} ${y + h * .32}V${y + h}H${x}Z`);
      case 'equip': return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" ${a}/><path d="M${x} ${y + 12}H${x + w}M${x + 10} ${y + 12}V${y + h}M${x + w - 10} ${y + 12}V${y + h}" fill="none" stroke="${st}" stroke-width="${sw}" opacity=".7"/>`;
    }
    return _shp(n, f, st, sw, da);
  };
  const _sz = sz;
  sz = function (n, fs) { return (n.type == 'or' || n.type == 'sum') ? _sz({ ...n, type: 'conn' }, fs) : _sz(n, fs); };
  // перерисовать палитру и список типов с новыми фигурами
  $('#pal').innerHTML = Object.keys(T).map(k => `<button data-add="${k}">${miniIcon(k, 40)}<span>${NAMES[k]}</span></button>`).join('');
  $('#pty').innerHTML = Object.keys(T).map(k => `<option value="${k}">${NAMES[k]}`).join('');

  /* ================= 2. Импорт .drawio ================= */
  const DIO_TYPE = (st, w, h, hasVal) => {
    const s = st.shape || '', raw = st._raw || '';
    if (st.rhombus !== undefined || s == 'rhombus' || /flowchart\.decision/.test(s)) return 'decision';
    if (/parallelogram|flowchart\.data|flowchart\.input_output/.test(s) || st.parallelogram !== undefined) return 'io';
    if (/cylinder|flowchart\.database|flowchart\.direct_data/.test(s)) return 'data';
    if (/hexagon|flowchart\.preparation/.test(s)) return 'prep';
    if (/flowchart\.terminator/.test(s) || /arcSize=(50|[5-9]\d)/.test(raw) && st.rounded == '1') return 'terminal';
    if (/flowchart\.predefined_process|^process$/.test(s)) return 'sub';
    if (/flowchart\.document|^document$/.test(s)) return 'doc';
    if (/flowchart\.manual_input/.test(s)) return 'manual';
    if (/flowchart\.delay/.test(s)) return 'delay';
    if (/flowchart\.display/.test(s)) return 'display';
    if (/flowchart\.stored_data/.test(s)) return 'stored';
    if (/flowchart\.merge/.test(s)) return 'merge';
    if (/flowchart\.summing_function/.test(s)) return 'sum';
    if (/flowchart\.or\b/.test(s)) return 'or';
    if (/offpage/.test(s)) return 'offpage';
    if (/^cloud$/.test(s) || st.cloud !== undefined) return 'cloud';
    if (/^note$|^folder$/.test(s) || /^text(;|$)/.test(raw)) return 'note';
    if (st.ellipse !== undefined || s == 'ellipse') return (w <= 64 && h <= 64) ? 'conn' : 'terminal';
    return 'process';
  };
  const parseStyle = str => {
    const o = { _raw: str || '' };
    String(str || '').split(';').forEach((p, i) => { if (!p) return; const j = p.indexOf('='); if (j < 0) o[p] = ''; else o[p.slice(0, j)] = p.slice(j + 1); if (j < 0 && i == 0) o._first = p; });
    return o;
  };
  const plain = v => {
    if (!v) return '';
    if (!/[<&]/.test(v)) return v;
    const d = new DOMParser().parseFromString('<body>' + String(v).replace(/<br\s*\/?>/gi, '\n').replace(/<\/(div|p|li)>/gi, '\n') + '</body>', 'text/html');
    return (d.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
  };
  async function inflateDiagram(txt) {
    const bin = Uint8Array.from(atob(txt.trim()), c => c.charCodeAt(0));
    const ds = new DecompressionStream('deflate-raw'), w = ds.writable.getWriter();
    w.write(bin); w.close();
    const out = await new Response(ds.readable).text();
    return decodeURIComponent(out);
  }
  async function dioToDoc(xml, pageIdx = 0) {
    let doc = new DOMParser().parseFromString(xml, 'text/xml');
    if (doc.querySelector('parsererror')) throw Error('XML повреждён');
    let model = doc.querySelector('mxGraphModel'), pages = [...doc.querySelectorAll('diagram')];
    if (pages.length) {
      const pg = pages[Math.min(pageIdx, pages.length - 1)];
      model = pg.querySelector('mxGraphModel');
      if (!model) {
        const inner = await inflateDiagram(pg.textContent);
        model = new DOMParser().parseFromString(inner, 'text/xml').querySelector('mxGraphModel');
      }
    }
    if (!model) throw Error('не найден mxGraphModel — это не .drawio');
    const cells = new Map();
    model.querySelectorAll('mxCell,object,UserObject').forEach(el => {
      if (el.tagName == 'mxCell' && el.parentElement && /^(object|UserObject)$/.test(el.parentElement.tagName)) return;
      const c = el.tagName == 'mxCell' ? el : el.querySelector('mxCell');
      if (!c) return;
      const id = el.getAttribute('id') || c.getAttribute('id');
      cells.set(id, { id, el, c, parent: c.getAttribute('parent'), vertex: c.getAttribute('vertex') == '1', edge: c.getAttribute('edge') == '1', st: parseStyle(c.getAttribute('style')), value: el !== c ? (el.getAttribute('label') || '') : (c.getAttribute('value') || ''), src: c.getAttribute('source'), tgt: c.getAttribute('target'), g: c.querySelector(':scope > mxGeometry') });
    });
    // абсолютные координаты с учётом родителей
    const abs = id => { const c = cells.get(id); if (!c || !c.g) return [0, 0]; const [px, py] = c.vertex && cells.get(c.parent) && cells.get(c.parent).vertex ? abs(c.parent) : [0, 0]; return [px + (+c.g.getAttribute('x') || 0), py + (+c.g.getAttribute('y') || 0)]; };
    const nodes = [], groups = [], idmap = new Map(), kids = new Map();
    for (const c of cells.values()) {
      if (!c.vertex || !c.g) continue;
      const w = +c.g.getAttribute('width') || 120, h = +c.g.getAttribute('height') || 60, [x, y] = abs(c.id), st = c.st, text = plain(c.value);
      const isCont = st.swimlane !== undefined || st.container == '1' || st._first == 'swimlane' || st._first == 'group' || /^(swimlane|pool)/.test(st.shape || '');
      if (isCont) { groups.push({ id: 'g' + c.id, title: text || 'Группа', color: hex6(st.fillColor) || '#89b4fa', nodes: [], _src: c.id }); continue; }
      const n = { id: c.id, type: DIO_TYPE(st, w, h), text: text || (T[DIO_TYPE(st, w, h)] || [''])[0], x: Math.round(x), y: Math.round(y) };
      const fc = hex6(st.fillColor); if (fc) n.color = fc;
      if (w >= 40) n.sw = Math.round(w); if (h >= 30) n.sh = Math.round(h);
      if (+st.fontSize >= 10 && +st.fontSize <= 48 && +st.fontSize != 14) n.fs = +st.fontSize;
      if (st.dashed == '1') n.bd = 'dashed';
      nodes.push(n); idmap.set(c.id, n.id);
      let p = c.parent; while (p && cells.has(p)) { const gp = groups.find(g => g._src == p); if (gp) { gp.nodes.push(n.id); break; } p = cells.get(p).parent; }
    }
    // контейнеры могли встретиться после детей — досборка
    groups.forEach(gp => nodes.forEach(n => { const c = cells.get(n.id); let p = c && c.parent; while (p && cells.has(p)) { if (p == gp._src) { if (!gp.nodes.includes(n.id)) gp.nodes.push(n.id); break; } p = cells.get(p).parent; } }));
    const edges = [];
    for (const c of cells.values()) {
      if (!c.edge || !idmap.has(c.src) || !idmap.has(c.tgt)) continue;
      const st = c.st, e = { from: idmap.get(c.src), to: idmap.get(c.tgt) }, lbl = plain(c.value);
      if (lbl) e.label = lbl;
      if (/orthogonal|elbow/i.test(st.edgeStyle || '')) e.route = 'ortho'; else if (st.curved == '1') e.route = 'curve';
      if (st.dashed == '1') e.dash = (st.dashPattern && /^1 /.test(st.dashPattern)) ? 'dotted' : 'dashed';
      const ea = st.endArrow, sa = st.startArrow;
      if (ea == 'none' && (!sa || sa == 'none')) e.arrow = 'none'; else if (sa && sa != 'none' && ea != 'none') e.arrow = 'both';
      const sc = hex6(st.strokeColor); if (sc) e.color = sc;
      if (+st.strokeWidth >= 1 && +st.strokeWidth <= 6) e.width = Math.round(+st.strokeWidth);
      edges.push(e);
    }
    groups.forEach(g => delete g._src);
    if (!nodes.length) throw Error('в диаграмме нет блоков');
    return { doc: { format: 'flowforge', nodes, edges, groups: groups.filter(g => g.nodes.length) }, pages: pages.length || 1 };
  }

  /* ================= 3. Экспорт .drawio / DOT / HTML / editable SVG ================= */
  const DIO_STYLE = {
    terminal: 'rounded=1;arcSize=50;whiteSpace=wrap;html=1;', process: 'rounded=1;whiteSpace=wrap;html=1;', decision: 'rhombus;whiteSpace=wrap;html=1;',
    io: 'shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;', data: 'shape=cylinder3;whiteSpace=wrap;html=1;', sub: 'shape=process;whiteSpace=wrap;html=1;',
    note: 'shape=note;whiteSpace=wrap;html=1;', doc: 'shape=document;whiteSpace=wrap;html=1;', prep: 'shape=hexagon;perimeter=hexagonPerimeter2;whiteSpace=wrap;html=1;',
    conn: 'ellipse;whiteSpace=wrap;html=1;', manual: 'shape=mxgraph.flowchart.manual_input;whiteSpace=wrap;html=1;', delay: 'shape=mxgraph.flowchart.delay;whiteSpace=wrap;html=1;',
    display: 'shape=mxgraph.flowchart.display;whiteSpace=wrap;html=1;', stored: 'shape=mxgraph.flowchart.stored_data;whiteSpace=wrap;html=1;', merge: 'shape=mxgraph.flowchart.merge_or_storage;whiteSpace=wrap;html=1;',
    or: 'shape=mxgraph.flowchart.or;whiteSpace=wrap;html=1;', sum: 'shape=mxgraph.flowchart.summing_function;whiteSpace=wrap;html=1;', cloud: 'ellipse;shape=cloud;whiteSpace=wrap;html=1;',
    offpage: 'shape=mxgraph.flowchart.off-page_reference;whiteSpace=wrap;html=1;', ccp: 'shape=mxgraph.flowchart.preparation;whiteSpace=wrap;html=1;'
  };
  function toDrawio() {
    let id = 2, o = `<mxfile host="FlowForge Studio" version="${ver}"><diagram name="${XML_ESC(pname())}" id="ff1"><mxGraphModel grid="1" gridSize="${cfg.gs || 20}" page="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>`;
    const gid = new Map();
    S.groups.forEach(g => { const b = gbox(g); if (!b) return; const i = 'g' + id++; gid.set(g.id, i); o += `<mxCell id="${i}" value="${XML_ESC(g.title)}" style="swimlane;startSize=28;fillColor=none;strokeColor=${g.color || '#89b4fa'};dashed=1;" vertex="1" parent="1"><mxGeometry x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" as="geometry"/></mxCell>`; });
    const nm = new Map();
    S.nodes.forEach(n => {
      const i = 'n' + id++; nm.set(n.id, i);
      const grp = S.groups.find(g => g.nodes.includes(n.id)), gb = grp && gbox(grp), par = grp && gid.get(grp.id) ? gid.get(grp.id) : '1';
      const x = gb ? n.x - gb.x : n.x, y = gb ? n.y - gb.y : n.y;
      const fill = n.color || T[n.type][1];
      o += `<mxCell id="${i}" value="${XML_ESC(n.text).replace(/\n/g, '&lt;br&gt;')}" style="${DIO_STYLE[n.type] || DIO_STYLE.process}fillColor=${fill};strokeColor=#333333;fontColor=${ink(fill)};${n.bd == 'dashed' ? 'dashed=1;' : ''}${n.fs ? `fontSize=${n.fs};` : ''}" vertex="1" parent="${par}"><mxGeometry x="${x}" y="${y}" width="${n.w}" height="${n.h}" as="geometry"/></mxCell>`;
    });
    S.edges.forEach(e => {
      const st = `edgeStyle=${e.route == 'ortho' ? 'orthogonalEdgeStyle' : 'none'};${e.route == 'curve' ? 'curved=1;' : ''}rounded=1;html=1;endArrow=${e.arrow == 'none' ? 'none' : 'classic'};startArrow=${e.arrow == 'both' ? 'classic' : 'none'};${e.dash && e.dash != 'solid' ? 'dashed=1;' : ''}${e.color ? `strokeColor=${e.color};` : ''}${e.width ? `strokeWidth=${e.width};` : ''}`;
      o += `<mxCell id="e${id++}" value="${XML_ESC(e.label || '')}" style="${st}" edge="1" parent="1" source="${nm.get(e.from)}" target="${nm.get(e.to)}"><mxGeometry relative="1" as="geometry"/></mxCell>`;
    });
    return o + '</root></mxGraphModel></diagram></mxfile>';
  }
  function toDot() {
    const q = s => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
    const sh = { terminal: 'ellipse', process: 'box', decision: 'diamond', io: 'parallelogram', data: 'cylinder', sub: 'box3d', note: 'note', doc: 'tab', prep: 'hexagon', conn: 'circle', manual: 'trapezium', cloud: 'ellipse', ccp: 'octagon', tank: 'cylinder', store: 'house', equip: 'component', merge: 'invtriangle' };
    let o = `digraph "${pname().replace(/"/g, "'")}" {\n  rankdir=TB; node [fontname="Arial", style=filled];\n`;
    S.nodes.forEach(n => o += `  ${q(n.id)} [label=${q(n.text)}, shape=${sh[n.type] || 'box'}, fillcolor=${q(n.color || T[n.type][1])}];\n`);
    S.edges.forEach(e => o += `  ${q(e.from)} -> ${q(e.to)}${e.label ? ` [label=${q(e.label)}]` : ''};\n`);
    return o + '}\n';
  }
  const b64 = s => btoa(unescape(encodeURIComponent(s))), unb64 = s => decodeURIComponent(escape(atob(s)));
  function svgEditable() {
    const { s } = svgStr(), data = b64(JSON.stringify(ser(true)));
    return s.replace(/(<svg[^>]*>)/, `$1<metadata id="flowforge-data" data-app="FlowForge Studio">${data}</metadata>`);
  }
  Object.assign(ACT, {
    drawio() { if (!S.nodes.length) return toast('Схема пуста'); dl(new Blob([toDrawio()], { type: 'application/xml' }), `${slug(pname())}-${stamp()}.drawio`); toast('✅ .drawio сохранён — откроется в draw.io'); },
    dot() { if (!S.nodes.length) return toast('Схема пуста'); dl(new Blob([toDot()], { type: 'text/vnd.graphviz' }), `${slug(pname())}.dot`); },
    svgx() { if (!S.nodes.length) return toast('Схема пуста'); dl(new Blob([svgEditable()], { type: 'image/svg+xml' }), `${slug(pname())}.ff.svg`); toast('✅ SVG с вшитыми данными: его можно открыть обратно в FlowForge'); },
    html() { if (!S.nodes.length) return toast('Схема пуста'); const { s } = svgStr(); dl(new Blob([`<!DOCTYPE html><html lang="ru"><meta charset="utf-8"><title>${XML_ESC(pname())}</title><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;display:grid;place-items:center;min-height:100vh;background:#f6f7fb"><div style="max-width:100%;overflow:auto">${s}</div>`], { type: 'text/html' }), `${slug(pname())}.html`); },
    outline() { toggleOutline(); }
  });

  /* ================= 4. Перехват импорта (.drawio / редактируемый SVG) ================= */
  const _imp = importText;
  importText = function (t) {
    const s = String(t || '').trim();
    if (/^<\?xml|^<mxfile|^<mxGraphModel/i.test(s) && /mxGraphModel|<mxfile/i.test(s)) {
      dioToDoc(s).then(({ doc, pages }) => {
        newProjectFromImport(doc);
        toast(`✅ draw.io: ${S.nodes.length} блоков, ${S.edges.length} связей${pages > 1 ? ` (импортирована 1-я страница из ${pages})` : ''}`);
      }).catch(e => toast('❌ draw.io: ' + e.message));
      return true;
    }
    if (/^<svg|^<\?xml/i.test(s) && /id="flowforge-data"/.test(s)) {
      try { const m = s.match(/<metadata id="flowforge-data"[^>]*>([^<]+)<\/metadata>/); return _imp(unb64(m[1])); } catch (e) { toast('❌ SVG: ' + e.message); return false; }
    }
    return _imp(t);
  };
  function newProjectFromImport(doc) { setDoc(doc); reveal(); fit && fit(); commit(); }
  $('#fi').accept = '.json,.drawio,.xml,.svg,application/json';

  /* ================= 5. Outline: навигатор по блокам ================= */
  const pan = document.createElement('div');
  pan.id = 'outl'; pan.hidden = true;
  pan.innerHTML = '<div class="lh"><b>Структура схемы</b><span><small id="ocnt"></small><button data-a="outline" title="Закрыть">✕</button></span></div><input id="oq" placeholder="Поиск по блокам…" autocomplete="off"><div id="olist"></div>';
  $('#stage').appendChild(pan);
  const btn = document.createElement('button'); btn.dataset.a = 'outline'; btn.title = 'Структура схемы (Outline)'; btn.textContent = '☰'; btn.style.fontSize = '15px';
  const hud = $('#hud'); hud.insertBefore(btn, hud.querySelector('[data-a="lint"]'));
  function renderOutline() {
    if (pan.hidden) return;
    const q = $('#oq').value.trim().toLowerCase(), L = S.nodes.filter(n => !q || n.text.toLowerCase().includes(q));
    $('#ocnt').textContent = `${L.length}/${S.nodes.length}`;
    $('#olist').innerHTML = L.slice(0, 400).map(n => `<button data-oid="${esc(n.id)}"><i style="background:${n.color || T[n.type][1]}"></i><span>${esc(n.text.replace(/\n/g, ' ') || NAMES[n.type])}</span><small>${NAMES[n.type]}</small></button>`).join('') || '<p>Ничего не найдено</p>';
  }
  function toggleOutline() { pan.hidden = !pan.hidden; if (!pan.hidden) { renderOutline(); $('#oq').focus(); } }
  $('#oq').oninput = renderOutline;
  $('#olist').addEventListener('click', e => { const b = e.target.closest('[data-oid]'); if (b) { const n = N(b.dataset.oid); if (n) focusN(n); } });
  const _commit = commit; commit = function () { const r = _commit.apply(this, arguments); renderOutline(); return r; };

  /* ================= 6. Кнопки импорта/экспорта в меню «Файл» ================= */
  const fp = MENU.querySelector('[data-pane="file"]'), anchor0 = fp && fp.querySelector('.line');
  if (fp && anchor0) {
    const h = document.createElement('h4'); h.textContent = 'Совместимость и интеграции';
    const c = document.createElement('div'); c.className = 'cards c2';
    c.innerHTML = '<button class="card" data-a="open"><i>📥</i><b>Импорт .drawio</b><small>Откроет файл draw.io</small></button><button class="card" data-a="drawio"><i>📤</i><b>Экспорт .drawio</b><small>Открыть в draw.io</small></button>' +
      '<button class="card" data-a="svgx"><i>🧬</i><b>SVG + данные</b><small>Вставить в README</small></button><button class="card" data-a="html"><i>🌐</i><b>HTML</b><small>Страница для сайта</small></button>' +
      '<button class="card" data-a="dot"><i>🕸</i><b>Graphviz DOT</b><small>.dot для Graphviz</small></button><button class="card" data-a="outline"><i>☰</i><b>Структура</b><small>Список блоков и поиск</small></button>';
    fp.insertBefore(h, anchor0); fp.insertBefore(c, anchor0);
  }

  /* ================= 7. flowforge.config.json ================= */
  if (location.protocol != 'file:') fetch('flowforge.config.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(j => {
    if (!j || typeof j != 'object') return;
    const stored = LS('ffCfg', {}), d = j.defaults || {};
    Object.keys(d).forEach(k => { if (!(k in stored) && k in cfg) cfg[k] = d[k]; });
    if (j.palette && typeof j.palette == 'object') Object.entries(j.palette).forEach(([k, v]) => { if (T[k] && hex6(v)) T[k][1] = hex6(v); });
    syncUI(); draw();
  }).catch(() => {});

  draw();
})();
