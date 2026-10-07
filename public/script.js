const partidos = [

  {
    id: 1,
    deporte: "⚽ Fútbol",
    liga: "Partido internacional",
    local: "Argentina",
    visitante: "Brasil",
    hora: "18:00",
    estado: "live",
    localScore: 2,
    visitanteScore: 1
  },

  {
    id: 2,
    deporte: "⚽ Fútbol",
    liga: "Partido internacional",
    local: "España",
    visitante: "Francia",
    hora: "20:00",
    estado: "upcoming",
    localScore: null,
    visitanteScore: null
  },

  {
    id: 3,
    deporte: "⚽ Fútbol",
    liga: "Partido internacional",
    local: "Italia",
    visitante: "Alemania",
    hora: "21:30",
    estado: "finished",
    localScore: 3,
    visitanteScore: 1
  },

  {
    id: 4,
    deporte: "⚽ Fútbol",
    liga: "Liga",
    local: "Barcelona",
    visitante: "Atlético de Madrid",
    hora: "22:00",
    estado: "upcoming"
  },

  {
    id: 5,
    deporte: "⚽ Fútbol",
    liga: "Premier League",
    local: "Liverpool",
    visitante: "Chelsea",
    hora: "22:30",
    estado: "upcoming"
  }

];


// Generar más partidos de ejemplo hasta llegar a 50

const equipos = [
  ["Manchester City", "Arsenal"],
  ["Real Madrid", "Sevilla"],
  ["Inter", "Milan"],
  ["Bayern", "Dortmund"],
  ["PSG", "Lyon"],
  ["Benfica", "Porto"],
  ["Ajax", "PSV"],
  ["Juventus", "Napoli"],
  ["River Plate", "Boca Juniors"],
  ["Flamengo", "Palmeiras"],
  ["Monterrey", "Tigres"],
  ["América", "Cruz Azul"],
  ["LA Galaxy", "Inter Miami"],
  ["Barcelona", "Valencia"],
  ["Chelsea", "Tottenham"],
  ["Arsenal", "Newcastle"],
  ["Milan", "Roma"],
  ["Napoli", "Lazio"],
  ["Leverkusen", "Leipzig"],
  ["Porto", "Braga"],
  ["PSV", "Feyenoord"],
  ["Ajax", "AZ Alkmaar"],
  ["River Plate", "Racing"],
  ["Boca Juniors", "San Lorenzo"],
  ["Colo-Colo", "Universidad de Chile"],
  ["Atlético Nacional", "Millonarios"],
  ["Peñarol", "Nacional"],
  ["Fluminense", "Botafogo"],
  ["Santos", "Corinthians"],
  ["Gremio", "Internacional"],
  ["Vélez", "Independiente"],
  ["Lanús", "Estudiantes"],
  ["Valencia", "Villarreal"],
  ["Betis", "Villarreal"],
  ["Leicester", "Everton"],
  ["West Ham", "Fulham"],
  ["Monaco", "Marseille"],
  ["Nice", "Lille"],
  ["Roma", "Fiorentina"],
  ["Torino", "Genoa"],
  ["Bologna", "Atalanta"],
  ["Werder Bremen", "Frankfurt"],
  ["Stuttgart", "Mainz"],
  ["Sporting", "Boavista"],
  ["Galatasaray", "Fenerbahce"]
];


for (let i = partidos.length; i < 50; i++) {

  const equiposPartido = equipos[
    (i - partidos.length) % equipos.length
  ];

  partidos.push({
    id: i + 1,
    deporte: "⚽ Fútbol",
    liga: "Partido",
    local: equiposPartido[0],
    visitante: equiposPartido[1],
    hora: `${String(12 + (i % 12)).padStart(2, "0")}:00`,
    estado: "upcoming",
    localScore: null,
    visitanteScore: null
  });

}


// Fecha

function mostrarFecha() {

  const fecha = new Date();

  const opciones = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  };

  document.getElementById("today").textContent =
    fecha.toLocaleDateString("es-ES", opciones);
}


// Crear tarjeta

function crearPartido(partido) {

  let estadoTexto = "";
  let estadoClase = "";

  if (partido.estado === "live") {

    estadoTexto = "🔴 EN VIVO";
    estadoClase = "status-live";

  } else if (partido.estado === "finished") {

    estadoTexto = "FINAL";
    estadoClase = "status-finished";

  } else {

    estadoTexto = "PRÓXIMO";

  }


  let marcador = "";

  if (
    partido.estado === "live" ||
    partido.estado === "finished"
  ) {

    marcador =
      `${partido.localScore ?? 0} - ${partido.visitanteScore ?? 0}`;

  } else {

    marcador = `
      <span class="time">
        ${partido.hora}
      </span>
    `;

  }


  return `
    <article class="game">

      <div class="game-top">

        <span class="competition">
          ${partido.deporte} · ${partido.liga}
        </span>

        <span class="${estadoClase}">
          ${estadoTexto}
        </span>

      </div>


      <div class="match">

        <div class="team">
          ${partido.local}
        </div>


        <div class="score">
          ${marcador}
        </div>


        <div class="team">
          ${partido.visitante}
        </div>

      </div>

    </article>
  `;
}


// Mostrar partidos

function mostrarPartidos(lista = partidos) {

  const live = lista.filter(p => p.estado === "live");

  const upcoming = lista.filter(p => p.estado === "upcoming");

  const finished = lista.filter(p => p.estado === "finished");


  document.getElementById("liveGames").innerHTML =
    live.length
      ? live.map(crearPartido).join("")
      : `<div class="no-games">No hay partidos en vivo.</div>`;


  document.getElementById("upcomingGames").innerHTML =
    upcoming.length
      ? upcoming.map(crearPartido).join("")
      : `<div class="no-games">No hay próximos partidos.</div>`;


  document.getElementById("finishedGames").innerHTML =
    finished.length
      ? finished.map(crearPartido).join("")
      : `<div class="no-games">No hay resultados todavía.</div>`;


  document.getElementById("liveCount").textContent =
    live.length;

  document.getElementById("liveLabel").textContent =
    `${live.length} partidos`;

  document.getElementById("upcomingLabel").textContent =
    `${upcoming.length} partidos`;

  document.getElementById("finishedLabel").textContent =
    `${finished.length} partidos`;
}


// Buscador

document.getElementById("search").addEventListener(
  "input",
  function () {

    const texto = this.value.toLowerCase();

    const filtrados = partidos.filter(p =>
      p.local.toLowerCase().includes(texto) ||
      p.visitante.toLowerCase().includes(texto) ||
      p.liga.toLowerCase().includes(texto)
    );

    mostrarPartidos(filtrados);

  }
);


// Navegación

document.querySelectorAll(".nav-btn").forEach(
  boton => {

    boton.addEventListener("click", () => {

      document
        .querySelectorAll(".nav-btn")
        .forEach(b => b.classList.remove("active"));

      boton.classList.add("active");


      const seccion = boton.dataset.section;


      if (seccion === "todos") {

        document.getElementById("liveSection").style.display = "block";
        document.getElementById("upcomingSection").style.display = "block";
        document.getElementById("finishedSection").style.display = "block";

      }


      if (seccion === "live") {

        document.getElementById("liveSection").style.display = "block";
        document.getElementById("upcomingSection").style.display = "none";
        document.getElementById("finishedSection").style.display = "none";

      }


      if (seccion === "upcoming") {

        document.getElementById("liveSection").style.display = "none";
        document.getElementById("upcomingSection").style.display = "block";
        document.getElementById("finishedSection").style.display = "none";

      }


      if (seccion === "finished") {

        document.getElementById("liveSection").style.display = "none";
        document.getElementById("upcomingSection").style.display = "none";
        document.getElementById("finishedSection").style.display = "block";

      }

    });

  }
);


mostrarFecha();

mostrarPartidos();
