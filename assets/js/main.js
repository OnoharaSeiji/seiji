(function () {
  const plan = window.studyPlan;
  if (!plan || !Array.isArray(plan.lessons)) return;

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

  function lessonTypeLabel(type) {
    if (type === "revisao") return "Revisão";
    if (type === "teste") return "Teste";
    return "Conteúdo";
  }

  function lessonFile(index) {
    return `apostilas/dia-${String(index + 1).padStart(3, "0")}.html`;
  }

  function renderCalendar() {
    const mount = document.getElementById("calendar-mount");
    if (!mount) return;

    mount.innerHTML = "";
    (plan.weeks || []).forEach((weekData) => {
      const lessons = plan.lessons.filter((lesson) => lesson.week === weekData.week);
      const daysHtml = lessons
        .map((lesson) => {
          const globalIndex = plan.lessons.findIndex((item) => item.id === lesson.id);
          const href = lessonFile(globalIndex);
          return `
            <a class="calendar-day" href="${href}">
              <small>Semana ${weekData.week} · ${escapeHtml(prettyWeekday(lesson.weekday))} · Dia ${lesson.dayNumber}</small>
              <strong>${escapeHtml(lesson.title)}</strong>
              <span class="type-tag">${escapeHtml(lessonTypeLabel(lesson.type))}</span>
              <span class="subject-tag">${escapeHtml(lesson.subject)}</span>
              <p>${escapeHtml(lesson.objective)}</p>
              <span class="day-link">Abrir apostila</span>
            </a>
          `;
        })
        .join("");

      const card = document.createElement("article");
      card.className = "card calendar-week";
      card.innerHTML = `
        <header>
          <div>
            <span class="week-badge">Semana ${weekData.week}</span>
            <h2>${escapeHtml(weekData.theme)}</h2>
            <p>${escapeHtml(weekData.focus)}</p>
          </div>
        </header>
        <div class="calendar-grid">${daysHtml}</div>
      `;
      mount.appendChild(card);
    });
  }

  document.addEventListener("DOMContentLoaded", renderCalendar);
})();
