# Pinterest Sponsored Pin Blocker

A lightweight Chrome extension that removes sponsored, promoted, paid-partnership, and advertisement-labelled Pinterest pins from the page as you browse.

## What you should do next

Follow these steps in order:

1. **Download or keep this project as one folder.** Do not separate the files.
2. **Open Chrome Extensions:** type `chrome://extensions` in Chrome's address bar and press **Enter**.
3. **Turn on Developer mode** using the switch in the top-right corner.
4. **Click Load unpacked**.
5. **Select this project folder** — the folder that contains `manifest.json`.
6. **Open Pinterest** at `https://www.pinterest.com/`.
7. **Refresh Pinterest** if it was already open before loading the extension.
8. **Scroll your feed** and confirm sponsored/promoted pins disappear.

You do not need to run code, install Node.js, or publish anything to the Chrome Web Store for local use.

## How to download or keep this project as one folder

Choose the option that matches where you are viewing these files:

### Option A: If this project is on GitHub

1. Open the GitHub repository page.
2. Click the green **Code** button.
3. Click **Download ZIP**.
4. Find the downloaded ZIP file on your computer.
5. Right-click it and choose **Extract All** / **Unzip**.
6. Use the extracted folder when Chrome asks you to **Load unpacked**.

### Option B: If you already have these files on your computer

1. Create a folder named `pinterest-sponsored-pin-blocker`.
2. Move these files into that folder:
   - `manifest.json`
   - `content.js`
   - `styles.css`
   - `README.md`
3. When Chrome asks you to **Load unpacked**, select the `pinterest-sponsored-pin-blocker` folder itself.

### Option C: If you use Git

Run this command, then select the created folder in Chrome:

```bash
git clone <your-repository-url> pinterest-sponsored-pin-blocker
```

The important rule is: Chrome must be pointed at the folder that directly contains `manifest.json`.

## Beginner-friendly setup details

If you are new to Chrome extensions, do not open the extension files one by one. Chrome needs the entire project folder because `manifest.json`, `content.js`, and `styles.css` work together.

### 1. Find this project folder

Keep the files together in one folder. The folder should contain:

- `manifest.json` — tells Chrome this folder is an extension and where it should run.
- `content.js` — scans Pinterest pages and marks sponsored pins for removal.
- `styles.css` — hides pins that `content.js` marks as sponsored.
- `README.md` — these instructions.

### 2. Load the extension in Chrome

1. Open Google Chrome.
2. Type `chrome://extensions` into the address bar and press **Enter**.
3. Turn on **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select this whole project folder, not an individual file.
6. You should now see **Pinterest Sponsored Pin Blocker** listed on the extensions page.

### 3. Test it on Pinterest

1. Open `https://www.pinterest.com/`.
2. Refresh Pinterest if it was already open.
3. Scroll your feed normally.
4. Sponsored/promoted pins should disappear automatically when Pinterest loads them.

### 4. If it does not work immediately

Try these beginner checks:

- Confirm the extension is enabled on `chrome://extensions`.
- Click the reload icon on the extension card after editing any file.
- Refresh the Pinterest tab after reloading the extension.
- Make sure you loaded the folder that directly contains `manifest.json`.
- Open Chrome DevTools on Pinterest with **Right click → Inspect → Console** and look for extension errors.

## What it does

- Runs only on `pinterest.com` pages.
- Scans loaded pins for sponsorship labels such as `Sponsored`, `Promoted`, `Paid partnership`, and `Advertisement`.
- Hides the full pin container when a sponsored signal is found.
- Watches Pinterest's dynamic feed with a `MutationObserver`, so newly loaded ads are removed while scrolling.

## Files

- `manifest.json` registers the Chrome Extension Manifest V3 content script for Pinterest.
- `content.js` detects sponsored labels and hides their pin containers.
- `styles.css` applies the final `display: none` rule to blocked pins.
