const trips = [
  {
    id: "kyushu",
    card: {
      title: "九州一周！",
      area: "福岡 / 佐賀 / 長崎 / 熊本 / 大分 / 宮崎 / 鹿児島",
      period: "2024/08/07~2024/08/17",
      summary: "7日かけてソロで九州を一周しました。",
      status: "記事作成中",
    },
    map: {
      regionIds: ["JP-40", "JP-41", "JP-42", "JP-43", "JP-44", "JP-45", "JP-46"],
    },
    article: null,
  },
  {
    id: "shikoku",
    card: {
      title: "四国周遊",
      area: "高知 / 香川 / 愛媛",
      period: "2025/09/20~2025/09/23",
      summary: "四国を巡りながら、高知・香川・愛媛の景色と食を楽しんだ旅です。",
      status: "記事作成中",
    },
    map: {
      regionIds: ["JP-37", "JP-38", "JP-39"],
    },
    article: null,
  },
  {
    id: "setouchi",
    card: {
      title: "瀬戸内海一周！",
      area: "岡山 / 広島 / 香川 / 愛媛 / 高知",
      period: "2026/04/29~2026/05/01",
      summary: "レンタカーで3日かけて瀬戸内海をぐるっと巡りながら、景色と食事を楽しんだ旅です。",
      status: "記事作成中",
    },
    map: {
      regionIds: ["JP-33", "JP-34", "JP-37", "JP-38", "JP-39"],
    },
    article: null,
  },
  // {
  //   id: "bali",
  //   card: {
  //     title: "バリ島3泊5日！",
  //     area: "インドネシア / バリ島",
  //     period: "3泊5日",
  //     summary: "海と街をゆったり楽しむ海外旅行。シュノーケリングもしました",
  //     status: "記事作成中",
  //   },
  //   map: {
  //     regionIds: [],
  //   },
  //   article: null,
  // },
];

const getCardInfo = (trip) => trip.card;

const getRegionIds = (trip) => trip.map?.regionIds ?? [];

const getArticleInfo = (trip) => trip.article;

const getTripRegions = (trip) =>
  getRegionIds(trip)
    .map((regionId) => document.getElementById(regionId))
    .filter(Boolean);

const getTripCard = (trip) =>
  document.querySelector(`[data-trip-id="${trip.id}"]`);

const createArticleLink = (article, className) => {
  if (!article?.url) return null;

  const link = document.createElement("a");
  link.className = className;
  link.href = article.url;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = article.label || "詳細を見る";
  return link;
};

const createTravelCard = (trip, handlers) => {
  const cardInfo = getCardInfo(trip);
  const articleInfo = getArticleInfo(trip);
  const card = document.createElement("article");
  card.className = "travel-card";
  card.dataset.tripId = trip.id;

  const header = document.createElement("div");
  header.className = "travel-card__header";

  const title = document.createElement("h3");
  title.className = "travel-card__title";
  title.textContent = cardInfo.title;
  header.appendChild(title);

  if (cardInfo.status) {
    const status = document.createElement("span");
    status.className = "travel-card__status";
    status.textContent = cardInfo.status;
    header.appendChild(status);
  }

  const meta = document.createElement("p");
  meta.className = "travel-card__meta";
  meta.textContent = [cardInfo.period, cardInfo.area].filter(Boolean).join("\n");

  const summary = document.createElement("p");
  summary.className = "travel-card__summary";
  summary.textContent = cardInfo.summary;

  card.append(header, meta, summary);

  const articleLink = createArticleLink(articleInfo, "travel-card__link");
  if (articleLink) {
    card.appendChild(articleLink);
  }

  card.addEventListener("mouseenter", () => handlers.onActivate(trip));
  card.addEventListener("mouseleave", handlers.onDeactivate);
  card.addEventListener("focusin", () => handlers.onActivate(trip));
  card.addEventListener("focusout", handlers.onDeactivate);

  return card;
};

const renderTravelCards = (cardList, travelItems, handlers) => {
  cardList.replaceChildren(
    ...travelItems.map((trip) => createTravelCard(trip, handlers))
  );
};

const createRegionToTripMap = (travelItems) => {
  const regionToTrip = new Map();

  travelItems.forEach((trip) => {
    getRegionIds(trip).forEach((regionId) => {
      regionToTrip.set(regionId, trip);
    });
  });

  return regionToTrip;
};

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

const hideMapPopup = (popup) => {
  popup.style.display = "none";
  popup.setAttribute("aria-hidden", "true");
};

const renderMapPopup = (popup, trip) => {
  const cardInfo = getCardInfo(trip);
  const articleInfo = getArticleInfo(trip);

  popup.replaceChildren();

  const title = document.createElement("h3");
  title.textContent = cardInfo.title;
  popup.appendChild(title);

  const articleLink = createArticleLink(articleInfo, "popup__link");
  if (articleLink) {
    popup.appendChild(articleLink);
  }

  if (cardInfo.status) {
    const status = document.createElement("p");
    status.textContent = cardInfo.status;
    popup.appendChild(status);
  }
};

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), Math.max(min, max));

const positionMapPopup = (popup, target) => {
  const map = target.closest(".travel-map");
  if (!map) return;

  const rect = target.getBoundingClientRect();
  const mapRect = map.getBoundingClientRect();
  const popupWidth = popup.offsetWidth;
  const popupHeight = popup.offsetHeight;
  const gap = 12;
  const padding = 12;
  const topAboveTarget = rect.top - mapRect.top - popupHeight - gap;
  const topBelowTarget = rect.bottom - mapRect.top + gap;
  const top = topAboveTarget >= padding ? topAboveTarget : topBelowTarget;
  const left = rect.left - mapRect.left + rect.width / 2 - popupWidth / 2;
  const maxTop = mapRect.height - popupHeight - padding;
  const maxLeft = mapRect.width - popupWidth - padding;

  popup.style.right = "";
  popup.style.bottom = "";
  popup.style.top = `${clamp(top, padding, maxTop)}px`;
  popup.style.left = `${clamp(left, padding, maxLeft)}px`;
};

const showMapPopup = (popup, trip, target) => {
  setActiveTrip(trip);
  renderMapPopup(popup, trip);

  popup.style.display = "block";
  popup.setAttribute("aria-hidden", "false");
  positionMapPopup(popup, target);
};

const setupTravelMap = (regionToTrip, handlers) => {
  regionToTrip.forEach((trip, regionId) => {
    const region = document.getElementById(regionId);
    if (!region) return;

    region.classList.add("is-visited");
    region.setAttribute("tabindex", "0");
    region.setAttribute("role", "button");
    region.setAttribute("aria-label", getCardInfo(trip).title);

    region.addEventListener("mouseenter", (event) => {
      handlers.onRegionActivate(trip, event.currentTarget);
    });

    region.addEventListener("mouseleave", handlers.onDeactivate);

    region.addEventListener("focus", (event) => {
      handlers.onRegionActivate(trip, event.currentTarget);
    });

    region.addEventListener("blur", handlers.onDeactivate);

    region.addEventListener("click", (event) => {
      handlers.onRegionActivate(trip, event.currentTarget);
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const cardList = document.getElementById("travel-cards");
  const popup = document.getElementById("travel-popup");
  if (!cardList || !popup) return;

  const regionToTrip = createRegionToTripMap(trips);
  let isPopupHovered = false;
  let hideTimeout;

  const scheduleDeactivate = () => {
    hideTimeout = setTimeout(() => {
      if (!isPopupHovered) {
        clearActiveTrip();
        hideMapPopup(popup);
      }
    }, 200);
  };

  const activateTripCard = (trip) => {
    clearTimeout(hideTimeout);
    setActiveTrip(trip);
  };

  const activateMapRegion = (trip, target) => {
    clearTimeout(hideTimeout);
    showMapPopup(popup, trip, target);
  };

  popup.addEventListener("mouseenter", () => {
    clearTimeout(hideTimeout);
    isPopupHovered = true;
  });

  popup.addEventListener("mouseleave", () => {
    isPopupHovered = false;
    scheduleDeactivate();
  });

  renderTravelCards(cardList, trips, {
    onActivate: activateTripCard,
    onDeactivate: scheduleDeactivate,
  });

  setupTravelMap(regionToTrip, {
    onRegionActivate: activateMapRegion,
    onDeactivate: scheduleDeactivate,
  });
});
