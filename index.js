const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_FOOTBALL_KEY;

const API_URL = "https://v3.football.api-sports.io";

app.use(express.static(path.join(__dirname, "public")));

const cache = new Map();

async function apiRequest(endpoint) {
  if (!API_KEY) {
    throw new Error(
      "No se encontró API_FOOTBALL_KEY. Configúrala en Environment de Render."
    );
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`API respondió con estado ${response.status}`);
  }

  const data = await response.json();

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(
      "La API devolvió un error: " +
      JSON.stringify(data.errors)
    );
  }

  return data.response || [];
}

async function cached(key, duration, callback) {
  const existing = cache.get(key);

  if (existing && Date.now() - existing.time < duration) {
    return existing.data;
  }

  const data = await callback();

  cache.set(key, {
    time: Date.now(),
    data
  });

  return data;
}


// ===============================
// PARTIDOS
// ===============================

app.get("/api/matches", async (req, res) => {
  try {
    const date = req.query.date;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: "Fecha inválida."
      });
    }

    const matches = await cached(
      `matches-${date}`,
      30000,
      () => apiRequest(`/fixtures?date=${date}`)
    );

    const result = matches
      .map(match => {

        const status = match.fixture.status.short;

        let state = "upcoming";

        if (
          [
            "1H",
            "HT",
            "2H",
            "ET",
            "BT",
            "P"
          ].includes(status)
        ) {
          state = "live";
        }

        if (
          [
            "FT",
            "AET",
            "PEN"
          ].includes(status)
        ) {
          state = "finished";
        }

        return {
          id: match.fixture.id,

          league: match.league.name,

          country: match.league.country,

          home: match.teams.home.name,

          away: match.teams.away.name,

          homeLogo: match.teams.home.logo,

          awayLogo: match.teams.away.logo,

          date: match.fixture.date,

          timestamp: match.fixture.timestamp,

          elapsed: match.fixture.status.elapsed,

          status: match.fixture.status.long,

          statusShort: status,

          state,

          homeScore: match.goals.home,

          awayScore: match.goals.away
        };
      })

      .sort((a, b) => a.timestamp - b.timestamp)

      .slice(0, 50);

    res.json({
      date,
      total: result.length,
      matches: result
    });

  } catch (error) {

    console.error("Error obteniendo partidos:", error);

    res.status(500).json({
      error: error.message
    });
  }
});


// ===============================
// EVENTOS / GOLES
// ===============================

app.get("/api/matches/:id/events", async (req, res) => {

  try {

    const id = req.params.id;

    if (!/^\d+$/.test(id)) {

      return res.status(400).json({
        error: "ID de partido inválido."
      });

    }

    const events = await cached(
      `events-${id}`,
      30000,
      () => apiRequest(`/fixtures/events?fixture=${id}`)
    );

    const goals = events

      .filter(event => event.type === "Goal")

      .map(event => ({
        team: event.team?.name || "Equipo desconocido",

        player: event.player?.name || "Jugador desconocido",

        assist: event.assist?.name || null,

        minute: event.time?.elapsed ?? null,

        extra: event.time?.extra ?? null,

        detail: event.detail || "Gol"
      }));

    res.json({
      goals
    });

  } catch (error) {

    console.error("Error obteniendo eventos:", error);

    res.status(500).json({
      error: error.message
    });
  }
});


// ===============================
// PÁGINA
// ===============================

app.get("/", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
  );

});


// ===============================
// SERVIDOR
// ===============================

app.listen(PORT, () => {

  console.log(
    `ScoreLive funcionando en el puerto ${PORT}`
  );

});
