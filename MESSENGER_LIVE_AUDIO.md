# Live audio + encoder

## Vercel
- Music file: `/audio/xo-so-live-bed.wav` (original royalty-safe bed)
- API field: `musicUrl` on `/api/kqxs/today` and `/api/kqxs-mt/today`
- Pages `/live` and `/live-mt` auto-play loop until `completed`

## OBS / GitHub Actions (required for Fanpage to hear audio)
- OBS: Browser Source → enable **Control audio via OBS** / Monitor and Output
- Puppeteer: `--autoplay-policy=no-user-gesture-required`
- ffmpeg must capture browser/pulse audio, not video-only grab

Vercel only plays music inside the page; the encoder must capture that audio into the RTMPS stream.
