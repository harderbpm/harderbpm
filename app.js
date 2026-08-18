const stationList = document.getElementById("station-list");
const audioPlayer = document.getElementById("audio-player");
const playerButton = document.getElementById("player-button");
const playerStationName = document.getElementById("player-station-name");
const playerStationGenre = document.getElementById("player-station-genre");
const volumeSlider = document.getElementById("volume-slider");

let currentStation = null;
let currentStationButton = null;

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
          <div class="station-icon">${station.shortName}</div>

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
          playerButton.textContent = "▶";
          return;
        }

        if (currentStationButton && currentStationButton !== stationButton) {
          currentStationButton.querySelector(".station-play-icon").textContent = "▶";
          currentStationButton.querySelector("span:last-child").textContent = "Listen live";
        }

        currentStation = station;
        currentStationButton = stationButton;

        audioPlayer.src = station.stream;
        playerStationName.textContent = station.name;
        playerStationGenre.textContent = station.genre;

        audioPlayer
          .play()
          .then(() => {
            stationPlayIcon.textContent = "❚❚";
            stationButton.querySelector("span:last-child").textContent = "Pause";
            playerButton.textContent = "❚❚";
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

playerButton.addEventListener("click", () => {
  if (!currentStation) {
    return;
  }

  if (audioPlayer.paused) {
    audioPlayer
      .play()
      .then(() => {
        playerButton.textContent = "❚❚";

        if (currentStationButton) {
          currentStationButton.querySelector(".station-play-icon").textContent = "❚❚";
          currentStationButton.querySelector("span:last-child").textContent = "Pause";
        }
      })
      .catch((error) => {
        console.error("Stream kon niet worden hervat:", error);
      });
  } else {
    audioPlayer.pause();
    playerButton.textContent = "▶";

    if (currentStationButton) {
      currentStationButton.querySelector(".station-play-icon").textContent = "▶";
      currentStationButton.querySelector("span:last-child").textContent = "Listen live";
    }
  }
});

audioPlayer.volume = 0.5;

volumeSlider.addEventListener("input", () => {
  audioPlayer.volume = Number(volumeSlider.value);
});
