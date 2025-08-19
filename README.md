# Minimal Ad Blocker (MV3) + YouTube Helper (Android-Ready)

A lightweight Chrome **Manifest V3** extension that blocks common ad networks, hides cosmetic ad elements, and includes a YouTube helper that **auto-skips, mutes, and accelerates through YouTube ads** — now tuned for **Chrome on Android (with Developer Mode enabled)**.

---

## ✨ Features
- **Network blocking**: Uses Chrome’s `declarativeNetRequest` API to block requests to known ad networks (DoubleClick, Taboola, Criteo, etc.).
- **Cosmetic filtering**: Injects CSS to hide banners, containers, and “sponsored” slots across sites.
- **YouTube helper**:
  - Skips pre-rolls when possible.
  - Mutes & fast-forwards mid-rolls (16×) until they end.
  - Removes banner overlays and companion ads.
- **Custom rules**:
  - Add your own URL patterns (`*://*.example.com/*`) via the Options page.
  - Save CSS selectors to nuke site-specific ad slots.
- **Sync support**: All settings (enabled/disabled, custom rules, selectors) sync via your Google account across Chrome instances — desktop or mobile.

---

## 📦 Installation (Desktop + Android)
1. Download this repo as a ZIP and unzip (or clone with `git clone`).
2. **On Desktop (Windows/Linux/macOS)**  
   - Open Chrome → `chrome://extensions`  
   - Enable **Developer mode** (toggle in top-right).  
   - Click **Load unpacked** → select the unzipped folder.  
3. **On Android (Chrome Beta/Dev/Canary)**  
   - Enable **Developer Mode** in Chrome settings.  
   - Go to `chrome://extensions`.  
   - Turn on **Developer mode**.  
   - Tap **Load unpacked** → pick the unzipped folder from your phone’s storage.  

> ⚠️ Note: Full extension loading on Android requires Chrome Beta/Dev/Canary with “Enable Extension Support” flag. Stable Chrome may not expose `chrome://extensions` yet.

---

## 🛠 Usage
- **Toolbar / Menu**:
  - Toggle ad hiding on/off.
  - Check whether network rules are active.
  - See your custom block rules count.
- **Options page**:
  - Manage custom URL filters.
  - Add custom CSS selectors for site-specific blocks.
- Works instantly on ad-heavy sites + YouTube.

---

## ⚠️ Notes & Limitations
- YouTube ads aren’t truly blocked at the request level (Google bundles them with the video). Instead:
  - Pre-rolls are skipped if detected.
  - Mid-rolls are muted + sped up.
  - Visual companions are hidden.
- Ruleset is deliberately small/lightweight. For wider coverage, import external filters.
- **Sync caveat**: While settings sync across devices, developer-mode extensions themselves don’t auto-install. You must load it manually on each device.

---

## 📂 Project Structure
- `manifest.json` — MV3 configuration  
- `rules_1.json` — starter block rules  
- `content.js` — cosmetic filtering + YouTube helper  
- `popup.html` / `popup.js` — popup UI  
- `options.html` / `options.js` — options page  
- `README.md` — this file  

---

## 🚀 Roadmap / Ideas
- [ ] Counter in popup showing ads skipped/hidden  
- [ ] One-click site whitelist toggle  
- [ ] Import support for EasyList / ABP filter lists  
- [ ] Auto-build & package release ZIP via GitHub Actions  

---

## 📜 License
MIT License — free to use, modify, and share.  
