// ==========================================
// CONFIGURAÇÃO E DADOS INICIAIS DO CONSERTAÍ
// ==========================================
const $ = s => document.querySelector(s);
const E = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

let S;
try {
  S = JSON.parse(localStorage.getItem('cs'));
} catch (e) {}

S = S || {
  reqs: [],
  provs: [],
  me: 'p1',
  user: { n: 'Mariana R.', tel: '(11) 98765-4321', logado: true },
  logs: []
};
if (!S.user) S.user = { n: 'Mariana R.', tel: '(11) 98765-4321', logado: true };

const save = () => {
  try {
    localStorage.setItem('cs', JSON.stringify(S));
  } catch (e) {}
};

function logEvent(action, details = {}) {
  const entry = {
    timestamp: new Date().toLocaleTimeString('pt-BR'),
    data: new Date().toLocaleDateString('pt-BR'),
    action,
    details
  };
  S.logs = S.logs || [];
  S.logs.push(entry);
  save();
}

const all = () => {
  const overrides = (S && S.provOverrides) || {};
  return [...P0.map(p => overrides[p.id] ? { ...p, ...overrides[p.id] } : p), ...((S && S.provs) || [])];
};
const pv = id => all().find(p => p.id == id);
const rq = id => S.reqs.find(r => r.id == id);

// Filtro de prestadores respeitando o raio atual
const getProsInRadius = (cat = null) => {
  return all().filter(p => p.km <= currentRadiusKm && (!cat || p.cats.includes(cat)));
};

const R = n => 'R$ ' + Number(n).toFixed(2).replace('.', ',');
const calc = (p, pecasOpt) => {
  const m = p.base;
  let pe = 0;
  let peLabel = 'Cliente já possui materiais';

  if (pecasOpt === 'prest_simples' || pecasOpt === 'prest' || pecasOpt === true) {
    pe = 30;
    peLabel = 'Prestador compra: reparo básico (+R$ 30)';
  } else if (pecasOpt === 'prest_padrao') {
    pe = 75;
    peLabel = 'Prestador compra: reposição (+R$ 75)';
  } else if (pecasOpt === 'prest_orcamento') {
    pe = 0;
    peLabel = 'Prestador orça na visita (c/ nota fiscal)';
  }

  const d = Math.ceil(p.km) * 5; // R$ 5 por km arredondado
  return { m, pe, peLabel, d, t: m + pe + d };
};

const ini = n => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const av = (p, l) => p.foto
  ? `<img class="av ${l ? 'l' : ''}" src="${p.foto}" alt="${E(p.n)}" onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(p.n)}&background=1216B0&color=fff'">`
  : `<div class="av ${l ? 'l' : ''}">${E(ini(p.n))}</div>`;

const nt = p => p.av ? `⭐ <b>${p.nota}</b> (${p.av})` : '<span style="color:var(--brand-orange);font-weight:700">★ Novo</span>';
const st = s => {
  let cls = '';
  if (s == 'Confirmado' || s == 'Concluído') cls = 'ok';
  else if (s == 'Cancelado') cls = 'x';
  else if (s == 'Em análise') cls = 'alert';
  return `<span class="st ${cls}">${s}</span>`;
};

function getMinAgendaDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function setQuandoTipo(tipo) {
  F.quandoTipo = tipo;
  if (tipo === 'Hoje') {
    F.quando = 'Hoje (Urgente / Próximas horas)';
  } else if (tipo === 'Amanhã') {
    F.quando = 'Amanhã (Horário comercial)';
  } else {
    if (!F.agendaData) F.agendaData = getMinAgendaDate();
    updateAgendaText();
  }
  render();
}

function updateAgendaText() {
  if (F.agendaData) {
    const parts = F.agendaData.split('-');
    const formatted = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : F.agendaData;
    F.quando = `${formatted} (${F.agendaPeriodo || 'Manhã (08h às 12h)'})`;
  } else {
    F.quando = 'Agendar com o profissional';
  }
}

let v = 'home';
let H = [];
let C = {};
let F = {
  cat: 'Elétrica',
  desc: '',
  end: '',
  pecas: 'eu',
  quandoTipo: 'Hoje',
  quando: 'Hoje (Urgente / Próximas horas)',
  agendaData: '',
  agendaPeriodo: 'Manhã (08h às 12h)',
  searchQuery: ''
};
let K = { n: '', c: '', cats: ['Elétrica'], d: '', foto: '' };
let M = { mot: 'Serviço mais difícil', nv: '', just: '' };

let leafletMapInstance = null;
let radiusCircleInstance = null;

const LOGO_SVG = `
<div class="brand-header">
  <div class="brand-logo-row">
    <span class="brand-logo-text brand-blue">Consert</span>
    <span class="brand-logo-text brand-orange">a</span>
    <span class="brand-i-container">
      <svg class="brand-wrench-icon" viewBox="0 0 28 28" fill="none" stroke="#FF6E1A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 4a5 5 0 0 0-4.5 7.1L4.2 19.4a2 2 0 1 0 2.8 2.8l8.3-8.3A5 5 0 0 0 22.4 9.4l-3.2 3.2-2.8-.7-.7-2.8 3.2-3.2A4.9 4.9 0 0 0 17 4z"/>
        <circle cx="5.6" cy="20.8" r="0.8" fill="#FF6E1A"/>
      </svg>
      <span class="brand-logo-text brand-i-stem">ı</span>
    </span>
  </div>
  <span class="brand-slogan">A confiança que a sua casa precisa</span>
</div>
`;

function toast(msg) {
  const t = $('#toast');
  t.innerText = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

function showModal(title, htmlContent, onConfirm, confirmText = 'Entendi', isWide = false) {
  const root = $('#modal-root');
  root.innerHTML = `
    <div class="modal-backdrop" onclick="if(event.target===this)closeModal()">
      <div class="modal-sheet ${isWide ? 'wide' : ''}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
          <h2 style="font-size:18px;margin:0;color:var(--ink);">${title}</h2>
          <button onclick="closeModal()" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--m);line-height:1;padding:2px 6px;">✕</button>
        </div>
        <div>${htmlContent}</div>
        <div style="display:flex;gap:8px;margin-top:6px;">
          <button class="btn" style="flex:1" onclick="(${onConfirm ? onConfirm : 'closeModal'})()">${confirmText}</button>
        </div>
      </div>
    </div>
  `;
}
function closeModal() {
  $('#modal-root').innerHTML = '';
}

function showTrustModal() {
  logEvent('abriu_modal_selo_confianca');
  showModal(
    '🛡️ Selo de Confiança Consertaí',
    `
    <p style="margin-bottom:10px;font-size:13.5px;">Garantimos a paz de espírito para você receber profissionais em casa:</p>
    <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;color:var(--ink);">
      <div style="background:var(--muted-bg);padding:10px;border-radius:10px;">
        <b>1. Checagem de Antecedentes</b>
        <small>Certidões negativas da Polícia Civil e Federal analisadas antes da ativação.</small>
      </div>
      <div style="background:var(--muted-bg);padding:10px;border-radius:10px;">
        <b>2. Entrevista em Vídeo Individual</b>
        <small>Verificação presencial/remota feita pela equipe do Consertaí.</small>
      </div>
      <div style="background:var(--muted-bg);padding:10px;border-radius:10px;">
        <b>3. Preço Tabelado & Sem Surpresas</b>
        <small>O valor é calculado pelo app e o prestador não pode alterar sem sua aprovação.</small>
      </div>
    </div>
    `
  );
}

function openLoginModal() {
  const isLogged = S.user && S.user.logado;
  showModal(
    isLogged ? '👤 Sua Conta (Morador)' : '🔑 Entrar / Cadastrar',
    isLogged ? `
      <div style="background:var(--muted-bg);padding:12px;border-radius:12px;margin-bottom:10px;">
        <small style="color:var(--brand-blue);font-weight:700;">CONECTADO COMO MORADOR</small>
        <b style="font-size:16px;display:block;margin-top:2px;">${E(S.user.n)}</b>
        <small>${E(S.user.tel)} · Pinheiros / Jardins</small>
      </div>
      <p style="font-size:12.5px;color:var(--m);margin-bottom:12px;">
        Você pode solicitar serviços, verificar o mapa e acompanhar pedidos em tempo real.
      </p>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <button class="btn o" onclick="closeModal();go('pedidos')">Ver Meus Pedidos</button>
        <button class="btn subtle" style="color:var(--status-alert-text);" onclick="S.user={n:'',tel:'',logado:false};save();toast('Desconectado');closeModal();render()">Sair da Conta</button>
      </div>
    ` : `
      <label>Seu Nome Completo</label>
      <input class="in" id="login-name" placeholder="Ex.: Mariana Rodrigues" value="Mariana R.">
      <label>Seu WhatsApp ou E-mail</label>
      <input class="in" id="login-contact" placeholder="(11) 99999-9999" value="(11) 98765-4321">
      <div class="info-box" style="margin-top:8px;">
        ⓘ <b>MVP de Demonstração (USP SI):</b> Login instantâneo para testes, sem atrito ou necessidade de senha.
      </div>
      <div style="display:flex;gap:8px;margin-top:10px;">
        <button class="btn" onclick="doLogin()">Entrar como Morador</button>
      </div>
    `,
    null,
    'Fechar'
  );
}

function doLogin() {
  const name = ($('#login-name') ? $('#login-name').value : '').trim();
  const tel = ($('#login-contact') ? $('#login-contact').value : '').trim();
  S.user = { n: name || 'Mariana R.', tel: tel || '(11) 98765-4321', logado: true };
  save();
  logEvent('morador_fez_login', { nome: S.user.n });
  toast(`Conectado como ${S.user.n}!`);
  closeModal();
  render();
}

// ==========================================
// AVALIAÇÃO DE SERVIÇO (FLUXO DO CLIENTE)
// ==========================================
window._curRating = { rid: '', score: 5, tags: [] };

function openRatingModal(rid) {
  const r = rq(rid);
  if (!r) return;
  const p = pv(r.pid);
  window._curRating = { rid, score: 5, tags: [] };

  const content = `
    <div style="text-align:center;margin-bottom:12px;">
      ${p ? av(p, 1) : ''}
      <h3 style="margin-top:6px;font-size:16px;color:var(--ink);">${p ? E(p.n) : 'Profissional'}</h3>
      <small style="color:var(--brand-blue);font-weight:700;">${p ? E(p.t) : ''}</small>
      <div style="font-size:12px;color:var(--m);margin-top:4px;">Serviço concluído: <b>${E(r.svc.slice(0, 34))}</b></div>
    </div>

    <div style="text-align:center;background:var(--muted-bg);padding:12px;border-radius:12px;margin-bottom:12px;">
      <small style="font-weight:700;display:block;margin-bottom:4px;color:var(--ink);">Como você avalia o atendimento?</small>
      <div id="star-rating-box" style="font-size:32px;cursor:pointer;letter-spacing:4px;user-select:none;line-height:1;">
        <span onclick="setRatingScore(1)" id="star-1" style="color:#F59E0B;">★</span>
        <span onclick="setRatingScore(2)" id="star-2" style="color:#F59E0B;">★</span>
        <span onclick="setRatingScore(3)" id="star-3" style="color:#F59E0B;">★</span>
        <span onclick="setRatingScore(4)" id="star-4" style="color:#F59E0B;">★</span>
        <span onclick="setRatingScore(5)" id="star-5" style="color:#F59E0B;">★</span>
      </div>
      <small id="rating-score-label" style="font-weight:700;color:var(--brand-blue);font-size:12.5px;display:block;margin-top:4px;">5.0 — Excelente!</small>
    </div>

    <small style="font-weight:700;display:block;margin-bottom:6px;color:var(--ink);">O que mais se destacou?</small>
    <div class="row" w style="gap:6px;margin-bottom:12px;">
      ${['Pontualidade', 'Limpeza', 'Educação', 'Preço Justo', 'Rapidez', 'Acabamento Fino'].map(tag => `
        <button type="button" class="chip" id="rtag-${tag.replace(/\s+/g, '')}" onclick="toggleRatingTag('${tag}')">${tag}</button>
      `).join('')}
    </div>

    <label style="font-weight:700;">Deixe um depoimento para a Vitrine do prestador:</label>
    <textarea id="rating-comment" class="in" rows="3" placeholder="Ex.: O profissional chegou no horário combinado, resolveu tudo rapidamente e deixou o ambiente limpo. Recomendo muito!"></textarea>

    <div class="info-box" style="margin-top:8px;">
      🛡️ Sua avaliação será exibida publicamente na <b>Vitrine de Reputação</b> do profissional para fortalecer a confiança na vizinhança.
    </div>

    <div style="display:flex;gap:8px;margin-top:12px;">
      <button class="btn o" style="flex:1;" onclick="closeModal()">Cancelar</button>
      <button class="btn" style="flex:2;background:var(--brand-orange);" onclick="submitRating('${r.id}')">Enviar Avaliação</button>
    </div>
  `;
  showModal('Avaliar Atendimento', content, null, 'Fechar');
}

function setRatingScore(score) {
  window._curRating.score = score;
  const labels = {
    1: '1.0 — Muito insatisfeito',
    2: '2.0 — Abaixo do esperado',
    3: '3.0 — Regular / Aceitável',
    4: '4.0 — Bom atendimento',
    5: '5.0 — Excelente / Super recomendado!'
  };
  for (let i = 1; i <= 5; i++) {
    const el = $('#star-' + i);
    if (el) el.style.color = i <= score ? '#F59E0B' : '#D1D5DB';
  }
  const lbl = $('#rating-score-label');
  if (lbl) lbl.textContent = labels[score] || (score + '.0');
}

function toggleRatingTag(tag) {
  const id = 'rtag-' + tag.replace(/\s+/g, '');
  const el = $('#' + id);
  const idx = window._curRating.tags.indexOf(tag);
  if (idx > -1) {
    window._curRating.tags.splice(idx, 1);
    if (el) el.classList.remove('on');
  } else {
    window._curRating.tags.push(tag);
    if (el) el.classList.add('on');
  }
}

function submitRating(rid) {
  const r = rq(rid);
  if (!r) return closeModal();
  const score = (window._curRating && window._curRating.score) || 5;
  const tags = (window._curRating && window._curRating.tags) || [];
  const commentInput = $('#rating-comment');
  let comment = commentInput ? commentInput.value.trim() : '';
  if (!comment) {
    if (tags.length) {
      comment = `Destaques no atendimento: ${tags.join(', ')}. Profissional muito recomendado!`;
    } else {
      comment = score >= 4 ? 'Excelente atendimento, serviço de qualidade e pontualidade impecável.' : 'Serviço concluído conforme o combinado.';
    }
  }

  r.avaliado = true;
  r.nota_dada = score;
  r.comentario_dado = comment;
  r.tags_dadas = tags;

  const p = pv(r.pid);
  if (p) {
    const reviewerName = (S.user && S.user.logado && S.user.n) ? S.user.n : 'Morador do bairro';
    p.rev = p.rev || [];
    p.rev.unshift([reviewerName, score, comment, 'Hoje']);
    p.av = (p.av || 0) + 1;
    const sum = p.rev.reduce((acc, cur) => acc + (cur[1] || 5), 0);
    p.nota = parseFloat((sum / p.rev.length).toFixed(1));

    S.provOverrides = S.provOverrides || {};
    S.provOverrides[p.id] = { nota: p.nota, av: p.av, rev: p.rev };
  }

  save();
  logEvent('morador_avaliou_servico', { rid: r.id, pid: r.pid, nota: score, comentario: comment, tags });
  closeModal();
  toast('⭐ Avaliação registrada com sucesso! Obrigado pelo feedback.');
  render();
}

// ==========================================
// MODAL DE TODAS AS AVALIAÇÕES DO PRESTADOR
// ==========================================
function openAllReviewsModal(pid) {
  const p = pv(pid);
  if (!p) return;
  const revs = p.rev || [];
  
  const count5 = revs.filter(r => r[1] === 5).length;
  const count4 = revs.filter(r => r[1] === 4).length;
  const count3 = revs.filter(r => r[1] === 3).length;
  const total = revs.length || 1;

  const pct5 = Math.round((count5 / total) * 100);
  const pct4 = Math.round((count4 / total) * 100);
  const pct3 = Math.round((count3 / total) * 100);

  const content = `
    <div style="background:var(--muted-bg);padding:14px;border-radius:12px;margin-bottom:12px;">
      <div style="display:flex;align-items:center;gap:16px;">
        <div style="text-align:center;min-width:85px;">
          <div style="font-size:34px;font-weight:900;color:var(--ink);line-height:1;">${p.nota}</div>
          <div style="color:#F59E0B;font-size:14px;margin-top:2px;">★★★★★</div>
          <small style="color:var(--m);display:block;margin-top:2px;font-weight:600;">${p.av || revs.length} avaliações</small>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:5px;font-size:11.5px;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-weight:600;">5★</span>
            <div style="flex:1;background:#E2E8F0;height:7px;border-radius:4px;overflow:hidden;">
              <div style="background:#F59E0B;width:${pct5}%;height:100%;"></div>
            </div>
            <span style="min-width:32px;text-align:right;color:var(--m);">${pct5}%</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-weight:600;">4★</span>
            <div style="flex:1;background:#E2E8F0;height:7px;border-radius:4px;overflow:hidden;">
              <div style="background:#F59E0B;width:${pct4}%;height:100%;"></div>
            </div>
            <span style="min-width:32px;text-align:right;color:var(--m);">${pct4}%</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-weight:600;">3★</span>
            <div style="flex:1;background:#E2E8F0;height:7px;border-radius:4px;overflow:hidden;">
              <div style="background:#F59E0B;width:${pct3}%;height:100%;"></div>
            </div>
            <span style="min-width:32px;text-align:right;color:var(--m);">${pct3}%</span>
          </div>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:8px;max-height:340px;overflow-y:auto;padding-right:4px;">
      ${revs.map(r => `
        <div class="box" style="margin:0;padding:12px;">
          <div class="kv">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="width:26px;height:26px;border-radius:50%;background:var(--brand-blue-bg);color:var(--brand-blue);display:inline-flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:800;">
                ${E(r[0].slice(0, 2)).toUpperCase()}
              </span>
              <b>${E(r[0])}</b>
            </div>
            <div style="text-align:right;">
              <span style="color:#F59E0B;font-size:12.5px;font-weight:700;">${'★'.repeat(r[1])}${'☆'.repeat(5 - r[1])}</span>
              <small style="color:var(--m);display:block;font-size:10.5px;">${r[3] || 'verificado'}</small>
            </div>
          </div>
          <p style="color:var(--ink);font-size:12.5px;margin-top:6px;line-height:1.4;">“${E(r[2])}”</p>
        </div>
      `).join('')}
    </div>

    <div class="info-box" style="margin-top:10px;">
      🛡️ <b>Auditoria Consertaí:</b> 100% das avaliações são emitidas por moradores reais que concluíram e pagaram pelo serviço na plataforma.
    </div>
  `;
  showModal(`⭐ Avaliações — ${E(p.n)}`, content, null, 'Fechar', true);
}

// ==========================================
// LIGHTBOX DE FOTOS DO PORTFÓLIO
// ==========================================
function openPortfolioLightbox(pid, idx) {
  const p = pv(pid);
  if (!p || !p.portfolio || !p.portfolio[idx]) return;
  const item = p.portfolio[idx];
  const total = p.portfolio.length;

  const content = `
    <div style="text-align:center;">
      <div style="position:relative;border-radius:12px;overflow:hidden;background:#000;max-height:360px;">
        <img src="${item.url}" alt="${E(item.title)}" style="width:100%;max-height:360px;object-fit:cover;display:block;" onerror="this.src='https://placehold.co/600x400/1216B0/ffffff?text=Consertai+Servico'">
        <div style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.65);color:#fff;padding:4px 8px;border-radius:6px;font-size:11.5px;font-weight:700;">
          ${idx + 1} de ${total}
        </div>
      </div>
      <div style="margin-top:12px;text-align:left;">
        <b style="font-size:15px;color:var(--ink);display:block;">${E(item.title)}</b>
        <p style="font-size:13px;color:var(--m);margin-top:4px;line-height:1.4;">${E(item.desc || '')}</p>
        <div style="display:flex;align-items:center;gap:6px;margin-top:8px;">
          <span class="chip on" style="font-size:11px;padding:3px 8px;">✓ Obra Verificada</span>
          <small style="color:var(--brand-blue);font-weight:700;">Executado por ${E(p.n)}</small>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;gap:8px;margin-top:14px;">
        <button class="btn o" style="flex:1;" onclick="openPortfolioLightbox('${p.id}', ${(idx - 1 + total) % total})">◀ Anterior</button>
        <button class="btn o" style="flex:1;" onclick="openPortfolioLightbox('${p.id}', ${(idx + 1) % total})">Próxima ▶</button>
      </div>
    </div>
  `;
  showModal(`📸 Portfólio — ${E(p.n)}`, content, null, 'Fechar', true);
}

function simulateWhatsApp(wText) {
  logEvent('clicou_avisar_whatsapp', { CFG_whats: !!CFG.whats });
  if (CFG.whats) {
    window.open(`https://wa.me/${CFG.whats}?text=${wText}`, '_blank');
  } else {
    showModal(
      '💬 Simulação de Envio pelo WhatsApp',
      `
      <div class="info-box" style="margin-bottom:10px;">
        ⓘ <b>Demonstração do MVP:</b> No produto final, isso abre diretamente a conversa com o profissional.
      </div>
      <p style="font-size:12px;color:var(--m);margin-bottom:6px;">Mensagem gerada:</p>
      <div style="background:var(--muted-bg);padding:12px;border-radius:10px;font-size:13px;white-space:pre-wrap;font-family:monospace;">${decodeURIComponent(wText)}</div>
      `
    );
  }
}

function toggleScreenMode(mode) {
  const isDesktop = mode === 'desktop';
  document.body.classList.toggle('desktop-view', isDesktop);
  $('#btn-view-mobile').classList.toggle('active', !isDesktop);
  $('#btn-view-desktop').classList.toggle('active', isDesktop);
  toast(isDesktop ? 'Modo Desktop ativado' : 'Modo Celular ativado');
  render();
}

function switchRole(role) {
  if (role === 'morador') {
    go('home');
    toast('Modo Morador ativado');
  } else {
    go('painel');
    toast('Modo Prestador ativado');
  }
}
function updateRoleButtons() {
  const isPrestador = ['painel', 'nova', 'cont', 'rev', 'cad'].includes(v);
  const bm = $('#btn-role-morador');
  const bp = $('#btn-role-prestador');
  if (bm && bp) {
    bm.classList.toggle('active', !isPrestador);
    bp.classList.toggle('active', isPrestador);
  }
}

// ============================================================
// CONTROLES E CONFIGURAÇÃO DO MAPA REAL
// ============================================================
function setRadius(km) {
  currentRadiusKm = km;
  logEvent('alterou_raio_busca', { novo_raio: km });
  toast(`Raio expandido para ${km} km!`);
  render();
  setTimeout(() => {
    if (leafletMapInstance && radiusCircleInstance) {
      leafletMapInstance.fitBounds(radiusCircleInstance.getBounds(), { padding: [20, 20] });
    }
  }, 120);
}

function setMapStyle(style) {
  mapStyle = style;
  logEvent('alterou_estilo_mapa', { estilo: style });
  toast(`Estilo do mapa: ${MAP_STYLES[style].label}`);
  render();
}

function recenterMap() {
  if (!leafletMapInstance) return;
  leafletMapInstance.setView(USER_COORDS, 13, { animate: true });
  toast('📍 Centralizado na sua residência');
}

function mountRealMap(filterCategory = null) {
  setTimeout(() => {
    const el = document.getElementById('real-map-container');
    if (!el) return;

    if (leafletMapInstance) {
      leafletMapInstance.remove();
      leafletMapInstance = null;
    }

    const currentStyle = MAP_STYLES[mapStyle] || MAP_STYLES.clean;

    // Inicializa o mapa Leaflet
    leafletMapInstance = L.map('real-map-container', {
      zoomControl: false,
      attributionControl: false
    }).setView(USER_COORDS, currentRadiusKm > 8 ? 12 : 13);

    // Controle de zoom customizado no canto superior direito
    L.control.zoom({ position: 'topright' }).addTo(leafletMapInstance);

    // Camada Base Esri
    L.tileLayer(currentStyle.base, {
      maxNativeZoom: currentStyle.maxNative || 19,
      maxZoom: 19
    }).addTo(leafletMapInstance);

    // Camada de Referência/Rótulos (se houver para Clean Tech ou Satélite)
    if (currentStyle.ref) {
      L.tileLayer(currentStyle.ref, {
        maxNativeZoom: currentStyle.maxNative || 19,
        maxZoom: 19
      }).addTo(leafletMapInstance);
    }

    // Círculo Hiperlocal do Raio Atual
    radiusCircleInstance = L.circle(USER_COORDS, {
      radius: currentRadiusKm * 1000,
      color: '#1216B0',
      fillColor: '#1216B0',
      fillOpacity: 0.05,
      weight: 2,
      dashArray: '6, 6'
    }).addTo(leafletMapInstance);

    // Marcador da Casa do Usuário
    const homeIcon = L.divIcon({
      className: 'custom-leaflet-pin',
      html: '<div class="map-custom-marker user-home" title="Sua Casa">🏠</div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    L.marker(USER_COORDS, { icon: homeIcon }).addTo(leafletMapInstance)
      .bindPopup(`
        <div style="padding:4px;text-align:center;">
          <b style="color:var(--brand-orange);font-size:13px;">📍 Sua Residência</b>
          <p style="font-size:11.5px;color:var(--m);margin-top:2px;">Rua das Flores, 120 — Pinheiros</p>
          <span style="font-size:11px;color:var(--brand-blue);font-weight:700;">Raio ativo: ${currentRadiusKm} km</span>
        </div>
      `);

    // Marcadores dos Prestadores que estão dentro do Raio Selecionado
    const list = getProsInRadius(filterCategory);
    list.forEach(p => {
      const lat = p.lat || (USER_COORDS[0] + (Math.sin(p.km) * 0.02));
      const lng = p.lng || (USER_COORDS[1] + (Math.cos(p.km) * 0.02));

      const iconEmoji = p.cats.includes('Elétrica') ? '⚡' : p.cats.includes('Encanamento') ? '💧' : p.cats.includes('Limpeza') ? '✨' : p.cats.includes('Pintura') ? '🖌️' : '🔧';
      const proIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `<div class="map-custom-marker" title="${E(p.n)}">${iconEmoji}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const cost = calc(p, F.pecas);
      const marker = L.marker([lat, lng], { icon: proIcon }).addTo(leafletMapInstance);
      marker.bindPopup(`
        <div style="padding:6px;width:195px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
            <b style="font-size:13.5px;color:var(--ink);">${E(p.n)}</b>
            <span title="Verificado">🛡️</span>
          </div>
          <small style="color:var(--brand-blue);font-weight:700;">${E(p.t)}</small>
          <small style="margin:2px 0 4px;">⭐ ${p.nota || 'Novo'} · 📍 ${p.km} km de você</small>
          <div style="font-size:12px;font-weight:700;color:var(--brand-blue);margin-bottom:6px;">
            A partir de ${R(cost.t)}
          </div>
          <button class="btn" style="padding:6px 10px;font-size:12px;" onclick="go('perfil',{pid:'${p.id}'})">
            Ver perfil & Contratar
          </button>
        </div>
      `);
    });

    leafletMapInstance.invalidateSize();
  }, 100);
}

function renderRealMapHTML(filterCategory = null) {
  const list = getProsInRadius(filterCategory);
  return `
    <div class="real-map-wrapper">
      <div class="real-map-header">
        <div style="display:flex;align-items:center;gap:6px;">
          <span>📍 <b>Pinheiros / Jardins</b></span>
          <span class="st ok" style="font-size:11px;padding:2px 8px;">${list.length} no raio</span>
        </div>
        <div class="map-theme-toggles">
          <button class="map-tag-btn ${mapStyle === 'modern' ? 'active' : ''}" onclick="setMapStyle('modern')">1) Moderno</button>
          <button class="map-tag-btn ${mapStyle === 'street' ? 'active' : ''}" onclick="setMapStyle('street')">2) Ruas</button>
          <button class="map-tag-btn ${mapStyle === 'sat' ? 'active' : ''}" onclick="setMapStyle('sat')">Satélite</button>
        </div>
      </div>

      <div id="real-map-container"></div>

      <div class="map-bottom-controls">
        <div class="radius-selector-group">
          <span style="font-size:11px;font-weight:700;color:var(--ink-secondary);">Raio de busca:</span>
          ${[3, 5, 8, 12].map(r => `
            <button class="radius-chip ${currentRadiusKm === r ? 'active' : ''}" onclick="setRadius(${r})">
              ${r} km ${r === 5 ? '(Padrão)' : ''}
            </button>
          `).join('')}
        </div>
        <button class="recenter-btn" onclick="recenterMap()" title="Recentralizar na minha casa">
          🎯 Minha Casa
        </button>
      </div>
    </div>
  `;
}

const bk = () => `
  <div class="top-nav-bar">
    <button class="bk-btn" onclick="back()" title="Voltar">‹</button>
    <div style="flex:1"></div>
    <span class="trust-badge" onclick="showTrustModal()">🛡️ Selo de Confiança</span>
  </div>
`;

const op = (k, val, l) => `<button class="chip ${F[k] == val ? 'on' : ''}" onclick="F['${k}']='${val}';render()">${l}</button>`;

const pc = p => `
  <div class="card pro-card-item" data-id="${p.id}" data-search="${normStr(p.n + ' ' + p.t + ' ' + p.cats.join(' ') + ' ' + p.srv.join(' ') + ' ' + p.sobre)}" onclick="go('perfil',{pid:'${p.id}'})">
    ${av(p)}
    <div class="f">
      <div style="display:flex;align-items:center;gap:6px;">
        <b style="font-size:15px;color:var(--ink);">${E(p.n)}</b>
        <span style="font-size:12px;cursor:pointer;" title="Selo de Confiança Verificado" onclick="event.stopPropagation();showTrustModal()">🛡️</span>
      </div>
      <small style="color:var(--brand-blue);font-weight:600;">${E(p.t)}</small>
      <small>${nt(p)} · 📍 ${p.km} km de você</small>
    </div>
    <span style="font-size:18px;color:var(--m);">›</span>
  </div>
`;

const kv = a => a.map(([x, y]) => `<div class="kv"><span>${x}</span><b>${y}</b></div>`).join('');

// ==========================================
// TELAS DO APLICATIVO (OBJETO V)
// ==========================================
const V = {
  // 1. Início do Morador (Mapa sempre visível no Celular e no Desktop)
  home: () => {
    const isDesktopView = document.body.classList.contains('desktop-view');
    const pros = getProsInRadius(null);

    // Layout para Modo Desktop Expandido (2 colunas)
    if (isDesktopView) {
      setTimeout(() => {
        mountRealMap(null);
        if (F.searchQuery) fl(F.searchQuery);
      }, 50);
      return `
        <div class="desktop-grid-2col">
          <div class="desktop-main-col">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;width:100%;">
              ${LOGO_SVG}
              <button class="chip ${S.user && S.user.logado ? 'on' : ''}" style="padding:6px 12px;font-size:12px;display:flex;align-items:center;gap:5px;cursor:pointer;" onclick="openLoginModal()">
                <span>👤</span>
                <span>${S.user && S.user.logado ? E(S.user.n.split(' ')[0]) : 'Entrar'}</span>
              </button>
            </div>
            <h1 style="margin-top:4px;">Olá! O que você precisa consertar hoje?</h1>
            <input class="in" id="home-search-input" placeholder="🔍 Buscar por serviço ou reparo (ex.: chuveiro, tomada, João)..." value="${E(F.searchQuery || '')}" oninput="fl(this.value)">

            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
              <h2>Categorias de serviços</h2>
              <small style="color:var(--brand-blue);font-weight:700;">Preço tabelado</small>
            </div>
            <div class="cat-grid">
              ${CATS.map(c => `
                <button class="cat-btn ${F.cat == c[0] ? 'active' : ''}" data-cat="${c[0]}" onclick="F.cat='${c[0]}';go('sol')">
                  <span>${c[1]}</span>
                  ${c[0]}
                </button>
              `).join('')}
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
              <h2>Profissionais no raio de ${currentRadiusKm} km</h2>
              <small id="pros-count-label" style="color:var(--brand-blue);font-weight:700;">${pros.length} disponíveis</small>
            </div>
            <div id="home-pros-container">
              ${pros.map(pc).join('')}
            </div>
            <div id="search-empty-state" style="display:none;"></div>

            <button class="btn o" style="margin-top:8px;" onclick="go('cad')">💼 Sou prestador de serviços</button>
          </div>

          <!-- Coluna Lateral com o Mapa Real ao Vivo -->
          <div class="desktop-side-col">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <h2>Radar Hiperlocal (GPS)</h2>
              <span class="trust-badge" onclick="showTrustModal()">🛡️ Selo de Confiança</span>
            </div>
            ${renderRealMapHTML(null)}
            <div class="box" style="margin-top:4px;">
              <b>Transparência Hiperlocal Consertaí</b>
              <p style="font-size:12.5px;margin-top:4px;">
                Ao aumentar o raio de busca, você encontra mais profissionais especializados. A taxa de deslocamento é calculada automaticamente a <b>R$ 5/km</b>, garantindo que o prestador seja pago com justiça.
              </p>
            </div>
            <div class="academic-footer">
              <p><b>Consertaí — MVP Acadêmico (USP SI 2026)</b></p>
              <p>Diego Aguiar, Luis Gustavo Cerqueira e Mateus de Sales</p>
            </div>
          </div>
        </div>
      `;
    }

    // Layout para Modo Celular (Mapa integrado logo abaixo das categorias!)
    setTimeout(() => {
      mountRealMap(null);
      if (F.searchQuery) fl(F.searchQuery);
    }, 50);

    return `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;width:100%;">
        ${LOGO_SVG}
        <button class="chip ${S.user && S.user.logado ? 'on' : ''}" style="padding:6px 12px;font-size:12px;display:flex;align-items:center;gap:5px;cursor:pointer;" onclick="openLoginModal()">
          <span>👤</span>
          <span>${S.user && S.user.logado ? E(S.user.n.split(' ')[0]) : 'Entrar'}</span>
        </button>
      </div>
      <h1 style="margin-top:4px;">Olá! O que você precisa consertar hoje?</h1>
      <input class="in" id="home-search-input" placeholder="🔍 Buscar por serviço ou reparo (ex.: chuveiro, tomada, João)..." value="${E(F.searchQuery || '')}" oninput="fl(this.value)">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
        <h2>Categorias de serviços</h2>
        <small style="color:var(--brand-blue);font-weight:700;">Preço tabelado</small>
      </div>
      <div class="cat-grid">
        ${CATS.map(c => `
          <button class="cat-btn ${F.cat == c[0] ? 'active' : ''}" data-cat="${c[0]}" onclick="F.cat='${c[0]}';go('sol')">
            <span>${c[1]}</span>
            ${c[0]}
          </button>
        `).join('')}
      </div>

      <!-- MAPA REAL TOTALMENTE INTEGRADO NA HOME DO CELULAR -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
        <h2>Radar Hiperlocal no Bairro</h2>
        <span class="trust-badge" onclick="showTrustModal()">🛡️ Selo de Confiança</span>
      </div>
      ${renderRealMapHTML(null)}

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
        <h2>Profissionais no raio (${currentRadiusKm} km)</h2>
        <small id="pros-count-label" style="color:var(--brand-blue);font-weight:700;">${pros.length} disponíveis</small>
      </div>
      <div id="home-pros-container">
        ${pros.map(pc).join('')}
      </div>
      <div id="search-empty-state" style="display:none;"></div>

      <div style="margin-top:8px;display:flex;flex-direction:column;gap:8px;">
        <button class="btn o" onclick="go('cad')">💼 Sou prestador de serviços</button>
      </div>

      <div class="academic-footer">
        <p><b>Consertaí — MVP Acadêmico (USP SI 2026)</b></p>
        <p>Desenvolvido para validação prática. Todos os dados são fictícios para teste.</p>
      </div>
    `;
  },

  // 2. Solicitar Serviço (Morador)
  sol: () => `
    <div class="desktop-centered-view">
      ${bk()}
      <h1 class="s">Solicitar serviço de ${F.cat}</h1>
      <small>Preencha os dados para calcularmos o preço exato antes de você contratar.</small>

      <label>Categoria selecionada</label>
      <select class="in" onchange="F.cat=this.value;render()">
        ${CATS.map(c => `<option ${c[0] == F.cat ? 'selected' : ''}>${c[0]}</option>`).join('')}
      </select>

      <label>O que está acontecendo?</label>
      <textarea class="in" rows="3" placeholder="Ex.: O disjuntor desarma ao ligar o chuveiro e precisa trocar a resistência" oninput="F.desc=this.value">${E(F.desc)}</textarea>

      <label>Endereço ou Bairro de atendimento</label>
      <input class="in" placeholder="Ex.: Rua das Flores, 120 — Pinheiros" value="${E(F.end)}" oninput="F.end=this.value">

      <!-- Peças e Materiais -->
      <label>Quem compra os materiais/peças?</label>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <button type="button" class="chip ${F.pecas == 'eu' ? 'on' : ''}" style="justify-content:flex-start;padding:10px 14px;text-align:left;" onclick="F.pecas='eu';render()">
          <span>📦 <b>Eu já tenho os materiais</b> (R$ 0 adicionais)</span>
        </button>
        <button type="button" class="chip ${F.pecas == 'prest_simples' ? 'on' : ''}" style="justify-content:flex-start;padding:10px 14px;text-align:left;" onclick="F.pecas='prest_simples';render()">
          <span>🔧 <b>Prestador compra: reparo básico (+R$ 30)</b> (fita, veda-rosca, buchas, conexões)</span>
        </button>
        <button type="button" class="chip ${F.pecas == 'prest_padrao' ? 'on' : ''}" style="justify-content:flex-start;padding:10px 14px;text-align:left;" onclick="F.pecas='prest_padrao';render()">
          <span>⚡ <b>Prestador compra: peça principal (+R$ 75)</b> (resistência, tomada dupla, torneira/sifão)</span>
        </button>
        <button type="button" class="chip ${F.pecas == 'prest_orcamento' ? 'on' : ''}" style="justify-content:flex-start;padding:10px 14px;text-align:left;" onclick="F.pecas='prest_orcamento';render()">
          <span>🧾 <b>Prestador orça peças na visita</b> (apresenta nota fiscal física)</span>
        </button>
      </div>

      <div class="info-box" style="margin-top:6px;">
        <span style="font-size:16px;">💡</span>
        <div>
          <b>Transparência Consertaí:</b> Se o prestador comprar as peças, o valor real é comprovado com nota fiscal física no momento da visita. Havendo qualquer diferença, o valor é ajustado com sua prévia aprovação pelo aplicativo.
        </div>
      </div>

      <!-- Agendamento com Calendário e Turnos -->
      <label style="margin-top:8px;">Para quando você precisa?</label>
      <div class="row" style="gap:6px;">
        <button type="button" class="chip ${F.quandoTipo == 'Hoje' ? 'on' : ''}" onclick="setQuandoTipo('Hoje')">⚡ Hoje (Urgente)</button>
        <button type="button" class="chip ${F.quandoTipo == 'Amanhã' ? 'on' : ''}" onclick="setQuandoTipo('Amanhã')">📅 Amanhã</button>
        <button type="button" class="chip ${F.quandoTipo == 'Agendar' ? 'on' : ''}" onclick="setQuandoTipo('Agendar')">🗓️ Agendar data</button>
      </div>

      ${F.quandoTipo === 'Agendar' ? `
        <div style="background:var(--muted-bg);padding:14px;border-radius:12px;margin-top:8px;border:1.5px solid var(--border);">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <label style="font-size:12px;font-weight:700;margin:0;color:var(--ink);">Escolha a data do atendimento:</label>
            <span class="st ok" style="font-size:10.5px;">Disponibilidade garantida</span>
          </div>
          <input type="date" class="in" style="margin-top:6px;" min="${new Date().toISOString().split('T')[0]}" value="${F.agendaData || getMinAgendaDate()}" onchange="F.agendaData=this.value;updateAgendaText();render();">

          <label style="font-size:12px;font-weight:700;margin-top:8px;color:var(--ink);">Turno de preferência:</label>
          <select class="in" style="margin-top:4px;" onchange="F.agendaPeriodo=this.value;updateAgendaText();render();">
            <option value="Manhã (08h às 12h)" ${F.agendaPeriodo == 'Manhã (08h às 12h)' ? 'selected' : ''}>Manhã (08h às 12h)</option>
            <option value="Tarde (13h às 17h)" ${F.agendaPeriodo == 'Tarde (13h às 17h)' ? 'selected' : ''}>Tarde (13h às 17h)</option>
            <option value="Noite (18h às 20h)" ${F.agendaPeriodo == 'Noite (18h às 20h)' ? 'selected' : ''}>Noite (18h às 20h)</option>
          </select>

          <div style="background:#fff;padding:8px 12px;border-radius:8px;margin-top:8px;font-size:12.5px;color:var(--brand-blue);font-weight:700;border:1px solid var(--border);">
            🗓️ Agendamento: <u>${F.quando}</u>
          </div>
        </div>
      ` : ''}

      <div class="bar">
        <button class="btn" onclick="vp()">Ver prestadores e preços calculados</button>
      </div>
    </div>
  `,

  // 3. Comparação de Prestadores e Preço Calculado (Morador)
  ped: () => {
    const l = getProsInRadius(F.cat).map(p => [p, calc(p, F.pecas)]).sort((a, b) => a[1].t - b[1].t);
    setTimeout(() => mountRealMap(F.cat), 50);
    const pecasInfo = calc(P0[0], F.pecas).peLabel;

    return `
      <div class="desktop-grid-2col">
        <div class="desktop-main-col">
          ${bk()}
          <h1 class="s">Prestadores de ${F.cat}</h1>
          <div class="box">
            <div class="kv">
              <b>${F.cat}</b>
              <span style="font-size:12px;color:var(--brand-blue);font-weight:700;">Preço calculado</span>
            </div>
            <small style="margin-top:2px;">“${E(F.desc.slice(0, 48))}${F.desc.length > 48 ? '...' : ''}”</small>
            <small style="margin-top:4px;">📍 ${E(F.end)} · Prazo: <b>${E(F.quando)}</b></small>
            <small style="color:var(--brand-blue);display:block;margin-top:2px;font-weight:600;">Peças: ${pecasInfo}</small>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
            <h2>Escolha o profissional ideal</h2>
            <small style="color:var(--brand-blue);font-weight:700;">${l.length} no raio (${currentRadiusKm} km)</small>
          </div>
          <small style="margin-bottom:4px;color:var(--m);">Profissionais qualificados perto de você. O preço sobe apenas conforme a distância de deslocamento (R$ 5/km).</small>

          ${l.length ? l.map(([p, c]) => `
            <div class="card2">
              <div class="r">
                ${av(p)}
                <div class="f">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <b>${E(p.n)}</b>
                    <span title="Verificado" style="cursor:pointer;" onclick="showTrustModal()">🛡️</span>
                  </div>
                  <small style="color:var(--brand-blue);font-weight:600;">${E(p.t)}</small>
                  <small>${nt(p)} · 📍 ${p.km} km (deslocamento: ${R(c.d)})</small>
                </div>
                <div class="pr">
                  <b>${R(c.t)}</b>
                  <small>preço final fixo</small>
                </div>
              </div>
              <div class="row">
                <button class="btn o" style="padding:10px;" onclick="go('perfil',{pid:'${p.id}'})">Ver perfil completo</button>
                <button class="btn" style="padding:10px;" onclick="hire('${p.id}')">Escolher</button>
              </div>
            </div>
          `).join('') : `
            <div class="info-box">
              Ainda não há prestadores de <b>${F.cat}</b> no raio de <b>${currentRadiusKm} km</b>. Experimente usar os botões acima no mapa para aumentar o raio para <b>8 km ou 12 km</b>!
            </div>
          `}
        </div>

        <div class="desktop-side-col">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <h2>Localização dos Profissionais</h2>
            <small style="color:var(--brand-blue);font-weight:700;">Raio: ${currentRadiusKm} km</small>
          </div>
          ${renderRealMapHTML(F.cat)}
          <div class="box" style="margin-top:6px;">
            <b>Garantia do Selo Consertaí</b>
            <p style="font-size:12px;color:var(--m);margin-top:3px;">
              Todos os profissionais exibidos passaram por validação de antecedentes criminais e entrevista técnica em vídeo.
            </p>
          </div>
        </div>
      </div>
    `;
  },

  // 4. Perfil do Profissional (Morador)
  perfil: () => {
    const p = pv(C.pid);
    const hasOrder = F.desc.trim() && F.end.trim() && p.cats.includes(F.cat);
    const cost = calc(p, F.pecas);
    const revs = p.rev || [];
    const topRevs = revs.slice(0, 2);
    const portfolio = p.portfolio || [];

    return `
      <div class="desktop-centered-view">
        ${bk()}
        <div class="r" style="margin-top:4px;">
          ${av(p, 1)}
          <div class="f">
            <h1 class="s">${E(p.n)}</h1>
            <small style="color:var(--brand-blue);font-weight:600;">${E(p.t)}</small>
            <div class="trust-badge" style="margin-top:6px;" onclick="showTrustModal()">🛡️ Selo de Confiança Ativo</div>
          </div>
        </div>

        <div class="stats">
          <div>
            <b>${p.av ? p.nota : 'Novo'}</b>
            <small>avaliação média</small>
          </div>
          <div>
            <b>${p.av}</b>
            <small>serviços avaliados</small>
          </div>
          <div>
            <b>${p.km} km</b>
            <small>distância de você</small>
          </div>
        </div>

        <div class="info-box">
          <span style="font-size:16px;">🛡️</span>
          <div>
            <b>Profissional Verificado:</b> Documentação checada, antecedentes criminais validados e entrevista técnica em vídeo concluída pelo Consertaí.
          </div>
        </div>

        <h2>Sobre o profissional</h2>
        <p style="background:var(--bg);padding:12px;border-radius:12px;font-size:13.5px;line-height:1.5;">${E(p.sobre || 'Profissional autônomo com ampla experiência atendendo a região.')}</p>

        <h2>Serviços e Especialidades</h2>
        <div class="row" w style="gap:6px;">
          ${p.srv.map(s => `<span class="chip on" style="font-size:12px;padding:6px 10px;">✓ ${E(s)}</span>`).join('')}
        </div>

        <!-- Portfólio de Trabalhos Recentes -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
          <h2>📸 Portfólio de Trabalhos Recentes</h2>
          <small style="color:var(--brand-blue);font-weight:700;">${portfolio.length} fotos</small>
        </div>
        ${portfolio.length ? `
          <div class="portfolio-grid">
            ${portfolio.map((item, idx) => `
              <div class="portfolio-item" onclick="openPortfolioLightbox('${p.id}', ${idx})" title="${E(item.title)}">
                <img src="${item.url}" alt="${E(item.title)}" loading="lazy" onerror="this.src='https://placehold.co/600x400/1216B0/ffffff?text=Consertai+Servico'">
                <div class="portfolio-item-overlay">
                  <span>${E(item.title)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <small style="color:var(--m);">Fotos de serviços em atualização.</small>
        `}

        <!-- Vitrine de Avaliações -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
          <h2>⭐ Avaliações de vizinhos no bairro</h2>
          <small style="color:var(--brand-blue);font-weight:700;">★ ${p.nota} (${p.av})</small>
        </div>
        ${topRevs.length ? topRevs.map(x => `
          <div class="box" style="margin-top:4px;">
            <div class="kv">
              <b>${E(x[0])}</b>
              <span style="color:#F59E0B;font-size:12px;font-weight:700;">${'★'.repeat(x[1] || 5)} (${x[1] || 5}.0)</span>
            </div>
            <small style="color:var(--ink-secondary);font-size:13px;margin-top:2px;display:block;">“${E(x[2])}”</small>
          </div>
        `).join('') : '<small>Este profissional ainda não recebeu avaliações na plataforma.</small>'}

        ${revs.length > 2 ? `
          <button class="btn o" style="width:100%;margin-top:4px;padding:9px;" onclick="openAllReviewsModal('${p.id}')">
            💬 Ver todas as ${revs.length} avaliações com comentários
          </button>
        ` : ''}

        <div class="bar">
          ${hasOrder ? `
            <button class="btn" onclick="hire('${p.id}')">
              Contratar por ${R(cost.t)}
            </button>
          ` : `
            <button class="btn" onclick="F.cat='${p.cats[0]}';go('sol')">
              Solicitar orçamento a ${E(p.n.split(' ')[0])}
            </button>
          `}
        </div>
      </div>
    `;
  },

  // 5. Confirmação do Envio do Pedido (Morador)
  env: () => {
    const r = rq(C.rid);
    const p = pv(r.pid);
    const w = encodeURIComponent(`Olá, ${p.n}! Fiz uma solicitação pelo Consertaí para você:\nServiço: ${r.svc}\nEndereço: ${r.end}\nValor tabelado: ${R(r.val)}.`);
    return `
      <div class="desktop-centered-view">
        <div class="ok-icon-circle">✓</div>
        <h1 class="c">Solicitação enviada com sucesso!</h1>
        <p class="c">O profissional já foi notificado. O valor final de <b>${R(r.val)}</b> já está registrado e garantido pela plataforma.</p>

        <div class="box" style="margin-top:10px;">
          ${kv([
            ['Código do Pedido', '#' + r.id.slice(-5)],
            ['Serviço', E(r.svc.slice(0, 32))],
            ['Profissional', E(p.n)],
            ['Preço Fechado', R(r.val)],
            ['Status Atual', st(r.status)]
          ])}
        </div>

        <button class="btn o" onclick="simulateWhatsApp('${w}')">
          💬 Avisar prestador no WhatsApp
        </button>
        <button class="btn" onclick="go('pedidos')">Acompanhar em Meus Pedidos</button>
      </div>
    `;
  },

  // 6. Lista de Pedidos (Morador)
  pedidos: () => `
    <div class="desktop-centered-view">
      <h1 class="s">Seus Pedidos</h1>
      <small>Acompanhe o andamento dos serviços e avalie o atendimento dos profissionais</small>
      ` + (S.reqs.length ? [...S.reqs].reverse().map(r => {
        const p = pv(r.pid);
        return `
          <div class="card2" style="margin-top:6px;border:1.5px solid var(--border);">
            <div class="kv">
              <b>${E(r.svc.slice(0, 32))}</b>
              ${st(r.status)}
            </div>
            <small>Profissional: <b>${E(p ? p.n : 'Profissional')}</b> · Valor fechado: <b style="color:var(--brand-blue);font-size:13.5px;">${R(r.val)}</b></small>
            <small style="color:var(--m);">📍 ${E(r.end)} · Prazo: <b>${r.quando || 'Hoje'}</b></small>

            ${r.status == 'Aguardando resposta' ? `
              <div style="background:var(--muted-bg);padding:8px 12px;border-radius:10px;font-size:12px;color:var(--ink);margin-top:6px;">
                ⏱ Solicitação enviada. O profissional já foi notificado e responderá em breve.
              </div>
            ` : ''}

            ${r.status == 'Confirmado' ? `
              <div style="background:var(--status-ok-bg);color:var(--status-ok-text);padding:10px 12px;border-radius:10px;font-size:12.5px;font-weight:600;margin-top:6px;">
                ✓ Atendimento confirmado pelo profissional! Ele comparecerá no endereço informado.
              </div>
            ` : ''}

            ${r.status == 'Em análise' ? `
              <div class="info-box" style="background:#FFFBEB;border-color:#FDE68A;color:#92400E;margin-top:6px;">
                <div>
                  <b>O prestador solicitou um ajuste de valor:</b><br>
                  Novo valor proposto: <b style="font-size:15px;color:#B45309;">${R(r.nv)}</b><br>
                  Motivo: <i>${E(r.mot)}</i><br>
                  Justificativa: “${E(r.just)}”
                </div>
              </div>
              <div class="row" style="margin-top:6px;">
                <button class="btn o" style="flex:1;padding:10px;" onclick="ans('${r.id}',0)">Recusar ajuste</button>
                <button class="btn" style="flex:1;padding:10px;" onclick="ans('${r.id}',1)">Aprovar novo valor</button>
              </div>
            ` : ''}

            ${r.status == 'Concluído' ? `
              ${!r.avaliado ? `
                <div style="background:linear-gradient(135deg, #EFF6FF, #F0FDF4);border:1.5px solid #86EFAC;border-radius:12px;padding:12px;margin-top:8px;">
                  <div class="kv" style="align-items:center;">
                    <div>
                      <b style="color:#166534;font-size:13.5px;">✓ Atendimento Concluído!</b>
                      <p style="font-size:12px;color:#374151;margin-top:2px;">Como foi o serviço com <b>${p ? E(p.n) : 'o prestador'}</b>? Sua avaliação fortalece a reputação do bairro.</p>
                    </div>
                  </div>
                  <button class="btn" style="margin-top:10px;padding:9px 14px;font-size:13px;background:var(--brand-orange);" onclick="openRatingModal('${r.id}')">
                    ⭐ Avaliar atendimento
                  </button>
                </div>
              ` : `
                <div style="background:#F8FAFC;border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-top:8px;">
                  <div class="kv">
                    <small style="color:var(--brand-blue);font-weight:700;">SUA AVALIAÇÃO DO ATENDIMENTO</small>
                    <span style="color:#F59E0B;font-weight:700;font-size:13px;">${'★'.repeat(r.nota_dada || 5)}${'☆'.repeat(5 - (r.nota_dada || 5))} (${r.nota_dada || 5}.0)</span>
                  </div>
                  <p style="font-size:12.5px;font-style:italic;color:var(--ink);margin-top:4px;">“${E(r.comentario_dado || 'Excelente atendimento!')}”</p>
                  ${r.tags_dadas && r.tags_dadas.length ? `
                    <div class="row" w style="gap:4px;margin-top:6px;">
                      ${r.tags_dadas.map(t => `<span class="chip on" style="font-size:10.5px;padding:2px 7px;">${E(t)}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
              `}
            ` : ''}
          </div>
        `;
      }).join('') : `
        <div class="info-box" style="margin-top:10px;">
          Você ainda não fez nenhum pedido. Volte à página inicial para experimentar a contratação.
        </div>
        <button class="btn" onclick="go('home')">Ver serviços disponíveis</button>
      `) + `
    </div>
  `,

  // 7. Configurações / Painel de Evidências (Para entrega USP)
  conta: () => `
    <div class="desktop-centered-view">
      <h1 class="s">Configurações & Validação</h1>
      <small>Painel do teste e geração de evidências para o trabalho</small>

      <h2>Sua Conta (Morador)</h2>
      <div class="box" style="margin-top:4px;">
        <div class="kv">
          <span>Nome:</span>
          <b>${E((S.user && S.user.n) || 'Visitante')}</b>
        </div>
        <div class="kv">
          <span>Contato:</span>
          <b>${E((S.user && S.user.tel) || 'Não informado')}</b>
        </div>
        <div class="kv">
          <span>Status de Acesso:</span>
          <span class="st ${S.user && S.user.logado ? 'ok' : 'x'}">${S.user && S.user.logado ? 'Logado' : 'Desconectado'}</span>
        </div>
        <button class="btn o" style="margin-top:8px;padding:8px 12px;font-size:13px;" onclick="openLoginModal()">
          ${S.user && S.user.logado ? 'Alterar dados / Trocar de conta' : 'Fazer login / Cadastrar'}
        </button>
      </div>

      <div class="box" style="margin-top:10px;">
        <b>Ambiente de Validação Acadêmica (USP SI)</b>
        <p style="font-size:12.5px;margin-top:4px;">Este MVP opera 100% no navegador (localStorage) para permitir testes controlados e sem custos de infraestrutura.</p>
      </div>

      <h2>Evidências dos 5 Testes de Usuário</h2>
      <div class="box">
        <div class="kv">
          <span>Ações registradas neste navegador:</span>
          <b>${(S.logs || []).length} eventos</b>
        </div>
        <div class="kv">
          <span>Pedidos cadastrados:</span>
          <b>${S.reqs.length}</b>
        </div>
        <div class="kv">
          <span>Prestadores adicionais:</span>
          <b>${S.provs.length}</b>
        </div>
      </div>

      <button class="btn sec-blue" onclick="exportEvidenceCSV()">
        📥 Baixar Relatório de Evidências (CSV)
      </button>
      <button class="btn o" onclick="exportEvidenceJSON()">
        📄 Baixar Logs de Validação (JSON)
      </button>

      <h2>Ações de Demonstração</h2>
      <button class="btn o" onclick="switchRole('prestador')">🛠️ Acessar Painel do Prestador</button>
      <button class="btn subtle" style="color:var(--status-alert-text);margin-top:4px;" onclick="resetTestState()">
        ⚠️ Limpar todos os dados e reiniciar teste
      </button>
    </div>
  `,

  // 8. Cadastro de Prestador
  cad: () => `
    <div class="desktop-centered-view">
      ${bk()}
      <h1 class="s">Ofereça seus serviços no Consertaí</h1>
      <small>Conquiste clientes perto da sua casa com reputação e preço justo.</small>

      <label>Nome completo</label>
      <input class="in" placeholder="Ex.: Carlos da Silva" value="${E(K.n)}" oninput="K.n=this.value">

      <label>Telefone para contato (WhatsApp)</label>
      <input class="in" placeholder="(11) 98765-4321" value="${E(K.c)}" oninput="K.c=this.value">

      <label>Quais serviços você faz? (Selecione um ou mais)</label>
      <div class="row" w style="gap:6px;">
        ${CATS.map(c => `
          <button class="chip ${K.cats.includes(c[0]) ? 'on' : ''}" onclick="tg('${c[0]}')">
            ${c[1]} ${c[0]}
          </button>
        `).join('')}
      </div>

      <label>Fale um pouco sobre sua experiência</label>
      <textarea class="in" rows="3" placeholder="Ex.: Trabalho com elétrica residencial há 8 anos, tenho ferramentas próprias..." oninput="K.d=this.value">${E(K.d)}</textarea>

      <label>Foto do perfil (Gera mais confiança para o morador)</label>
      <div class="r" style="background:var(--bg);padding:10px;border-radius:12px;">
        ${K.foto ? `<img class="av" src="${K.foto}">` : `<div class="av">📷</div>`}
        <input type="file" accept="image/*" onchange="foto(event)" style="font-size:12px;">
      </div>

      <div class="info-box">
        <span style="font-size:16px;">💰</span>
        <div>
          <b>Regra de Ouro Consertaí:</b> Você <b>não paga nada</b> para receber contatos. Cobramos apenas <b>${Math.round(CFG.taxa * 100)}% de taxa</b> somente sobre os serviços concluídos.
        </div>
      </div>

      <div class="bar">
        <button class="btn" onclick="reg()">Criar meu cadastro</button>
        <button class="btn o" style="margin-top:6px;" onclick="go('painel')">Já sou cadastrado — Ir para o Painel</button>
      </div>
    </div>
  `,

  // 9. Painel do Prestador (Totalmente Reformulado para Celular e PC)
  painel: () => {
    const me = pv(S.me) || P0[0];
    const mine = S.reqs.filter(r => r.pid == me.id);
    const done = mine.filter(r => r.status == 'Concluído');
    const g = done.reduce((a, r) => a + r.val * (1 - CFG.taxa), 0);
    const live = mine.filter(r => r.status != 'Concluído' && r.status != 'Cancelado');

    return `
      <div class="desktop-grid-2col">
        <!-- Coluna Esquerda: Perfil do Prestador, Métricas, Configurações -->
        <div class="desktop-main-col">
          <div class="card2" style="background:#fff;border:1.5px solid var(--border);padding:18px;">
            <div class="r" style="align-items:center;">
              ${av(me, 1)}
              <div class="f">
                <small style="color:var(--brand-orange);font-weight:800;letter-spacing:0.5px;">ÁREA DO PRESTADOR</small>
                <h1 class="s" style="margin-top:2px;font-size:20px;">Olá, ${E(me.n.split(' ')[0])}!</h1>
                <small style="color:var(--brand-blue);font-weight:700;">${E(me.t)}</small>
              </div>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;background:var(--muted-bg);padding:10px 14px;border-radius:12px;margin-top:14px;">
              <span style="font-size:13px;font-weight:600;color:var(--ink);">Status para receber chamados:</span>
              <label style="display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;margin:0;cursor:pointer;color:${S.disp !== false ? 'var(--status-ok-text)' : 'var(--m)'};">
                <input type="checkbox" ${S.disp !== false ? 'checked' : ''} onchange="S.disp=this.checked;save();toast(this.checked?'Você está DISPONÍVEL para receber chamados!':'Pausado temporariamente');render()">
                ${S.disp !== false ? '🟢 Disponível' : '⏸️ Pausado'}
              </label>
            </div>

            <div class="trust-badge" style="margin-top:10px;justify-content:center;padding:7px;" onclick="showTrustModal()">
              🛡️ Selo de Confiança Ativo & Documentado
            </div>
          </div>

          <!-- Seletor de Simulação -->
          <div class="box" style="margin:0;">
            <label style="font-size:12px;font-weight:700;color:var(--ink);">Simular login como outro prestador (MVP Testes):</label>
            <select class="in" style="margin-top:4px;" onchange="S.me=this.value;save();render()">
              ${all().map(p => `<option value="${p.id}" ${p.id == me.id ? 'selected' : ''}>Entrar como ${E(p.n)} (${p.cats[0]})</option>`).join('')}
            </select>
          </div>

          <!-- Indicadores Financeiros / KPIs -->
          <div class="row" style="gap:10px;">
            <div class="box" style="flex:1;margin:0;padding:14px;">
              <small style="font-size:11px;font-weight:700;color:var(--m);text-transform:uppercase;">Ganhos líquidos</small>
              <b style="font-size:24px;color:var(--brand-blue);display:block;margin-top:4px;">${R(g)}</b>
              <small style="font-size:11px;color:var(--status-ok-text);font-weight:600;">✓ 90% repassado direto</small>
            </div>
            <div class="box" style="flex:1;margin:0;padding:14px;">
              <small style="font-size:11px;font-weight:700;color:var(--m);text-transform:uppercase;">Concluídos</small>
              <b style="font-size:24px;color:var(--ink);display:block;margin-top:4px;">${done.length}</b>
              <small style="font-size:11px;color:var(--m);">serviços entregues</small>
            </div>
          </div>

          <!-- Reputação do Prestador -->
          <div class="box" style="margin:0;">
            <div class="kv">
              <div>
                <small style="font-size:11px;font-weight:700;color:var(--m);text-transform:uppercase;">Sua Reputação no Bairro</small>
                <div style="font-size:20px;font-weight:800;color:var(--ink);margin-top:2px;">
                  ★ ${me.nota} <span style="font-size:13px;font-weight:500;color:var(--m);">(${me.av || (me.rev ? me.rev.length : 0)} avaliações)</span>
                </div>
              </div>
              <button class="btn o" style="padding:6px 10px;font-size:11.5px;" onclick="openAllReviewsModal('${me.id}')">Ver avaliações</button>
            </div>
          </div>

          <!-- Regra de Ouro -->
          <div class="info-box" style="margin:0;">
            <span style="font-size:18px;">💰</span>
            <div>
              <b>Regra de Ouro Consertaí:</b> Você <b>não paga para disputar contatos</b>. Cobramos apenas <b>${Math.round(CFG.taxa * 100)}% de taxa</b> exclusivamente quando o serviço for concluído e recebido.
            </div>
          </div>

          <button class="btn o" onclick="switchRole('morador')">
            ← Voltar à visão do Morador
          </button>
        </div>

        <!-- Coluna Direita: Chamados Pendentes e Serviços Realizados -->
        <div class="desktop-side-col">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <h2>Chamados no seu bairro</h2>
            <span class="chip on" style="font-size:11.5px;padding:3px 8px;">${live.length} pendente(s)</span>
          </div>

          ${live.length ? live.map(r => `
            <div class="card2" style="border:2px solid var(--brand-blue);background:#fff;padding:16px;">
              <div class="kv" style="align-items:flex-start;">
                <div>
                  <b style="font-size:15px;color:var(--ink);">${E(r.svc.slice(0, 38))}</b>
                  <div style="font-size:12px;color:var(--m);margin-top:2px;">📍 ${E(r.end)} · Prazo: <b>${r.quando || 'Hoje'}</b></div>
                </div>
                ${st(r.status)}
              </div>

              <div style="background:var(--muted-bg);padding:10px 12px;border-radius:10px;margin-top:10px;font-size:12.5px;">
                <div class="kv">
                  <span>Valor bruto ao cliente:</span>
                  <b style="font-size:14px;color:var(--brand-blue);">${R(r.val)}</b>
                </div>
                <div class="kv" style="margin-top:2px;">
                  <span>Seu ganho líquido (90%):</span>
                  <b style="font-size:14px;color:var(--status-ok-text);">${R(r.val * (1 - CFG.taxa))}</b>
                </div>
                <div class="kv" style="margin-top:2px;font-size:11.5px;color:var(--m);">
                  <span>Peças / Material:</span>
                  <span>${r.pecasLabel || (r.pecas == 'prest' ? 'Você fornece (+R$30)' : 'Cliente já possui')}</span>
                </div>
              </div>

              <div style="margin-top:12px;">
                ${r.status == 'Aguardando resposta' ? `
                  <div class="row" style="gap:8px;">
                    <button class="btn o" style="flex:1;padding:10px;" onclick="go('cont',{rid:'${r.id}'})">Ajustar valor</button>
                    <button class="btn" style="flex:1;padding:10px;" onclick="go('nova',{rid:'${r.id}'})">Ver detalhes e aceitar</button>
                  </div>
                ` : r.status == 'Confirmado' ? `
                  <button class="btn sec-blue" style="width:100%;padding:11px;" onclick="fin('${r.id}')">
                    ✓ Finalizar serviço e receber ganho
                  </button>
                ` : `
                  <div style="background:#FFFBEB;border:1px solid #FDE68A;color:#92400E;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:600;">
                    ⏱ Ajuste de ${R(r.nv)} em análise pelo morador. Aguarde a confirmação no app.
                  </div>
                `}
              </div>
            </div>
          `).join('') : `
            <div class="box" style="padding:20px;text-align:center;background:#fff;border:1.5px dashed var(--border);">
              <div style="font-size:32px;margin-bottom:6px;">📋</div>
              <b style="font-size:15px;color:var(--ink);display:block;">Nenhum chamado ativo no momento</b>
              <p style="font-size:12.5px;color:var(--m);margin-top:4px;line-height:1.4;">
                Você está pronto para receber pedidos de <b>${me.cats[0]}</b> na região.
              </p>
              <div style="background:var(--muted-bg);padding:10px;border-radius:10px;font-size:12px;color:var(--ink);margin-top:12px;text-align:left;">
                💡 <b>Dica de teste (USP SI):</b> Alterne para a visão de <b>Morador</b>, selecione a categoria <b>${me.cats[0]}</b>, faça uma solicitação e volte aqui para aceitar e finalizar o chamado.
              </div>
              <button class="btn o" style="margin-top:12px;padding:8px 14px;font-size:12.5px;" onclick="switchRole('morador')">
                Alternar para Morador e fazer um pedido de teste
              </button>
            </div>
          `}

          <h2 style="margin-top:10px;">Serviços cadastrados e Preços Base</h2>
          <div style="display:flex;flex-direction:column;gap:6px;">
            ${me.srv.map(s => `
              <div class="box" style="margin:0;padding:12px 14px;">
                <div class="kv">
                  <b style="font-size:13.5px;">${E(s)}</b>
                  <span style="font-size:13px;color:var(--brand-blue);font-weight:700;">Base: ${R(BASE[s] || me.base)}</span>
                </div>
                <small style="color:var(--m);display:block;margin-top:2px;font-size:11.5px;">
                  + R$ 5,00/km de deslocamento calculado pelo GPS + peças
                </small>
              </div>
            `).join('')}
          </div>

          ${me.rev && me.rev.length ? `
            <h2 style="margin-top:10px;">Últimas avaliações recebidas</h2>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${me.rev.slice(0, 2).map(x => `
                <div class="box" style="margin:0;padding:10px 12px;">
                  <div class="kv">
                    <b style="font-size:12.5px;">${E(x[0])}</b>
                    <span style="color:#F59E0B;font-size:12px;font-weight:700;">★ ${x[1]}.0</span>
                  </div>
                  <small style="color:var(--ink-secondary);font-size:12px;margin-top:2px;display:block;">“${E(x[2])}”</small>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  // 10. Detalhe da Nova Solicitação (Prestador)
  nova: () => {
    const r = rq(C.rid);
    const d = r.det;
    const tx = r.val * CFG.taxa;
    const adj = r.val - d.t;
    const p = pv(r.pid);

    return `
      <div class="desktop-centered-view">
        ${bk()}
        <h1 class="s">Solicitação de Atendimento</h1>
        <div class="box">
          <div class="kv">
            <b>${E(r.svc.slice(0, 32))}</b>
            ${st(r.status)}
          </div>
          <small style="margin-top:2px;">📍 ${E(r.end)}</small>
          <small style="margin-top:4px;font-style:italic;">“${E(r.svc)}”</small>
          <div class="row" w style="gap:6px;margin-top:6px;">
            <span class="chip on" style="font-size:11.5px;padding:4px 8px;">
              ${r.pecasLabel || (r.pecas == 'prest' ? 'Você fornece peças' : 'Cliente tem as peças')}
            </span>
            <span class="chip on" style="font-size:11.5px;padding:4px 8px;">
              Prazo: ${r.quando}
            </span>
          </div>
        </div>

        <div class="pay-card">
          <small>Valor bruto calculado pelo Consertaí</small>
          <b class="huge">${R(r.val)}</b>
          <hr>
          ${kv([
            ['Mão de obra base', R(d.m)],
            ['Peças estimadas', R(d.pe)],
            [`Deslocamento até o cliente (${p.km} km)`, R(d.d)]
          ])}
          ${adj ? kv([['Ajuste aprovado pelo morador', R(adj)]]) : ''}
          <hr>
          ${kv([
            [`Taxa Consertaí (${Math.round(CFG.taxa * 100)}% só sobre concluídos)`, '− ' + R(tx)],
            ['Seu ganho líquido', '<span style="font-size:17px;color:#86EFAC;">' + R(r.val - tx) + '</span>']
          ])}
        </div>

        <div class="info-box">
          <span style="font-size:15px;">⚖️</span>
          <div>O serviço é mais complexo do que o descrito? Você pode contestar o valor justificando o motivo para o cliente aprovar.</div>
        </div>

        <div class="bar">
          <button class="btn" onclick="acc('${r.id}')">Aceitar chamado por ${R(r.val)}</button>
          <button class="btn o" style="margin-top:6px;" onclick="go('cont')">Contestar / Ajustar valor</button>
        </div>
      </div>
    `;
  },

  // 11. Contestar Valor (Prestador)
  cont: () => {
    const r = rq(C.rid);
    return `
      <div class="desktop-centered-view">
        ${bk()}
        <h1 class="s">Contestar valor do serviço</h1>
        <small>Transparência total: o morador precisará aprovar para o valor valer.</small>

        <div class="box" style="margin-top:6px;">
          <div class="kv">
            <span>Valor atual calculado:</span>
            <b>${R(r.val)}</b>
          </div>
        </div>

        <label>Qual valor você considera justo pelo trabalho?</label>
        <input class="in" type="number" inputmode="decimal" placeholder="Ex.: ${(r.val + 35).toFixed(2)}" value="${M.nv}" oninput="M.nv=this.value">

        <label>Qual o motivo do ajuste?</label>
        <div class="row" w style="gap:6px;">
          ${['Serviço mais difícil', 'Mais peças necessárias', 'Acesso difícil', 'Outro'].map(m => `
            <button class="chip ${M.mot == m ? 'on' : ''}" onclick="M.mot='${m}';render()">${m}</button>
          `).join('')}
        </div>

        <label>Explique claramente para o cliente aprovar</label>
        <textarea class="in" rows="4" placeholder="Ex.: A fiação é antiga e vai exigir passar conduíte novo para não haver risco de curto..." oninput="M.just=this.value">${E(M.just)}</textarea>

        <div class="info-box" style="margin-top:6px;">
          ⓘ Para evitar a dor do cliente de <i>'preço que muda no final'</i>, o morador recebe uma notificação e decide se aceita antes do início.
        </div>

        <div class="bar">
          <button class="btn" onclick="sendc()">Enviar ajuste para o cliente</button>
        </div>
      </div>
    `;
  },

  // 12. Valor em Revisão (Prestador)
  rev: () => {
    const r = rq(C.rid);
    return `
      <div class="desktop-centered-view">
        <div class="ok-icon-circle" style="background:#FEF3C7;color:#D97706;box-shadow:0 0 0 12px rgba(254,243,199,0.5);">⏱</div>
        <h1 class="c">Ajuste enviado para o morador</h1>
        <p class="c">Enviamos sua justificativa ao cliente. Assim que ele aprovar em "Meus Pedidos", o chamado será confirmado.</p>

        <div class="box" style="margin-top:10px;">
          ${kv([
            ['Valor Original', R(r.val)],
            ['Novo Valor Proposto', R(r.nv)],
            ['Motivo Informado', E(r.mot)],
            ['Status', st(r.status)]
          ])}
        </div>

        <button class="btn" onclick="go('painel')">Voltar ao Painel do Prestador</button>
      </div>
    `;
  }
};

// ==========================================
// CONTROLADORES E ROTAS
// ==========================================
function render() {
  const showNav = ['home', 'pedidos', 'conta'].includes(v);
  $('#app').innerHTML = V[v]() + (showNav ? `
    <div class="nav">
      ${[
        ['home', '🏠', 'Início'],
        ['pedidos', '📋', 'Pedidos'],
        ['conta', '⚙️', 'Ajustes']
      ].map(([k, i, l]) => `
        <button class="${v == k ? 'on' : ''}" onclick="go('${k}')">
          <span class="nav-icon">${i}</span>
          <small>${l}</small>
        </button>
      `).join('')}
    </div>
  ` : '');

  updateRoleButtons();
}

function go(targetView, context) {
  if (context) Object.assign(C, context);
  if (['home', 'pedidos', 'conta', 'painel'].includes(targetView)) {
    H = [];
  } else if (targetView != v) {
    H.push(v);
  }
  v = targetView;
  render();
  window.scrollTo(0, 0);
  logEvent('navegou_para_tela', { tela: targetView });
}

function back() {
  v = H.pop() || 'home';
  render();
  window.scrollTo(0, 0);
}

function fl(q) {
  F.searchQuery = q || '';
  const term = normStr(q);

  // 1. Filtra as categorias com base no nome e palavras-chave de serviço (ex.: chuveiro -> Elétrica)
  document.querySelectorAll('.cat-btn').forEach(b => {
    const catName = b.dataset.cat || b.textContent.trim();
    const keywords = (CAT_KEYWORDS[catName] || []).join(' ');
    const searchable = normStr(catName + ' ' + keywords);
    b.style.display = (!term || searchable.includes(term)) ? '' : 'none';
  });

  // 2. Filtra a lista de profissionais com busca em múltiplos campos (nome, título, serviços, sobre)
  const proCards = document.querySelectorAll('.pro-card-item');
  let visiblePros = 0;
  proCards.forEach(c => {
    const searchable = c.dataset.search || '';
    const matches = !term || searchable.includes(term);
    c.style.display = matches ? '' : 'none';
    if (matches) visiblePros++;
  });

  // 3. Atualiza contador dinâmico de profissionais visíveis
  const countEl = document.getElementById('pros-count-label');
  if (countEl) {
    countEl.textContent = term ? `${visiblePros} encontrado(s)` : `${proCards.length} disponíveis`;
  }

  // 4. Exibe mensagem de feedback se nenhum resultado bater com o termo buscado
  const emptyEl = document.getElementById('search-empty-state');
  if (emptyEl) {
    if (term && visiblePros === 0) {
      emptyEl.style.display = 'block';
      emptyEl.innerHTML = `
        <div class="box" style="text-align:center;padding:16px;background:var(--muted-bg);margin-top:8px;">
          <div style="font-size:26px;margin-bottom:4px;">🔍</div>
          <b style="font-size:14px;color:var(--ink);">Nenhum serviço ou profissional encontrado para "${E(q)}"</b>
          <p style="font-size:12px;color:var(--m);margin-top:4px;">Tente buscar por termos como <i>chuveiro, vazamento, tomada, diarista, pintor, João</i> ou selecione uma categoria acima.</p>
        </div>
      `;
    } else {
      emptyEl.style.display = 'none';
    }
  }
}

function vp() {
  if (!F.desc.trim() || !F.end.trim()) {
    return toast('Preencha a descrição do problema e o endereço.');
  }
  logEvent('iniciou_orcamento', { cat: F.cat, pecas: F.pecas });
  go('ped');
}

function hire(id) {
  const p = pv(id);
  const c = calc(p, F.pecas);
  const r = {
    id: 'r' + Date.now(),
    pid: id,
    svc: F.desc.trim() || 'Atendimento residencial',
    cat: F.cat,
    end: F.end.trim() || 'Endereço residencial',
    pecas: F.pecas,
    pecasLabel: c.peLabel,
    quando: F.quando,
    det: c,
    val: c.t,
    status: 'Aguardando resposta',
    avaliado: false
  };
  S.reqs.push(r);
  save();
  logEvent('criou_pedido', { id: r.id, prestador: p.n, valor: r.val, distancia: p.km });
  toast('Solicitação criada com sucesso!');
  go('env', { rid: r.id });
}

function ans(id, ok) {
  const r = rq(id);
  if (ok) {
    r.val = r.nv;
    r.status = 'Confirmado';
    logEvent('morador_aceitou_ajuste', { id, novo_valor: r.nv });
    toast('Novo valor aprovado! Atendimento confirmado na sua agenda.');
  } else {
    r.status = 'Cancelado';
    logEvent('morador_recusou_ajuste', { id });
    toast('Ajuste recusado. Pedido cancelado.');
  }
  save();
  render();
}

function tg(c) {
  K.cats = K.cats.includes(c) ? K.cats.filter(x => x != c) : [...K.cats, c];
  render();
}

function foto(e) {
  const f = e.target.files[0];
  if (!f) return;
  const fr = new FileReader();
  fr.onload = () => {
    const i = new Image();
    i.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = cv.height = 160;
      const s = Math.min(i.width, i.height);
      cv.getContext('2d').drawImage(i, (i.width - s) / 2, (i.height - s) / 2, s, s, 0, 0, 160, 160);
      K.foto = cv.toDataURL('image/jpeg', 0.8);
      render();
    };
    i.src = fr.result;
  };
  fr.readAsDataURL(f);
}

function reg() {
  if (!(K.n || '').trim() || !K.cats.length) {
    return toast('Informe seu nome e ao menos uma categoria.');
  }
  const p = {
    id: 'u' + Date.now(),
    n: K.n.trim(),
    t: K.cats.join(' · '),
    nota: 5.0,
    av: 0,
    km: 2.0,
    base: 80,
    cats: K.cats,
    lat: USER_COORDS[0] + (Math.random() * 0.03 - 0.015),
    lng: USER_COORDS[1] + (Math.random() * 0.03 - 0.015),
    sobre: K.d || '',
    srv: K.cats.map(c => 'Serviços de ' + c.toLowerCase()),
    rev: [],
    foto: K.foto
  };
  S.provs.push(p);
  S.me = p.id;
  save();

  logEvent('prestador_cadastrado', { id: p.id, nome: p.n, categorias: p.cats });

  if (CFG.form) {
    fetch(CFG.form, {
      method: 'POST',
      mode: 'no-cors',
      body: new URLSearchParams({
        nome: p.n,
        contato: K.c || '',
        servicos: K.cats.join(', '),
        descricao: K.d || ''
      })
    }).catch(() => {});
  }

  K = { n: '', c: '', cats: ['Elétrica'], d: '', foto: '' };
  toast('Cadastro realizado com sucesso!');
  go('painel');
}

function acc(id) {
  rq(id).status = 'Confirmado';
  save();
  logEvent('prestador_aceitou_pedido', { id });
  toast('Atendimento confirmado!');
  go('painel');
}

function fin(id) {
  const r = rq(id);
  if (!r) return;
  r.status = 'Concluído';
  if (r.avaliado === undefined) r.avaliado = false;
  save();
  logEvent('servico_concluido', { id, valor: r.val, liquido: r.val * (1 - CFG.taxa) });
  toast('Serviço concluído! Ganhos contabilizados.');
  render();
}

function sendc() {
  const r = rq(C.rid);
  const nv = parseFloat(M.nv);
  if (!(nv > r.val) || !M.just.trim()) {
    return toast('Informe um valor superior e a justificativa clara.');
  }
  Object.assign(r, {
    nv,
    mot: M.mot,
    just: M.just.trim(),
    status: 'Em análise'
  });
  logEvent('prestador_contestou_valor', { id: r.id, original: r.val, proposto: nv, motivo: M.mot });
  M = { mot: 'Serviço mais difícil', nv: '', just: '' };
  save();
  toast('Ajuste enviado para o cliente!');
  go('rev');
}

// ==========================================
// EXPORTAÇÃO DE EVIDÊNCIAS (ENTREGA ACADÊMICA)
// ==========================================
function exportEvidenceCSV() {
  const logs = S.logs || [];
  if (!logs.length) return toast('Ainda não há eventos registrados.');
  let csv = 'Data,Hora,Acao,Detalhes\n';
  logs.forEach(l => {
    csv += `"${l.data}","${l.timestamp}","${l.action}","${JSON.stringify(l.details).replace(/"/g, '""')}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `evidencias_consertai_${Date.now()}.csv`;
  a.click();
  toast('Relatório CSV baixado!');
}

function exportEvidenceJSON() {
  const data = {
    projeto: 'Consertaí MVP',
    data_exportacao: new Date().toISOString(),
    pedidos: S.reqs,
    prestadores_cadastrados: S.provs,
    logs: S.logs
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `evidencias_consertai_${Date.now()}.json`;
  a.click();
  toast('Arquivo JSON baixado!');
}

function resetTestState() {
  if (confirm('Deseja realmente apagar todos os pedidos e cadastros e restaurar o estado padrão do teste?')) {
    S = { reqs: [], provs: [], me: 'p1', logs: [] };
    save();
    toast('Ambiente de testes restaurado.');
    go('home');
  }
}

// Inicialização
render();
