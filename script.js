// ---------- Settings: change these to your own details ----------
const WHATSAPP_NUMBER = ""; // your number in international format, no + or spaces
const OWNER_EMAIL = "afriyiekwame226@gmail.com";  // your email address

const form = document.getElementById("bookingForm");
const nameInput = document.getElementById("name");
const locationInput = document.getElementById("location");
const serviceSelect = document.getElementById("service");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const result = document.getElementById("result");

document.getElementById("year").textContent = new Date().getFullYear();

// Stop people from picking a date in the past
function todayString() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
}
dateInput.min = todayString();

// Clicking a service card selects it in the dropdown and scrolls to the form
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    serviceSelect.value = card.dataset.service;
    clearError(serviceSelect, "serviceError");
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => nameInput.focus(), 700);
  });
});

function showError(input, errorId, message) {
  input.classList.add("invalid");
  document.getElementById(errorId).textContent = message;
}
function clearError(input, errorId) {
  input.classList.remove("invalid");
  document.getElementById(errorId).textContent = "";
}

[
  [nameInput, "nameError"],
  [locationInput, "locationError"],
  [serviceSelect, "serviceError"],
  [dateInput, "dateError"],
  [timeInput, "timeError"]
].forEach(([el, id]) => el.addEventListener("input", () => clearError(el, id)));

// Turn 2026-10-27 into "Tuesday, 27 October 2026" and 14:30 into "2:30 PM"
function prettyDate(value) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
}
function prettyTime(value) {
  const [h, m] = value.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let valid = true;

  const name = nameInput.value.trim();
  const location = locationInput.value.trim();
  const service = serviceSelect.value;
  const date = dateInput.value;
  const time = timeInput.value;

  if (name.length < 2) { showError(nameInput, "nameError", "Please enter your name."); valid = false; }
  if (location.length < 2) { showError(locationInput, "locationError", "Please enter your location."); valid = false; }
  if (!service) { showError(serviceSelect, "serviceError", "Please choose a service."); valid = false; }
  if (!date) {
    showError(dateInput, "dateError", "Please choose a date.");
    valid = false;
  } else if (date < todayString()) {
    showError(dateInput, "dateError", "Please choose today or a future date.");
    valid = false;
  }
  if (!time) { showError(timeInput, "timeError", "Please choose a time."); valid = false; }
  if (!valid) return;

  const niceDate = prettyDate(date);
  const niceTime = prettyTime(time);

  // Save a local copy of the request in this browser
  try {
    const saved = JSON.parse(localStorage.getItem("bookings") || "[]");
    saved.push({ name, location, service, date, time, created: new Date().toISOString() });
    localStorage.setItem("bookings", JSON.stringify(saved));
  } catch (err) { /* storage unavailable, ignore */ }

  const message =
    `Hello, I would like to make a booking.\n\nName: ${name}\nLocation: ${location}\nService: ${service}\nDate: ${niceDate}\nTime: ${niceTime}`;
  const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const mail = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(service)}&body=${encodeURIComponent(message)}`;

  result.innerHTML =
    `Thank you, <strong>${escapeHtml(name)}</strong>! Your <strong>${escapeHtml(service)}</strong> request ` +
    `for <strong>${escapeHtml(location)}</strong> on <strong>${escapeHtml(niceDate)}</strong> at ` +
    `<strong>${escapeHtml(niceTime)}</strong> is ready.<br>` +
    `Send it now via <a href="${wa}" target="_blank" rel="noopener"></a> ` +
    `<a href="${mail}">Email</a> to confirm.`;
  result.classList.add("show");
  form.reset();
  dateInput.min = todayString();
});

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}