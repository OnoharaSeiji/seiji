
(function () {
  const plan = window.studyPlan;
  if (!plan) return;

  const stateKey = "seiji_study_progress_v1";

  function readState() {
    try { return JSON.parse(localStorage.getItem(stateKey) || "{}"); }
    catch { return {}; }
  }

  function saveState(state) {
    localStorage.setItem(stateKey, JSON.stringify(state));
  }

  function isDone(id) {
    return !!readState()[id];
  }

  function setDone(id, value) {
    const state = readState();
    state[id] = value;
    saveState(state);
  }

  function getAllLessons() {
    return plan.lessons || [];
  }

  function getLesson(id) {
    return getAllLessons().find(l => l.id === id);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function progressSummary() {
    const all = getAllLessons();
    const done = all.filter(l => isDone(l.id)).length;
    const pct = all.length ? Math.round((done / all.length) * 100) : 0;
    const review = all.filter(l => l.type === "revisao").length;
    const tests = all.filter(l => l.type === "teste").length;
    return { done, total: all.length, pct, review, tests };
  }

  function renderIndex() {
    const mount = document.getElementById("weeks-mount");
    const stats = document.getElementById("stats-mount");
    if (!mount) return;

    const summary = progressSummary();
    if (stats) {
      stats.innerHTML = `
        <article class="card stat-card">
          <small class="kicker">Aulas totais</small>
          <strong>${summary.total}</strong>
          <div class="note">Segunda a sábado, em 12 semanas.</div>
        </article>
        <article class="card stat-card">
          <small class="kicker">Concluídas</small>
          <strong>${summary.done}</strong>
          <div class="progress-bar" aria-label="Progresso geral"><span style="width:${summary.pct}%"></span></div>
        </article>
        <article class="card stat-card">
          <small class="kicker">Revisões</small>
          <strong>${summary.review}</strong>
          <div class="note">Sextas-feiras dedicadas a recuperação ativa.</div>
        </article>
        <article class="card stat-card">
          <small class="kicker">Testes</small>
          <strong>${summary.tests}</strong>
          <div class="note">Sábados com aplicação prática e diagnóstico.</div>
        </article>
      `;
    }

    mount.innerHTML = "";
    plan.weeks.forEach((weekData, index) => {
      const weekLessons = getAllLessons().filter(l => l.week === weekData.week);
      const completed = weekLessons.filter(l => isDone(l.id)).length;
      const percent = Math.round((completed / weekLessons.length) * 100);

      const daysHtml = weekLessons.map(lesson => {
        const typeClass = lesson.type === "conteudo" ? "ok" : lesson.type === "revisao" ? "review" : "test";
        const typeLabel = lesson.type === "conteudo" ? "Conteúdo" : lesson.type === "revisao" ? "Revisão" : "Teste";
        const doneTag = isDone(lesson.id) ? `<span class="tag ok">Concluída</span>` : "";
        return `
          <a class="day-item" href="apostilas/index.html?id=${encodeURIComponent(lesson.id)}">
            <div class="meta">
              <small>${capitalize(lesson.weekday)} · Dia ${lesson.dayNumber}</small>
              <strong>${escapeHtml(lesson.title)}</strong>
            </div>
            <div class="day-tags">
              <span class="tag ${typeClass}">${typeLabel}</span>
              <span class="tag">${escapeHtml(lesson.subject)}</span>
              ${doneTag}
            </div>
          </a>
        `;
      }).join("");

      const card = document.createElement("article");
      card.className = "card week-card";
      card.innerHTML = `
        <header>
          <div>
            <span class="week-badge">Semana ${weekData.week}</span>
            <h3>${escapeHtml(weekData.theme)}</h3>
          </div>
          <div class="tag">${percent}% concluído</div>
        </header>
        <p class="week-focus">${escapeHtml(weekData.focus)}</p>
        <div class="progress-bar" aria-label="Progresso da semana">
          <span style="width:${percent}%"></span>
        </div>
        <div class="day-list">${daysHtml}</div>
      `;
      mount.appendChild(card);
    });
  }

  function capitalize(v) {
    if (!v) return "";
    return v.charAt(0).toUpperCase() + v.slice(1);
  }

  function iconForType(type) {
    if (type === "revisao") return "Revisão";
    if (type === "teste") return "Teste";
    return "Apostila";
  }

  function renderLesson() {
    const mount = document.getElementById("lesson-mount");
    if (!mount) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const lesson = getLesson(id);
    if (!lesson) {
      mount.innerHTML = `
        <section class="card empty-state">
          <h1>Apostila não encontrada</h1>
          <p class="lead">Verifique o link ou volte para o cronograma.</p>
          <p><a class="btn btn-primary" href="../index.html">Voltar ao cronograma</a></p>
        </section>
      `;
      return;
    }

    const all = getAllLessons();
    const idx = all.findIndex(l => l.id === lesson.id);
    const prev = idx > 0 ? all[idx - 1] : null;
    const next = idx < all.length - 1 ? all[idx + 1] : null;
    const checked = isDone(lesson.id) ? "checked" : "";

    const typeLabel = iconForType(lesson.type);

    const bulletHtml = lesson.bullets.map(item => `<li>${escapeHtml(item)}</li>`).join("");
    const reviewHtml = lesson.review.map(item => `<li>${escapeHtml(item)}</li>`).join("");
    const quizHtml = lesson.quiz.map(item => `<li>${escapeHtml(item)}</li>`).join("");
    const englishHtml = lesson.english.tasks.map(item => `<li>${escapeHtml(item)}</li>`).join("");
    const japaneseHtml = lesson.japanese.tasks.map(item => `<li>${escapeHtml(item)}</li>`).join("");

    mount.innerHTML = `
      <div class="lesson-layout">
        <article class="card lesson-card">
          <div class="lesson-breadcrumb">
            <a href="../index.html">Cronograma</a>
            <span>•</span>
            <span>Semana ${lesson.week}</span>
            <span>•</span>
            <span>Dia ${lesson.dayNumber}</span>
          </div>
          <div class="eyebrow">${typeLabel} · ${capitalize(lesson.weekday)} · ${escapeHtml(lesson.subject)}</div>
          <h1 class="lesson-title">${escapeHtml(lesson.title)}</h1>
          <p class="lesson-subtitle">${escapeHtml(lesson.objective)}</p>

          <div class="lesson-grid">
            <section class="lesson-section">
              <h2>1. Revisão espaçada da apostila anterior</h2>
              <p>Comece sem consultar nada. Recupere da memória primeiro, só depois confira.</p>
              <ol>${reviewHtml}</ol>
            </section>

            <section class="lesson-section">
              <h2>2. Objetivo da aula</h2>
              <p>${escapeHtml(lesson.objective)}</p>
            </section>

            <section class="lesson-section">
              <h2>3. Conteúdo principal</h2>
              <p>Estes são os blocos que você precisa dominar nesta aula.</p>
              <ul>${bulletHtml}</ul>
            </section>

            <section class="lesson-section">
              <h2>4. Exemplo guiado</h2>
              <p>Explique este tema em voz alta, como se estivesse ensinando alguém. Em seguida, produza um exemplo aplicado ao seu contexto real de trabalho.</p>
              <div class="note">Regra prática: primeiro entender, depois reproduzir, depois adaptar.</div>
            </section>

            <section class="lesson-section">
              <h2>5. Exercício prático</h2>
              <p>${escapeHtml(lesson.task)}</p>
            </section>

            <section class="lesson-section">
              <h2>6. Mini quiz</h2>
              <ol>${quizHtml}</ol>
            </section>

            <section class="lesson-section">
              <h2>7. Inglês aplicado</h2>
              <p>Tempo sugerido: ${escapeHtml(lesson.english.goal)}</p>
              <ul>${englishHtml}</ul>
            </section>

            <section class="lesson-section">
              <h2>8. Japonês aplicado</h2>
              <p>Tempo sugerido: ${escapeHtml(lesson.japanese.goal)}</p>
              <ul>${japaneseHtml}</ul>
            </section>

            <section class="lesson-section">
              <h2>9. Caderno de erros</h2>
              <p>Anote no final da aula: o que você confundiu, por que confundiu e como evitar repetir o erro amanhã.</p>
              <ul>
                <li>Erro 1: conceito mal definido.</li>
                <li>Erro 2: execução pulada ou feita sem checklist.</li>
                <li>Erro 3: leitura de métrica isolada, sem contexto.</li>
              </ul>
            </section>

            <section class="lesson-section">
              <h2>10. Como estudar esta apostila</h2>
              <p>Esta estrutura usa métodos com boa sustentação empírica: recuperação ativa, revisão espaçada, mistura de tópicos, exemplo guiado, prática deliberada e autoexplicação.</p>
            </section>
          </div>

          <div class="completion">
            <div>
              <strong>Marcar como concluída</strong>
              <p class="lesson-subtitle" style="margin-top:6px">Seu progresso fica salvo no navegador deste dispositivo.</p>
            </div>
            <label>
              <input id="completion-switch" class="switch" type="checkbox" ${checked} aria-label="Marcar apostila como concluída">
            </label>
          </div>

          <div class="nav-buttons">
            <a class="btn btn-secondary" href="../index.html">Retornar ao cronograma</a>
            ${prev ? `<a class="btn" href="index.html?id=${encodeURIComponent(prev.id)}">Apostila anterior</a>` : ""}
            ${next ? `<a class="btn btn-primary" href="index.html?id=${encodeURIComponent(next.id)}">Próxima apostila</a>` : ""}
          </div>
        </article>

        <aside class="card aside-card">
          <h3>Resumo da semana</h3>
          <p><strong>Semana ${lesson.week}.</strong> ${escapeHtml(lesson.weekTheme)}</p>
          <p>${escapeHtml(lesson.weekFocus)}</p>

          <div class="callout" style="margin-top:16px">
            <strong>Tempo sugerido</strong>
            <p>60 a 90 minutos. Comece pela revisão, avance no conteúdo principal e feche com prática + idiomas.</p>
          </div>

          <div class="callout" style="margin-top:16px">
            <strong>Critério de qualidade</strong>
            <p>No fim da aula, você precisa conseguir explicar o conteúdo sem olhar e aplicar pelo menos uma decisão no seu contexto real.</p>
          </div>

          <div class="callout" style="margin-top:16px">
            <strong>Navegação</strong>
            <p>Use o botão de retorno para voltar ao cronograma e o botão de próxima apostila para manter a sequência diária.</p>
          </div>
        </aside>
      </div>
    `;

    const toggle = document.getElementById("completion-switch");
    if (toggle) {
      toggle.addEventListener("change", function () {
        setDone(lesson.id, this.checked);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderIndex();
    renderLesson();
  });
})();
