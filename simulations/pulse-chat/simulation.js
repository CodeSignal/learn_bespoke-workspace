const v = `
TEAM STATE & SITUATION CONTEXT (shared knowledge all team members have):
- You work at Acme Corp on the "Horizon" product team.
- TODAY is launch day. The team is releasing Horizon v2.0 to production, scheduled for 10:00 AM.
- The launch includes a major dashboard redesign, new API endpoints, and an updated onboarding flow.
- Last night's staging deploy went mostly smooth, but error monitoring (Datadog) started showing unusual 500-error spikes on the /api/users endpoint around 8:45 AM — roughly 2% of requests.
- The root cause is not yet confirmed. Alex is investigating; it might be a race condition in the new connection pooling logic.
- Stakeholders (VP of Product, marketing team) are expecting the launch to go live at 10 AM sharp — marketing has a press release queued.
- The team is feeling the pressure but staying professional. There's a real question of whether to delay the launch or go ahead.
- The user you are chatting with is a software engineer on the team. They are involved in the launch but not the one investigating the error spikes directly.

IMPORTANT: Stay in character. Respond naturally based on your role's perspective on this situation. Keep messages brief (1-3 sentences), casual workplace tone. Do NOT break character or mention that you are an AI.
`, y = [
  {
    id: "sarah-chen",
    name: "Sarah Chen",
    role: "Engineering Manager",
    avatarText: "SC",
    avatarClass: "manager",
    persona: v + `
YOUR ROLE: You are Sarah Chen, the Engineering Manager for the Horizon team.
- You're responsible for coordinating the launch and communicating with stakeholders.
- You're aware of the error spikes and are waiting on Alex's investigation before making a call.
- You're feeling the pressure from the VP but want to make the right technical decision.
- You're supportive of your team, protective of them, and don't want to ship something broken.
- You tend to ask clarifying questions and want status updates. Occasionally use emoji.`,
    messages: [
      { sender: "them", text: "Morning! Big day today 🚀 How are you feeling about the launch?", time: "8:30 AM" },
      { sender: "me", text: "Feeling good! Ran through the checklist this morning. Everything on my end is green.", time: "8:35 AM" },
      { sender: "them", text: "Love to hear it. Alex flagged some error spikes on the users endpoint — he's looking into it now. I'll keep you posted.", time: "8:50 AM" }
    ]
  },
  {
    id: "alex-rivera",
    name: "Alex Rivera",
    role: "Senior Engineer",
    avatarText: "AR",
    avatarClass: "peer",
    persona: v + `
YOUR ROLE: You are Alex Rivera, Senior Engineer and the tech lead on Horizon v2.0.
- You are currently investigating the 500-error spikes on /api/users.
- You suspect it's a race condition in the new database connection pooling logic you wrote.
- You're deep in the logs and Datadog dashboards right now. You're focused and a bit terse.
- You're honest about the risk — you don't want to sugarcoat it, but you're not panicking either.
- You have a dry sense of humor and care deeply about shipping quality code.
- If asked about launch readiness, you'll express concern about error spikes and mention that you are still investigating.`,
    messages: [
      { sender: "them", text: "Heads up — seeing some weird 500s on /api/users in Datadog. Started around 8:45.", time: "8:47 AM" },
      { sender: "me", text: "Oh no. How bad is it?", time: "8:48 AM" },
      { sender: "them", text: "About 2% of requests. Could be the connection pooling changes. Digging into it now.", time: "8:49 AM" }
    ]
  },
  {
    id: "jordan-kim",
    name: "Jordan Kim",
    role: "Product Designer",
    avatarText: "JK",
    avatarClass: "designer",
    persona: v + `
YOUR ROLE: You are Jordan Kim, Product Designer on the Horizon team.
- You led the dashboard redesign that's shipping in v2.0. You're proud of the work.
- You're aware of the error spikes but don't fully understand the technical details.
- You're concerned about user experience — if errors affect the onboarding flow, it could hurt first impressions.
- You're collaborative and want to help however you can (e.g., preparing a fallback UI, drafting user-facing error messages).
- You care about the launch going well because you coordinated closely with marketing on the new look.`,
    messages: [
      { sender: "them", text: "Hey! Heard there might be some backend issues. Is the launch still on track for 10?", time: "9:00 AM" }
    ]
  }
];
let r = [], o = null, u = null, l = {};
const b = 2;
function k() {
  try {
    const t = localStorage.getItem("pulse-chat-data"), e = localStorage.getItem("pulse-chat-version");
    t && Number(e) === b ? r = JSON.parse(t) : (r = JSON.parse(JSON.stringify(y)), localStorage.setItem("pulse-chat-version", String(b)));
  } catch (t) {
    console.error("Failed to load conversations:", t), r = JSON.parse(JSON.stringify(y));
  }
}
function g() {
  try {
    localStorage.setItem("pulse-chat-data", JSON.stringify(r));
  } catch (t) {
    console.error("Failed to save conversations:", t);
  }
}
function h(t) {
  const e = document.createElement("div");
  return e.textContent = t, e.innerHTML;
}
function I(t) {
  return t.messages.length === 0 ? { text: "No messages yet", time: "" } : t.messages[t.messages.length - 1];
}
function c() {
  const t = document.getElementById("chat-conversation-list");
  t && (t.innerHTML = r.map((e) => {
    const n = I(e), a = e.id === o, i = (n.sender === "me" ? "You: " : "") + n.text;
    return `
      <button class="chat-conversation-item ${a ? "active" : ""}" data-conv-id="${e.id}">
        <div class="chat-avatar ${e.avatarClass}">${e.avatarText}</div>
        <div class="chat-conv-details">
          <div class="chat-conv-top-row">
            <span class="chat-conv-name">${h(e.name)}</span>
            <span class="chat-conv-time">${n.time}</span>
          </div>
          <div class="chat-conv-preview">${h(i.substring(0, 50))}</div>
        </div>
      </button>
    `;
  }).join(""));
}
function d() {
  const t = document.getElementById("chat-messages"), e = document.getElementById("chat-contact-name"), n = document.getElementById("chat-contact-role"), a = document.getElementById("chat-input-area");
  if (!o) {
    t.innerHTML = '<div class="chat-empty">Choose a conversation from the sidebar to start chatting.</div>', e.textContent = "Select a conversation", n.textContent = "", a.hidden = !0;
    return;
  }
  const s = r.find((i) => i.id === o);
  s && (e.textContent = s.name, n.textContent = s.role, a.hidden = !1, t.innerHTML = s.messages.map((i) => {
    const m = i.sender === "me", x = m ? "You" : s.name, T = m ? "" : s.avatarClass, E = m ? "Me" : s.avatarText;
    return `
      <div class="chat-message ${m ? "sent" : "received"}">
        <div class="chat-avatar ${T}">${E}</div>
        <div class="chat-bubble">
          <div class="chat-bubble-meta">
            <span class="chat-bubble-sender">${h(x)}</span>
            <span class="chat-bubble-time">${i.time}</span>
          </div>
          ${h(i.text)}
        </div>
      </div>
    `;
  }).join(""), t.scrollTop = t.scrollHeight);
}
function w(t) {
  const e = document.getElementById("chat-messages"), n = document.createElement("div");
  n.className = "chat-typing", n.id = "typing-indicator", n.innerHTML = `
    <div class="chat-avatar ${t.avatarClass}" style="width:24px;height:24px;font-size:10px">${t.avatarText}</div>
    <span>${h(t.name)} is typing</span>
    <span class="typing-dots"><span></span><span></span><span></span></span>
  `, e.appendChild(n), e.scrollTop = e.scrollHeight;
}
function f() {
  document.getElementById("typing-indicator")?.remove();
}
function p() {
  return (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
async function A(t) {
  if (!t.trim() || !o) return;
  const e = r.find((n) => n.id === o);
  if (e) {
    e.messages.push({ sender: "me", text: t.trim(), time: p() }), g(), d(), c(), l.emit && l.emit("chat:message-sent", {
      conversationId: e.id,
      contactName: e.name,
      text: t.trim()
    }), w(e);
    try {
      const n = e.messages.map((i) => ({
        role: i.sender === "me" ? "user" : "assistant",
        content: i.text
      })), s = await (await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: n, persona: e.persona })
      })).json();
      if (o !== e.id) return;
      f(), e.messages.push({ sender: "them", text: s.response, time: p() }), g(), d(), c(), l.emit && l.emit("chat:message-received", {
        conversationId: e.id,
        contactName: e.name,
        text: s.response
      });
    } catch (n) {
      console.error("Failed to get chat response:", n), f(), e.messages.push({
        sender: "them",
        text: "Sorry, I got disconnected for a sec. What were you saying?",
        time: p()
      }), g(), d(), c();
    }
  }
}
function C(t) {
  o = t, c(), d();
  const e = document.getElementById("chat-input");
  e && e.focus();
}
function S(t = {}) {
  l = t, u = new AbortController();
  const e = u.signal;
  k(), c(), d(), document.getElementById("chat-conversation-list").addEventListener("click", (n) => {
    const a = n.target.closest(".chat-conversation-item");
    a && C(a.dataset.convId);
  }, { signal: e }), document.getElementById("chat-input-form").addEventListener("submit", (n) => {
    n.preventDefault();
    const a = document.getElementById("chat-input"), s = a.value;
    a.value = "", A(s);
  }, { signal: e }), document.addEventListener("keydown", (n) => {
    n.key === "Escape" && (o = null, c(), d());
  }, { signal: e });
}
function M() {
  u && (u.abort(), u = null), r = [], o = null, l = {};
}
function Y(t) {
  if (t.type === "add-message") {
    const e = t.payload || {}, n = r.find((a) => a.id === e.conversationId);
    if (!n) return;
    n.messages.push({
      sender: "them",
      text: e.text || "",
      time: e.time || p()
    }), g(), c(), o === n.id && d();
  } else if (t.type === "trigger-typing") {
    const e = r.find((n) => n.id === t.payload?.conversationId);
    e && o === e.id && (w(e), setTimeout(f, t.payload?.duration || 2e3));
  }
}
function O(t) {
  console.log("Pulse Chat received message:", t);
}
export {
  M as destroy,
  S as init,
  Y as onAction,
  O as onMessage
};
