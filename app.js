const stationList = document.getElementById("station-list");
const audioPlayer = document.getElementById("audio-player");
const playerButton = document.getElementById("player-button");
const playerStationName = document.getElementById("player-station-name");
const playerStationGenre = document.getElementById("player-station-genre");
const volumeSlider = document.getElementById("volume-slider");

let currentStation = null;
let currentStationButton = null;

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

    default:
      return shortName;
  }
}

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
  playerButton.innerHTML = isPlaying ? pauseIcon : playIcon;
}


/* =========================
   Stations laden
========================= */

fetch("stations.json")
  .then((response) => response.json())
  .then((stations) => {
    stations.forEach((station) => {
      const card = document.createElement("article");
      card.className = "station-card";

      card.innerHTML = `
        <div class="station-card-top">
          <div class="station-badge">LIVE</div>
          <div class="station-genre">${station.genre}</div>
        </div>

        <div class="station-card-content">
          <div class="station-icon">
          ${getGenreIcon(station.genre, station.shortName)}
          </div>

          <div>
            <h3>${station.name}</h3>
            <p>${station.genre} radio</p>
          </div>
        </div>

        <button class="station-play-button" type="button">
          <span class="station-play-icon">▶</span>
          <span>Listen live</span>
        </button>
      `;

      const stationButton = card.querySelector(".station-play-button");
      const stationPlayIcon = card.querySelector(".station-play-icon");

      stationButton.addEventListener("click", () => {
        if (currentStation === station && !audioPlayer.paused) {
          audioPlayer.pause();

          stationPlayIcon.textContent = "▶";
          stationButton.querySelector("span:last-child").textContent = "Listen live";

          setPlayerIcon(false);

          return;
        }

        if (currentStationButton && currentStationButton !== stationButton) {
          currentStationButton
            .querySelector(".station-play-icon")
            .textContent = "▶";

          currentStationButton
            .querySelector("span:last-child")
            .textContent = "Listen live";
        }

        currentStation = station;
        currentStationButton = stationButton;

        audioPlayer.src = station.stream;

        playerStationName.textContent = station.name;
        playerStationGenre.textContent = station.genre;

        audioPlayer.volume = Number(volumeSlider.value);
        audioPlayer.muted = false;

        audioPlayer
          .play()
          .then(() => {
            stationPlayIcon.textContent = "❚❚";
            stationButton.querySelector("span:last-child").textContent = "Pause";

            setPlayerIcon(true);
          })
          .catch((error) => {
            console.error("Stream kon niet worden afgespeeld:", error);
            playerStationName.textContent = "Stream unavailable";
          });
      });

      stationList.appendChild(card);
    });
  })
  .catch((error) => {
    console.error("Stations konden niet worden geladen:", error);
  });


/* =========================
   Centrale Play / Pause
========================= */

playerButton.addEventListener("click", () => {
  if (!currentStation) {
    return;
  }

  if (audioPlayer.paused) {
    audioPlayer.volume = Number(volumeSlider.value);
    audioPlayer.muted = false;

    audioPlayer
      .play()
      .then(() => {
        setPlayerIcon(true);

        if (currentStationButton) {
          currentStationButton
            .querySelector(".station-play-icon")
            .textContent = "❚❚";

          currentStationButton
            .querySelector("span:last-child")
            .textContent = "Pause";
        }
      })
      .catch((error) => {
        console.error("Stream kon niet worden hervat:", error);
      });

  } else {
    audioPlayer.pause();

    setPlayerIcon(false);

    if (currentStationButton) {
      currentStationButton
        .querySelector(".station-play-icon")
        .textContent = "▶";

      currentStationButton
        .querySelector("span:last-child")
        .textContent = "Listen live";
    }
  }
});


/* =========================
   Volume
========================= */

function updateVolume() {
  const volume = Number(volumeSlider.value);

  audioPlayer.muted = false;
  audioPlayer.volume = volume;
}

volumeSlider.value = 0.5;
audioPlayer.volume = 0.5;

volumeSlider.addEventListener("input", updateVolume);
volumeSlider.addEventListener("change", updateVolume);


/* Start met play-icoon */
setPlayerIcon(false);
