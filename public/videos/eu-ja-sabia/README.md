## Eu ja sabia assets

Place the raw reference clip at `public/videos/eu-ja-sabia-base.mp4` and run:

```
node ./scripts/generate-eu-ja-sabia.mjs --font="C:/Windows/Fonts/segoesc.ttf"
```

The script will detect the sheet of paper via `ffmpeg`'s `cropdetect`, render the handwritten digits for 0-9, and write the generated MP4 files plus `metadata.json` into this folder. Make sure `ffmpeg` and `ffprobe` are accessible on your PATH before running the generator.
