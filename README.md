# NextGIS Dashboard (Next.js + OpenLayers + Turf)

A WebGIS dashboard built with Next.js (App Router), OpenLayers for map rendering, and Turf.js for geospatial calculations.

This project includes a client-only OpenLayers map component, a left collapsible sidebar for selecting GN/ADM3 divisions, and Turf-based area/perimeter computations.

## Features

- OpenLayers map integrated as a client component (`src/app/components/OpenLayersMap.tsx`).
- Sidebar with filter + select for GN/ADM3 divisions (`src/app/components/Sidebar.tsx`).
- Dark themed UI with layered shadows and 3D-like visual accents.
- Turf.js used to compute geodesic area and perimeter (converted to EPSG:4326 before calculation).
- Selected-only rendering: large GeoJSONs are kept in memory but only the selected geometry is rendered on the map for performance.
- Default dark basemap: Carto Dark Matter (configurable in `OpenLayersMap.tsx`).

## Project layout

- `src/app/page.tsx` — app layout and composition.
- `src/app/components/OpenLayersMap.tsx` — map initialization, layers, selection, Turf calculations.
- `src/app/components/Sidebar.tsx` — filters, selection dropdown, attribute cards.
- `src/app/components/Navbar.tsx` — top navigation bar.
- `public/` — put GeoJSON data files here (ignored by `.gitignore` by default).

## GeoJSON data

Place GeoJSON files in the `public/` folder (for example `public/sri_lanka.geojson`).

Note: this repo's `.gitignore` is configured to ignore `*.geojson` and `public/*.geojson` so large data files aren't committed accidentally. Remove those lines from `.gitignore` if you want to track a GeoJSON file in Git.

## Setup (Windows PowerShell)

Open PowerShell in the project folder (`d:\Data\Projects\Programming\Web\Next-GIS\mapbox-nextjs`) and run:

```powershell
# install dependencies
cd "d:\Data\Projects\Programming\Web\Next-GIS\mapbox-nextjs"
npm install

# start development server
npm run dev
```

If `npm run dev` fails, inspect the terminal output for missing packages or TypeScript errors. Running `npm install` in the project root usually fixes missing dependencies.

## Notes for developers

- Map code runs on the client only. The map component is dynamically imported with `ssr: false`.
- GeoJSON features are read with `ol/format/GeoJSON` and reprojected to `EPSG:3857` for display. For Turf calculations features are converted to `EPSG:4326` GeoJSON before running `turf.area` and `turf.length`.
- The sidebar filters and deduplicates division labels to avoid showing empty/unknown entries.
- Base layers are configured in `OpenLayersMap.tsx` (Carto, Stadia, OSM). Change `baseLayer` state or `baseLayers` to switch providers.
- A canvas `prerender/postrender` (and compatibility with `precompose/postcompose`) handler is attached to the tile layer to optionally apply a CSS canvas `filter` during tile draw. Remove it to use raw tiles.

## Common troubleshooting

- Blank map: ensure `public/sri_lanka.geojson` exists and is reachable via `fetch('/sri_lanka.geojson')`.
- Overflowing layout: avoid nested `100vh` elements; use flex with `minHeight: 0` as used in the app layout.

## Contributing

If you plan to add features, consider:

- Moving inline styles to CSS modules or Tailwind for maintainability.
- Adding unit tests for the conversion and Turf calculations.

## License & attribution

Tile providers used (Carto, Stadia, OSM) require proper attribution in production. Stamen tiles are CC0; check each provider's terms.

---

If you want, I can also:

- Add a `CONTRIBUTING.md` and `DEVELOPMENT.md` for local setup and debugging steps.
- Run the dev server and report any startup errors.
- Convert inline styles to CSS modules.
