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

  function lessonFileName(lesson) {
    if (!lesson) return "";
    const week = String(lesson.week).padStart(2, "0");
    const day = String(lesson.dayNumber).padStart(2, "0");
    return `semana-${week}-dia-${day}.html`;
  }

  function lessonHref(lesson) {
    return lesson ? lessonFileName(lesson) : "#";
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
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

  function renderLessonPage() {
    const mount = document.getElementById("lesson-mount");
    const lessonId = document.body.dataset.lessonId;
    if (!mount || !lessonId) return;

    const lesson = getLesson(lessonId);
    if (!lesson) {
      mount.innerHTML = `
        <section class="card empty-state">
          <h1>Apostila não encontrada</h1>
          <p class="lead">Verifique o arquivo ou volte para o cronograma.</p>
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

          <section class="lesson-hero">
            <div class="lesson-hero-card">
              <span class="section-label">Método de estudo</span>
              <h2>Como usar esta apostila</h2>
              <p>Comece pela recuperação ativa, só depois releia. Em seguida, avance para o conteúdo principal, faça o exercício no seu contexto real, responda ao mini quiz e feche com um registro dos erros. Essa lógica favorece retenção, transferência e consistência.</p>
            </div>
            <div class="lesson-hero-stats">
              <div class="mini-panel">
                <strong>Tempo ideal</strong>
                <span>60 a 90 min</span>
              </div>
              <div class="mini-panel">
                <strong>Saída prática</strong>
                <span>1 aplicação concreta no seu trabalho</span>
              </div>
              <div class="mini-panel">
                <strong>Idiomas</strong>
                <span>Inglês + japonês no fechamento</span>
              </div>
              <div class="mini-panel">
                <strong>Critério de domínio</strong>
                <span>Explicar e aplicar sem consultar</span>
              </div>
            </div>
          </section>

          <div class="lesson-grid">
            <section class="lesson-section">
              <h2>1. Revisão da apostila anterior</h2>
              <p>Responda sem consultar. A meta é forçar recuperação ativa antes da releitura.</p>
              <ol>${reviewHtml}</ol>
            </section>

            <section class="lesson-section">
              <h2>2. Objetivo da aula</h2>
              <p>${escapeHtml(lesson.objective)}</p>
            </section>

            <section class="lesson-section">
              <h2>3. Conteúdo principal</h2>
              <p>Estes são os blocos que precisam ficar claros nesta aula.</p>
              <ul>${bulletHtml}</ul>
            </section>

            <section class="lesson-section">
              <h2>4. Exemplo guiado</h2>
              <p>Explique o tema em voz alta como se estivesse ensinando alguém. Depois construa um exemplo aplicado a uma conta, cliente ou rotina real sua.</p>
              <div class="note">Regra prática: entender → reproduzir → adaptar.</div>
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
              <h2>7. Feedback e autocorreção</h2>
              <p>Revise suas respostas e marque onde houve falha de conceito, pressa de execução ou leitura isolada de métrica. O ganho real vem da correção do erro, não só do acerto.</p>
              <ul>
                <li>O que eu entendi bem?</li>
                <li>Onde eu hesitei?</li>
                <li>O que preciso revisar amanhã em 5 minutos?</li>
              </ul>
            </section>

            <section class="lesson-section">
              <h2>8. Inglês aplicado</h2>
              <p>Tempo sugerido: ${escapeHtml(lesson.english.goal)}</p>
              <ul>${englishHtml}</ul>
            </section>

            <section class="lesson-section">
              <h2>9. Japonês aplicado</h2>
              <p>Tempo sugerido: ${escapeHtml(lesson.japanese.goal)}</p>
              <ul>${japaneseHtml}</ul>
            </section>

            <section class="lesson-section">
              <h2>10. Caderno de erros</h2>
              <p>Feche a aula registrando os 3 erros mais importantes do dia e a correção prática de cada um.</p>
              <ul>
                <li>Erro 1: conceito mal definido.</li>
                <li>Erro 2: execução sem checklist.</li>
                <li>Erro 3: decisão baseada em pouco contexto.</li>
              </ul>
            </section>
          </div>

          <div class="completion">
            <div>
              <strong>Marcar como concluída</strong>
              <p class="lesson-subtitle" style="margin-top:6px">Seu progresso continua salvo no navegador deste dispositivo.</p>
            </div>
            <label>
              <input id="completion-switch" class="switch" type="checkbox" ${checked} aria-label="Marcar apostila como concluída">
            </label>
          </div>

          <div class="nav-buttons">
            <a class="btn btn-secondary" href="../index.html">Retornar ao cronograma</a>
            ${prev ? `<a class="btn" href="${lessonHref(prev)}">Apostila anterior</a>` : ""}
            ${next ? `<a class="btn btn-primary" href="${lessonHref(next)}">Próxima apostila</a>` : ""}
          </div>
        </article>

        <aside class="card aside-card">
          <h3>Resumo da semana</h3>
          <p><strong>Semana ${lesson.week}.</strong> ${escapeHtml(lesson.weekTheme)}</p>
          <p>${escapeHtml(lesson.weekFocus)}</p>

          <div class="callout" style="margin-top:16px">
            <strong>Como esta base funciona</strong>
            <p>Você não precisa mais atualizar a estrutura do projeto para cada aula nova. Cada apostila já existe como arquivo próprio, com nome padronizado por semana e dia.</p>
          </div>

          <div class="callout" style="margin-top:16px">
            <strong>Fluxo ideal</strong>
            <p>Quando quiser melhorar uma apostila, basta substituir o arquivo desta aula e manter o mesmo nome.</p>
          </div>

          <div class="callout" style="margin-top:16px">
            <strong>Nome deste arquivo</strong>
            <p>${escapeHtml(lessonHref(lesson))}</p>
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

  document.addEventListener("DOMContentLoaded", renderLessonPage);
})();