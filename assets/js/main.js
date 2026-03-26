(function () {
  const plan = window.studyPlan;
  if (!plan || !Array.isArray(plan.lessons)) return;

  const START_DATE = new Date(2026, 2, 23); // 23/03/2026
  const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  function lessonDate(index) {
    const date = new Date(START_DATE);
    let placed = 0;
    while (placed < index) {
      date.setDate(date.getDate() + 1);
      if (date.getDay() !== 0) placed += 1;
    }
    return new Date(date);
  }

  function mondayFirstOffset(jsDay) {
    return (jsDay + 6) % 7;
  }

  function monthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function formatMonth(date) {
    return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  const lessons = plan.lessons.map((lesson, index) => ({
    ...lesson,
    index,
    file: `apostilas/dia-${String(index + 1).padStart(3, "0")}.html`,
    date: lessonDate(index)
  }));

  const lessonMap = new Map(lessons.map((lesson) => [dateKey(lesson.date), lesson]));
  const monthOrder = [];
  lessons.forEach((lesson) => {
    const key = monthKey(lesson.date);
    if (!monthOrder.includes(key)) monthOrder.push(key);
  });

  function renderMonth(key) {
    const [year, month] = key.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const totalDays = lastDay.getDate();
    const offset = mondayFirstOffset(firstDay.getDay());

    let cells = "";
    for (let i = 0; i < offset; i += 1) {
      cells += `<div class="day-cell empty" aria-hidden="true"></div>`;
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(year, month - 1, day);
      const sunday = date.getDay() === 0;
      const keyDate = dateKey(date);
      const lesson = lessonMap.get(keyDate);

      if (lesson) {
        cells += `
          <a class="day-cell has-lesson" href="${lesson.file}">
            <div class="day-num"><span>${day}</span><span class="lesson-tag">Apostila ${String(lesson.index + 1).padStart(3, "0")}</span></div>
            <strong class="lesson-title">${escapeHtml(lesson.title)}</strong>
            <div class="lesson-meta">Semana ${lesson.week} · Dia ${lesson.dayNumber}<br>${escapeHtml(lesson.subject)}</div>
            <span class="lesson-open">Abrir apostila →</span>
          </a>
        `;
      } else {
        cells += `
          <div class="day-cell ${sunday ? "sunday" : "empty"}">
            <div class="day-num"><span>${day}</span></div>
          </div>
        `;
      }
    }

    const card = document.createElement("article");
    card.className = "card month-card";
    card.innerHTML = `
      <header class="month-head">
        <div>
          <span class="month-badge">📅 ${formatMonth(firstDay)}</span>
          <h2>${formatMonth(firstDay)}</h2>
          <p>Calendário real com as apostilas ligadas ao seu dia correspondente.</p>
        </div>
      </header>
      <div class="weekday-row">${weekdays.map((name) => `<div class="weekday">${name}</div>`).join("")}</div>
      <div class="month-grid">${cells}</div>
    `;
    return card;
  }

  function renderCalendar() {
    const mount = document.getElementById("calendar-mount");
    if (!mount) return;
    mount.innerHTML = "";
    monthOrder.forEach((key) => mount.appendChild(renderMonth(key)));

    const legend = document.createElement("div");
    legend.className = "legend";
    legend.innerHTML = `
      <span class="legend-item"><span class="dot"></span> Dia com apostila</span>
      <span class="legend-item"><span class="dot sunday"></span> Domingo sem estudo</span>
      <span class="legend-item"><span class="dot empty"></span> Dia sem apostila</span>
    `;
    mount.appendChild(legend);
  }

  document.addEventListener("DOMContentLoaded", renderCalendar);
})();
