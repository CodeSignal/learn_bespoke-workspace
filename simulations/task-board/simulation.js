const S = [
  { id: "pending", label: "Pending", dotClass: "pending" },
  { id: "inprogress", label: "In Progress", dotClass: "inprogress" },
  { id: "blocked", label: "Blocked", dotClass: "blocked" },
  { id: "done", label: "Done", dotClass: "done" }
], A = [
  { id: "t1", title: "Run final staging smoke tests", desc: "Execute the full regression suite against staging before the 10 AM deploy.", status: "pending", assignee: "Alex R.", priority: "high" },
  { id: "t2", title: "Prepare rollback runbook", desc: "Document step-by-step rollback procedure including feature flag and DB migration revert.", status: "pending", assignee: "Alex R.", priority: "high" },
  { id: "t3", title: "Send customer notification email", desc: "Notify enterprise customers about the upcoming v2.0 release and expected downtime window.", status: "done", assignee: "Marketing", priority: "medium" },
  { id: "t4", title: "Update API documentation", desc: "Add docs for new endpoints introduced in v2.0.", status: "inprogress", assignee: "Jordan K.", priority: "medium" },
  { id: "t5", title: "Investigate /api/users 500 errors", desc: "Datadog showing ~2% error rate on /api/users since 8:45 AM. Possible race condition in connection pooling.", status: "inprogress", assignee: "Alex R.", priority: "high" },
  { id: "t6", title: "Review onboarding flow copy", desc: "Final copy review for the updated first-run experience.", status: "done", assignee: "Sarah C.", priority: "low" },
  { id: "t7", title: "Deploy marketing landing page", desc: "Blocked on engineering go/no-go decision at 9 AM.", status: "blocked", assignee: "Marketing", priority: "medium" },
  { id: "t8", title: "Post launch announcement in #general", desc: "Prepare Slack message for all-hands after successful deploy.", status: "pending", assignee: "Sarah C.", priority: "low" }
], k = 1;
let r = [], m = 100, p = null, l = null, f = null, g = {};
function E() {
  try {
    const t = localStorage.getItem("task-board-version");
    if (Number(t) === k) {
      const e = localStorage.getItem("task-board-tasks");
      if (e) {
        r = JSON.parse(e), m = r.reduce((s, a) => {
          const o = parseInt(a.id.replace("t", ""), 10);
          return isNaN(o) ? s : Math.max(s, o + 1);
        }, m);
        return;
      }
    }
  } catch (t) {
    console.error("Failed to load tasks:", t);
  }
  r = JSON.parse(JSON.stringify(A)), localStorage.setItem("task-board-version", String(k)), b();
}
function b() {
  try {
    localStorage.setItem("task-board-tasks", JSON.stringify(r));
  } catch (t) {
    console.error("Failed to save tasks:", t);
  }
}
function v(t) {
  const e = document.createElement("div");
  return e.textContent = t, e.innerHTML;
}
function $(t) {
  return r.filter((e) => e.status === t);
}
function u() {
  const t = document.getElementById("board-columns");
  t && (t.innerHTML = S.map((e) => {
    const s = $(e.id);
    return `
      <div class="board-column" data-col="${e.id}">
        <div class="board-column-header">
          <span class="board-column-title">
            <span class="status-dot ${e.dotClass}"></span>
            ${e.label}
            <span class="board-column-count">${s.length}</span>
          </span>
          <button class="board-column-add" data-col="${e.id}" title="Add task">+</button>
        </div>
        <div class="board-column-body" data-col="${e.id}">
          ${f === e.id ? C(e.id) : ""}
          ${s.map((a) => x(a)).join("")}
        </div>
      </div>
    `;
  }).join(""));
}
function x(t) {
  const e = t.priority ? `<span class="task-card-priority ${t.priority}">${t.priority}</span>` : "", s = t.assignee ? `<span class="task-card-assignee">${v(t.assignee)}</span>` : "<span></span>";
  return `
    <div class="task-card" draggable="true" data-task-id="${t.id}">
      <div class="task-card-title">${v(t.title)}</div>
      ${t.desc ? `<p class="task-card-desc">${v(t.desc)}</p>` : ""}
      <div class="task-card-footer">
        ${s}
        ${e}
      </div>
    </div>
  `;
}
function C(t) {
  return `
    <form class="add-task-form" data-col="${t}">
      <input type="text" class="input" name="title" placeholder="Task title" autocomplete="off" required />
      <input type="text" class="input" name="desc" placeholder="Description (optional)" autocomplete="off" />
      <div class="add-task-form-actions">
        <button type="submit" class="button button-primary">Add</button>
        <button type="button" class="button button-text add-task-cancel">Cancel</button>
      </div>
    </form>
  `;
}
function L(t) {
  f = t, u();
  const e = document.querySelector(`.add-task-form[data-col="${t}"] input[name="title"]`);
  e && e.focus();
}
function T(t, e, s) {
  const a = `t${m++}`;
  r.push({ id: a, title: e, desc: s || "", status: t, assignee: "", priority: "medium" }), b(), f = null, u(), g.emit && g.emit("task:added", { taskId: a, title: e, status: t });
}
function I() {
  f = null, u();
}
function h(t, e, s) {
  const a = r.find((n) => n.id === t);
  if (!a) return;
  const o = a.status;
  if (r = r.filter((n) => n.id !== t), a.status = e, s) {
    const n = r.findIndex((i) => i.id === s);
    n !== -1 ? r.splice(n, 0, a) : r.push(a);
  } else
    r.push(a);
  b(), u(), g.emit && o !== e && g.emit("task:moved", { taskId: t, title: a.title, from: o, to: e });
}
function q(t) {
  const e = document.getElementById("board-columns");
  e && (e.addEventListener("dragstart", (s) => {
    const a = s.target.closest(".task-card");
    a && (l = a.dataset.taskId, a.classList.add("dragging"), s.dataTransfer.effectAllowed = "move", s.dataTransfer.setData("text/plain", l));
  }, { signal: t }), e.addEventListener("dragend", (s) => {
    const a = s.target.closest(".task-card");
    a && a.classList.remove("dragging"), l = null, document.querySelectorAll(".board-column.drag-over").forEach((o) => o.classList.remove("drag-over")), document.querySelectorAll(".task-card-placeholder").forEach((o) => o.remove());
  }, { signal: t }), e.addEventListener("dragover", (s) => {
    s.preventDefault(), s.dataTransfer.dropEffect = "move";
    const a = s.target.closest(".board-column");
    if (!a) return;
    document.querySelectorAll(".board-column.drag-over").forEach((d) => {
      d !== a && d.classList.remove("drag-over");
    }), a.classList.add("drag-over");
    const o = a.querySelector(".board-column-body");
    if (!o) return;
    let n = o.querySelector(".task-card-placeholder");
    n || (n = document.createElement("div"), n.className = "task-card-placeholder");
    const i = [...o.querySelectorAll(".task-card:not(.dragging)")];
    let c = null;
    for (const d of i) {
      const y = d.getBoundingClientRect();
      if (s.clientY < y.top + y.height / 2) {
        c = d;
        break;
      }
    }
    c ? o.insertBefore(n, c) : o.appendChild(n);
  }, { signal: t }), e.addEventListener("dragleave", (s) => {
    const a = s.target.closest(".board-column");
    if (a && !a.contains(s.relatedTarget)) {
      a.classList.remove("drag-over");
      const o = a.querySelector(".task-card-placeholder");
      o && o.remove();
    }
  }, { signal: t }), e.addEventListener("drop", (s) => {
    s.preventDefault();
    const a = s.target.closest(".board-column");
    if (!a || !l) return;
    const o = a.dataset.col, i = a.querySelector(".board-column-body")?.querySelector(".task-card-placeholder");
    let c = null;
    if (i && i.nextElementSibling) {
      const d = i.nextElementSibling.closest(".task-card");
      d && (c = d.dataset.taskId);
    }
    document.querySelectorAll(".task-card-placeholder").forEach((d) => d.remove()), document.querySelectorAll(".board-column.drag-over").forEach((d) => d.classList.remove("drag-over")), h(l, o, c), l = null;
  }, { signal: t }));
}
function B(t = {}) {
  g = t, p = new AbortController();
  const e = p.signal;
  E(), u(), q(e);
  const s = document.getElementById("board-columns");
  s.addEventListener("click", (a) => {
    const o = a.target.closest(".board-column-add");
    if (o) {
      L(o.dataset.col);
      return;
    }
    if (a.target.closest(".add-task-cancel")) {
      I();
      return;
    }
  }, { signal: e }), s.addEventListener("submit", (a) => {
    a.preventDefault();
    const o = a.target.closest(".add-task-form");
    if (!o) return;
    const n = o.querySelector('input[name="title"]').value.trim();
    if (!n) return;
    const i = o.querySelector('input[name="desc"]').value.trim();
    T(o.dataset.col, n, i);
  }, { signal: e });
}
function D() {
  p && (p.abort(), p = null), r = [], m = 100, l = null, f = null;
}
function N(t) {
  if (t.type === "add-task") {
    const e = t.payload || {}, s = `t${m++}`;
    r.push({
      id: s,
      title: e.title || "New Task",
      desc: e.desc || "",
      status: e.status || "pending",
      assignee: e.assignee || "",
      priority: e.priority || "medium"
    }), b(), u();
  } else if (t.type === "move-task") {
    const e = t.payload || {}, s = r.find((a) => a.id === e.taskId || a.title === e.title);
    s && e.to && h(s.id, e.to);
  }
}
function w(t) {
  console.log("Task Board received message:", t);
}
export {
  D as destroy,
  B as init,
  N as onAction,
  w as onMessage
};
