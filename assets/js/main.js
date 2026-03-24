(function () {
  const plan = window.studyPlan;
  if (!plan) return;

  const stateKey = "seiji_study_progress_v1";

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(stateKey) || "{}");
    } catch {
      return {};
    }
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
    return Array.isArray(plan.lessons) ? plan.lessons : [];
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function capitalize(value) {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function lessonNumber(lesson, allLessons) {
    const explicit = lesson.sequence || lesson.globalDay || lesson.lessonNumber || lesson.order || lesson.dayIndex;
    if (Number.isFinite(explicit)) return explicit;
    const index = allLessons.findIndex((item) => item.id === lesson.id);
    return index >= 0 ? index + 1 : 1;
  }

  function lessonHref(lesson, allLessons) {
    if (lesson.path) return lesson.path;
    if (lesson.file) return `apostilas/${lesson.file}`;
    if (lesson.slug) return `apostilas/${lesson.slug}.html`;
    const number = String(lessonNumber(lesson, allLessons)).padStart(3, "0");
    return `apostilas/dia-${number}.html`;
  }

  function lessonTypeLabel(type) {
    if (type === "revisao") return "Revisão";
    if (type === "teste") return "Teste";
    return "Conteúdo";
  }

  function lessonTypeClass(type) {
    if (type === "revisao") return "review";
    if (type === "teste") return "test";
    return "ok";
  }

  function progressSummary(allLessons) {
    const done = allLessons.filter((lesson) => isDone(lesson.id)).length;
    const review = allLessons.filter((lesson) => lesson.type === "revisao").length;
    const tests = allLessons.filter((lesson) => lesson.type === "teste").length;
    const pct = allLessons.length ? Math.round((done / allLessons.length) * 100) : 0;
    return { done, total: allLessons.length, review, tests, pct };
  }

  function renderStats(allLessons) {
    const mount = document.getElementById("stats-mount");
    if (!mount) return;

    const summary = progressSummary(allLessons);
    mount.innerHTML = `
      <article class="card stat-card">
        <strong>Aulas totais</strong>
        <span>${summary.total}</span>
        <small>Segunda a sábado, em 12 semanas.</small>
      </article>
      <article class="card stat-card">
        <strong>Concluídas</strong>
        <span>${summary.done}</span>
        <small>${summary.pct}% do cronograma finalizado.</small>
      </article>
      <article class="card stat-card">
        <strong>Revisões</strong>
        <span>${summary.review}</span>
        <small>Sextas-feiras dedicadas a recuperação ativa.</small>
      </article>
      <article class="card stat-card">
        <strong>Testes</strong>
        <span>${summary.tests}</span>
        <small>Sábados com aplicação prática e diagnóstico.</small>
      </article>
    `;
  }

  function renderWeeks(allLessons) {
    const mount = document.getElementById("weeks-mount");
    if (!mount) return;

    mount.innerHTML = "";

    (plan.weeks || []).forEach((weekData) => {
      const lessons = allLessons.filter((lesson) => lesson.week === weekData.week);
      const completed = lessons.filter((lesson) => isDone(lesson.id)).length;
      const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;

      const daysHtml = lessons.map((lesson) => {
        const href = lessonHref(lesson, allLessons);
        const done = isDone(lesson.id);
        const number = String(lessonNumber(lesson, allLessons)).padStart(3, "0");

        return `
          <article class="day-card ${lessonTypeClass(lesson.type)} ${done ? "is-done" : ""}">
            <a class="day-link" href="${href}">
              <div class="day-top">
                <span class="day-pill">${lessonTypeLabel(lesson.type)}</span>
                <span class="day-code">${number}</span>
              </div>
              <h3>${capitalize(lesson.weekday)} · Dia ${lesson.dayNumber}</h3>
              <p class="day-title">${escapeHtml(lesson.title)}</p>
              <p class="day-subject">${escapeHtml(lesson.subject)}</p>
            </a>
            <label class="day-check">
              <input type="checkbox" data-lesson-id="${escapeHtml(lesson.id)}" ${done ? "checked" : ""}>
              <span>Concluída</span>
            </label>
          </article>
        `;
      }).join("");

      const card = document.createElement("article");
      card.className = "card week-card";
      card.innerHTML = `
        <div class="week-head">
          <div>
            <p class="eyebrow">Semana ${weekData.week}</p>
            <h3>${escapeHtml(weekData.theme)}</h3>
          </div>
          <div class="week-progress">${percent}% concluído</div>
        </div>
        <p class="week-focus">${escapeHtml(weekData.focus)}</p>
        <div class="days-grid">${daysHtml}</div>
      `;
      mount.appendChild(card);
    });
  }

  function bindProgressEvents() {
    document.querySelectorAll("[data-lesson-id]").forEach((checkbox) => {
      checkbox.addEventListener("change", function (event) {
        event.stopPropagation();
        const id = this.getAttribute("data-lesson-id");
        setDone(id, this.checked);
        const allLessons = getAllLessons();
        renderStats(allLessons);
        renderWeeks(allLessons);
        bindProgressEvents();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    const allLessons = getAllLessons();
    renderStats(allLessons);
    renderWeeks(allLessons);
    bindProgressEvents();
  });
})();
