const trips = [
  {
    id: "kyushu",
    title: "九州一周！",
    area: "福岡 / 佐賀 / 長崎 / 熊本 / 大分 / 宮崎 / 鹿児島",
    period: "Solo trip",
    summary: "7日かけてソロで九州を一周しました。",
    status: "記事作成中",
    link: null,
    regionIds: ["JP-40", "JP-41", "JP-42", "JP-43", "JP-44", "JP-45", "JP-46"],
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const cardList = document.getElementById("travel-cards");
  const popup = document.getElementById("travel-popup");
  const regionToTrip = new Map();
  let isPopupHovered = false;
  let hideTimeout;

  const getRegionIds = (trip) => trip.regionIds ?? [];

  trips.forEach((trip) => {
    getRegionIds(trip).forEach((regionId) => {
      regionToTrip.set(regionId, trip);
    });
  });

  const getTripRegions = (trip) =>
    getRegionIds(trip)
      .map((regionId) => document.getElementById(regionId))
      .filter(Boolean);

  const getTripCard = (trip) =>
    document.querySelector(`[data-trip-id="${trip.id}"]`);

  const clearActiveTrip = () => {
    document
      .querySelectorAll(".map-land.is-active")
      .forEach((region) => region.classList.remove("is-active"));
    document
      .querySelectorAll(".travel-card.is-active")
      .forEach((card) => card.classList.remove("is-active"));
  };

  const setActiveTrip = (trip) => {
    clearActiveTrip();
    getTripRegions(trip).forEach((region) => region.classList.add("is-active"));
    getTripCard(trip)?.classList.add("is-active");
  };

  const hidePopup = () => {
    popup.style.display = "none";
    popup.setAttribute("aria-hidden", "true");
  };

  const scheduleHide = () => {
    hideTimeout = setTimeout(() => {
      if (!isPopupHovered) {
        clearActiveTrip();
        hidePopup();
      }
    }, 200);
  };

  const renderTripCard = (trip) => {
    const card = document.createElement("article");
    card.className = "travel-card";
    card.dataset.tripId = trip.id;

    const header = document.createElement("div");
    header.className = "travel-card__header";

    const title = document.createElement("h3");
    title.className = "travel-card__title";
    title.textContent = trip.title;
    header.appendChild(title);

    if (trip.status) {
      const status = document.createElement("span");
      status.className = "travel-card__status";
      status.textContent = trip.status;
      header.appendChild(status);
    }

    const meta = document.createElement("p");
    meta.className = "travel-card__meta";
    meta.textContent = [trip.period, trip.area].filter(Boolean).join(" / ");

    const summary = document.createElement("p");
    summary.className = "travel-card__summary";
    summary.textContent = trip.summary;

    card.append(header, meta, summary);

    if (trip.link?.url) {
      const link = document.createElement("a");
      link.className = "travel-card__link";
      link.href = trip.link.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = trip.link.label || "詳細を見る";
      card.appendChild(link);
    }

    card.addEventListener("mouseenter", () => {
      clearTimeout(hideTimeout);
      setActiveTrip(trip);
    });

    card.addEventListener("mouseleave", () => {
      scheduleHide();
    });

    card.addEventListener("focusin", () => {
      clearTimeout(hideTimeout);
      setActiveTrip(trip);
    });

    card.addEventListener("focusout", () => {
      scheduleHide();
    });

    return card;
  };

  const renderCards = () => {
    if (!cardList) return;
    cardList.replaceChildren(...trips.map(renderTripCard));
  };

  const renderPopup = (trip) => {
    popup.replaceChildren();

    const title = document.createElement("h3");
    title.textContent = trip.title;
    popup.appendChild(title);

    if (trip.link?.url) {
      const link = document.createElement("a");
      link.href = trip.link.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = trip.link.label || "詳細を見る";
      popup.appendChild(link);
    }

    if (trip.status) {
      const status = document.createElement("p");
      status.textContent = trip.status;
      popup.appendChild(status);
    }
  };

  const showPopup = (trip, target) => {
    clearTimeout(hideTimeout);
    setActiveTrip(trip);
    renderPopup(trip);

    popup.style.display = "block";
    popup.setAttribute("aria-hidden", "false");

    if (window.matchMedia("(max-width: 640px)").matches) {
      popup.style.top = "";
      popup.style.left = "";
      return;
    }

    const rect = target.getBoundingClientRect();
    const mapRect = target.closest(".travel-map").getBoundingClientRect();
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;
    const top = rect.top - mapRect.top - popupHeight - 12;
    const left = rect.left - mapRect.left + rect.width / 2 - popupWidth / 2;
    const maxLeft = mapRect.width - popupWidth - 12;

    popup.style.top = `${Math.max(12, top)}px`;
    popup.style.left = `${Math.min(Math.max(12, left), maxLeft)}px`;
  };

  const setupMapInteractions = () => {
    regionToTrip.forEach((trip, regionId) => {
      const region = document.getElementById(regionId);
      if (!region) return;

      region.classList.add("is-visited");
      region.setAttribute("tabindex", "0");
      region.setAttribute("role", "button");
      region.setAttribute("aria-label", trip.title);

      region.addEventListener("mouseenter", (event) => {
        showPopup(trip, event.currentTarget);
      });

      region.addEventListener("mouseleave", () => {
        scheduleHide();
      });

      region.addEventListener("focus", (event) => {
        showPopup(trip, event.currentTarget);
      });

      region.addEventListener("blur", () => {
        scheduleHide();
      });

      region.addEventListener("click", (event) => {
        showPopup(trip, event.currentTarget);
      });
    });
  };

  popup.addEventListener("mouseenter", () => {
    clearTimeout(hideTimeout);
    isPopupHovered = true;
  });

  popup.addEventListener("mouseleave", () => {
    isPopupHovered = false;
    scheduleHide();
  });

  renderCards();
  setupMapInteractions();
});
