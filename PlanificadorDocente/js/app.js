function load(key, def) { try { return JSON.parse(localStorage.getItem(key)) || def; } catch(e){ return def; } }
function saveLocal(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){} }

// ── SYNC UI ──────────────────────────────────────────────────────────────────
function setSyncMsg(m) {
  const bar = document.getElementById('sync-bar');
  bar.style.borderColor='var(--border)'; bar.style.background='var(--surface)'; bar.style.color='var(--text2)';
  document.getElementById('sync-msg').textContent = m;
}
function setSyncOk(m) {
  const bar = document.getElementById('sync-bar');
  bar.style.borderColor='var(--accent)'; bar.style.background='var(--accent-light)'; bar.style.color='var(--accent)';
  document.getElementById('sync-msg').textContent = m;
}
function setSyncing(m) {
  const bar = document.getElementById('sync-bar');
  bar.style.borderColor='var(--blue-border)'; bar.style.background='var(--blue-light)'; bar.style.color='var(--blue)';
  document.getElementById('sync-msg').textContent = m;
}

// ── AUTH UI ──────────────────────────────────────────────────────────────────
function setAuthUI(connected, name) {
  const btn = document.getElementById('auth-btn');
  const dot = document.getElementById('auth-dot');
  const lbl = document.getElementById('auth-label');
  if(connected) {
    dot.style.background = 'var(--accent)';
    lbl.textContent = name ? '✓ ' + name.split(' ')[0] : 'Conectado';
    btn.style.borderColor = 'var(--accent)';
    btn.style.color = 'var(--accent)';
  } else {
    dot.style.background = 'var(--text3)';
    lbl.textContent = 'Conectar con Google';
    btn.style.borderColor = 'var(--border2)';
    btn.style.color = 'var(--text)';
  }
}

function toggleAuth() {
  const lbl = document.getElementById('auth-label').textContent;
  if(lbl.startsWith('✓') || lbl === 'Conectado') {
    window._fbSignOut && window._fbSignOut();
  } else {
    window._fbSignIn && window._fbSignIn();
  }
}

// ── SNAPSHOT (datos para guardar) ────────────────────────────────────────────
function getLocalSnapshot() {
  return {
    version: 3,
    fecha: new Date().toISOString(),
    estados, notas, evalData, evalNotas, evalLinks,
    grupos, hitos, moodleData, notaCaso, claseLinks, claseBiblio,
    tisiEntradas, tisiLinks, tisiPuntuacion, tisiReflexiones, tisiEstrategia,
    tisiRubrica, cajonItems, pnbCajonNotas, recordatorios
  };
}

function importRemoteData(datos) {
  estados    = datos.estados    || {};
  notas      = datos.notas      || {};
  evalData   = datos.evalData   || {};
  evalNotas  = datos.evalNotas  || {};
  evalLinks  = datos.evalLinks  || {};
  grupos     = datos.grupos     || [];
  hitos      = datos.hitos      || HITOS_DEFAULT;
  moodleData = datos.moodleData || {};
  notaCaso   = datos.notaCaso   || '';
  claseLinks = datos.claseLinks || {};
  claseBiblio = datos.claseBiblio || {};
  tisiEntradas    = datos.tisiEntradas    || {g1:[],g2:[]};
  tisiLinks       = datos.tisiLinks       || {g1:[],g2:[]};
  tisiPuntuacion  = datos.tisiPuntuacion  || {g1:{},g2:{}};
  tisiReflexiones = datos.tisiReflexiones || [];
  tisiEstrategia  = datos.tisiEstrategia  || [];
  tisiRubrica     = datos.tisiRubrica     || {g1:{},g2:{}};
  cajonItems      = datos.cajonItems      || [];
  pnbCajonNotas   = datos.pnbCajonNotas   || [];
  recordatorios   = datos.recordatorios   || [];
  // Guardar también en local como caché
  persist(false);
  renderMetrics(); renderAlertas(); renderClases(); renderEval(); renderGrupos(); renderGlobal();
}

let estados   = load('pnb_estados', {});
let notas     = load('pnb_notas', {});
let evalData  = load('pnb_eval', {});
let evalNotas = load('pnb_evalnotas', {});
let evalLinks = load('pnb_evallinks', {});
let grupos    = load('pnb_grupos', []);
let hitos     = load('pnb_hitos', HITOS_DEFAULT);
let moodleData= load('pnb_moodle', {});
let notaCaso  = load('pnb_notacaso', '');
let claseLinks= load('pnb_claselinks', {});
let claseBiblio= load('pnb_clasebiblio', {});
let expanded  = null;
let filtro    = 'todos';

// TISI data
let tisiGrupoActivo = 'g1';
let rubricaGrupoActivo = 'g1';


let tisiCatActiva = 'todas';
let tisiEntradas = load('tisi_entradas', {g1:[], g2:[]});
let tisiLinks    = load('tisi_links', {g1:[], g2:[]});
let tisiPuntuacion = load('tisi_puntuacion', {g1:{formal:'',cualitativa:''},g2:{formal:'',cualitativa:''}});
let tisiReflexiones = load('tisi_reflexiones', []);
let tisiEstrategia  = load('tisi_estrategia', []);
let tisiEstrategiaCat = 'todas';
let tisiRubrica = load('tisi_rubrica', {g1:{}, g2:{}}); // {g1: {item_id: {estado:'cumplido'|'parcial'|'no', nota:''}, ...}}

// Cajón de entrada y recordatorios globales
let cajonItems       = load('cajon_items', []);
let pnbCajonNotas    = load('pnb_cajon_notas', []);
let recordatorios    = load('recordatorios', []);

let _saveTimer = null;
function persist(syncCloud = true) {
  // Guardar en localStorage (caché local)
  saveLocal('pnb_estados', estados);
  saveLocal('pnb_notas', notas);
  saveLocal('pnb_eval', evalData);
  saveLocal('pnb_evalnotas', evalNotas);
  saveLocal('pnb_evallinks', evalLinks);
  saveLocal('pnb_grupos', grupos);
  saveLocal('pnb_hitos', hitos);
  saveLocal('pnb_moodle', moodleData);
  saveLocal('pnb_notacaso', notaCaso);
  saveLocal('pnb_claselinks', claseLinks);
  saveLocal('pnb_clasebiblio', claseBiblio);
  saveLocal('tisi_entradas', tisiEntradas);
  saveLocal('tisi_links', tisiLinks);
  saveLocal('tisi_puntuacion', tisiPuntuacion);
  saveLocal('tisi_reflexiones', tisiReflexiones);
  saveLocal('tisi_estrategia', tisiEstrategia);
  saveLocal('tisi_rubrica', tisiRubrica);
  saveLocal('cajon_items', cajonItems);
  saveLocal('pnb_cajon_notas', pnbCajonNotas);
  saveLocal('recordatorios', recordatorios);

  // Guardar en Firestore con debounce (espera 1.5s de inactividad)
  if(syncCloud && window._fbSave) {
    clearTimeout(_saveTimer);
    setSyncing('Guardando en la nube...');
    _saveTimer = setTimeout(async () => {
      await window._fbSave(getLocalSnapshot());
      setSyncOk('☁ Guardado en la nube ✓');
    }, 1500);
  }
}

function switchTab(tab, btn) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('sec-'+tab).classList.add('active');

  const metricsEl = document.getElementById('metrics');
  const titles = {
    global:         ['Mi semana', 'Vista general · UNLP 2026', ''],
    cronograma:     ['Cronograma 2026', 'Miércoles · Ciencia de Datos en las Organizaciones', 'Inicio PDN: mié 19 ago 2026'],
    evaluaciones:   ['Evaluaciones', 'Procesos de Negocio', ''],
    grupos:         ['Grupos — Caso de Estudio', 'Procesos de Negocio', ''],
    caso:           ['Caso de Estudio', 'Procesos de Negocio', ''],
    moodle:         ['Material y Bibliografía', 'Procesos de Negocio', ''],
    'tisi-grupos':  ['Grupos', 'TISI · Seguimiento', ''],
    'tisi-clases':  ['Mejora de Clases', 'TISI · Reflexiones para el año siguiente', ''],
    'tisi-estrategia': ['Estrategia de Cursada', 'TISI · Ideas y reflexiones', ''],
  };
  const t = titles[tab] || ['','',''];
  document.getElementById('page-title').textContent = t[0];
  document.getElementById('page-subtitle').textContent = t[1];
  document.getElementById('page-meta').textContent = t[2];

  if(['cronograma','evaluaciones','grupos','caso','moodle'].includes(tab)) {
    metricsEl.style.display = '';
    renderMetrics();
  } else {
    metricsEl.style.display = 'none';
  }

  if(tab==='moodle') renderMoodle();
  if(tab==='caso') { renderHitos(); document.getElementById('nota-caso').value = notaCaso; }
  if(tab==='global') { renderGlobal(); }
  if(tab==='tisi-grupos') { renderTisiGrupos(); }
  if(tab==='tisi-clases') { renderReflexiones(); }
  if(tab==='tisi-estrategia') { renderEstrategia(); }
}

function filtrar(tipo, btn) {
  filtro = tipo;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderClases();
}

// --- Metrics & Alerts ---
function renderMetrics() {
  const activas = CLASES.filter(c => !['sf','feriado','teoria'].includes(c.tipo));
  const total = activas.length;
  const listas = activas.filter(c => estados[c.n] === 'lista').length;
  const progreso = activas.filter(c => estados[c.n] === 'progreso').length;
  const talleres = CLASES.filter(c => c.tipo === 'taller').length;
  document.getElementById('metrics').innerHTML = `
    <div class="metric"><div class="metric-label">Clases activas</div><div class="metric-val">${total}</div></div>
    <div class="metric"><div class="metric-label">Listas</div><div class="metric-val green">${listas}</div></div>
    <div class="metric"><div class="metric-label">En progreso</div><div class="metric-val amber">${progreso}</div></div>
    <div class="metric"><div class="metric-label">Talleres</div><div class="metric-val blue">${talleres}</div></div>
  `;
}

function renderAlertas() {
  const hoy = new Date();
  const checks = [
    {nombre:'Primer Parcial',    fecha: new Date(2026,8,23)},
    {nombre:'Segundo Parcial',   fecha: new Date(2026,10,2)},
    {nombre:'Recuperatorio 2do', fecha: new Date(2026,10,16)},
  ];
  let html = '';
  checks.forEach(p => {
    const diff = Math.round((p.fecha - hoy)/(1000*60*60*24));
    if(diff > 0 && diff <= 21) {
      const cls = diff <= 14 ? 'danger' : 'warning';
      html += `<div class="alert ${cls}">⚠ <strong>${p.nombre}</strong> en ${diff} días — preparar enunciado</div>`;
    }
  });
  document.getElementById('alertas').innerHTML = html;
}

// --- Cronograma ---
function badgeHTML(tipo) {
  const map = {taller:'badge-taller',parcial:'badge-parcial',exposicion:'badge-exposicion',feriado:'badge-feriado',recu:'badge-recu',sf:'badge-sf'};
  const labels = {taller:'Taller',parcial:'Parcial',exposicion:'Exposición',feriado:'Feriado',recu:'Recuperatorio',sf:'Sem. Finales'};
  if(!labels[tipo]) return '';
  return `<span class="badge ${map[tipo]}">${labels[tipo]}</span>`;
}

function renderClases() {
  const container = document.getElementById('lista-clases');
  const esAdmin = t => ['sf','feriado','teoria'].includes(t);
  const filtradas = CLASES.filter(c => {
    if(filtro === 'todos') return true;
    if(filtro === 'taller') return c.tipo === 'taller';
    if(filtro === 'parcial') return ['parcial','recu'].includes(c.tipo);
    if(filtro === 'exposicion') return c.tipo === 'exposicion';
    if(filtro === 'pendiente') return !esAdmin(c.tipo) && (estados[c.n]||'pendiente') === 'pendiente';
    if(filtro === 'lista') return estados[c.n] === 'lista';
    return true;
  });

  if(!filtradas.length) { container.innerHTML = '<div class="empty">No hay clases con ese filtro.</div>'; return; }

  container.innerHTML = filtradas.map(c => {
    const est = estados[c.n] || 'pendiente';
    const nota = notas[c.n] || '';
    const biblio = claseBiblio[c.n] || '';
    const titulo = c.teoria || c.practica || '—';
    const isExp = expanded === c.n;
    const admin = esAdmin(c.tipo);

    return `<div class="clase-card${isExp?' expanded':''}" id="card-${c.n}">
      <div class="clase-header" onclick="toggleCard(${c.n})">
        <span class="clase-num">${String(c.n).padStart(2,'0')}</span>
        <span class="clase-fecha">${c.fecha}</span>
        <span class="clase-titulo${admin?' dimmed':''}">${titulo.length>65?titulo.slice(0,65)+'…':titulo}</span>
        ${badgeHTML(c.tipo)}
        ${!admin ? `<select class="estado-select ${est}" onclick="event.stopPropagation()" onchange="setEstado(${c.n},this.value)">
          <option value="pendiente" ${est==='pendiente'?'selected':''}>Pendiente</option>
          <option value="progreso" ${est==='progreso'?'selected':''}>En progreso</option>
          <option value="lista" ${est==='lista'?'selected':''}>Lista ✓</option>
          <option value="dada" ${est==='dada'?'selected':''}>Dada</option>
        </select>` : ''}
      </div>
      ${isExp ? `<div class="clase-detalle">
        <div class="detalle-grid">
          ${c.practica ? `<span class="detalle-label">Práctica</span><span class="detalle-val">${c.practica}</span>` : ''}
          ${c.taller ? `<span class="detalle-label">Taller</span><span class="detalle-val">${c.taller}</span>` : ''}
          ${c.comentario ? `<span class="detalle-label">Pendiente</span><span class="detalle-val comment">${c.comentario}</span>` : ''}
        </div>
        <textarea class="nota" onclick="event.stopPropagation()" placeholder="Notas, ideas, observaciones..." onchange="setNota(${c.n},this.value)">${nota}</textarea>
        <div class="links-section" onclick="event.stopPropagation()">
          <p class="links-section-label">📚 Bibliografía</p>
          <textarea class="nota" style="min-height:56px;font-size:14px;background:#f8f8f8;" onclick="event.stopPropagation()" placeholder="Ej: Cap. 2 — Procesos de negocio, Pérez (2023)&#10;Ej: Apunte Unidad 1 — cátedra" onchange="setBiblio(${c.n},this.value)">${biblio}</textarea>
        </div>
        <div class="links-section" onclick="event.stopPropagation()">
          <p class="links-section-label">Links y material</p>
          <div class="links-list" id="links-clase-${c.n}">${renderLinksList('clase', c.n)}</div>
          <div class="add-link-row">
            <input class="inp-link" id="lurl-${c.n}" placeholder="https://..." style="flex:2;min-width:160px;" />
            <input class="inp-link" id="llbl-${c.n}" placeholder="Nombre del link" style="flex:1;min-width:100px;" />
            <button class="btn-xs" onclick="addLink('clase',${c.n})">+ Agregar</button>
          </div>
        </div>
        <div class="detalle-actions" style="margin-top:10px;">
          <button class="btn-sm" onclick="event.stopPropagation();toggleMoodle(${c.n})">${(moodleData[c.n]||false)?'✓ Moodle ok':'📚 Marcar Moodle ok'}</button>
        </div>
      </div>` : ''}
    </div>`;
  }).join('');
}

function renderLinksList(scope, key) {
  const store = scope === 'clase' ? claseLinks : evalLinks;
  const links = store[key] || [];
  if(!links.length) return '';
  return links.map((l,i) => `
    <div class="link-row">
      <span>🔗</span>
      <a class="link-anchor" href="${l.url}" target="_blank" title="${l.url}">${l.label || l.url}</a>
      <button class="btn-xs remove" onclick="removeLink('${scope}','${key}',${i})" title="Eliminar">✕</button>
    </div>`).join('');
}

function addLink(scope, key) {
  const urlId = scope === 'clase' ? `lurl-${key}` : `lurl-eval-${key}`;
  const lblId = scope === 'clase' ? `llbl-${key}` : `llbl-eval-${key}`;
  const urlEl = document.getElementById(urlId);
  const lblEl = document.getElementById(lblId);
  if(!urlEl) return;
  let url = urlEl.value.trim();
  if(!url) return;
  if(!/^https?:\/\//i.test(url)) url = 'https://' + url;
  const label = lblEl ? lblEl.value.trim() : '';
  const store = scope === 'clase' ? claseLinks : evalLinks;
  if(!store[key]) store[key] = [];
  store[key].push({url, label});
  urlEl.value = ''; if(lblEl) lblEl.value = '';
  persist();
  const listEl = document.getElementById(`links-${scope}-${key}`);
  if(listEl) listEl.innerHTML = renderLinksList(scope, key);
}

function removeLink(scope, key, idx) {
  const store = scope === 'clase' ? claseLinks : evalLinks;
  if(!store[key]) return;
  store[key].splice(idx, 1);
  persist();
  const listEl = document.getElementById(`links-${scope}-${key}`);
  if(listEl) listEl.innerHTML = renderLinksList(scope, key);
}

function toggleCard(n) { expanded = expanded === n ? null : n; renderClases(); }
function setEstado(n, v) { estados[n] = v; persist(); renderMetrics(); renderClases(); }
function setNota(n, v) { notas[n] = v; persist(); }
function setBiblio(n, v) { claseBiblio[n] = v; persist(); }
function toggleMoodle(n) { moodleData[n] = !moodleData[n]; persist(); renderClases(); }

// --- Evaluaciones ---
function renderEval() {
  document.getElementById('lista-eval').innerHTML = EVALUACIONES.map(ev => {
    const checks = evalData[ev.id] || {};
    const nota = evalNotas[ev.id] || '';
    const badgeCls = ev.tipo==='parcial'?'badge-parcial':ev.tipo==='recu'?'badge-recu':'badge-exposicion';
    const completadas = ev.checks.filter((_,i) => checks[i]).length;
    return `<div class="eval-card">
      <div class="eval-top">
        <div>
          <div class="eval-nombre">${ev.nombre}</div>
          <div class="eval-fecha">${ev.fecha} · ${completadas}/${ev.checks.length} completados</div>
        </div>
        <span class="badge ${badgeCls}">${ev.tipo==='parcial'?'Parcial':ev.tipo==='recu'?'Recuperatorio':'Exposición'}</span>
      </div>
      <div class="checklist">
        ${ev.checks.map((ch,i) => `
          <label class="check-row${checks[i]?' done':''}">
            <input type="checkbox" ${checks[i]?'checked':''} onchange="setCheck('${ev.id}',${i},this.checked)"> ${ch}
          </label>`).join('')}
      </div>
      <div class="links-section" style="margin-top:10px;">
        <p class="links-section-label">Links y material</p>
        <div class="links-list" id="links-eval-${ev.id}">${renderLinksList('eval', ev.id)}</div>
        <div class="add-link-row">
          <input class="inp-link" id="lurl-eval-${ev.id}" placeholder="https://..." style="flex:2;min-width:160px;" />
          <input class="inp-link" id="llbl-eval-${ev.id}" placeholder="Nombre del link" style="flex:1;min-width:100px;" />
          <button class="btn-xs" onclick="addLink('eval','${ev.id}')">+ Agregar</button>
        </div>
      </div>
      <textarea class="eval-note" placeholder="Notas, criterios de corrección, observaciones..." onchange="setEvalNota('${ev.id}',this.value)">${nota}</textarea>
    </div>`;
  }).join('');
}

function setCheck(evId, idx, val) {
  if(!evalData[evId]) evalData[evId] = {};
  evalData[evId][idx] = val;
  persist(); renderEval();
}
function setEvalNota(evId, val) { evalNotas[evId] = val; persist(); }

// --- Grupos ---
function renderGrupos() {
  const container = document.getElementById('lista-grupos');
  if(!grupos.length) { container.innerHTML = '<div class="empty">Todavía no hay grupos. Agregalos abajo.</div>'; return; }
  container.innerHTML = grupos.map((g,i) => `
    <div class="grupo-card">
      <div class="grupo-top">
        <span class="grupo-nombre">${g.nombre}</span>
        <div class="avance-wrap">
          <div class="avance-bar"><div class="avance-fill" id="af-${i}" style="width:${g.avance||0}%"></div></div>
          <span class="avance-pct" id="ap-${i}">${g.avance||0}%</span>
          <input type="range" min="0" max="100" step="5" value="${g.avance||0}" style="width:80px;" oninput="setAvance(${i},this.value)">
        </div>
        <button class="btn-danger" onclick="eliminarGrupo(${i})">✕</button>
      </div>
      ${g.integrantes ? `<div class="grupo-integrantes">👤 ${g.integrantes}</div>` : ''}
      <textarea class="nota" style="font-size:12px;" placeholder="Notas del grupo, observaciones, entregas..." onchange="setNotaGrupo(${i},this.value)">${g.notas||''}</textarea>
    </div>
  `).join('');
}

function agregarGrupo() {
  const nombre = document.getElementById('inp-grupo').value.trim();
  if(!nombre) return;
  const integrantes = document.getElementById('inp-integrantes').value.trim();
  grupos.push({nombre, integrantes, avance:0, notas:''});
  document.getElementById('inp-grupo').value = '';
  document.getElementById('inp-integrantes').value = '';
  persist(); renderGrupos();
}
function eliminarGrupo(i) {
  if(!confirm('¿Eliminar este grupo?')) return;
  grupos.splice(i,1); persist(); renderGrupos();
}
function setAvance(i,v) {
  grupos[i].avance = Math.round(v);
  document.getElementById('af-'+i).style.width = v+'%';
  document.getElementById('ap-'+i).textContent = Math.round(v)+'%';
  persist();
}
function setNotaGrupo(i,v) { grupos[i].notas = v; persist(); }

// --- Hitos caso de estudio ---
function renderHitos() {
  document.getElementById('lista-hitos').innerHTML = hitos.map((h,i) => `
    <div class="hito-card">
      <div class="hito-top">
        <input type="checkbox" ${h.done?'checked':''} onchange="setHitoDone(${i},this.checked)" style="width:16px;height:16px;accent-color:var(--accent);">
        <span class="hito-nombre" style="${h.done?'text-decoration:line-through;color:var(--text3)':''}">
          ${h.nombre}
        </span>
        <span class="hito-fecha">${h.fecha}</span>
        <button class="btn-danger" onclick="eliminarHito(${i})">✕</button>
      </div>
      <textarea class="nota" style="font-size:12px;" placeholder="Notas..." onchange="setHitaNota(${i},this.value)">${h.nota||''}</textarea>
    </div>
  `).join('');
}

function agregarHito() {
  const nombre = document.getElementById('inp-hito').value.trim();
  if(!nombre) return;
  const fecha = document.getElementById('inp-hito-fecha').value.trim() || '';
  hitos.push({nombre, fecha, done:false, nota:''});
  document.getElementById('inp-hito').value = '';
  document.getElementById('inp-hito-fecha').value = '';
  persist(); renderHitos();
}
function setHitoDone(i,v) { hitos[i].done = v; persist(); renderHitos(); }
function setHitaNota(i,v) { hitos[i].nota = v; persist(); }
function eliminarHito(i) { hitos.splice(i,1); persist(); renderHitos(); }
function saveNotaCaso() { notaCaso = document.getElementById('nota-caso').value; persist(); }

// ============ CAJÓN DE ENTRADA ============
function updateCajonSecciones() {
  const materia = document.getElementById('cajon-materia').value;
  const secEl = document.getElementById('cajon-seccion');
  const catEl = document.getElementById('cajon-categoria');
  secEl.innerHTML = '<option value="">Sección...</option>';
  catEl.innerHTML = '<option value="">Categoría...</option>';

  if(materia === 'pnb') {
    [['cronograma','Cronograma'],['evaluaciones','Evaluaciones'],['grupos','Grupos'],['caso','Caso de estudio'],['general','General']].forEach(([v,l]) => {
      secEl.innerHTML += `<option value="${v}">${l}</option>`;
    });
    catEl.style.display = 'none';
  } else if(materia === 'tisi') {
    [['g1','Grupo 1'],['g2','Grupo 2'],['clases','Mejora de clases'],['estrategia','Estrategia']].forEach(([v,l]) => {
      secEl.innerHTML += `<option value="${v}">${l}</option>`;
    });
    catEl.style.display = '';
    [['notas','📝 Nota'],['pendientes','✅ Pendiente'],['ideas','💡 Idea']].forEach(([v,l]) => {
      catEl.innerHTML += `<option value="${v}">${l}</option>`;
    });
  } else {
    catEl.style.display = 'none';
  }
}

function guardarEnCajon() {
  const texto = document.getElementById('cajon-texto').value.trim();
  if(!texto) return;
  const materia = document.getElementById('cajon-materia').value;
  const seccion = document.getElementById('cajon-seccion').value;
  const cat = document.getElementById('cajon-categoria').value;

  const item = { texto, materia: materia||'', seccion: seccion||'', categoria: cat||'', fecha: new Date().toLocaleDateString('es-AR') };

  // Si está bien clasificado para TISI grupos, lo mandamos directo
  if(materia === 'tisi' && (seccion === 'g1' || seccion === 'g2') && cat) {
    if(!tisiEntradas[seccion]) tisiEntradas[seccion] = [];
    tisiEntradas[seccion].push({ texto, categoria: cat, fecha: item.fecha });
    persist();
  } else if(materia === 'tisi' && seccion === 'clases' && texto) {
    tisiReflexiones.unshift({ titulo: texto.slice(0,60), body: '', tipo: 'reflexion', fecha: item.fecha });
    persist();
  } else if(materia === 'tisi' && seccion === 'estrategia' && texto) {
    tisiEstrategia.unshift({ titulo: texto.slice(0,60), body: '', tipo: 'actual', fecha: item.fecha });
    persist();
  } else if(materia === 'pnb' && seccion && seccion !== '') {
    pnbCajonNotas.unshift({ texto, seccion, categoria: cat||'', fecha: item.fecha });
    persist();
    renderPnbCajonNotas();
  } else {
    cajonItems.unshift(item);
    persist();
  }

  document.getElementById('cajon-texto').value = '';
  renderCajonSinClasificar();
  renderRecordatoriosGlobal();
}

function renderPnbCajonNotas() {
  const secNames = {cronograma:'Cronograma', evaluaciones:'Evaluaciones', grupos:'Grupos', caso:'Caso de estudio', general:'General'};
  ['cronograma','evaluaciones','grupos','caso','general'].forEach(sec => {
    const el = document.getElementById('pnb-cajon-' + sec);
    if(!el) return;
    const items = pnbCajonNotas.filter(n => n.seccion === sec);
    if(!items.length) { el.innerHTML = ''; el.style.display='none'; return; }
    el.style.display = '';
    el.innerHTML = `<div style="margin-top:20px;border-top:2px solid var(--border);padding-top:16px;">
      <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text3);margin-bottom:10px;">📥 Ideas del cajón</div>
      ${items.map((n,i) => `<div style="background:var(--amber-light);border:2px solid var(--amber-border);border-radius:var(--radius-sm);padding:10px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div>
          <div style="font-size:14px;color:var(--text);white-space:pre-wrap;">${n.texto}</div>
          <div style="font-size:11px;color:var(--amber);font-weight:600;margin-top:4px;">${n.categoria||''} · ${n.fecha||''}</div>
        </div>
        <button onclick="eliminarPnbCajonNota('${sec}',${pnbCajonNotas.indexOf(n)})" style="background:none;border:none;cursor:pointer;font-size:16px;color:var(--text3);padding:0 4px;" title="Eliminar">✕</button>
      </div>`).join('')}
    </div>`;
  });
}

function eliminarPnbCajonNota(sec, i) {
  pnbCajonNotas.splice(i, 1);
  persist();
  renderPnbCajonNotas();
}

function renderCajonSinClasificar() {
  const sinClasificar = cajonItems.filter(i => !i.materia || !i.seccion);
  const wrap = document.getElementById('cajon-sin-clasificar-wrap');
  const lista = document.getElementById('cajon-sin-clasificar');
  const count = document.getElementById('cajon-count');
  const countSC = document.getElementById('sin-clasificar-count');

  if(sinClasificar.length > 0) {
    if(count) { count.textContent = sinClasificar.length; count.style.display=''; }
    if(wrap) wrap.style.display = '';
    if(countSC) countSC.textContent = sinClasificar.length;
  } else {
    if(count) count.style.display='none';
    if(wrap) wrap.style.display='none';
  }

  if(!lista) return;
  lista.innerHTML = cajonItems.map((it, i) => `
    <div class="cajon-item">
      <div class="cajon-item-text">${it.texto}</div>
      <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end;">
        <span class="cajon-item-meta">${it.materia ? it.materia.toUpperCase() + (it.seccion ? ' · '+it.seccion : '') : '⚠️ sin clasificar'}</span>
        <span style="font-size:11px;color:var(--text3);">${it.fecha||''}</span>
        <button class="btn-xs remove" onclick="eliminarCajonItem(${i})" style="font-size:11px;padding:2px 6px;">✕</button>
      </div>
    </div>`).join('') || '<div class="empty" style="padding:20px;font-size:14px;">El cajón está vacío 🎉</div>';
}

function eliminarCajonItem(i) { cajonItems.splice(i,1); persist(); renderCajonSinClasificar(); }

// ============ RECORDATORIOS ============
function agregarRecordatorio() {
  const texto = document.getElementById('inp-rec-texto').value.trim();
  const fecha = document.getElementById('inp-rec-fecha').value;
  const materia = document.getElementById('inp-rec-materia').value;
  if(!texto) return;
  recordatorios.push({ texto, fecha, materia, done: false });
  recordatorios.sort((a,b) => (a.fecha||'9999') > (b.fecha||'9999') ? 1 : -1);
  document.getElementById('inp-rec-texto').value = '';
  document.getElementById('inp-rec-fecha').value = '';
  persist(); renderRecordatoriosGlobal();
}

function toggleRecordatorio(i) { recordatorios[i].done = !recordatorios[i].done; persist(); renderRecordatoriosGlobal(); }
function eliminarRecordatorio(i) { recordatorios.splice(i,1); persist(); renderRecordatoriosGlobal(); }

function renderRecordatoriosGlobal() {
  const el = document.getElementById('recordatorios-lista-global');
  if(!el) return;
  const hoy = new Date().toISOString().slice(0,10);
  const activos = recordatorios.filter(r => !r.done);
  if(!activos.length) { el.innerHTML = '<div style="font-size:14px;color:var(--text3);padding:10px 0;">No hay recordatorios pendientes.</div>'; return; }
  el.innerHTML = activos.map((r,i) => {
    const idx = recordatorios.indexOf(r);
    const vencido = r.fecha && r.fecha < hoy;
    return `<div class="recordatorio-item${vencido?' vencido':''}">
      <span class="rec-fecha">${r.fecha ? formatFecha(r.fecha) : 'Sin fecha'}</span>
      <span class="rec-texto">${r.texto}</span>
      <span class="rec-materia">${r.materia.toUpperCase()}</span>
      <button class="btn-xs" onclick="toggleRecordatorio(${idx})" title="Marcar como hecho" style="font-size:11px;padding:3px 8px;">✓</button>
      <button class="btn-xs remove" onclick="eliminarRecordatorio(${idx})" style="font-size:11px;padding:3px 6px;">✕</button>
    </div>`;
  }).join('');
}

function formatFecha(iso) {
  if(!iso) return '';
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ============ VISTA GLOBAL ============
function renderGlobal() {
  renderCajonSinClasificar();
  renderRecordatoriosGlobal();
}

// ============ TISI — GRUPOS ============
function switchTisiGrupo(g, btn) {
  document.querySelectorAll('.tisi-grupo-tab').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');

  const esRubrica = g === 'rubrica';
  document.getElementById('tisi-rubrica-panel').style.display = esRubrica ? '' : 'none';

  // Mostrar/ocultar contenido de grupos
  const grupoContent = document.querySelectorAll('#sec-tisi-grupos > *:not(.tisi-grupo-tabs):not(#tisi-rubrica-panel)');
  grupoContent.forEach(el => el.style.display = esRubrica ? 'none' : '');

  if(!esRubrica) {
    tisiGrupoActivo = g;
    tisiCatActiva = 'todas';
    document.querySelectorAll('.tisi-cat-btn').forEach(b => { b.classList.remove('active'); if(b.textContent.trim()==='Todas') b.classList.add('active'); });
    renderTisiGrupos();
  } else {
    renderRubrica();
  }
}

// ============ RÚBRICA DEL PROYECTO ============
function switchRubricaGrupo(g, btn) {
  rubricaGrupoActivo = g;
  document.querySelectorAll('#tisi-rubrica-panel .filter-btn').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  renderRubrica();
}

function setRubricaEstado(partId, itemId, estado) {
  const g = rubricaGrupoActivo;
  if(!tisiRubrica[g]) tisiRubrica[g] = {};
  if(!tisiRubrica[g][itemId]) tisiRubrica[g][itemId] = {estado:'', nota:''};
  tisiRubrica[g][itemId].estado = estado;
  persist();
  renderRubrica();
}

function setRubricaNota(itemId, val) {
  const g = rubricaGrupoActivo;
  if(!tisiRubrica[g]) tisiRubrica[g] = {};
  if(!tisiRubrica[g][itemId]) tisiRubrica[g][itemId] = {estado:'', nota:''};
  tisiRubrica[g][itemId].nota = val;
  persist();
}

function setRubricaNotaParte(partId, val) {
  const g = rubricaGrupoActivo;
  if(!tisiRubrica[g]) tisiRubrica[g] = {};
  tisiRubrica[g]['nota_'+partId] = val;
  persist();
}

function renderRubrica() {
  const g = rubricaGrupoActivo;
  const data = tisiRubrica[g] || {};
  const estadoIcon = { cumplido: '✓', parcial: '~', no: '✗', '': '—' };
  const estadoStyle = {
    cumplido: 'background:var(--accent-light);color:var(--accent);border-color:var(--accent-border)',
    parcial: 'background:var(--amber-light);color:var(--amber);border-color:var(--amber-border)',
    no: 'background:var(--red-light);color:var(--red);border-color:var(--red-border)',
    '': 'background:var(--surface2);color:var(--text3);border-color:var(--border)'
  };

  const el = document.getElementById('rubrica-content');
  el.innerHTML = RUBRICA_PARTES.map(parte => {
    const itemsHtml = parte.items.map(item => {
      const iData = data[item.id] || {estado:'', nota:''};
      const btns = ['cumplido','parcial','no'].map(e => {
        const active = iData.estado === e;
        return `<button onclick="setRubricaEstado('${parte.id}','${item.id}','${e}')" 
          style="padding:4px 12px;border-radius:20px;border:2px solid;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.12s;${active ? estadoStyle[e] : 'background:var(--surface2);color:var(--text3);border-color:var(--border);'}"
          title="${e==='cumplido'?'Cumplido':e==='parcial'?'Parcial':'No cumplido'}">${estadoIcon[e]} ${e==='cumplido'?'Cumplido':e==='parcial'?'Parcial':'No cumplido'}</button>`;
      }).join('');
      return `<div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:8px;">
        <div style="font-size:14px;font-weight:500;color:var(--text);">${item.label}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
          ${btns}
        </div>
        <input type="text" value="${iData.nota||''}" placeholder="Observación sobre este ítem (opcional)..."
          onchange="setRubricaNota('${item.id}',this.value)"
          style="font-size:13px;padding:6px 10px;border:1.5px solid var(--border);border-radius:6px;background:var(--surface);color:var(--text);font-family:inherit;width:100%;">
      </div>`;
    }).join('');

    const notaParte = data['nota_'+parte.id] || '';
    return `<div style="background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);margin-bottom:14px;overflow:hidden;">
      <div style="background:var(--surface2);padding:12px 16px;border-bottom:2px solid var(--border);">
        <div style="font-size:15px;font-weight:700;color:var(--text);">${parte.titulo}</div>
      </div>
      ${itemsHtml}
      <div style="padding:12px 16px;">
        <label style="font-size:12px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:6px;">Notas generales de esta parte</label>
        <textarea onchange="setRubricaNotaParte('${parte.id}',this.value)" 
          style="width:100%;min-height:60px;font-size:13px;padding:8px 10px;border:1.5px solid var(--border);border-radius:6px;background:var(--surface2);color:var(--text);font-family:inherit;resize:vertical;"
          placeholder="Observaciones generales sobre esta parte del proyecto...">${notaParte}</textarea>
      </div>
    </div>`;
  }).join('');
}


function switchTisiCat(cat, btn) {
  tisiCatActiva = cat;
  document.querySelectorAll('.tisi-cat-btn').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  renderTisiEntradas();
}

function renderTisiGrupos() {
  const g = tisiGrupoActivo;
  // Links
  const linksEl = document.getElementById('tisi-links-lista');
  if(linksEl) {
    const links = tisiLinks[g] || [];
    linksEl.innerHTML = links.map((l,i) => `
      <div class="link-row">
        <span>🔗</span>
        <a class="link-anchor" href="${l.url}" target="_blank">${l.label||l.url}</a>
        <button class="btn-xs remove" onclick="tisiRemoveLink(${i})">✕</button>
      </div>`).join('') || '';
  }
  // Puntuación
  const p = tisiPuntuacion[g] || {};
  const fEl = document.getElementById('tisi-nota-formal');
  const cEl = document.getElementById('tisi-nota-cualitativa');
  if(fEl) fEl.value = p.formal || '';
  if(cEl) cEl.value = p.cualitativa || '';
  // Entradas
  renderTisiEntradas();
}

function tisiAddLink() {
  const url = document.getElementById('tisi-lurl').value.trim();
  const label = document.getElementById('tisi-llbl').value.trim();
  if(!url) return;
  if(!tisiLinks[tisiGrupoActivo]) tisiLinks[tisiGrupoActivo] = [];
  tisiLinks[tisiGrupoActivo].push({ url: /^https?:\/\//i.test(url)?url:'https://'+url, label });
  document.getElementById('tisi-lurl').value = '';
  document.getElementById('tisi-llbl').value = '';
  persist(); renderTisiGrupos();
}

function tisiRemoveLink(i) { tisiLinks[tisiGrupoActivo].splice(i,1); persist(); renderTisiGrupos(); }

function saveTisiPuntuacion() {
  const g = tisiGrupoActivo;
  if(!tisiPuntuacion[g]) tisiPuntuacion[g] = {};
  tisiPuntuacion[g].formal = document.getElementById('tisi-nota-formal').value;
  tisiPuntuacion[g].cualitativa = document.getElementById('tisi-nota-cualitativa').value;
  persist();
}

function agregarTisiEntrada() {
  const texto = document.getElementById('tisi-nueva-entrada').value.trim();
  const cat = document.getElementById('tisi-nueva-cat').value;
  const fecha = document.getElementById('tisi-nueva-fecha').value;
  if(!texto) return;
  const g = tisiGrupoActivo;
  if(!tisiEntradas[g]) tisiEntradas[g] = [];
  tisiEntradas[g].unshift({ texto, categoria: cat, fecha: fecha || new Date().toLocaleDateString('es-AR'), done: false });
  document.getElementById('tisi-nueva-entrada').value = '';
  document.getElementById('tisi-nueva-fecha').value = '';
  persist(); renderTisiEntradas();
}

function toggleTisiEntrada(i) {
  const g = tisiGrupoActivo;
  tisiEntradas[g][i].done = !tisiEntradas[g][i].done;
  persist(); renderTisiEntradas();
}

function eliminarTisiEntrada(i) { tisiEntradas[tisiGrupoActivo].splice(i,1); persist(); renderTisiEntradas(); }

function renderTisiEntradas() {
  const el = document.getElementById('tisi-entradas-lista');
  if(!el) return;
  const g = tisiGrupoActivo;
  const todas = tisiEntradas[g] || [];
  const filtradas = tisiCatActiva === 'todas' ? todas : todas.filter(e => e.categoria === tisiCatActiva);
  if(!filtradas.length) { el.innerHTML = '<div class="empty" style="padding:20px;font-size:14px;">No hay entradas aquí todavía.</div>'; return; }
  el.innerHTML = filtradas.map((e) => {
    const realIdx = todas.indexOf(e);
    const catClass = `tisi-cat-${e.categoria}`;
    const catLabel = {notas:'📝 Nota', pendientes:'✅ Pendiente', ideas:'💡 Idea'}[e.categoria] || e.categoria;
    return `<div class="tisi-entry-card${e.done?' ' : ''}">
      <div class="tisi-entry-top">
        ${e.categoria==='pendientes' ? `<input type="checkbox" ${e.done?'checked':''} onchange="toggleTisiEntrada(${realIdx})" style="width:16px;height:16px;accent-color:var(--accent);margin-top:3px;flex-shrink:0;">` : ''}
        <span class="tisi-entry-text" style="${e.done?'color:var(--text3);text-decoration:line-through;':''}">${e.texto}</span>
        <span class="tisi-cat-tag ${catClass}">${catLabel}</span>
        <button class="btn-xs remove" onclick="eliminarTisiEntrada(${realIdx})" style="font-size:11px;padding:3px 6px;flex-shrink:0;">✕</button>
      </div>
      <div class="tisi-entry-meta">${e.fecha||''}</div>
    </div>`;
  }).join('');
}

// ============ TISI — REFLEXIONES ============
function agregarReflexion() {
  const titulo = document.getElementById('tisi-ref-titulo').value.trim();
  const body = document.getElementById('tisi-ref-body').value.trim();
  const tipo = document.getElementById('tisi-ref-tipo').value;
  if(!titulo && !body) return;
  tisiReflexiones.unshift({ titulo: titulo||body.slice(0,60), body, tipo, fecha: new Date().toLocaleDateString('es-AR') });
  document.getElementById('tisi-ref-titulo').value = '';
  document.getElementById('tisi-ref-body').value = '';
  persist(); renderReflexiones();
}

function eliminarReflexion(i) { tisiReflexiones.splice(i,1); persist(); renderReflexiones(); }

function renderReflexiones() {
  const el = document.getElementById('tisi-reflexiones-lista');
  if(!el) return;
  if(!tisiReflexiones.length) { el.innerHTML = '<div class="empty">Todavía no hay reflexiones guardadas.</div>'; return; }
  const tipoLabel = { reflexion:'💭 Reflexión', mejora:'✨ Mejora', ejemplo:'🔗 Ejemplo/Material' };
  const tipoBadge = { reflexion:'badge-sf', mejora:'badge-taller', ejemplo:'badge-exposicion' };
  el.innerHTML = tisiReflexiones.map((r,i) => `
    <div class="reflexion-card">
      <div class="reflexion-top">
        <span class="reflexion-titulo">${r.titulo}</span>
        <div style="display:flex;gap:8px;align-items:center;">
          <span class="badge ${tipoBadge[r.tipo]||'badge-sf'}">${tipoLabel[r.tipo]||r.tipo}</span>
          <span class="reflexion-fecha">${r.fecha||''}</span>
          <button class="btn-xs remove" onclick="eliminarReflexion(${i})" style="font-size:11px;padding:3px 6px;">✕</button>
        </div>
      </div>
      ${r.body ? `<div class="reflexion-body">${r.body}</div>` : ''}
    </div>`).join('');
}

// ============ TISI — ESTRATEGIA ============
function switchEstrategiaCat(cat, btn) {
  tisiEstrategiaCat = cat;
  document.querySelectorAll('#sec-tisi-estrategia .tisi-cat-btn').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  renderEstrategia();
}

function agregarEstrategia() {
  const titulo = document.getElementById('tisi-est-titulo').value.trim();
  const body = document.getElementById('tisi-est-body').value.trim();
  const tipo = document.getElementById('tisi-est-tipo').value;
  if(!titulo && !body) return;
  tisiEstrategia.unshift({ titulo: titulo||body.slice(0,60), body, tipo, fecha: new Date().toLocaleDateString('es-AR') });
  document.getElementById('tisi-est-titulo').value = '';
  document.getElementById('tisi-est-body').value = '';
  persist(); renderEstrategia();
}

function eliminarEstrategia(i) { tisiEstrategia.splice(i,1); persist(); renderEstrategia(); }

function renderEstrategia() {
  const el = document.getElementById('tisi-estrategia-lista');
  if(!el) return;
  const filtradas = tisiEstrategiaCat === 'todas' ? tisiEstrategia : tisiEstrategia.filter(e => e.tipo === tisiEstrategiaCat);
  if(!filtradas.length) { el.innerHTML = '<div class="empty">Todavía no hay ideas guardadas.</div>'; return; }
  const tipoLabel = { actual:'📌 Cursada actual', siguiente:'🔮 Año siguiente' };
  const tipoBadge = { actual:'badge-taller', siguiente:'badge-recu' };
  el.innerHTML = filtradas.map((e) => {
    const realIdx = tisiEstrategia.indexOf(e);
    return `<div class="reflexion-card">
      <div class="reflexion-top">
        <span class="reflexion-titulo">${e.titulo}</span>
        <div style="display:flex;gap:8px;align-items:center;">
          <span class="badge ${tipoBadge[e.tipo]||'badge-sf'}">${tipoLabel[e.tipo]||e.tipo}</span>
          <span class="reflexion-fecha">${e.fecha||''}</span>
          <button class="btn-xs remove" onclick="eliminarEstrategia(${realIdx})" style="font-size:11px;padding:3px 6px;">✕</button>
        </div>
      </div>
      ${e.body ? `<div class="reflexion-body">${e.body}</div>` : ''}
    </div>`;
  }).join('');
}

// ============ EXPORT / IMPORT (actualizado) ============
function renderMoodle() {
  const container = document.getElementById('lista-moodle');
  const activas = CLASES.filter(c => !['sf','feriado','teoria'].includes(c.tipo));
  container.innerHTML = `
    <p style="font-size:13px;color:var(--text2);margin-bottom:16px;">Marcá las clases donde ya subiste el material a Moodle.</p>
    ${activas.map(c => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">
        <input type="checkbox" ${moodleData[c.n]?'checked':''} onchange="toggleMoodle(${c.n})" style="width:16px;height:16px;accent-color:var(--accent);">
        <span style="font-size:12px;color:var(--text3);min-width:90px;">${c.fecha}</span>
        <span style="font-size:13px;${moodleData[c.n]?'color:var(--text3);text-decoration:line-through;':''}">${(c.practica||c.taller||c.teoria||'—').slice(0,70)}</span>
      </div>
    `).join('')}
  `;
}

function exportarDatos() {
  const datos = getLocalSnapshot();
  const blob = new Blob([JSON.stringify(datos, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'PlanificadorDocente_backup_' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
}

function importarDatos(event) {
  const file = event.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const datos = JSON.parse(e.target.result);
      if(!datos.version) { alert('Archivo no válido.'); return; }
      if(!confirm('¿Importar datos? Esto reemplazará todo lo que tenés guardado actualmente.')) return;
      importRemoteData(datos);
      // Si hay conexión, subir también a la nube
      if(window._fbSave) {
        setSyncing('Subiendo datos importados a la nube...');
        await window._fbSave(getLocalSnapshot());
        setSyncOk('☁ Datos importados y sincronizados ✓');
      }
      alert('✓ Datos importados correctamente.');
    } catch(err) {
      alert('Error al leer el archivo. Verificá que sea un backup válido.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// Init
renderAlertas();
renderClases();
renderEval();
renderGrupos();
renderGlobal();
// Inicializar select de cajón
updateCajonSecciones();
renderPnbCajonNotas();
document.getElementById('cajon-categoria').style.display = 'none';
