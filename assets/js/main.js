(function () {
  const plan = window.studyPlan;
  if (!plan) return;

  const repoConfig = window.SEIJI_REPO_CONFIG || {
    owner: "OnoharaSeiji",
    repo: "seiji",
    lessonsDir: "apostilas",
  };

  const stateKey = "seiji_study_progress_v1";
  const availabilityCacheKey = "seiji_available_lessons_v2";
  const availabilityCacheTtlMs = 5 * 60 * 1000;

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

  function prettyWeekday(value) {
    const map = {
      segunda: "Segunda",
      terca: "Terça",
      quarta: "Quarta",
      quinta: "Quinta",
      sexta: "Sexta",
      sabado: "Sábado",
      domingo: "Domingo",
    };
    return map[value] || String(value || "");
  }

  function lessonNumber(lesson, allLessons) {
    const explicit =
      lesson.sequence ||
      lesson.globalDay ||
      lesson.lessonNumber ||
      lesson.order ||
      lesson.dayIndex;
    if (Number.isFinite(explicit)) return explicit;
    const index = allLessons.findIndex((item) => item.id === lesson.id);
    return index >= 0 ? index + 1 : 1;
  }

  function lessonFile(lesson, allLessons) {
    if (lesson.file) return lesson.file;
    if (lesson.slug) return `${lesson.slug}.html`;
    const number = String(lessonNumber(lesson, allLessons)).padStart(3, "0");
    return `dia-${number}.html`;
  }

  function lessonHref(lesson, allLessons) {
    if (lesson.path) return lesson.path;
    return `apostilas/${lessonFile(lesson, allLessons)}`;
  }

  function legacyKeyForLesson(lesson, allLessons) {
    const number = String(lessonNumber(lesson, allLessons)).padStart(3, "0");
    return `seiji.study.complete.dia-${number}`;
  }

  function isDone(lesson, allLessons) {
    const state = readState();
    if (state[lesson.id]) return true;
    return localStorage.getItem(legacyKeyForLesson(lesson, allLessons)) === "true";
  }

  function setDone(lesson, value, allLessons) {
    const state = readState();
    state[lesson.id] = !!value;
    saveState(state);
    localStorage.setItem(legacyKeyForLesson(lesson, allLessons), String(!!value));
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

  function readAvailabilityCache() {
    try {
      const raw = sessionStorage.getItem(availabilityCacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.files) || !parsed.ts) return null;
      if (Date.now() - parsed.ts > availabilityCacheTtlMs) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function writeAvailabilityCache(files) {
    try {
      sessionStorage.setItem(
        availabilityCacheKey,
        JSON.stringify({
          files,
          ts: Date.now(),
        })
      );
    } catch {
      // ignore sessionStorage errors
    }
  }

  function fallbackAvailableFiles() {
    return ["dia-001.html", "dia-002.html", "dia-003.html"];
  }

  async function fetchAvailableFiles() {
    const cache = readAvailabilityCache();
    if (cache) {
      return {
        files: new Set(cache.files),
        source: "cache",
      };
    }

    const url = `https://api.github.com/repos/${repoConfig.owner}/${repoConfig.repo}/contents/${repoConfig.lessonsDir}`;
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github+json",
        },
      });
      if (!response.ok) {
        throw new Error(`GitHub API ${response.status}`);
      }
      const data = await response.json();
      const files = Array.isArray(data)
        ? data
            .filter((item) => item && item.type === "file" && /^dia-\d{3}\.html$/i.test(item.name))
            .map((item) => item.name)
            .sort()
        : [];

      writeAvailabilityCache(files);

      return {
        files: new Set(files),
        source: "github-api",
      };
    } catch (error) {
      const files = fallbackAvailableFiles();
      return {
        files: new Set(files),
        source: "fallback",
        error: error instanceof Error ? error.message : "Falha ao consultar o GitHub",
      };
    }
  }

  function progressSummary(allLessons, availableFiles) {
    const publishedLessons = allLessons.filter((lesson) => availableFiles.has(lessonFile(lesson, allLessons)));
    const done = publishedLessons.filter((lesson) => isDone(lesson, allLessons)).length;
    const review = publishedLessons.filter((lesson) => lesson.type === "revisao").length;
    const tests = publishedLessons.filter((lesson) => lesson.type === "teste").length;
    const pct = publishedLessons.length ? Math.round((done / publishedLessons.length) * 100) : 0;

    return {
      planned: allLessons.length,
      published: publishedLessons.length,
      done,
      review,
      tests,
      pct,
    };
  }

  function renderAvailabilityNote(allLessons, availableFiles, source, error) {
    const note = document.getElementById("availability-note");
    const firstLessonLink = document.getElementById("first-lesson-link");
    if (!note) return;

    const publishedLessons = allLessons.filter((lesson) => availableFiles.has(lessonFile(lesson, allLessons)));
    const firstPublished = publishedLessons[0];

    if (firstLessonLink) {
      if (firstPublished) {
        firstLessonLink.href = lessonHref(firstPublished, allLessons);
        firstLessonLink.textContent = "Abrir primeira apostila publicada";
        firstLessonLink.removeAttribute("aria-disabled");
      } else {
        firstLessonLink.href = "#";
        firstLessonLink.textContent = "Nenhuma apostila publicada";
        firstLessonLink.setAttribute("aria-disabled", "true");
      }
    }

    const sourceLabel =
      source === "github-api"
        ? "GitHub"
        : source === "cache"
        ? "cache do navegador"
        : "modo de fallback";

    const errorText = error ? ` Falha de consulta: ${escapeHtml(error)}.` : "";
    note.innerHTML = `Detecção automática ativa. Hoje o sistema encontrou <strong>${publishedLessons.length}</strong> apostilas publicadas de um total planejado de <strong>${allLessons.length}</strong>. Fonte: ${escapeHtml(sourceLabel)}.${errorText}`;
  }

  function renderStats(allLessons, availableFiles) {
    const mount = document.getElementById("stats-mount");
    if (!mount) return;

    const summary = progressSummary(allLessons, availableFiles);
    mount.innerHTML = `
      <article class="card stat-card">
        <small>Planejadas</small>
        <strong>${summary.planned}</strong>
        <div class="progress-bar"><span style="width:100%"></span></div>
      </article>
      <article class="card stat-card">
        <small>Publicadas</small>
        <strong>${summary.published}</strong>
        <div class="progress-bar"><span style="width:${summary.planned ? Math.round((summary.published / summary.planned) * 100) : 0}%"></span></div>
      </article>
      <article class="card stat-card">
        <small>Concluídas</small>
        <strong>${summary.done}</strong>
        <div class="progress-bar"><span style="width:${summary.pct}%"></span></div>
      </article>
      <article class="card stat-card">
        <small>Revisões / testes publicados</small>
        <strong>${summary.review + summary.tests}</strong>
        <div class="progress-bar"><span style="width:${summary.published ? Math.round(((summary.review + summary.tests) / summary.published) * 100) : 0}%"></span></div>
      </article>
    `;
  }

  function renderWeeks(allLessons, availableFiles) {
    const mount = document.getElementById("weeks-mount");
    if (!mount) return;

    mount.innerHTML = "";

    (plan.weeks || []).forEach((weekData) => {
      const lessons = allLessons.filter((lesson) => lesson.week === weekData.week);
      const publishedLessons = lessons.filter((lesson) =>
        availableFiles.has(lessonFile(lesson, allLessons))
      );
      const completed = publishedLessons.filter((lesson) => isDone(lesson, allLessons)).length;
      const weekPercent = publishedLessons.length
        ? Math.round((completed / publishedLessons.length) * 100)
        : 0;

      const daysHtml = lessons
        .map((lesson) => {
          const available = availableFiles.has(lessonFile(lesson, allLessons));
          const done = available && isDone(lesson, allLessons);
          const href = lessonHref(lesson, allLessons);

          const openButton = available
            ? `<a class="btn btn-secondary day-open" href="${href}">Abrir</a>`
            : `<span class="tag locked">em breve</span>`;

          const doneTag = done ? `<span class="tag done">concluída</span>` : "";
          const publishedTag = available
            ? `<span class="tag live">publicada</span>`
            : `<span class="tag locked">em breve</span>`;

          const checkbox = available
            ? `<label class="day-check">
                 <input type="checkbox" data-lesson-id="${escapeHtml(lesson.id)}" ${done ? "checked" : ""}>
                 <span>Concluída</span>
               </label>`
            : "";

          return `
            <article class="day-item ${available ? "is-available" : "is-disabled"} ${done ? "is-done" : ""}">
              <div class="meta">
                <small>${escapeHtml(prettyWeekday(lesson.weekday))} · Dia ${lesson.dayNumber} · ${escapeHtml(lessonTypeLabel(lesson.type))}</small>
                <strong>${escapeHtml(lesson.title)}</strong>
                <small>${escapeHtml(lesson.subject)}</small>
              </div>
              <div class="day-tags">
                <span class="tag ${lessonTypeClass(lesson.type)}">${escapeHtml(lessonTypeLabel(lesson.type))}</span>
                ${publishedTag}
                ${doneTag}
              </div>
              <div class="day-actions">
                ${openButton}
                ${checkbox}
              </div>
            </article>
          `;
        })
        .join("");

      const card = document.createElement("article");
      card.className = "card week-card";
      card.innerHTML = `
        <header>
          <div>
            <span class="week-badge">Semana ${weekData.week}</span>
            <h3>${escapeHtml(weekData.theme)}</h3>
          </div>
          <div class="week-badge">${publishedLessons.length}/${lessons.length} publicadas · ${weekPercent}% concluído</div>
        </header>
        <p class="week-focus">${escapeHtml(weekData.focus)}</p>
        <div class="day-list">${daysHtml}</div>
      `;
      mount.appendChild(card);
    });
  }

  function bindProgressEvents(allLessons, availableFiles) {
    document.querySelectorAll("[data-lesson-id]").forEach((checkbox) => {
      checkbox.addEventListener("change", function (event) {
        event.stopPropagation();
        const lessonId = this.getAttribute("data-lesson-id");
        const lesson = allLessons.find((item) => item.id === lessonId);
        if (!lesson) return;
        setDone(lesson, this.checked, allLessons);
        renderStats(allLessons, availableFiles);
        renderWeeks(allLessons, availableFiles);
        bindProgressEvents(allLessons, availableFiles);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", async function () {
    const allLessons = getAllLessons();
    const availability = await fetchAvailableFiles();
    renderAvailabilityNote(allLessons, availability.files, availability.source, availability.error);
    renderStats(allLessons, availability.files);
    renderWeeks(allLessons, availability.files);
    bindProgressEvents(allLessons, availability.files);
  });
})();
