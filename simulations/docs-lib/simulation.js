const w = [
  {
    id: "launch-plan",
    title: "Horizon v2.0 — Launch Plan",
    lastEdited: "Today, 8:15 AM",
    icon: "📄",
    sections: [
      {
        id: "overview",
        type: "heading",
        content: "Launch Overview"
      },
      {
        id: "intro",
        type: "paragraph",
        content: "This document outlines the launch plan for Horizon v2.0. The release includes a major dashboard redesign, new API endpoints, and an updated onboarding flow. All teams have been aligned on the timeline below."
      },
      {
        id: "status-table",
        type: "status-table",
        rows: [
          { milestone: "Engineering", status: "Ready", statusClass: "status-ready" },
          { milestone: "Customer", status: "Notified", statusClass: "status-notified" },
          { milestone: "Launch Time", status: "10:00 AM", statusClass: "" },
          { milestone: "Final System Check", status: "Pending", statusClass: "status-pending" }
        ]
      },
      {
        id: "timeline",
        type: "heading",
        content: "Timeline"
      },
      {
        id: "timeline-details",
        type: "list",
        items: [
          "8:00 AM — Team standup & final checklist review",
          "8:30 AM — Staging environment verification",
          "9:00 AM — Go/no-go decision with engineering lead",
          "9:30 AM — Marketing assets go live (blog post, email blast)",
          "10:00 AM — Production deploy & feature flag flip",
          "10:15 AM — Smoke tests on production",
          "10:30 AM — All-hands announcement in #general"
        ]
      },
      {
        id: "rollback",
        type: "heading",
        content: "Rollback Plan"
      },
      {
        id: "rollback-details",
        type: "paragraph",
        content: "If critical issues are detected within the first 30 minutes post-launch, we will revert via feature flag (instant) and roll back the database migration if needed (estimated 5 minutes). Alex Rivera is the designated rollback owner."
      },
      {
        id: "stakeholders",
        type: "heading",
        content: "Stakeholders"
      },
      {
        id: "stakeholder-list",
        type: "list",
        items: [
          "Sarah Chen — Engineering Manager (launch coordinator)",
          "Alex Rivera — Senior Engineer (tech lead & rollback owner)",
          "Jordan Kim — Product Designer (dashboard & onboarding UX)",
          "Priya Patel — VP of Product (executive sponsor)",
          "Marketing Team — Press release & customer communications"
        ]
      },
      {
        id: "notes",
        type: "heading",
        content: "Notes"
      },
      {
        id: "notes-content",
        type: "paragraph",
        content: "Please flag any blockers in #horizon-launch immediately. The go/no-go call at 9:00 AM is the last checkpoint before we commit to the 10:00 AM deploy."
      }
    ]
  }
];
let a = [], c = null, r = {}, u = null, p = null, h = {};
const y = 1;
function I() {
  try {
    const e = localStorage.getItem("docs-lib-version");
    if (Number(e) === y) {
      const t = localStorage.getItem("docs-lib-comments");
      t && (r = JSON.parse(t));
    } else
      r = {}, localStorage.setItem("docs-lib-version", String(y));
  } catch (e) {
    console.error("Failed to load docs data:", e), r = {};
  }
  a = JSON.parse(JSON.stringify(w));
}
function A() {
  try {
    localStorage.setItem("docs-lib-comments", JSON.stringify(r));
  } catch (e) {
    console.error("Failed to save comments:", e);
  }
}
function l(e) {
  const t = document.createElement("div");
  return t.textContent = e, t.innerHTML;
}
function M() {
  return (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function k(e, t) {
  const n = `${e}:${t}`;
  return r[n] || [];
}
function $(e, t, n, o) {
  const d = `${e}:${t}`;
  r[d] || (r[d] = []), r[d].push({ author: o || "You", text: n, time: M() }), A();
}
function S() {
  const e = document.getElementById("docs-file-list");
  e && (e.innerHTML = a.map((t) => `
    <button class="docs-file-item ${t.id === c ? "active" : ""}" data-doc-id="${t.id}">
      <span class="docs-file-icon">${t.icon}</span>
      <div class="docs-file-info">
        <div class="docs-file-name">${l(t.title)}</div>
        <div class="docs-file-meta">${t.lastEdited}</div>
      </div>
    </button>
  `).join(""));
}
function E(e, t) {
  const n = k(e.id, t.id), o = n.length > 0, d = u === t.id, s = n.length;
  let i = "";
  t.type === "heading" ? i = `<h2>${l(t.content)}</h2>` : t.type === "paragraph" ? i = `<p>${l(t.content)}</p>` : t.type === "list" ? i = `<ul>${t.items.map((m) => `<li>${l(m)}</li>`).join("")}</ul>` : t.type === "status-table" && (i = `
      <table class="docs-status-table">
        <thead><tr><th>Milestone</th><th>Status</th></tr></thead>
        <tbody>${t.rows.map((m) => `
          <tr>
            <td>${l(m.milestone)}</td>
            <td class="${m.statusClass}">${l(m.status)}</td>
          </tr>
        `).join("")}</tbody>
      </table>
    `);
  const C = `<span class="docs-comment-indicator">${s || "+"}</span>`;
  let v = "";
  if (d) {
    const m = n.map((g) => `
      <div class="docs-comment">
        <div class="docs-comment-header">
          <span class="docs-comment-author">${l(g.author)}</span>
          <span class="docs-comment-time">${g.time}</span>
        </div>
        <div class="docs-comment-text">${l(g.text)}</div>
      </div>
    `).join("");
    v = `
      <div class="docs-comment-panel" data-section-id="${t.id}">
        ${m}
        <form class="docs-comment-form" data-section-id="${t.id}">
          <input type="text" class="input" placeholder="Add a comment..." autocomplete="off" />
          <button type="submit" class="button button-primary">Post</button>
        </form>
      </div>
    `;
  }
  return `
    <div class="docs-commentable ${o ? "has-comments" : ""}" data-section-id="${t.id}">
      ${i}
      ${C}
    </div>
    ${v}
  `;
}
function f() {
  const e = document.getElementById("docs-viewer-title"), t = document.getElementById("docs-viewer-body");
  if (!c) {
    e.textContent = "Select a document", t.innerHTML = '<div class="docs-empty">Choose a document from the sidebar to view it.</div>';
    return;
  }
  const n = a.find((o) => o.id === c);
  n && (e.textContent = n.title, t.innerHTML = `
    <div class="docs-page">
      <h1>${l(n.title)}</h1>
      ${n.sections.map((o) => E(n, o)).join("")}
    </div>
  `);
}
function b(e) {
  c = e, u = null, S(), f();
}
function T(e) {
  if (u = u === e ? null : e, f(), u) {
    const t = document.querySelector(`.docs-comment-form[data-section-id="${e}"] input`);
    t && t.focus();
  }
}
function P(e = {}) {
  h = e, p = new AbortController();
  const t = p.signal;
  I(), S(), f(), document.getElementById("docs-file-list").addEventListener("click", (n) => {
    const o = n.target.closest(".docs-file-item");
    o && b(o.dataset.docId);
  }, { signal: t }), document.getElementById("docs-viewer-body").addEventListener("click", (n) => {
    const o = n.target.closest(".docs-commentable");
    o && !n.target.closest(".docs-comment-panel") && T(o.dataset.sectionId);
  }, { signal: t }), document.getElementById("docs-viewer-body").addEventListener("submit", (n) => {
    n.preventDefault();
    const o = n.target.closest(".docs-comment-form");
    if (!o) return;
    const s = o.querySelector("input").value.trim();
    !s || !c || ($(c, o.dataset.sectionId, s), f(), h.emit && h.emit("doc:comment-added", { docId: c, sectionId: o.dataset.sectionId, text: s }));
  }, { signal: t }), a.length === 1 && b(a[0].id);
}
function x() {
  p && (p.abort(), p = null), a = [], c = null, r = {}, u = null;
}
function L(e) {
  if (e.type === "add-comment") {
    const t = e.payload || {}, n = t.docId || a[0] && a[0].id;
    if (!n || !t.sectionId) return;
    $(n, t.sectionId, t.text || "", t.author || "System"), c === n && f();
  } else if (e.type === "update-status") {
    const t = e.payload || {}, n = t.docId || a[0] && a[0].id, o = a.find((i) => i.id === n);
    if (!o) return;
    const d = o.sections.find((i) => i.id === (t.sectionId || "status-table"));
    if (!d || d.type !== "status-table") return;
    const s = d.rows.find((i) => i.milestone === t.milestone);
    s && (s.status = t.newStatus || s.status, s.statusClass = t.newStatusClass || s.statusClass, c === n && f());
  }
}
function D(e) {
  console.log("Docs Lib received message:", e);
}
export {
  x as destroy,
  P as init,
  L as onAction,
  D as onMessage
};
