# TextGenie — Development Checkpoint

## Current implementation
- Translation: Google (unofficial endpoint), Google Cloud, DeepL, OpenAI, Gemini, OpenAI-compatible Custom API, Bob, Eudic.
- Currency: same-currency sums and mixed-currency conversion; target defaults from system locale with manual override.
- Utility actions: open URL, terminal command fill, path opening, JSON format/minify, URL encode/decode, Base64 encode/decode.
- Icons: monochrome extension icon; distinct icons for URL/Base64 and JSON format/minify actions.
- Update checker: only appears for dedicated trigger phrases (`textgenie update`, `textgenie updates`, `检查文灵更新`).
- CI: manifest/resource checks, JavaScript syntax parsing, regression tests, extension ZIP validation, artifact upload.

## Verification boundaries
- CI tests use mocked exchange rates; they do not verify live FX rates.
- CI cannot verify PopClip toolbar visibility or AppleScript behavior on the user's Mac.
- Terminal filling and path opening require macOS permission and app-specific runtime checks.
- A permanent latest-release download link only works after the first GitHub Release is published.

## Release process
- Push a `v*` tag to build and publish a release.
- Or manually run the release workflow and provide a version.
