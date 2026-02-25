const h = [
  {
    id: 1,
    folder: "inbox",
    from: "Alice Johnson <alice@example.com>",
    to: "me@example.com",
    subject: "Q1 Marketing Strategy Review",
    body: `Hi,

I wanted to follow up on our discussion from last week about the Q1 marketing strategy. I've put together a detailed plan that covers social media campaigns, content marketing, and paid advertising.

Key highlights:
- 30% budget increase for social media
- New content series launching in February
- Partnership with three new influencers

Could we schedule a meeting this Thursday to go over the details? I'd love to get your feedback before we finalize everything.

Best regards,
Alice`,
    date: "2026-02-23T09:15:00",
    read: !1,
    starred: !0
  },
  {
    id: 2,
    folder: "inbox",
    from: "Bob Smith <bob@example.com>",
    to: "me@example.com",
    subject: "Project Alpha - Sprint Update",
    body: `Team,

Here's the sprint update for Project Alpha:

Completed:
- User authentication module
- Database migration scripts
- API documentation

In Progress:
- Dashboard UI redesign
- Performance optimization

Blockers:
- Waiting on design assets from the UX team

Please review and let me know if anything needs to be adjusted.

Thanks,
Bob`,
    date: "2026-02-23T08:30:00",
    read: !1,
    starred: !1
  },
  {
    id: 3,
    folder: "inbox",
    from: "Carol Davis <carol@example.com>",
    to: "me@example.com",
    subject: "Lunch plans for Friday?",
    body: `Hey!

A few of us are planning to go to that new Italian place downtown for lunch on Friday. Would you like to join?

They have amazing pasta and the reviews are great. We're thinking around 12:30 PM.

Let me know!
Carol`,
    date: "2026-02-22T16:45:00",
    read: !0,
    starred: !1
  },
  {
    id: 4,
    folder: "inbox",
    from: "David Lee <david@example.com>",
    to: "me@example.com",
    subject: "Invoice #2847 - February Services",
    body: `Dear Customer,

Please find attached the invoice for services rendered in February 2026.

Invoice Number: #2847
Amount Due: $4,250.00
Due Date: March 15, 2026

Payment can be made via bank transfer or credit card through our payment portal.

If you have any questions regarding this invoice, please don't hesitate to reach out.

Regards,
David Lee
Accounts Receivable`,
    date: "2026-02-22T14:20:00",
    read: !0,
    starred: !1
  },
  {
    id: 5,
    folder: "inbox",
    from: "Emma Wilson <emma@example.com>",
    to: "me@example.com",
    subject: "Re: Conference Tickets",
    body: `Great news! I managed to secure early-bird tickets for the TechSummit 2026 conference.

Details:
- Date: April 15-17, 2026
- Location: San Francisco Convention Center
- Tickets: 2x Full Access Pass

I'll forward the confirmation emails once they arrive. Let me know if you need anything else.

Cheers,
Emma`,
    date: "2026-02-21T11:00:00",
    read: !0,
    starred: !0
  },
  {
    id: 6,
    folder: "sent",
    from: "me@example.com",
    to: "alice@example.com",
    subject: "Re: Q1 Marketing Strategy Review",
    body: `Hi Alice,

Thanks for putting this together! The plan looks solid. Thursday works for me — how about 2 PM?

I have a few thoughts on the influencer partnerships I'd like to discuss as well.

Best,
Me`,
    date: "2026-02-22T10:30:00",
    read: !0,
    starred: !1
  },
  {
    id: 7,
    folder: "sent",
    from: "me@example.com",
    to: "team@example.com",
    subject: "Team Standup Notes - Feb 21",
    body: `Hi everyone,

Here are the standup notes from today's meeting:

- Feature release is on track for next Monday
- QA found 3 minor bugs, all assigned to developers
- Design review pushed to Wednesday

Action items:
1. Complete code reviews by EOD Friday
2. Update staging environment
3. Prepare release notes

Let me know if I missed anything.

Thanks!`,
    date: "2026-02-21T09:00:00",
    read: !0,
    starred: !1
  },
  {
    id: 8,
    folder: "drafts",
    from: "me@example.com",
    to: "hr@example.com",
    subject: "Vacation Request - March",
    body: `Hi HR Team,

I would like to request time off from March 10-14, 2026.

I have ensured that my current projects will be covered during my absence and have briefed my team lead.

Please let me know if you need any additional information.

Thank you,`,
    date: "2026-02-20T15:00:00",
    read: !0,
    starred: !1
  },
  {
    id: 9,
    folder: "inbox",
    from: "GitHub <notifications@github.com>",
    to: "me@example.com",
    subject: "[repo/project] Pull Request #142 merged",
    body: `Pull Request #142 has been merged into main.

Title: Fix pagination bug in user list
Author: @developer123
Reviewers: @me, @teammate

3 files changed, 47 insertions(+), 12 deletions(-)

View on GitHub: https://github.com/repo/project/pull/142`,
    date: "2026-02-21T20:15:00",
    read: !0,
    starred: !1
  },
  {
    id: 10,
    folder: "inbox",
    from: "Sophia Martinez <sophia@example.com>",
    to: "me@example.com",
    subject: "Book recommendation",
    body: `Hey!

I just finished reading "Designing Data-Intensive Applications" by Martin Kleppmann and I think you'd really enjoy it. It covers distributed systems, databases, and data processing in a very accessible way.

Highly recommend it if you're looking for your next tech read!

Talk soon,
Sophia`,
    date: "2026-02-20T13:30:00",
    read: !0,
    starred: !1
  }
];
let r = [], f = "inbox", i = null, y = 100, g = null, p = {};
function x() {
  try {
    const o = localStorage.getItem("email-app-data");
    if (o) {
      const e = JSON.parse(o);
      r = e.emails || [], y = e.nextId || 100;
    } else
      r = JSON.parse(JSON.stringify(h));
  } catch (o) {
    console.error("Failed to load emails from localStorage:", o), r = JSON.parse(JSON.stringify(h));
  }
}
function l() {
  try {
    localStorage.setItem("email-app-data", JSON.stringify({ emails: r, nextId: y }));
  } catch (o) {
    console.error("Failed to save emails:", o);
  }
}
function k(o) {
  return o === "starred" ? r.filter((e) => e.starred && e.folder !== "trash") : r.filter((e) => e.folder === o);
}
function B(o) {
  const e = new Date(o), t = /* @__PURE__ */ new Date();
  if (e.toDateString() === t.toDateString())
    return e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const a = new Date(t);
  return a.setDate(a.getDate() - 1), e.toDateString() === a.toDateString() ? "Yesterday" : e.toLocaleDateString([], { month: "short", day: "numeric" });
}
function d() {
  const o = ["inbox", "sent", "drafts", "trash", "starred"];
  for (const e of o) {
    const t = e === "starred" ? r.filter((a) => a.starred && a.folder !== "trash").length : r.filter((a) => a.folder === e).length, n = document.getElementById(`count-${e}`);
    if (n)
      if (e === "inbox") {
        const a = r.filter((c) => c.folder === "inbox" && !c.read).length;
        n.textContent = a > 0 ? a : "";
      } else
        n.textContent = t > 0 ? t : "";
  }
}
function s() {
  const o = document.getElementById("email-list"), e = (document.getElementById("search-input")?.value || "").toLowerCase();
  let t = k(f);
  if (e && (t = t.filter(
    (n) => n.subject.toLowerCase().includes(e) || n.from.toLowerCase().includes(e) || n.body.toLowerCase().includes(e)
  )), t.sort((n, a) => new Date(a.date) - new Date(n.date)), t.length === 0) {
    o.innerHTML = `<div class="email-list-empty">${e ? "No matching emails" : "No emails in this folder"}</div>`;
    return;
  }
  o.innerHTML = t.map((n) => {
    const a = n.id === i, c = n.body.split(`
`).filter((w) => w.trim()).slice(0, 1).join(" ").substring(0, 80), I = n.from.includes("<") ? n.from.split("<")[0].trim() : n.from;
    return `
      <div class="email-item ${a ? "active" : ""} ${n.read ? "" : "unread"}" data-id="${n.id}">
        <div class="email-item-row">
          <span class="email-item-sender">${b(I)}</span>
          <span class="email-item-date">${B(n.date)}</span>
        </div>
        <div class="email-item-subject">${b(n.subject)}</div>
        <div class="email-item-preview">${b(c)}</div>
        <button class="email-item-star ${n.starred ? "starred" : ""}" data-star-id="${n.id}" title="Toggle star">
          ${n.starred ? "&#9733;" : "&#9734;"}
        </button>
      </div>
    `;
  }).join("");
}
function u() {
  const o = document.getElementById("email-detail"), e = document.getElementById("email-detail-empty");
  if (!i) {
    o.hidden = !0, e.hidden = !1;
    return;
  }
  const t = r.find((a) => a.id === i);
  if (!t) {
    o.hidden = !0, e.hidden = !1;
    return;
  }
  o.hidden = !1, e.hidden = !0, document.getElementById("detail-subject").textContent = t.subject, document.getElementById("detail-from").textContent = t.from, document.getElementById("detail-date").textContent = new Date(t.date).toLocaleString(), document.getElementById("detail-to").textContent = `To: ${t.to}`, document.getElementById("detail-body").textContent = t.body;
  const n = document.getElementById("btn-star-detail");
  n.innerHTML = t.starred ? "&#9733;" : "&#9734;", n.style.color = t.starred ? "#f5a623" : "";
}
function j(o) {
  i = o;
  const e = r.find((n) => n.id === o);
  e && !e.read && (e.read = !0, l(), d()), document.querySelector(".email-layout").classList.add("show-detail"), s(), u(), e && p.emit && p.emit("email:opened", { emailId: e.id, subject: e.subject });
}
function b(o) {
  const e = document.createElement("div");
  return e.textContent = o, e.innerHTML;
}
function v(o = {}) {
  document.getElementById("compose-to").value = o.to || "", document.getElementById("compose-subject").value = o.subject || "", document.getElementById("compose-body").value = o.body || "", document.getElementById("compose-overlay").hidden = !1;
}
function m() {
  document.getElementById("compose-overlay").hidden = !0, document.getElementById("compose-form").reset();
}
function L() {
  const o = document.getElementById("compose-to").value.trim(), e = document.getElementById("compose-subject").value.trim() || "(No subject)", t = document.getElementById("compose-body").value.trim();
  if (!o) return;
  const n = {
    id: y++,
    folder: "sent",
    from: "me@example.com",
    to: o,
    subject: e,
    body: t,
    date: (/* @__PURE__ */ new Date()).toISOString(),
    read: !0,
    starred: !1
  };
  r.push(n), l(), m(), d(), f === "sent" && s(), p.emit && p.emit("email:sent", { to: o, subject: e, body: t.substring(0, 200) });
}
function S() {
  const o = document.getElementById("compose-to").value.trim(), e = document.getElementById("compose-subject").value.trim() || "(No subject)", t = document.getElementById("compose-body").value.trim(), n = {
    id: y++,
    folder: "drafts",
    from: "me@example.com",
    to: o || "",
    subject: e,
    body: t,
    date: (/* @__PURE__ */ new Date()).toISOString(),
    read: !0,
    starred: !1
  };
  r.push(n), l(), m(), d(), f === "drafts" && s();
}
function T(o) {
  const e = r.find((t) => t.id === o);
  e && (e.folder === "trash" ? r = r.filter((t) => t.id !== o) : e.folder = "trash", i === o && (i = null, document.querySelector(".email-layout")?.classList.remove("show-detail")), l(), d(), s(), u());
}
function E(o) {
  const e = r.find((t) => t.id === o);
  e && (e.starred = !e.starred, l(), d(), s(), i === o && u());
}
function D(o) {
  f = o, i = null, document.querySelector(".email-layout")?.classList.remove("show-detail"), document.querySelectorAll(".folder-item").forEach((e) => {
    e.classList.toggle("active", e.dataset.folder === o);
  }), s(), u();
}
function C(o = {}) {
  p = o, g = new AbortController();
  const e = g.signal;
  x(), d(), s(), u(), document.getElementById("folder-list").addEventListener("click", (t) => {
    const n = t.target.closest(".folder-item");
    n && D(n.dataset.folder);
  }, { signal: e }), document.getElementById("email-list").addEventListener("click", (t) => {
    const n = t.target.closest(".email-item-star");
    if (n) {
      t.stopPropagation(), E(Number(n.dataset.starId));
      return;
    }
    const a = t.target.closest(".email-item");
    a && j(Number(a.dataset.id));
  }, { signal: e }), document.getElementById("btn-compose").addEventListener("click", () => v(), { signal: e }), document.getElementById("btn-compose-close").addEventListener("click", m, { signal: e }), document.getElementById("btn-discard").addEventListener("click", m, { signal: e }), document.getElementById("compose-overlay").addEventListener("click", (t) => {
    t.target === t.currentTarget && m();
  }, { signal: e }), document.getElementById("compose-form").addEventListener("submit", (t) => {
    t.preventDefault(), L();
  }, { signal: e }), document.getElementById("btn-save-draft").addEventListener("click", S, { signal: e }), document.getElementById("btn-reply").addEventListener("click", () => {
    const t = r.find((c) => c.id === i);
    if (!t) return;
    const n = t.from === "me@example.com" ? t.to : t.from, a = n.includes("<") && n.match(/<(.+)>/)?.[1] || n;
    v({
      to: a,
      subject: t.subject.startsWith("Re:") ? t.subject : `Re: ${t.subject}`,
      body: `

--- Original Message ---
From: ${t.from}
Date: ${new Date(t.date).toLocaleString()}

${t.body}`
    });
  }, { signal: e }), document.getElementById("btn-delete-detail").addEventListener("click", () => {
    i && T(i);
  }, { signal: e }), document.getElementById("btn-star-detail").addEventListener("click", () => {
    i && E(i);
  }, { signal: e }), document.getElementById("btn-back").addEventListener("click", () => {
    i = null, document.querySelector(".email-layout")?.classList.remove("show-detail"), s(), u();
  }, { signal: e }), document.getElementById("search-input").addEventListener("input", () => {
    s();
  }, { signal: e }), document.addEventListener("keydown", (t) => {
    if (t.key === "Escape") {
      const n = document.getElementById("compose-overlay");
      n && !n.hidden && m();
    }
  }, { signal: e });
}
function A() {
  g && (g.abort(), g = null), r = [], f = "inbox", i = null, y = 100;
}
function F(o) {
  if (o.type === "add-email") {
    const e = o.payload || {}, t = {
      id: y++,
      folder: e.folder || "inbox",
      from: e.from || "unknown@example.com",
      to: e.to || "me@example.com",
      subject: e.subject || "(No subject)",
      body: e.body || "",
      date: e.date || (/* @__PURE__ */ new Date()).toISOString(),
      read: !1,
      starred: e.starred || !1
    };
    r.push(t), l(), d(), f === (e.folder || "inbox") && s();
  } else if (o.type === "mark-unread") {
    const e = r.find((t) => t.id === o.payload?.emailId);
    e && (e.read = !1, l(), d(), s());
  }
}
function M(o) {
  console.log("Email app received message:", o);
}
export {
  A as destroy,
  C as init,
  F as onAction,
  M as onMessage
};
