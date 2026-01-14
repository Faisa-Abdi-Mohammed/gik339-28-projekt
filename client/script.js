const listMount = document.querySelector("#listMount");
const form = document.querySelector("#movieForm");

const movieIdEl = document.querySelector("#movieId");
const titleEl = document.querySelector("#title");
const yearEl = document.querySelector("#year");
const genreEl = document.querySelector("#genre");
const ratingEl = document.querySelector("#rating");

const clearBtn = document.querySelector("#clearBtn");
const refreshBtn = document.querySelector("#refreshBtn");

const modalEl = document.querySelector("#messageModal");
const modalTitleEl = document.querySelector("#modalTitle");
const modalBodyEl = document.querySelector("#modalBody");
const messageModal = new bootstrap.Modal(modalEl);

function showMessage(title, body) {
  modalTitleEl.textContent = title;
  modalBodyEl.textContent = body;
  messageModal.show();
}

function resetForm() {
  movieIdEl.value = "";
  form.reset();
}

function getPayload() {
  return {
    title: titleEl.value.trim(),
    year: Number(yearEl.value),
    genre: genreEl.value.trim(),
    rating: Number(ratingEl.value)
  };
}

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function fetchMovies() {
  const res = await fetch("/movies");
  if (!res.ok) throw new Error("Kunde inte hämta filmer");
  return res.json();
}

function renderMovies(movies) {
  listMount.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "d-grid gap-3";

  if (movies.length === 0) {
    const p = document.createElement("p");
    p.className = "text-muted mb-0";
    p.textContent = "Inga filmer än. Lägg till en!";
    wrapper.appendChild(p);
    listMount.appendChild(wrapper);
    return;
  }

  for (const m of movies) {
    const card = document.createElement("div");
    card.className = "card movie-card";
    card.dataset.rating = String(m.rating);

    card.innerHTML = `
      <div class="card-body d-flex justify-content-between align-items-start gap-3">
        <div>
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <h3 class="h6 mb-0">${escapeHtml(m.title)}</h3>
            <span class="badge text-bg-primary">Betyg: ${m.rating}</span>
          </div>
          <div class="text-muted small mt-1">
            ${m.year} • ${escapeHtml(m.genre)}
          </div>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary" data-action="edit" data-id="${m.id}">Ändra</button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${m.id}">Ta bort</button>
        </div>
      </div>
    `;
    wrapper.appendChild(card);
  }

  listMount.appendChild(wrapper);

  wrapper.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;

    if (action === "delete") {
      await deleteMovie(id);
      return;
    }

    if (action === "edit") {
      const movie = movies.find(x => x.id === id);
      if (!movie) return;

      movieIdEl.value = String(movie.id);
      titleEl.value = movie.title;
      yearEl.value = movie.year;
      genreEl.value = movie.genre;
      ratingEl.value = movie.rating;

      showMessage("Redigera", "Formuläret är ifyllt. Ändra och klicka Spara för att uppdatera.");
    }
  }, { once: true });
}

async function refresh() {
  try {
    const movies = await fetchMovies();
    renderMovies(movies);
  } catch (err) {
    showMessage("Fel", err.message);
  }
}

async function createMovie(payload) {
  const res = await fetch("/movies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Kunde inte skapa film");
  return data;
}

async function updateMovie(payloadWithId) {
  const res = await fetch("/movies", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payloadWithId)
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Kunde inte uppdatera film");
  return data;
}

async function deleteMovie(id) {
  try {
    const res = await fetch(`/movies/${id}`, { method: "DELETE" });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.message || "Kunde inte ta bort film");

    showMessage("Borttagen", data.message || "Film borttagen.");
    await refresh();
  } catch (err) {
    showMessage("Fel", err.message);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = getPayload();
  const id = movieIdEl.value ? Number(movieIdEl.value) : null;

  try {
    if (!payload.title || !payload.genre || !Number.isInteger(payload.year) || !Number.isInteger(payload.rating)) {
      showMessage("Validering", "Fyll i alla fält korrekt.");
      return;
    }

    if (id) {
      const data = await updateMovie({ id, ...payload });
      showMessage("Uppdaterad", data.message || "Film uppdaterad.");
    } else {
      const data = await createMovie(payload);
      showMessage("Skapad", data.message || "Film skapad.");
    }

    resetForm();
    await refresh();
  } catch (err) {
    showMessage("Fel", err.message);
  }
});

clearBtn.addEventListener("click", resetForm);
refreshBtn.addEventListener("click", refresh);

refresh();
