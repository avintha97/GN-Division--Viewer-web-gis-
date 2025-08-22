import React, { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Fill, Stroke } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { Draw, Modify, Snap } from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { getArea, getLength } from 'ol/sphere';
import * as turf from '@turf/turf';
import OLGeoJSON from 'ol/format/GeoJSON';
import type { Options as DrawOptions } from 'ol/interaction/Draw';

const OpenLayersMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  type DrawType = 'None' | 'Polygon' | 'LineString' | 'Point';
  const [drawType, setDrawType] = useState<DrawType>('None');
  const [area, setArea] = useState<number | null>(null);
  const [perimeter, setPerimeter] = useState<number | null>(null);
  // base layer selection key
  const [baseLayer, setBaseLayer] = useState('dark_matter');
  // GeoJSON state
  const [features, setFeatures] = useState<any[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  // Card data will be dynamic from selected feature
  const cardData = selectedFeature ? [
    { label: 'Area', value: `${selectedFeature.get('area')} km²`, icon: '📏', color: '#fbbf24' },
    { label: 'Province', value: selectedFeature.get('province') || selectedFeature.get('ADM1_EN'), icon: '🏞️', color: '#60a5fa' },
    { label: 'Population', value: selectedFeature.get('population'), icon: '👥', color: '#34d399' },
    { label: 'DS Division', value: selectedFeature.get('ds_name') || selectedFeature.get('ADM2_EN'), icon: '🏛️', color: '#f472b6' },
    { label: 'GN/ADM3', value: selectedFeature.get('gn_name') || selectedFeature.get('ADM3_EN'), icon: '🗺️', color: '#a78bfa' },
  ] : [];

  // Vector source/layer for drawing and geojson
  const vectorSourceRef = useRef<any>(null);
  const geojsonLayerRef = useRef<any>(null);
  const defaultGeojsonStyleRef = useRef<any>(null);
  const selectedSourceRef = useRef<any>(null);
  const selectedLayerRef = useRef<any>(null);
  const drawRef = useRef<any>(null);
  const snapRef = useRef<any>(null);
  const modifyRef = useRef<any>(null);
  const [selectedPopulation, setSelectedPopulation] = useState<number | null>(null);
  const baseLayers: { [key: string]: OSM | XYZ } = {
    osm: new OSM(),
    satellite: new XYZ({
      url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attributions: '© OpenTopoMap contributors',
    }),
    dark: new XYZ({
      url: 'https://tiles.stadiamaps.com/tiles/alidade_dark/{z}/{x}/{y}{r}.png',
      attributions: '© Stadia Maps',
    }),
    // Carto Dark Matter (good dark basemap). Attribution: CARTO
    dark_matter: new XYZ({
      url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attributions: '© CARTO',
    }),
  };

  // centralized selection handler used by click and sidebar selection
  const handleSelectFeature = (feature: any | null) => {
    if (!mapInstance.current) return;
    if (feature) {
      setSelectedFeature(feature);
      // make sure the selected feature is visible by adding it to the selected layer
      if (selectedSourceRef.current) {
        selectedSourceRef.current.clear();
        // clone feature to avoid modifying original
        const cloned = feature.clone ? feature.clone() : feature;
        selectedSourceRef.current.addFeature(cloned);
      }
      try {
        const geom: any = feature.getGeometry();
        if (geom) {
          try {
            // write feature to GeoJSON in EPSG:4326 for accurate geodesic calculations with Turf
            const writer = new OLGeoJSON();
            const gj = writer.writeFeatureObject(feature, { featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4326' });
            const turfArea = turf.area(gj);
            const turfLengthKm = turf.length(gj, { units: 'kilometers' });
            setArea(turfArea); // area in square meters
            setPerimeter(turfLengthKm * 1000); // convert km to meters
          } catch (e) {
            // fallback to ol sphere if turf fails
            const a = getArea(geom as any);
            setArea(a);
            let p: number | null = null;
            try { p = getLength(geom as any); } catch (e2) { p = null; }
            setPerimeter(p);
          }
          // random population > 1000
          const pop = Math.floor(1000 + Math.random() * 90000);
          setSelectedPopulation(pop);
        } else {
          setArea(null);
          setPerimeter(null);
        }
      } catch (e) {
        setArea(null);
        setPerimeter(null);
      }

      // animate + fit
      try {
        const extent = feature.getGeometry().getExtent();
        const view = mapInstance.current.getView();
        const center3857 = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
        view.animate({ center: center3857, duration: 800, zoom: Math.min(view.getZoom() || 10, 13) }, () => {
          view.fit(extent, { duration: 400, maxZoom: 15, padding: [60,60,60,60] });
        });
      } catch (e) {
        // ignore
      }

      // style only the selected feature, hide others visually
      if (geojsonLayerRef.current) {
        geojsonLayerRef.current.setStyle((feat: any) => {
          if (feat === feature) {
            return new Style({ fill: new Fill({ color: 'rgba(37,99,235,0.25)' }), stroke: new Stroke({ color: '#f59e42', width: 4 }) });
          }
          return null;
        });
      }
    } else {
      // deselect
      setSelectedFeature(null);
      setArea(null);
      setPerimeter(null);
  setSelectedPopulation(null);
      if (geojsonLayerRef.current) {
        geojsonLayerRef.current.setStyle(defaultGeojsonStyleRef.current as any);
      }
  if (selectedSourceRef.current) selectedSourceRef.current.clear();
    }
  };

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      // Drawing vector source/layer
      vectorSourceRef.current = new VectorSource();
      const vectorLayer = new VectorLayer({ source: vectorSourceRef.current });

      // GeoJSON vector layer (we keep features in memory and do NOT add them all to the map)
      geojsonLayerRef.current = new VectorLayer({
        source: new VectorSource(),
        style: new Style({
          fill: new Fill({ color: 'rgba(14,165,160,0.08)' }),
          stroke: new Stroke({ color: '#0ea5a0', width: 2 })
        })
      });
      // selected-only layer: will contain exactly one (selected) feature
      selectedSourceRef.current = new VectorSource();
  selectedLayerRef.current = new VectorLayer({ source: selectedSourceRef.current, style: new Style({ fill: new Fill({ color: 'rgba(14,165,160,0.22)' }), stroke: new Stroke({ color: '#f59e42', width: 4 }) }) });
      // store default style so we can restore later
      defaultGeojsonStyleRef.current = geojsonLayerRef.current.getStyle();

      // Base layer
      const tileLayer = new TileLayer({ source: baseLayers['dark_matter'] });

      // Apply canvas filters during render so the tiles appear dark/grayscale as requested
      // We save/restore the context to avoid leaking canvas state.
      // support both OL event names: prerender/postrender and precompose/postcompose
      const preHandler = (evt: any) => {
        try {
          const context = evt.context as CanvasRenderingContext2D | null;
          if (context) {
            context.save();
            context.filter = 'grayscale(80%) invert(100%)';
            context.globalCompositeOperation = 'source-over';
          }
        } catch (e) {
          // ignore
        }
      };
      const postHandler = (evt: any) => {
        try {
          const context = evt.context as CanvasRenderingContext2D | null;
          if (context) {
            context.restore();
          }
        } catch (e) {
          // ignore
        }
      };

      tileLayer.on('prerender', preHandler);
  // some OL versions use 'precompose'/'postcompose' instead of 'prerender'/'postrender'
  (tileLayer as any).on('precompose', preHandler);
      tileLayer.on('postrender', postHandler);
  (tileLayer as any).on('postcompose', postHandler);

      // Sri Lanka extent in EPSG:3857 (approx)
      const sriLankaExtent = [8850000, 700000, 9150000, 1200000];

      mapInstance.current = new Map({
        target: mapRef.current,
        // don't add the whole geojsonLayer to the map to avoid rendering all features
        layers: [tileLayer, selectedLayerRef.current, vectorLayer],
        view: new View({
          center: [9900000, 990000],
          zoom: 7,
          projection: 'EPSG:3857',
        }),
      });

      // Fit to Sri Lanka extent on load
      mapInstance.current.getView().fit(sriLankaExtent, { duration: 1200, padding: [40,40,40,40] });

      // click-to-select: when clicking a feature, select it and compute attributes
      mapInstance.current.on('singleclick', (evt) => {
        const feature = mapInstance.current?.forEachFeatureAtPixel(evt.pixel, (f) => f) || null;
        if (feature) {
          handleSelectFeature(feature);
        } else {
          handleSelectFeature(null);
        }
      });
    }
    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
    };
  }, []);

  // Load GeoJSON on mount (use sri_lanka.geojson)
  useEffect(() => {
    fetch('/sri_lanka.geojson')
      .then(res => res.json())
      .then(data => {
        const format = new GeoJSON();
        const feats = format.readFeatures(data, {
          featureProjection: 'EPSG:3857',
        });
        setFeatures(feats);
        if (geojsonLayerRef.current) {
          geojsonLayerRef.current.getSource().clear();
          geojsonLayerRef.current.getSource().addFeatures(feats);
        }
        // Fit to all features (Sri Lanka) on load
        if (mapInstance.current && feats.length > 0) {
          const extent = geojsonLayerRef.current.getSource().getExtent();
          mapInstance.current.getView().fit(extent, { duration: 1200, padding: [40,40,40,40] });
        }
      });
  }, []);

  // Filtered features for dropdown
  const filteredFeatures = features.filter(f => {
    const adm3 = (f.get('ADM3_EN') || '').toString().toLowerCase();
    const gn = (f.get('gn_name') || '').toString().toLowerCase();
    const ds = (f.get('ds_name') || '').toString().toLowerCase();
    const q = filter.toLowerCase();
    return adm3.includes(q) || gn.includes(q) || ds.includes(q);
  });

  // Handle base layer switching
  useEffect(() => {
    if (!mapInstance.current) return;
    const layers = mapInstance.current.getLayers().getArray();
    const tileLayer = layers[0] as TileLayer<any>;
    if (baseLayers[baseLayer]) {
      tileLayer.setSource(baseLayers[baseLayer]);
    }
  }, [baseLayer]);

  // Drawing interaction
  useEffect(() => {
    if (!mapInstance.current) return;
    // Remove previous draw interaction
    if (drawRef.current) {
      mapInstance.current.removeInteraction(drawRef.current);
      drawRef.current = null;
    }
    if (snapRef.current) {
      mapInstance.current.removeInteraction(snapRef.current);
      snapRef.current = null;
    }
    if (modifyRef.current) {
      mapInstance.current.removeInteraction(modifyRef.current);
      modifyRef.current = null;
    }
    // reset area when changing tools
    setArea(null);

    if (drawType !== 'None') {
      // create draw interaction
      const draw = new Draw({
        source: vectorSourceRef.current,
        type: drawType as DrawOptions['type'],
      });
      drawRef.current = draw;
      mapInstance.current.addInteraction(draw);

      // snap interaction
      const snap = new Snap({ source: vectorSourceRef.current });
      snapRef.current = snap;
      mapInstance.current.addInteraction(snap);

      // modify interaction
      const modify = new Modify({ source: vectorSourceRef.current });
      modifyRef.current = modify;
      mapInstance.current.addInteraction(modify);

      // area calc for polygons
      if (drawType === 'Polygon') {
        draw.on('drawend', (evt: any) => {
          try {
            const geom = evt.feature.getGeometry?.() || evt.feature.getGeometry();
            const areaVal = getArea(geom);
            setArea(areaVal);
          } catch (e) {
            // ignore
          }
        });
      }
    }
  }, [drawType]);

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', minHeight: 0 }}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        filter={filter}
        setFilter={setFilter}
        features={features}
        selectedFeature={selectedFeature}
        setSelectedFeature={handleSelectFeature}
        area={area}
        perimeter={perimeter}
        population={selectedPopulation}
      />
      {/* Map Area */}
    <div style={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', background: '#0f172a', padding: 20 }}>
        <div
          ref={mapRef}
      style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', flex: 1, minHeight: 0, boxShadow: '0 24px 60px rgba(2,6,23,0.75), inset 0 1px 0 rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.02)' }}
        />
      </div>
    </div>
  );
}

export default OpenLayersMap;
