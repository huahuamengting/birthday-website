# Birthday Greeting Website

A lightweight static site with a birthday home page, camera, and on-device photo album.

## Run locally

Camera access requires a secure context. Do not open the HTML files directly from disk.

```powershell
node server.cjs
```

Open `http://localhost:8000`. For a phone, deploy the site over HTTPS and open it in the phone browser.

## Production build

```powershell
npm run build
```

Upload the contents of `dist/` to any static hosting service with HTTPS enabled. The build copies the HTML, CSS, JavaScript, and `assets/` without modifying the source files.

## Features

- Birthday home page with a hand-drawn cake, animated star outlines, and shape-morphing candle flames.
- Play the local background music file from the floating record button.
- Camera page with front/rear camera switching and five photo frames.
- Local photo decoration, download, and system share support.
- Save photos and birthday emoji comments in browser storage; open the album to view photos and looping comments.

Photos and comments stay in the browser on the current device. Browser storage can be cleared by the browser or device.

- Local background music file in `assets/birthday-bg-music-2.mp3`, controlled from the floating record button. Playback starts only after a user click; volume and looping are supported.
