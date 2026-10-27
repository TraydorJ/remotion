# LA → New York → Paris — Remotion film

This is a standalone Remotion project stored only in `TraydorJ/remotion`. It does not import, edit, or deploy anything from the SKYHOP game repository.

## Composition
- ID: `LA-NY-PARIS`
- 1920×1080, 30 fps, 30 seconds
- Original stylized vector map, opening zoom centered on Los Angeles
- Animated Los Angeles → New York and New York → Paris route lines with a camera that follows the journey
- Procedurally modeled rotating 3D Eiffel Tower using `@remotion/three`

## Run

```bash
npm install
npm run studio
npm run render
```

Output: `out/la-ny-paris.mp4`.

Animation is driven by Remotion's `useCurrentFrame()` and deterministic interpolation. The map is an original stylized illustration, not a navigation-grade geographic map. The `Render LA-NY-Paris MP4` GitHub Actions workflow typechecks and renders the video as a downloadable artifact.
