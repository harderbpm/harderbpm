const stationList = document.getElementById("station-list");
const audioPlayer = document.getElementById("audio-player");
const playerButton = document.getElementById("player-button");
const playerStationName = document.getElementById("player-station-name");
const playerStationGenre = document.getElementById("player-station-genre");
const volumeSlider = document.getElementById("volume-slider");

const statusApi =
  "https://harderbpm-stream-status.robbertinlog.workers.dev";

let currentStation = null;
let currentStationButton = null;
let currentStationCard = null;


/* =========================
   Player icons
========================= */

const playIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5.5L18 12L8 18.5V5.5Z"></path>
  </svg>
`;

const pauseIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="7" y="5" width="3.5" height="14" rx="1"></rect>
    <rect x="13.5" y="5" width="3.5" height="14" rx="1"></rect>
  </svg>
`;

function setPlayerIcon(isPlaying) {
  playerButton.innerHTML =
    isPlaying ? pauseIcon : playIcon;
}


/* =========================
   Genre icons
========================= */

function getGenreIcon(genre, shortName) {
  switch (genre.toLowerCase()) {

    case "hardcore":
      return `
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="8"></circle>

          <path d="M50 10
                   A40 40 0 0 1 84 30
                   L63 42
                   A17 17 0 0 0 50 33
                   Z"></path>

          <path d="M84 70
                   A40 40 0 0 1 50 90
                   L50 66
                   A17 17 0 0 0 63 58
                   Z"></path>

          <path d="M16 70
                   A40 40 0 0 1 16 30
                   L37 42
                   A17 17 0 0 0 37 58
                   Z"></path>
        </svg>
      `;


    case "hardstyle":
      return `
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path d="M58 6
                   L28 50
                   H47
                   L35 94
                   L72 43
                   H52
                   Z"></path>
        </svg>
      `;


    case "uptempo":
      return `
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path d="M40 8
                   L18 49
                   H34
                   L24 91
                   L53 48
                   H39
                   L55 8
                   Z"></path>

          <path d="M72 8
                   L50 49
                   H66
                   L56 91
                   L85 48
                   H71
                   L87 8
                   Z"></path>
        </svg>
      `;


    case "frenchcore":
      return `
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path d="M50 8
                   C42 20 38 28 38 36
                   C38 44 44 48 50 52
                   C56 48 62 44 62 36
                   C62 28 58 20 50 8
                   Z"></path>

          <path d="M50 52
                   C42 45 30 40 22 46
                   C12 54 18 70 32 68
                   C24 63 26 54 35 55
                   C41 56 45 62 47 68
                   H53
                   C55 62 59 56 65 55
                   C74 54 76 63 68 68
                   C82 70 88 54 78 46
                   C70 40 58 45 50 52
                   Z"></path>

          <rect
            x="46"
            y="52"
            width="8"
            height="35"
            rx="3"
          ></rect>

          <path d="M35 75 H65 V82 H35 Z"></path>
        </svg>
      `;


    case "hard techno":
      return `
        <svg viewBox="0 0 100 100" aria-hidden="true">

          <!-- Tandwiel -->
          <path d="
            M44 8 H56
            L59 18
            C63 19 67 21 70 23
            L79 18
            L87 27
            L82 36
            C84 40 86 44 86 48
            L96 52
            L94 64
            L83 65
            C81 69 79 73 76 76
            L81 86
            L71 93
            L63 86
            C59 88 55 89 51 89
            L47 99
            L35 96
            L35 85
            C31 83 27 81 24 78
            L14 82
            L7 72
            L14 64
            C12 60 11 56 11 52
            L1 47
            L5 35
            L16 35
            C18 31 20 27 23 24
            L18 14
            L28 7
            L36 15
            C39 12 42 10 44 8
            Z

            M50 30
            A20 20 0 1 0 50 70
            A20 20 0 1 0 50 30
            Z
          " fill-rule="evenodd"></path>

          <!-- Bliksem -->
          <path d="
            M56 24
            L37 52
            H48
            L42 77
            L65 45
            H54
            Z
          "></path>

        </svg>
      `;


    default:
      return shortName;
  }
}


/* =========================
   Station status helpers
========================= */

function clearPlayingState() {
  document
    .querySelectorAll(".station-card")
    .forEach((card) => {
      card.classList.remove("is-playing");
    });
}

function setStationButtonPlaying(
  button,
  isPlaying
) {
  if (!button) {
    return;
  }

  const icon =
    button.querySelector(".station-play-icon");

  const text =
    button.querySelector("span:last-child");

  if (isPlaying) {
    icon.textContent = "❚❚";
    text.textContent = "Pause";
  } else {
    icon.textContent = "▶";
    text.textContent = "Listen live";
  }
}


/* =========================
   Worker status ophalen
========================= */

async function loadStationStatus() {
  try {
    const response = await fetch(statusApi);

    if (!response.ok) {
      throw new Error(
        `Status API error: ${response.status}`
      );
    }

    const data = await response.json();

    data.stations.forEach((stationStatus) => {
      const card =
        document.querySelector(
          `.station-card[data-station="${CSS.escape(
            stationStatus.station
          )}"]`
        );

      if (!card) {
        return;
      }

      const badge =
        card.querySelector(".station-badge");

      const button =
        card.querySelector(
          ".station-play-button"
        );

      badge.classList.remove(
        "status-online",
        "status-unstable",
        "status-offline"
      );

      card.classList.remove("is-offline");

      button.disabled = false;


      /* ONLINE */
      if (stationStatus.status === "online") {
        badge.textContent = "ONLINE";
        badge.classList.add("status-online");

        if (
          currentStationCard !== card ||
          audioPlayer.paused
        ) {
          button.disabled = false;
        }
      }


      /* UNSTABLE */
      else if (
        stationStatus.status === "unstable"
      ) {
        badge.textContent = "UNSTABLE";

        badge.classList.add(
          "status-unstable"
        );

        button.disabled = false;
      }


      /* OFFLINE */
      else if (
        stationStatus.status === "offline"
      ) {
        badge.textContent = "OFFLINE";

        badge.classList.add(
          "status-offline"
        );

        card.classList.add("is-offline");

        button.disabled = true;

        const icon =
          button.querySelector(
            ".station-play-icon"
          );

        const text =
          button.querySelector(
            "span:last-child"
          );

        icon.textContent = "⚠";
        text.textContent = "Station offline";
      }
    });

  } catch (error) {
    console.error(
      "Station status kon niet worden geladen:",
      error
    );
  }
}


/* =========================
   Stations laden
========================= */

fetch("stations.json")
  .then((response) => response.json())
  .then((stations) => {

    stations.forEach((station) => {

      const card =
        document.createElement("article");

      card.className = "station-card";

      card.dataset.station = station.name;

      card.innerHTML = `
        <div class="station-card-top">

          <div class="station-badge status-online">
            ONLINE
          </div>

          <div class="station-genre">
            ${station.genre}
          </div>

        </div>

        <div class="station-card-content">

          <div class="station-icon">
            ${getGenreIcon(
              station.genre,
              station.shortName
            )}
          </div>

          <div>
            <h3>${station.name}</h3>
            <p>${station.genre} radio</p>
          </div>

        </div>

        <button
          class="station-play-button"
          type="button"
        >
          <span class="station-play-icon">
            ▶
          </span>

          <span>Listen live</span>
        </button>
      `;

      const stationButton =
        card.querySelector(
          ".station-play-button"
        );


      stationButton.addEventListener(
        "click",
        () => {

          if (stationButton.disabled) {
            return;
          }


          /* Zelfde station pauzeren */
          if (
            currentStation === station &&
            !audioPlayer.paused
          ) {
            audioPlayer.pause();

            setStationButtonPlaying(
              stationButton,
              false
            );

            card.classList.remove(
              "is-playing"
            );

            setPlayerIcon(false);

            return;
          }


          /* Vorige station resetten */
          if (
            currentStationButton &&
            currentStationButton !==
              stationButton
          ) {
            setStationButtonPlaying(
              currentStationButton,
              false
            );
          }

          clearPlayingState();


          /* Nieuwe station instellen */
          currentStation = station;

          currentStationButton =
            stationButton;

          currentStationCard = card;

          audioPlayer.src = station.stream;

          playerStationName.textContent =
            station.name;

          playerStationGenre.textContent =
            station.genre;

          audioPlayer.volume =
            Number(volumeSlider.value);

          audioPlayer.muted = false;


          /* Station starten */
          audioPlayer
            .play()
            .then(() => {

              card.classList.add(
                "is-playing"
              );

              setStationButtonPlaying(
                stationButton,
                true
              );

              setPlayerIcon(true);
            })
            .catch((error) => {

              console.error(
                "Stream kon niet worden afgespeeld:",
                error
              );

              playerStationName.textContent =
                "Stream unavailable";

              card.classList.remove(
                "is-playing"
              );

              setStationButtonPlaying(
                stationButton,
                false
              );

              setPlayerIcon(false);
            });
        }
      );


      stationList.appendChild(card);
    });


    /* Pas status ophalen nadat kaarten bestaan */
    loadStationStatus();

  })
  .catch((error) => {

    console.error(
      "Stations konden niet worden geladen:",
      error
    );

  });


/* =========================
   Centrale Play / Pause
========================= */

playerButton.addEventListener(
  "click",
  () => {

    if (!currentStation) {
      return;
    }


    /* Hervatten */
    if (audioPlayer.paused) {

      audioPlayer.volume =
        Number(volumeSlider.value);

      audioPlayer.muted = false;

      audioPlayer
        .play()
        .then(() => {

          setPlayerIcon(true);

          if (currentStationCard) {
            clearPlayingState();

            currentStationCard.classList.add(
              "is-playing"
            );
          }

          setStationButtonPlaying(
            currentStationButton,
            true
          );

        })
        .catch((error) => {

          console.error(
            "Stream kon niet worden hervat:",
            error
          );

        });


    } else {

      /* Pauzeren */
      audioPlayer.pause();

      setPlayerIcon(false);

      if (currentStationCard) {
        currentStationCard.classList.remove(
          "is-playing"
        );
      }

      setStationButtonPlaying(
        currentStationButton,
        false
      );
    }
  }
);


/* =========================
   Volume
========================= */

function updateVolume() {
  const volume =
    Number(volumeSlider.value);

  audioPlayer.muted = false;
  audioPlayer.volume = volume;
}


/* Start op 50% */
volumeSlider.value = 0.5;
audioPlayer.volume = 0.5;

volumeSlider.addEventListener(
  "input",
  updateVolume
);

volumeSlider.addEventListener(
  "change",
  updateVolume
);


/* Start met play-icoon */
setPlayerIcon(false);
