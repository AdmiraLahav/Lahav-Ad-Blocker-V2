// content.js — YT-safe cosmetics + ad-skipper
(function () {
  // Broad defaults for the rest of the web (NOT used on YouTube anymore)
  const DEFAULT_SELECTORS = [
    "#ad", ".ad", ".ads", ".advert", ".advertisement",
    "[id*='ad-container' i]", "[class*='ad-container' i]",
    "[id^='google_ads_']", "iframe[src*='doubleclick']",
    "iframe[src*='googlesyndication']",
    "div[id^='ad-slot-']",
    "div[class*='sponsored' i]",
    "[data-ad], [data-ad-client], [data-ad-slot]"
  ];

  // Narrow, YouTube-safe selectors
  const YT_SAFE_SELECTORS = [
    "ytd-promoted-sparkles-web-renderer",
    "ytd-display-ad-renderer",
    ".ytp-ad-module",
    "ytd-ad-slot-renderer",
    "ytd-companion-slot-renderer"
  ];

  const state = { enabled: true, customSelectors: [] };

  function buildCss(selectors) {
    if (!selectors || !selectors.length) return "";
    return selectors.map(s => `${s} { display: none !important; }`).join("\n");
  }

  function applyStyles() {
    if (!state.enabled) return;

    const styleId = "__mv3_adblock_css__";
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      style.type = "text/css";
      document.documentElement.endChild(style);
    }

    const isYT = /(^|\.)youtube\.com$/.test(location.hostname);
    const baseSelectors = isYT ? YT_SAFE_SELECTORS : DEFAULT_SELECTORS;
    const allSelectors = Array.from(new Set([...baseSelectors, ...state.customSelectors]));

    // Hard whitelist for the header/search bar on YouTube
    const WHITELIST = isYT ? `
#masthead, #masthead-container, ytd-masthead,
#center, #end, #container.ytd-masthead,
ytd-searchbox, #search-form {
  visibility: visible !important; /* don't force display */
}
` : "";


    style.textContent = buildCss(allSelectors) + "\n" + WHITELIST;
  }

  chrome.storage.sync.get({ enabled: true, customSelectors: [] }, (cfg) => {
    state.enabled = !!cfg.enabled;
    state.customSelectors = Array.isArray(cfg.customSelectors) ? cfg.customSelectors : [];
    applyStyles();
    if (state.enabled) maybeInitYouTubeHelper();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    if (changes.enabled) state.enabled = !!changes.enabled.newValue;
    if (changes.customSelectors) state.customSelectors = changes.customSelectors.newValue || [];
    if (!state.enabled) {
      const style = document.getElementById("__mv3_adblock_css__");
      if (style) style.textContent = "";
      return;
    }
    applyStyles();
    maybeInitYouTubeHelper();
  });

  // -------------------- YouTube helper (auto-skip/accelerate) --------------------
  function maybeInitYouTubeHelper() {
    if (!state.enabled) return;
    if (!/(^|\.)youtube\.com$/.test(location.hostname)) return;

    const YT_COSMETIC_REMOVE = [
      "ytd-ad-slot-renderer",
      "ytd-companion-slot-renderer",
      ".ytp-ad-player-overlay",
      ".ytd-display-ad-renderer"
      // NOTE: do NOT include "#masthead-ad" here — it can wrap real UI
    ];

    let adInterval = null;
    const saved = { rate: null, muted: null };

    const $ = (s) => document.querySelector(s);
    const $$ = (s) => document.querySelectorAll(s);
    const getVideo = () => document.querySelector("video.html5-main-video");
    const isAdShowing = () => document.querySelector("#movie_player.ad-showing") != null;

    function whitelistHeader() {
  const keep = [
    "#masthead", "#masthead-container", "ytd-masthead",
    "ytd-searchbox", "#search-form", "ytd-topbar-logo-renderer", "#buttons.ytd-masthead"
  ];
  keep.forEach(sel => document.querySelectorAll(sel).forEach(el => {
    // undo any previous inline hiding without overriding YouTube's layout
    el.style.removeProperty("display");
    el.style.removeProperty("visibility");
  }));

  const mh = document.querySelector("#masthead-ad");
  if (mh) {
    mh.querySelectorAll(".ytd-display-ad-renderer,.ytd-action-companion-ad-renderer,.ytp-ad-player-overlay,[data-ad],[data-ad-slot]")
      .forEach(n => n.remove());
    const header = mh.querySelector("ytd-masthead,#masthead,#masthead-container");
    if (header) {
      header.style.removeProperty("display");
      header.style.removeProperty("visibility");
    }
  }
}


    function zapCompanions() {
      YT_COSMETIC_REMOVE.forEach(sel => $$(sel).forEach(n => n.remove()));
      $$(".ytp-ad-overlay-close-button").forEach(b => b.click());
      whitelistHeader();
    }

    function clickSkip() {
      const btn = $(".ytp-ad-skip-button, .ytp-ad-skip-button-modern");
      if (btn) btn.click();
    }

    function onAdStart() {
      const v = getVideo();
      if (!v) return;
      if (saved.rate === null) saved.rate = v.playbackRate || 1;
      if (saved.muted === null) saved.muted = v.muted;

      try { v.muted = true; } catch {}
      try { v.playbackRate = 16; } catch {}

      clickSkip();
      zapCompanions();

      if (!adInterval) {
        adInterval = setInterval(() => {
          if (!isAdShowing()) return onAdEnd();
          clickSkip();
          zapCompanions();
          try {
            const d = v.duration || 0;
            if (d && d < 120 && v.currentTime < d - 0.2) {
              v.currentTime = Math.max(d - 0.1, 0);
            }
          } catch {}
        }, 300);
      }
    }

    function onAdEnd() {
      if (adInterval) { clearInterval(adInterval); adInterval = null; }
      const v = getVideo();
      if (v) {
        try { v.playbackRate = saved.rate ?? 1; } catch {}
        if (saved.muted !== null) try { v.muted = saved.muted; } catch {}
      }
      zapCompanions();
    }

    function hookPlayer() {
      const mp = document.getElementById("movie_player");
      if (!mp) return setTimeout(hookPlayer, 500);
      const obs = new MutationObserver(() => {
        if (isAdShowing()) onAdStart(); else onAdEnd();
      });
      obs.observe(mp, { attributes: true, attributeFilter: ["class"] });

      // Re-assert header visibility for a few seconds after navigation
      let t = 0;
      const hdrTimer = setInterval(() => { whitelistHeader(); if ((t += 1) > 20) clearInterval(hdrTimer); }, 250);
    }

    window.addEventListener("yt-navigate-start", () => onAdEnd(), { passive: true });
    window.addEventListener("yt-navigate-finish", () => { zapCompanions(); hookPlayer(); }, { passive: true });

    zapCompanions();
    hookPlayer();
  }
})();
