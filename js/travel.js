document.addEventListener("DOMContentLoaded", () => {
  // 九州地方の都道府県を取得
  const kyushuRegions = document.querySelectorAll('[id="JP-40"], [id="JP-41"], [id="JP-42"], [id="JP-43"], [id="JP-44"], [id="JP-45"], [id="JP-46"]');
  const popup = document.getElementById("kyushu-popup");
  let isPopupHovered = false; // ポップアップがホバーされているかを管理するフラグ
  let hideTimeout; // ポップアップを非表示にするタイマー

  // ホバー時に九州全体を強調表示
  kyushuRegions.forEach((region) => {
    region.addEventListener("mouseenter", (event) => {
      clearTimeout(hideTimeout); // 非表示タイマーをクリア
      kyushuRegions.forEach((r) => r.classList.add("is-active"));

      // ポップアップを表示
      popup.style.display = "block";

      // ポップアップの位置を設定
      const rect = event.target.getBoundingClientRect();
      const popupWidth = popup.offsetWidth;
      const popupHeight = popup.offsetHeight;

      // ポップアップを九州の右上に表示
      popup.style.top = `${rect.top + window.scrollY - popupHeight - 690}px`; // 上部に少し余白を追加
      popup.style.left = `${rect.left + window.scrollX + rect.width / 2 - popupWidth / 2}px`; // 中央揃え
    });

    region.addEventListener("mouseleave", () => {
      // 非表示を遅延させる
      hideTimeout = setTimeout(() => {
        if (!isPopupHovered) {
          kyushuRegions.forEach((r) => r.classList.remove("is-active"));
          popup.style.display = "none";
        }
      }, 200); // 200ms の遅延
    });
  });

  // ポップアップにホバーした際のイベント
  popup.addEventListener("mouseenter", () => {
    clearTimeout(hideTimeout); // 非表示タイマーをクリア
    isPopupHovered = true; // ポップアップがホバーされた状態にする
  });

  popup.addEventListener("mouseleave", () => {
    isPopupHovered = false; // ポップアップのホバーが解除された状態にする
    hideTimeout = setTimeout(() => {
      popup.style.display = "none"; // ポップアップを非表示
      kyushuRegions.forEach((r) => r.classList.remove("is-active")); // 地図の強調表示も解除
    }, 200); // 200ms の遅延
  });
});