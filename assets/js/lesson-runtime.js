(function () {
  const plan = window.studyPlan;
  if (!plan || !Array.isArray(plan.lessons)) return;

  const START_DATE = new Date(2026, 2, 23);
  const repoConfig = { owner: "OnoharaSeiji", repo: "seiji", lessonsDir: "apostilas" };
  const stateKey = "seiji_study_progress_v1";

  const refsBySubject = {
    "Meta Ads": [
      { title: "Meta for Business · Ad objectives", url: "https://www.facebook.com/business/ads/ad-objectives", desc: "Objetivos de campanha e relação entre objetivo de negócio e entrega do sistema." },
      { title: "Meta for Business · Advantage+ campaign budget", url: "https://www.facebook.com/business/ads/meta-advantage-plus/budget", desc: "Distribuição automática de orçamento na camada de campanha." },
      { title: "Meta for Business · Advantage+ placements", url: "https://www.facebook.com/business/ads/meta-advantage-plus/placements", desc: "Placements automáticos e expansão de oportunidades de entrega." }
    ],
    "Google Ads": [
      { title: "Google Ads Help · Keyword matching options", url: "https://support.google.com/google-ads/answer/11586965?hl=en", desc: "Correspondência ampla, frase e exata e como cada uma afeta o alcance." },
      { title: "Google Ads Help · Responsive search ads", url: "https://support.google.com/google-ads/answer/7684791?hl=en-419", desc: "Como RSAs combinam assets e aprendem quais combinações performam melhor." },
      { title: "Google Ads Help · About Performance Max campaigns", url: "https://support.google.com/google-ads/answer/10724817?hl=en", desc: "Papel da PMAX, canais cobertos e lógica de otimização com IA." }
    ],
    "Traqueamento": [
      { title: "Tag Manager Help · Set up GA4 events in Tag Manager", url: "https://support.google.com/tagmanager/answer/13034206?hl=en", desc: "Passo a passo oficial para configurar eventos GA4 via GTM." },
      { title: "Analytics Help · About events", url: "https://support.google.com/analytics/answer/9322688?hl=en-419", desc: "Conceito oficial de eventos no GA4 e seus tipos." },
      { title: "Analytics Help · Conversions vs. key events in GA4", url: "https://support.google.com/analytics/answer/13965727?hl=en", desc: "Diferença atual entre key events no Analytics e conversions no Google Ads." }
    ],
    "n8n": [
      { title: "n8n Docs · Error handling", url: "https://docs.n8n.io/flow-logic/error-handling/", desc: "Tratamento de erro, error workflow e investigação de falhas." },
      { title: "n8n Docs · Stop And Error", url: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.stopanderror/", desc: "Como forçar falha controlada e disparar fluxos de erro." },
      { title: "n8n Docs · Dealing with errors in workflows", url: "https://docs.n8n.io/courses/level-two/chapter-4/", desc: "Leitura de executions e depuração de workflows." }
    ],
    "CRM": [{ title: "IES · Organizing Instruction and Study to Improve Student Learning", url: "https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf", desc: "Base para revisão ativa, retenção e aplicação prática ao estudo." }],
    "Prospecção ativa": [{ title: "IES · Organizing Instruction and Study to Improve Student Learning", url: "https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf", desc: "Base metodológica para recuperação ativa e prática deliberada." }],
    "Vendas": [{ title: "IES · Organizing Instruction and Study to Improve Student Learning", url: "https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf", desc: "Base metodológica para revisão ativa, síntese e aplicação." }],
    "n8n + CRM": [
      { title: "n8n Docs · Error handling", url: "https://docs.n8n.io/flow-logic/error-handling/", desc: "Base oficial sobre falhas, alerts e tratamento de execução." },
      { title: "IES · Organizing Instruction and Study to Improve Student Learning", url: "https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf", desc: "Base pedagógica da estrutura de estudo e aplicação." }
    ],
    "Integração": [{ title: "IES · Organizing Instruction and Study to Improve Student Learning", url: "https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf", desc: "Base da metodologia de revisão ativa e síntese." }],
    "Idiomas": [{ title: "IES · Organizing Instruction and Study to Improve Student Learning", url: "https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf", desc: "Base para repetição ativa, evocação e prática curta frequente." }]
  };

  const subjectGuide = {
    "Meta Ads": { icon: "📢", main: "#2563eb", second: "#60a5fa", realm: "Reino da Performance", focus: "estruturar conta, intenção e leitura de sinais" },
    "Google Ads": { icon: "🔎", main: "#16a34a", second: "#4ade80", realm: "Reino da Intenção", focus: "consulta, anúncio e página em sintonia" },
    "Traqueamento": { icon: "📡", main: "#7c3aed", second: "#c4b5fd", realm: "Reino dos Sinais", focus: "dados limpos para otimização forte" },
    "n8n": { icon: "⚙️", main: "#ea580c", second: "#fdba74", realm: "Reino da Automação", focus: "workflow confiável e sem retrabalho" },
    "CRM": { icon: "🧭", main: "#0f766e", second: "#5eead4", realm: "Reino do Relacionamento", focus: "pipeline, follow-up e próxima ação" },
    "Prospecção ativa": { icon: "🎯", main: "#dc2626", second: "#fca5a5", realm: "Reino da Caça ao ICP", focus: "decisor, dor e abordagem coerente" },
    "Vendas": { icon: "💬", main: "#f59e0b", second: "#fde68a", realm: "Reino do Fechamento", focus: "diagnóstico, objeção e avanço" },
    "n8n + CRM": { icon: "🔗", main: "#8b5cf6", second: "#ddd6fe", realm: "Reino da Integração Comercial", focus: "lead entrando, sendo organizado e seguido" },
    "Integração": { icon: "🗺️", main: "#2563eb", second: "#93c5fd", realm: "Reino do Sistema", focus: "mídia, tracking e CRM trabalhando juntos" },
    "Idiomas": { icon: "🌍", main: "#0891b2", second: "#a5f3fc", realm: "Reino da Comunicação", focus: "vocabulário útil, repetição e aplicação" }
  };

  const shellStyle = `
    .cover{min-height:72vh;background:linear-gradient(155deg,var(--cover-main), var(--cover-dark) 46%, var(--cover-second) 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:42px 24px;position:relative;overflow:hidden}
    .cover-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px);background-size:56px 56px}
    .cover-glow{position:absolute;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle, rgba(255,255,255,.22), transparent 70%);top:-120px;right:-100px}
    .cover-icon{font-size:84px;position:relative;z-index:2;margin-bottom:14px;animation:floaty 2.8s ease-in-out infinite}
    @keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    .cover h1{font-family:'Fredoka',cursive;font-size:clamp(38px,6vw,68px);line-height:1.06;color:#fff;text-shadow:0 8px 30px rgba(0,0,0,.24);position:relative;z-index:2;letter-spacing:-.03em;margin:0}
    .cover-sub{margin-top:14px;color:rgba(255,255,255,.92);font-weight:800;font-size:clamp(16px,2.3vw,22px);position:relative;z-index:2}
    .cover-pills{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:24px;position:relative;z-index:2}
    .pill{padding:9px 16px;border-radius:999px;font-size:13px;font-weight:900;border:2px solid rgba(255,255,255,.22);color:#fff;background:rgba(255,255,255,.12);backdrop-filter:blur(4px)}
    .cover-note{margin-top:24px;max-width:820px;padding:18px 22px;border-radius:18px;background:rgba(255,255,255,.14);border:1.5px solid rgba(255,255,255,.24);color:rgba(255,255,255,.95);font-size:14px;font-weight:800;line-height:1.68;position:relative;z-index:2}
    .science-bar{background:#19304e;padding:12px 18px;display:flex;flex-wrap:wrap;justify-content:center;gap:8px}.science-chip{background:rgba(255,255,255,.08);color:rgba(255,255,255,.92);border:1.5px solid rgba(255,255,255,.16);border-radius:999px;padding:6px 12px;font-size:12px;font-weight:900}
    .page{max-width:980px;margin:0 auto;padding:38px 18px}
    .stage{border-radius:24px;padding:28px 24px;margin-bottom:24px;position:relative;overflow:hidden;box-shadow:0 18px 34px rgba(24,49,79,.14)}
    .stage::after{content:'';position:absolute;width:280px;height:280px;border-radius:50%;background:rgba(255,255,255,.08);right:-50px;bottom:-90px}
    .stage.blue{background:linear-gradient(135deg,#1d4ed8,#2563eb,#60a5fa)} .stage.green{background:linear-gradient(135deg,#065f46,#16a34a,#4ade80)} .stage.orange{background:linear-gradient(135deg,#9a3412,#ea580c,#fb923c)} .stage.purple{background:linear-gradient(135deg,#4c1d95,#7c3aed,#c4b5fd)} .stage.dark{background:linear-gradient(135deg,#0f172a,#1f3b63,#2563eb)}
    .stage-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.18);color:#fff;border:1.5px solid rgba(255,255,255,.28);padding:6px 14px;border-radius:999px;font-size:11px;font-weight:900;letter-spacing:.6px;text-transform:uppercase;margin-bottom:10px}
    .stage-icon{font-size:50px;margin-bottom:10px;display:block;position:relative;z-index:1}.stage h2{font-family:'Fredoka',cursive;font-size:clamp(28px,4vw,46px);color:#fff;line-height:1.12;text-shadow:0 4px 16px rgba(0,0,0,.24);position:relative;z-index:1;margin:0}.stage p{margin-top:10px;color:rgba(255,255,255,.92);font-size:15px;font-weight:800;position:relative;z-index:1}.stage-tags{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px;position:relative;z-index:1}.stage-tag{background:rgba(255,255,255,.16);color:#fff;border:1.5px solid rgba(255,255,255,.24);border-radius:999px;padding:6px 12px;font-size:12px;font-weight:900}
    .cardx{background:var(--panel);border-radius:18px;padding:24px;margin-bottom:18px;box-shadow:var(--shadow)} .cardx h3{font-family:'Fredoka',cursive;font-size:24px;margin:0 0 12px;display:flex;align-items:center;gap:8px} .cardx p{margin:0;color:var(--muted);line-height:1.78} .cardx ul,.cardx ol{margin:12px 0 0 18px;padding:0} .cardx li{margin:10px 0;line-height:1.7;color:var(--ink);font-weight:700}
    .cardx.bc{border-left:6px solid #f08d49}.cardx.bc h3{color:#ea580c}.cardx.bp{border-left:6px solid #4f7cff}.cardx.bp h3{color:#2563eb}.cardx.ba{border-left:6px solid #8d71ff}.cardx.ba h3{color:#7c3aed}.cardx.bg{border-left:6px solid #22a861}.cardx.bg h3{color:#16a34a}.cardx.bo{border-left:6px solid #f4b860}.cardx.bo h3{color:#d97706}.cardx.br{border-left:6px solid #e56b79}.cardx.br h3{color:#dc2626}
    .info{border-radius:14px;padding:16px 18px;margin:12px 0;font-size:14px;font-weight:800;line-height:1.66}.info strong{font-weight:900}.info.yellow{background:#fff8dd;border:2px solid #fde68a}.info.blue{background:#eff6ff;border:2px solid #93c5fd}.info.green{background:#f0fdf4;border:2px solid #86efac}.info.orange{background:#fff7ed;border:2px solid #fdba74}.info.purple{background:#f5f3ff;border:2px solid #c4b5fd}.info.red{background:#fff1f2;border:2px solid #fda4af}
    .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:12px 0}.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:12px 0}
    .bubble-card{background:#f8fafc;border:2px solid #dbe4f1;border-radius:16px;padding:16px;text-align:center;min-height:116px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:8px}.bubble-card strong{font-size:15px;color:var(--ink)}.bubble-card small{color:var(--muted);font-size:12px;font-weight:900}
    .question{background:#f8fbff;border-left:5px solid #dbe4f1;border-radius:14px;padding:15px 16px;margin-bottom:12px;font-size:14px;font-weight:800;line-height:1.65}.question.blue{border-left-color:#2563eb}.question.orange{border-left-color:#ea580c}.question.green{border-left-color:#16a34a}.question.purple{border-left-color:#7c3aed}
    details.answer{margin-top:10px;border-radius:12px;padding:12px 14px;background:#f0fdf4;border:2px solid #86efac;color:#166534;font-size:13px;font-weight:800;line-height:1.6}
    .nav-bottom{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin:36px 0 10px}.nav-bottom a,.nav-bottom button{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border-radius:12px;padding:12px 18px;font-weight:900;border:none;cursor:pointer}.btn-back{background:#e5e7eb;color:#111827}.btn-prev{background:#dbeafe;color:#1e3a8a}.btn-next{background:#2563eb;color:#fff}.btn-next.disabled{background:#9ca3af;pointer-events:none;cursor:not-allowed}
    .completion{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px;border-radius:18px;background:rgba(255,255,255,.98);border:1px solid var(--line);margin-top:18px;box-shadow:var(--shadow-soft)}
    .footer-info{background:#0d1117;color:rgba(255,255,255,.72);text-align:center;padding:28px 20px;font-size:13px;font-weight:800;margin-top:40px}
    @media(max-width:760px){.grid-2,.grid-3{grid-template-columns:1fr}.cover h1{font-size:42px}.stage h2{font-size:32px}.nav-bottom{flex-direction:column}.nav-bottom a,.nav-bottom button{width:100%}.completion{flex-direction:column;align-items:flex-start}}
  `;

  function lessonDate(number) {
    const date = new Date(START_DATE);
    let placed = 1;
    while (placed < number) {
      date.setDate(date.getDate() + 1);
      if (date.getDay() !== 0) placed += 1;
    }
    return new Date(date);
  }

  function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }

  function prettyWeekday(value) {
    const map = { segunda: "segunda-feira", terca: "terça-feira", quarta: "quarta-feira", quinta: "quinta-feira", sexta: "sexta-feira", sabado: "sábado", domingo: "domingo" };
    return map[value] || String(value || "");
  }

  function formatDateLong(date) {
    return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(date);
  }

  function lessonNumberFromPath() {
    const match = window.location.pathname.match(/dia-(\d{3})\.html/i);
    return match ? Number(match[1]) : null;
  }

  function lessonFile(number) { return `dia-${String(number).padStart(3, "0")}.html`; }
  function readState() { try { return JSON.parse(localStorage.getItem(stateKey) || "{}"); } catch { return {}; } }
  function saveState(state) { localStorage.setItem(stateKey, JSON.stringify(state)); }
  function refsFor(subject) { return refsBySubject[subject] || refsBySubject["Integração"]; }
  function guideFor(subject) { return subjectGuide[subject] || subjectGuide["Integração"]; }

  function card(title, colorClass, body) { return `<div class="cardx ${colorClass}"><h3>${title}</h3>${body}</div>`; }

  function stage(id, tone, badge, icon, title, desc, tags, inner) {
    return `<section id="${id}"><div class="stage ${tone}"><div class="stage-badge">${badge}</div><span class="stage-icon">${icon}</span><h2>${title}</h2><p>${desc}</p><div class="stage-tags">${tags.map((tag) => `<span class="stage-tag">${tag}</span>`).join("")}</div></div>${inner}</section>`;
  }

  function buildReviewCards(lesson, previous) {
    const prompts = Array.isArray(lesson.review) && lesson.review.length ? lesson.review : [`Sem consultar, explique o ponto central de “${previous ? previous.title : "a aula anterior"}”.`, "Cite 3 ideias que ainda estão claras na memória.", "O que você aplicaria hoje deste conteúdo?", "Qual foi a maior confusão conceitual até aqui?"];
    return card("🧠 Revisão ativa da aula anterior", "bo", `<div class="info yellow">Antes de seguir, recupere da memória o que veio antes. Responder sem olhar ativa o cérebro de verdade.</div>${prompts.map((item, index) => `<div class="question orange"><strong>${index + 1}.</strong> ${escapeHtml(item)}</div>`).join("")}`);
  }

  function buildCoreCards(lesson, number) {
    const guide = guideFor(lesson.subject);
    const bullets = (lesson.bullets || []).map((bullet) => `<div class="bubble-card"><div style="font-size:30px">${guide.icon}</div><strong>${escapeHtml(bullet)}</strong><small>${escapeHtml(guide.focus)}</small></div>`).join("");
    return card("🎯 Objetivo da aula", "bp", `<div class="info blue">${escapeHtml(lesson.objective)}</div><div class="info green"><strong>Reino:</strong> ${escapeHtml(guide.realm)}<br><strong>Foco:</strong> ${escapeHtml(guide.focus)}<br><strong>Data:</strong> ${formatDateLong(lessonDate(number))} · ${escapeHtml(prettyWeekday(lesson.weekday))}</div>`) + card("🧱 Pilares do conteúdo", "ba", `<div class="grid-2">${bullets}</div>`);
  }

  function buildExampleCards(lesson) {
    return card("🔍 Exemplo guiado", "bg", `<div class="info green">Traga este conteúdo para um caso real seu. O objetivo é sair da teoria e enxergar onde a ideia aparece na prática.</div><div class="info blue"><strong>Aplicação melhor:</strong> usar a aula para tomar uma decisão mais limpa, reduzir ruído operacional e aprender com o que está observando.</div><div class="info red"><strong>Aplicação fraca:</strong> executar sem hipótese, sem critério e sem ligação com o objetivo real.</div>`) + card("🧪 Missão prática", "bc", `<div class="question orange"><strong>Tarefa da aula:</strong> ${escapeHtml(lesson.task)}</div><div class="info orange">Escreva a situação atual, explique por que isso importa agora e defina os critérios que usará para avaliar se sua resposta ficou boa.</div>`);
  }

  function buildQuizCard(lesson) {
    const questions = Array.isArray(lesson.quiz) && lesson.quiz.length ? lesson.quiz : ["Explique o ponto central desta aula com suas palavras.", "Qual erro esta aula te ajuda a evitar?", "Como você aplicaria isso hoje?"];
    return card("🎮 Mini quiz com gabarito", "bp", `${questions.map((question, index) => `<div class="question blue"><strong>${index + 1}.</strong> ${escapeHtml(question)}<details class="answer"><summary>Ver gabarito</summary><div>${escapeHtml(lesson.objective)}</div></details></div>`).join("")}`);
  }

  function buildLanguageCards(lesson) {
    const guide = guideFor(lesson.subject);
    const englishTasks = lesson.english?.tasks || [];
    const japaneseTasks = lesson.japanese?.tasks || [];
    return card("🌍 Inglês aplicado", "ba", `<div class="info purple"><strong>Vocabulário útil:</strong> ${escapeHtml((guide.focus || "").toLowerCase())}</div><ul>${englishTasks.map((task) => `<li>${escapeHtml(task)}</li>`).join("")}</ul>`) + card("🗾 Japonês aplicado", "bg", `<div class="info green"><strong>Repetição curta e frequente.</strong></div><ul>${japaneseTasks.map((task) => `<li>${escapeHtml(task)}</li>`).join("")}</ul>`);
  }

  function buildErrorAndRefs(lesson) {
    const refs = refsFor(lesson.subject);
    return card("⚠️ Caderno de erros", "br", `<div class="info red">Registre o que ainda ficou confuso, onde você tende a errar e qual ponto precisa revisar amanhã antes da próxima aula.</div>`) + card("📚 Base consultada", "bo", refs.map((ref) => `<div class="question orange"><strong>${escapeHtml(ref.title)}</strong><br>${escapeHtml(ref.desc)}<br><a href="${escapeHtml(ref.url)}" target="_blank" rel="noopener noreferrer">Abrir referência</a></div>`).join(""));
  }

  function createPageShell(lesson, number, previous) {
    const date = lessonDate(number);
    const guide = guideFor(lesson.subject);
    return `
      <style>${shellStyle}</style>
      <div class="cover" id="top" style="--cover-main:${guide.main};--cover-second:${guide.second};--cover-dark:#16314d">
        <div class="cover-grid"></div>
        <div class="cover-glow"></div>
        <div class="cover-icon">${guide.icon}</div>
        <h1>${escapeHtml(lesson.title)}</h1>
        <p class="cover-sub">Dia ${String(number).padStart(3, "0")} • ${formatDateLong(date)} • ${escapeHtml(prettyWeekday(lesson.weekday))}</p>
        <div class="cover-pills">
          <span class="pill">Semana ${lesson.week}</span>
          <span class="pill">${escapeHtml(lesson.subject)}</span>
          <span class="pill">${escapeHtml(lesson.type)}</span>
          <span class="pill">${escapeHtml(guide.realm)}</span>
        </div>
        <div class="cover-note">${escapeHtml(lesson.objective)}${previous ? ` A revisão da apostila anterior entra logo no começo desta missão.` : " Esta é a missão de abertura do cronograma."}</div>
      </div>
      <div class="science-bar">
        <div class="science-chip">Revisão ativa</div>
        <div class="science-chip">Exemplo guiado</div>
        <div class="science-chip">Prática aplicada</div>
        <div class="science-chip">Mini quiz</div>
        <div class="science-chip">Inglês</div>
        <div class="science-chip">Japonês</div>
        <div class="science-chip">Caderno de erros</div>
      </div>
      <div class="page">
        ${stage("intro", "orange", "🧭 Mapa da missão", guide.icon, lesson.title, lesson.objective, [guide.realm, `Semana ${lesson.week}`, `Dia ${lesson.dayNumber}`], buildReviewCards(lesson, previous) + buildCoreCards(lesson, number))}
        ${stage("aplicacao", "blue", "🧪 Aplicação", "🔍", "Exemplos e prática", "Agora a ideia vira observação e tarefa concreta.", [guide.focus, "Hipótese", "Validação"], buildExampleCards(lesson))}
        ${stage("quiz", "purple", "🎮 Fechamento", "🏁", "Teste e consolidação", "Feche a missão validando o que ficou e registrando o que precisa de reforço.", ["Quiz", "Idiomas", "Revisão"], buildQuizCard(lesson) + buildLanguageCards(lesson) + buildErrorAndRefs(lesson))}
        <div class="completion"><div><strong>Marcar esta apostila como concluída</strong><div style="color:var(--muted);margin-top:4px;font-weight:700">O status é salvo no navegador deste dispositivo.</div></div><label><input id="completion-switch" class="switch" type="checkbox" aria-label="Marcar apostila como concluída"></label></div>
        <div class="nav-bottom"><a class="btn-back" href="../index.html">← Voltar ao cronograma</a><a class="btn-prev" id="prev-lesson-link" href="../index.html">Apostila anterior</a><a class="btn-next" id="next-lesson-link" href="#">Próxima apostila →</a></div>
      </div>
      <div class="footer-info">Dia ${String(number).padStart(3, "0")} • ${escapeHtml(lesson.title)} • ${escapeHtml(lesson.subject)} • ${formatDateLong(date)}</div>
    `;
  }

  function setCompletion(lesson, number) {
    const toggle = document.getElementById("completion-switch");
    if (!toggle) return;
    const state = readState();
    toggle.checked = !!state[lesson.id];
    toggle.addEventListener("change", function () {
      const next = readState();
      next[lesson.id] = this.checked;
      saveState(next);
      localStorage.setItem(`seiji.study.complete.${lessonFile(number).replace(".html", "")}`, String(!!this.checked));
    });
  }

  async function wireNavigation(number) {
    const prevLink = document.getElementById("prev-lesson-link");
    const nextLink = document.getElementById("next-lesson-link");
    const prevNumber = number - 1;
    const nextNumber = number + 1;
    if (prevLink) {
      if (prevNumber >= 1) prevLink.href = lessonFile(prevNumber);
      else { prevLink.href = "../index.html"; prevLink.textContent = "← Voltar ao cronograma"; }
    }
    if (!nextLink) return;
    if (nextNumber > plan.lessons.length) {
      nextLink.href = "../index.html"; nextLink.textContent = "Fim do cronograma"; nextLink.classList.add("disabled"); return;
    }
    const nextFile = lessonFile(nextNumber);
    const apiUrl = `https://api.github.com/repos/${repoConfig.owner}/${repoConfig.repo}/contents/${repoConfig.lessonsDir}/${nextFile}`;
    try {
      const response = await fetch(apiUrl, { headers: { Accept: "application/vnd.github+json" } });
      if (response.ok) { nextLink.href = nextFile; nextLink.textContent = "Próxima apostila →"; nextLink.classList.remove("disabled"); }
      else { nextLink.href = "#"; nextLink.textContent = "Próxima apostila ainda não publicada"; nextLink.classList.add("disabled"); }
    } catch { nextLink.href = "#"; nextLink.textContent = "Próxima apostila ainda não publicada"; nextLink.classList.add("disabled"); }
  }

  function renderError(message) {
    document.body.innerHTML = `<style>${shellStyle}</style><div class="page"><div class="cardx br"><h3>⚠️ Apostila não encontrada</h3><div class="info red">${escapeHtml(message)}</div><div class="nav-bottom"><a class="btn-back" href="../index.html">← Voltar ao cronograma</a></div></div></div>`;
  }

  const number = lessonNumberFromPath();
  if (!number) { renderError("Não foi possível identificar o número da apostila pela URL."); return; }
  const lesson = plan.lessons[number - 1];
  if (!lesson) { renderError("Esta apostila ainda não está cadastrada no cronograma oficial."); return; }
  const previous = number > 1 ? plan.lessons[number - 2] : null;
  document.title = `Dia ${String(number).padStart(3, "0")} — ${lesson.title} | Seiji`;
  document.body.innerHTML = createPageShell(lesson, number, previous);
  setCompletion(lesson, number);
  wireNavigation(number);
})();
