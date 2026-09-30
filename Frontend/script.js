const API = "http://localhost:4000/api";
let currentUser = null;
let isSignupMode = false;
 
// ---------- Helpers ----------
function showMsg(text, type = "error") {
  const box = document.getElementById("globalMsg");
  box.innerHTML = `<div class="msg ${type}">${text}</div>`;
  setTimeout(() => (box.innerHTML = ""), 4000);
}
 
async function apiCall(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}
 
function fmtDate(d) {
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
 
// ---------- Auth view toggle ----------
const authTitle = document.getElementById("authTitle");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authToggleLink = document.getElementById("authToggleLink");
const authToggleText = document.getElementById("authToggleText");
const signupNameField = document.getElementById("signupNameField");
 
authToggleLink.addEventListener("click", () => {
  isSignupMode = !isSignupMode;
  authTitle.textContent = isSignupMode ? "Sign Up" : "Login";
  authSubmitBtn.textContent = isSignupMode ? "Sign Up" : "Login";
  signupNameField.style.display = isSignupMode ? "block" : "none";
  authToggleText.innerHTML = isSignupMode
    ? `Already have an account? <a id="authToggleLink">Login</a>`
    : `Don't have an account? <a id="authToggleLink">Sign up</a>`;
  document.getElementById("authToggleLink").addEventListener("click", () => authToggleLink.click());
});
 
authSubmitBtn.addEventListener("click", async () => {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const name = document.getElementById("authName").value.trim();
 
  if (!email || !password || (isSignupMode && !name)) {
    return showMsg("Please fill all required fields.");
  }
 
  try {
    const endpoint = isSignupMode ? "/auth/signup" : "/auth/login";
    const body = isSignupMode ? { name, email, password } : { email, password };
    const user = await apiCall(endpoint, { method: "POST", body: JSON.stringify(body) });
    currentUser = user;
    showMsg(isSignupMode ? "Account created!" : "Welcome back!", "success");
    renderApp();
  } catch (err) {
    showMsg(err.message);
  }
});
 
// ---------- User box / logout ----------
function renderUserBox() {
  const box = document.getElementById("userBox");
  if (currentUser) {
    box.innerHTML = `<span>👤 ${currentUser.name} (${currentUser.role})</span> <button id="logoutBtn">Logout</button>`;
    document.getElementById("logoutBtn").addEventListener("click", async () => {
      await apiCall("/auth/logout", { method: "POST" });
      currentUser = null;
      showMsg("Logged out.", "success");
      renderAuthView();
    });
  } else {
    box.innerHTML = "";
  }
}
 
// ---------- View switching ----------
function renderAuthView() {
  document.getElementById("authView").classList.add("active");
  document.getElementById("appView").classList.remove("active");
  renderUserBox();
}
 
function renderApp() {
  document.getElementById("authView").classList.remove("active");
  document.getElementById("appView").classList.add("active");
  document.getElementById("createTabBtn").style.display =
    currentUser && currentUser.role === "organizer" ? "inline-block" : "none";
  renderUserBox();
  loadEvents();
}
 
// ---------- Tabs ----------
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tab-content").forEach((c) => (c.style.display = "none"));
    document.getElementById(`tab-${btn.dataset.tab}`).style.display = "block";
    if (btn.dataset.tab === "myreg") loadMyRegistrations();
    if (btn.dataset.tab === "events") loadEvents();
  });
});
 
// ---------- Events ----------
async function loadEvents(search = "") {
  const list = document.getElementById("eventsList");
  list.innerHTML = "<small class='hint'>Loading...</small>";
  try {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    const data = await apiCall(`/events${q}`);
    const events = Array.isArray(data) ? data : data.events;
 
    if (!events || events.length === 0) {
      list.innerHTML = "<small class='hint'>No events found.</small>";
      return;
    }
 
    list.innerHTML = "";
    events.forEach((ev) => {
      const div = document.createElement("div");
      div.className = "event-item";
      div.innerHTML = `
        <div class="info">
          <h3>${ev.title}</h3>
          <p>📅 ${fmtDate(ev.date)} &nbsp; 📍 ${ev.location}</p>
          <p>${ev.description || ""}</p>
          <p><small class="hint">Capacity: ${ev.capacity === 0 ? "Unlimited" : ev.capacity}</small></p>
        </div>
        <div>
          <button class="btn" data-id="${ev._id}">Register</button>
        </div>
      `;
      div.querySelector("button").addEventListener("click", () => registerForEvent(ev._id));
      list.appendChild(div);
    });
  } catch (err) {
    list.innerHTML = `<small class="hint">Could not load events (${err.message})</small>`;
  }
}
 
document.getElementById("searchBox").addEventListener("input", (e) => {
  loadEvents(e.target.value);
});
 
async function registerForEvent(eventId) {
  try {
    await apiCall(`/registrations/${eventId}`, { method: "POST" });
    showMsg("Registered successfully!", "success");
  } catch (err) {
    showMsg(err.message);
  }
}
 
// ---------- My Registrations ----------
async function loadMyRegistrations() {
  const list = document.getElementById("myRegList");
  list.innerHTML = "<small class='hint'>Loading...</small>";
  try {
    const regs = await apiCall("/registrations/my");
    if (!regs.length) {
      list.innerHTML = "<small class='hint'>You have no registrations yet.</small>";
      return;
    }
    list.innerHTML = "";
    regs.forEach((r) => {
      const div = document.createElement("div");
      div.className = "event-item";
      div.innerHTML = `
        <div class="info">
          <h3>${r.event?.title || "Event removed"}</h3>
          <p>📅 ${r.event ? fmtDate(r.event.date) : "-"} &nbsp; 📍 ${r.event?.location || "-"}</p>
          <span class="badge ${r.status}">${r.status}</span>
        </div>
        <div>
          ${r.status === "confirmed" ? `<button class="btn danger" data-id="${r._id}">Cancel</button>` : ""}
        </div>
      `;
      const cancelBtn = div.querySelector("button");
      if (cancelBtn) cancelBtn.addEventListener("click", () => cancelRegistration(r._id));
      list.appendChild(div);
    });
  } catch (err) {
    list.innerHTML = `<small class="hint">Could not load registrations (${err.message})</small>`;
  }
}
 
async function cancelRegistration(id) {
  try {
    await apiCall(`/registrations/${id}/cancel`, { method: "PUT" });
    showMsg("Registration cancelled.", "success");
    loadMyRegistrations();
  } catch (err) {
    showMsg(err.message);
  }
}
 
// ---------- Create Event (organizer) ----------
document.getElementById("createEventBtn").addEventListener("click", async () => {
  const title = document.getElementById("evTitle").value.trim();
  const description = document.getElementById("evDesc").value.trim();
  const date = document.getElementById("evDate").value;
  const location = document.getElementById("evLocation").value.trim();
  const capacity = Number(document.getElementById("evCapacity").value) || 0;
 
  if (!title || !date || !location) {
    return showMsg("Title, date and location are required.");
  }
 
  try {
    await apiCall("/events", {
      method: "POST",
      body: JSON.stringify({ title, description, date, location, capacity }),
    });
    showMsg("Event created!", "success");
    document.getElementById("evTitle").value = "";
    document.getElementById("evDesc").value = "";
    document.getElementById("evDate").value = "";
    document.getElementById("evLocation").value = "";
    document.getElementById("evCapacity").value = 0;
    document.querySelector('.tab-btn[data-tab="events"]').click();
  } catch (err) {
    showMsg(err.message);
  }
});
 
// ---------- Init: check if already logged in ----------
(async function init() {
  try {
    const user = await apiCall("/auth/me");
    currentUser = user;
    renderApp();
  } catch {
    renderAuthView();
  }
})();