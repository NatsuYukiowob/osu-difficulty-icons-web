# osu! Difficulty Icons Web App

A powerful, entirely browser-based tool to generate BBCode for osu! difficulty icons with beautiful star-rating colors, complete with a Live Preview mimicking the osu! forums.

## Features
- **No API required:** Generates difficulty links manually without backend rate-limits or OAuth constraints.
- **BBCode Editor:** Seamlessly chain and edit multiple difficulty icons and text.
- **Live Preview:** See exactly how your BBCode will look on the osu! forums in real-time.
- **100% Client-Side:** Everything runs locally in your browser. Perfect for static hosting.

## How to Use (GitHub Pages)

Since this is a static website (HTML/CSS/JS), it is incredibly easy to host for free via GitHub Pages.

1. **Fork this repository** to your own GitHub account.
2. Go to your repository's **Settings** tab.
3. Click on **Pages** in the left sidebar.
4. Under "Source", check that the branch is set to `main` (or `master`) and the folder is `/ (root)`.
5. Save, wait a few minutes, and GitHub will provide you with a live URL to your very own tool!

### Normal/Manual Use (Direct Link)
If you just want the raw image URLs as before, you can still use the direct links:

Change:
* `[gamemode]` to: `std`, `taiko`, `ctb` or `mania`
* `[sr]` to: star rating rounded to closest decimal (3.21 -> 3.2 or 5.37 -> 5.4)

```
https://raw.githubusercontent.com/hiderikzki/osu-difficulty-icons/main/rendered/[gamemode]/stars_[sr].png
```

Alternatively for 2x size (32x32):
```
https://raw.githubusercontent.com/hiderikzki/osu-difficulty-icons/main/rendered/[gamemode]/stars_[sr]@2x.png
```

## Local Development
Since the app relies purely on vanilla HTML, CSS, and JS, you do not need any package managers.
Simply clone the project and open `index.html` in any modern web browser or use an extension like VSCode Live Server.
