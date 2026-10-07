const $ = id => document.getElementById(id);

let partidos = [];

let seccionActual = "todos";

let busqueda = "";

let fechaActual = "";


function escapeHTML(value = "") {

  return String(value).replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]
  );

}


function localDate() {

  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(now.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(now.getDate())
      .padStart(2, "0");

  return `${year}-${month}-${day}`;

}


function formatDate(date) {

  return new Date(date)
    .toLocaleTimeString(
      "es",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );

}


function updateDate() {

  const now =
    new Date();

  $("today").textContent =
    now.toLocaleDateString(
      "es",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );

}


function statusLabel(match) {

  if (match.state === "live") {

    return `
      <span class="status-live">
        🔴 EN VIVO
        ${
          match.elapsed != null
            ? `${escapeHTML(match.elapsed)}'`
            : ""
        }
      </span>
    `;

  }


  if (match.state === "finished") {

    return `
      <span class="status-finished">
        FINALIZADO
      </span>
    `;

  }


  return `
    <span>
      PRÓXIMO
    </span>
  `;

}


function createCard(match) {

  const live =
    match.state === "live";

  const finished =
    match.state === "finished";


  const score =
    live || finished

      ? `
        ${match.homeScore ?? 0}
        -
        ${match.awayScore ?? 0}
      `

      : `
        <span class="time">
          ${formatDate(match.date)}
        </span>
      `;


  const homeLogo =
    match.homeLogo

      ? `
        <img
          src="${escapeHTML(match.homeLogo)}"
          alt=""
          class="team-logo"
        >
      `

      : "";


  const awayLogo =
    match.awayLogo

      ? `
        <img
          src="${escapeHTML(match.awayLogo)}"
          alt=""
          class="team-logo"
        >
      `

      : "";


  return `

    <article
      class="game ${live ? "live-game" : ""}"

      ${
        live
          ? `
            role="button"
            tabindex="0"
            data-id="${match.id}"
          `
          : ""
      }
    >

      <div class="game-top">

        <span class="competition">

          ${escapeHTML(match.country)}

          ·

          ${escapeHTML(match.league)}

        </span>

        ${statusLabel(match)}

      </div>


      <div class="match">


        <div class="team">

          ${homeLogo}

          <span>
            ${escapeHTML(match.home)}
          </span>

        </div>


        <div class="score">

          ${score}

        </div>


        <div class="team away-team">

          <span>
            ${escapeHTML(match.away)}
          </span>

          ${awayLogo}

        </div>


      </div>


      ${
        live
          ? `
            <div class="tap-hint">
              Ver goleadores y minutos ↗
            </div>
          `
          : ""
      }

    </article>

  `;

}


function filteredMatches() {

  return partidos.filter(match => {

    const text = `

      ${match.home}

      ${match.away}

      ${match.league}

      ${match.country}

    `.toLowerCase();


    const matchesSearch =
      text.includes(busqueda);


    const matchesSection =

      seccionActual === "todos"

      ||

      match.state === seccionActual;


    return (
      matchesSearch &&
      matchesSection
    );

  });

}


function render() {

  const list =
    filteredMatches();


  const live =
    list.filter(
      m => m.state === "live"
    );


  const upcoming =
    list.filter(
      m => m.state === "upcoming"
    );


  const finished =
    list.filter(
      m => m.state === "finished"
    );


  function show(id, items) {

    $(id).innerHTML =

      items.length

        ? items
            .map(createCard)
            .join("")

        : `
          <div class="no-games">
            No hay partidos disponibles.
          </div>
        `;

  }


  if (seccionActual === "todos") {

    show(
      "liveGames",
      live
    );

    show(
      "upcomingGames",
      upcoming
    );

    show(
      "finishedGames",
      finished
    );


    $("liveSection")
      .style.display = "";


    $("upcomingSection")
      .style.display = "";


    $("finishedSection")
      .style.display = "";

  }


  else {

    $("liveSection")
      .style.display =
        seccionActual === "live"
          ? ""
          : "none";


    $("upcomingSection")
      .style.display =
        seccionActual === "upcoming"
          ? ""
          : "none";


    $("finishedSection")
      .style.display =
        seccionActual === "finished"
          ? ""
          : "none";


    if (
      seccionActual === "live"
    ) {

      show(
        "liveGames",
        live
      );

    }


    if (
      seccionActual === "upcoming"
    ) {

      show(
        "upcomingGames",
        upcoming
      );

    }


    if (
      seccionActual === "finished"
    ) {

      show(
        "finishedGames",
        finished
      );

    }

  }


  const totalLive =
    partidos.filter(
      m => m.state === "live"
    ).length;


  $("liveCount").textContent =
    totalLive;


  $("liveLabel").textContent =
    `${live.length} partidos`;


  $("upcomingLabel").textContent =
    `${upcoming.length} partidos`;


  $("finishedLabel").textContent =
    `${finished.length} partidos`;

}


async function loadMatches() {

  const date =
    localDate();


  fechaActual =
    date;


  updateDate();


  $("loading")
    .style.display = "block";


  $("errorBox")
    .style.display = "none";


  try {

    const response =
      await fetch(
        `/api/matches?date=${date}`
      );


    if (!response.ok) {

      const data =
        await response
          .json()
          .catch(() => ({}));

      throw new Error(
        data.error ||
        "No se pudieron obtener los partidos."
      );

    }


    const data =
      await response.json();


    partidos =
      data.matches || [];


    $("loading")
      .style.display = "none";


    $("liveSection")
      .style.display = "";


    $("upcomingSection")
      .style.display = "";


    $("finishedSection")
      .style.display = "";


    render();

  }


  catch (error) {

    console.error(error);


    $("loading")
      .style.display = "none";


    $("errorBox")
      .style.display = "block";


    $("errorText")
      .textContent =
        error.message;


    $("liveSection")
      .style.display = "none";


    $("upcomingSection")
      .style.display = "none";


    $("finishedSection")
      .style.display = "none";

  }

}


// =================================
// MODAL
// =================================


const modal =
  document.createElement("div");


modal.id =
  "matchModal";


modal.className =
  "modal";


modal.style.display =
  "none";


modal.innerHTML = `

  <div
    class="modal-backdrop"
  ></div>


  <div
    class="modal-content"
    role="dialog"
    aria-modal="true"
  >

    <button
      class="modal-close"
      aria-label="Cerrar"
    >
      ✕
    </button>


    <div
      id="modalBody"
    ></div>

  </div>

`;


document.body.appendChild(
  modal
);


function closeModal() {

  modal.style.display =
    "none";

  document.body.style.overflow =
    "";

}


modal
  .querySelector(".modal-close")
  .addEventListener(
    "click",
    closeModal
  );


modal
  .querySelector(".modal-backdrop")
  .addEventListener(
    "click",
    closeModal
  );


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeModal();

    }

  }
);


async function openMatch(id) {

  const match =
    partidos.find(
      m =>
        String(m.id) ===
        String(id)
    );


  if (!match) return;


  modal.style.display =
    "flex";


  document.body.style.overflow =
    "hidden";


  $("modalBody").innerHTML = `

    <p class="small-title">

      ${escapeHTML(
        match.league
      )}

    </p>


    <h2>
      Detalles del partido
    </h2>


    <div class="modal-score">

      <span>
        ${escapeHTML(
          match.home
        )}
      </span>


      <strong>

        ${match.homeScore ?? 0}

        -

        ${match.awayScore ?? 0}

      </strong>


      <span>

        ${escapeHTML(
          match.away
        )}

      </span>

    </div>


    <p class="status-live">

      🔴 EN VIVO

      ${
        match.elapsed != null
          ? `${escapeHTML(
              match.elapsed
            )}'`
          : ""
      }

    </p>


    <h3>
      ⚽ Goleadores
    </h3>


    <p class="modal-loading">

      Cargando eventos...

    </p>

  `;


  try {

    const response =
      await fetch(
        `/api/matches/${id}/events`
      );


    if (!response.ok) {

      throw new Error(
        "No se pudieron cargar los eventos."
      );

    }


    const data =
      await response.json();


    const goals =
      data.goals || [];


    const goalList =

      goals.length

        ? goals
            .map(
              goal => `

                <div
                  class="goal-row"
                >

                  <span>
                    ⚽
                  </span>


                  <div>

                    <strong>
                      ${escapeHTML(
                        goal.player
                      )}
                    </strong>


                    <small>

                      ${escapeHTML(
                        goal.team
                      )}

                    </small>


                    ${
                      goal.assist
                        ? `
                          <small>
                            Asistencia:
                            ${escapeHTML(
                              goal.assist
                            )}
                          </small>
                        `
                        : ""
                    }

                  </div>


                  <b>

                    ${goal.minute ?? "?"}

                    ${
                      goal.extra
                        ? `+${goal.extra}`
                        : ""
                    }'

                  </b>

                </div>

              `
            )
            .join("")

        : `

          <p
            class="modal-loading"
          >
            Todavía no hay goles registrados.
          </p>

        `;


    $("modalBody").innerHTML = `

      <p class="small-title">

        ${escapeHTML(
          match.league
        )}

      </p>


      <h2>
        Detalles del partido
      </h2>


      <div class="modal-score">

        <span>

          ${escapeHTML(
            match.home
          )}

        </span>


        <strong>

          ${match.homeScore ?? 0}

          -

          ${match.awayScore ?? 0}

        </strong>


        <span>

          ${escapeHTML(
            match.away
          )}

        </span>

      </div>


      <p class="status-live">

        🔴 EN VIVO

        ${
          match.elapsed != null
            ? `${escapeHTML(
                match.elapsed
              )}'`
            : ""
        }

      </p>


      <h3>
        ⚽ Goleadores
      </h3>


      ${goalList}

    `;

  }


  catch (error) {

    console.error(error);


    $("modalBody")
      .insertAdjacentHTML(
        "beforeend",

        `

          <p
            class="modal-loading"
          >

            No se pudieron cargar
            los goleadores.

          </p>

        `
      );

  }

}


// =================================
// CLICK EN PARTIDO EN VIVO
// =================================


document.addEventListener(
  "click",
  event => {

    const card =
      event.target.closest(
        ".live-game"
      );


    if (card) {

      openMatch(
        card.dataset.id
      );

    }

  }
);


document.addEventListener(
  "keydown",
  event => {

    const card =
      event.target.closest(
        ".live-game"
      );


    if (
      card &&
      (
        event.key === "Enter" ||
        event.key === " "
      )
    ) {

      event.preventDefault();

      openMatch(
        card.dataset.id
      );

    }

  }
);


// =================================
// NAVEGACIÓN
// =================================


document
  .querySelectorAll(".nav-btn")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(
            ".nav-btn"
          )
          .forEach(
            b =>
              b.classList.remove(
                "active"
              )
          );


        button.classList.add(
          "active"
        );


        seccionActual =
          button.dataset.section;


        render();

      }
    );

  });


// =================================
// BUSCADOR
// =================================


$("search")
  .addEventListener(
    "input",
    event => {

      busqueda =
        event.target.value
          .trim()
          .toLowerCase();


      render();

    }
  );


// =================================
// REINTENTAR
// =================================


$("retryButton")
  .addEventListener(
    "click",
    loadMatches
  );


// =================================
// BOTÓN HOY
// =================================


$("dateButton")
  .addEventListener(
    "click",
    () => {

      loadMatches();

    }
  );


// =================================
// INICIO
// =================================


loadMatches();


// Actualizar cada minuto

setInterval(
  () => {

    const nuevaFecha =
      localDate();


    if (
      nuevaFecha !==
      fechaActual
    ) {

      loadMatches();

    }

    else {

      loadMatches();

    }

  },
  60000
);
