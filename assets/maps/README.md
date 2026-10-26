# Offline world map asset

`world-atlas-110m.js` is generated from `world-atlas@2.0.2/countries-110m.json` with:

```powershell
node tools/build-world-atlas.js <countries-110m.json> assets/maps/world-atlas-110m.js
```

The JavaScript wrapper is intentional: iMetriK runs directly from `file://`, where fetching a neighboring JSON file is not portable. The asset exposes `window.IMK_WORLD_ATLAS` and makes no network request.

