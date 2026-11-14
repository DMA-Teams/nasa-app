// Mapa real de Honduras: imagen satelital de NASA, relieve 3D y los 18 departamentos
// pintados según el clima de NASA POWER. Tocar el mapa elige un punto exacto.
"use client";

import type { FeatureCollection } from "geojson";
import { useEffect, useRef } from "react";
import {
  AttributionControl,
  Map as MapaLibre,
  Marker,
  NavigationControl,
  setWorkerUrl,
  type LngLatBoundsLike,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { COLOR_BORDE, COLOR_FONDO, COLOR_SELECCION, COLOR_ZONA, RAMPA_ALTURA } from "@/lib/colores";
import { poligonosDe } from "@/lib/geo";
import type { CapaMapa, DepartamentosGeoJSON, Punto } from "@/lib/tipos";

// El worker se copia a public/ en predev/prebuild (scripts/copiar-maplibre.mjs)
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const HONDURAS: LngLatBoundsLike = [[-89.4, 12.95], [-83.1, 16.55]];
// Arriba deja lugar al título; abajo, a la leyenda y los botones de capa
const MARGEN = { top: 70, bottom: 60, left: 8, right: 8 };
const MARGEN_MOVIL = { top: 64, bottom: 56, left: 0, right: 0 };
const margen = (m: MapaLibre) => (m.getContainer().clientWidth < 600 ? MARGEN_MOVIL : MARGEN);
const LIMITE_PANEO: LngLatBoundsLike = [[-93, 10.5], [-79.5, 19]];
const EXAGERACION = 1.5;
const PITCH_3D = 40;

const SATELITE = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_NextGeneration/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg";
const ELEVACION = "https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png";

/** Un rectángulo grande con Honduras recortada: oscurece a los países vecinos. */
function mascara(departamentos: DepartamentosGeoJSON): FeatureCollection {
  const huecos = departamentos.features.flatMap((d) => poligonosDe(d.geometry).map((p) => p[0]));
  const exterior = [[-100, 0], [-70, 0], [-70, 30], [-100, 30], [-100, 0]];
  return {
    type: "FeatureCollection",
    features: [{ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [exterior, ...huecos] } }],
  };
}

function estilo(departamentos: DepartamentosGeoJSON): StyleSpecification {
  const dem = { type: "raster-dem" as const, tiles: [ELEVACION], tileSize: 256, encoding: "terrarium" as const, maxzoom: 12 };
  return {
    version: 8,
    sources: {
      satelite: { type: "raster", tiles: [SATELITE], tileSize: 256, maxzoom: 8, attribution: "Imagen: NASA Blue Marble (GIBS)" },
      // Fuentes separadas para el 3D y para el sombreado, como recomienda MapLibre
      relieve: { ...dem, attribution: "Relieve: Mapzen Terrain Tiles (incluye SRTM de NASA)" },
      relieveCapas: dem,
      departamentos: {
        type: "geojson",
        data: departamentos as unknown as FeatureCollection,
        attribution: "Límites: geoBoundaries (OpenStreetMap, ODbL)",
      },
      mascara: { type: "geojson", data: mascara(departamentos) },
    },
    layers: [
      { id: "fondo", type: "background", paint: { "background-color": COLOR_FONDO } },
      { id: "satelite", type: "raster", source: "satelite" },
      { id: "sombra", type: "hillshade", source: "relieveCapas", paint: { "hillshade-exaggeration": 0.35 } },
      { id: "mascara", type: "fill", source: "mascara", paint: { "fill-color": COLOR_FONDO, "fill-opacity": 0.55 } },
      {
        id: "altura",
        type: "color-relief",
        source: "relieveCapas",
        layout: { visibility: "none" },
        paint: {
          "color-relief-color": ["interpolate", ["linear"], ["elevation"], ...RAMPA_ALTURA.flat()],
          "color-relief-opacity": 0.75,
        },
      },
      {
        id: "dep-relleno",
        type: "fill",
        source: "departamentos",
        paint: {
          "fill-color": ["match", ["get", "tipo"], "seca", COLOR_ZONA.seca, "lluviosa", COLOR_ZONA.lluviosa, COLOR_ZONA.equilibrada],
          // Más transparente al acercarse, para que se vea el relieve del terreno
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 6, 0.45, 9, 0.18],
        },
      },
      { id: "dep-borde", type: "line", source: "departamentos", paint: { "line-color": COLOR_BORDE, "line-width": 1.2, "line-opacity": 0.8 } },
      {
        id: "dep-seleccion",
        type: "line",
        source: "departamentos",
        filter: ["==", ["get", "nombre"], ""],
        paint: { "line-color": COLOR_BORDE, "line-width": 3.5 },
      },
    ],
  };
}

interface Props {
  departamentos: DepartamentosGeoJSON;
  capa: CapaMapa;
  inclinado: boolean;
  punto: Punto | null;
  onTocar: (lat: number, lon: number, departamento: string | null) => void;
  /** Altura real del punto (m) según el modelo de elevación, cuando el 3D está activo. */
  onAltura: (metros: number | null) => void;
}

export function MapaReal({ departamentos, capa, inclinado, punto, onTocar, onAltura }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaLibre | null>(null);
  const pin = useRef<Marker | null>(null);
  const listo = useRef(false);
  // Las funciones cambian en cada render; las guardamos en refs para no recrear el mapa
  const callbacks = useRef({ onTocar, onAltura });
  useEffect(() => {
    callbacks.current = { onTocar, onAltura };
  });

  // Crear el mapa una sola vez
  useEffect(() => {
    if (!contenedor.current) return;
    const m = new MapaLibre({
      container: contenedor.current,
      style: estilo(departamentos),
      bounds: HONDURAS,
      fitBoundsOptions: { padding: contenedor.current.clientWidth < 600 ? MARGEN_MOVIL : MARGEN },
      maxBounds: LIMITE_PANEO,
      pitch: PITCH_3D,
      bearing: -6,
      maxPitch: 75,
      attributionControl: false,
    });
    m.addControl(new AttributionControl({ compact: true }), "top-right");
    m.addControl(new NavigationControl({ visualizePitch: true }), "top-right");

    m.on("load", () => {
      listo.current = true;
      // Los créditos empiezan plegados (botón "i") para no tapar el título
      m.getContainer().querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
      m.setTerrain({ source: "relieve", exaggeration: EXAGERACION });
      // Nombres de los departamentos como etiquetas HTML (no necesitan servidor de fuentes)
      const etiquetas = departamentos.features.map((d) => {
        const etiqueta = document.createElement("span");
        etiqueta.textContent = d.properties.nombre;
        etiqueta.className = "pointer-events-none text-[11px] font-semibold text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.85)] md:text-xs";
        new Marker({ element: etiqueta }).setLngLat(d.properties.centro).addTo(m);
        return etiqueta;
      });
      // En pantallas chicas, con todo el país a la vista, los nombres se amontonan: se ocultan
      const mostrarEtiquetas = () => {
        const visibles = m.getContainer().clientWidth >= 600 || m.getZoom() >= 6.6;
        for (const e of etiquetas) e.style.visibility = visibles ? "visible" : "hidden";
      };
      mostrarEtiquetas();
      m.on("zoomend", mostrarEtiquetas);
      m.on("resize", mostrarEtiquetas);
    });

    m.on("click", (e) => {
      const [dep] = m.queryRenderedFeatures(e.point, { layers: ["dep-relleno"] });
      callbacks.current.onTocar(e.lngLat.lat, e.lngLat.lng, dep ? String(dep.properties.nombre) : null);
    });
    m.on("mouseenter", "dep-relleno", () => (m.getCanvas().style.cursor = "pointer"));
    m.on("mouseleave", "dep-relleno", () => (m.getCanvas().style.cursor = ""));

    const observador = new ResizeObserver(() => m.resize());
    observador.observe(contenedor.current);
    mapa.current = m;
    return () => {
      observador.disconnect();
      m.remove();
      mapa.current = null;
      listo.current = false;
    };
  }, [departamentos]);

  // Capa: clima (departamentos pintados) o altura (relieve real)
  useEffect(() => {
    const m = mapa.current;
    if (!m) return;
    const aplicar = () => {
      m.setLayoutProperty("altura", "visibility", capa === "altura" ? "visible" : "none");
      m.setPaintProperty(
        "dep-relleno",
        "fill-opacity",
        capa === "clima" ? ["interpolate", ["linear"], ["zoom"], 6, 0.45, 9, 0.18] : 0,
      );
    };
    if (listo.current) aplicar();
    else m.once("load", aplicar);
  }, [capa]);

  // 3D o plano
  useEffect(() => {
    const m = mapa.current;
    if (!m) return;
    const aplicar = () => {
      m.setTerrain(inclinado ? { source: "relieve", exaggeration: EXAGERACION } : null);
      m.easeTo({ pitch: inclinado ? PITCH_3D : 0, bearing: inclinado ? m.getBearing() : 0, duration: 800 });
    };
    if (listo.current) aplicar();
    else m.once("load", aplicar);
  }, [inclinado]);

  // Punto elegido: pin, borde del departamento y vuelo de cámara
  useEffect(() => {
    const m = mapa.current;
    if (!m) return;
    const aplicar = () => {
      pin.current?.remove();
      pin.current = null;
      m.setFilter("dep-seleccion", ["==", ["get", "nombre"], punto?.departamento ?? ""]);

      if (!punto) {
        m.fitBounds(HONDURAS, { padding: margen(m), pitch: inclinado ? PITCH_3D : 0, bearing: inclinado ? -6 : 0, duration: 1200 });
        return;
      }
      pin.current = new Marker({ color: COLOR_SELECCION }).setLngLat([punto.lon, punto.lat]).addTo(m);
      m.flyTo({ center: [punto.lon, punto.lat], zoom: 9, pitch: inclinado ? 60 : 0, speed: 0.9, essential: true });
      m.once("moveend", () => {
        const altura = m.getTerrain() ? m.queryTerrainElevation([punto.lon, punto.lat]) : null;
        callbacks.current.onAltura(altura === null ? null : Math.round(altura / EXAGERACION));
      });
    };
    if (listo.current) aplicar();
    else m.once("load", aplicar);
    // inclinado se lee al volar, pero cambiarlo no debe repetir el vuelo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [punto]);

  // El CSS de MapLibre pone `position: relative` al contenedor, así que el tamaño lo da el div de afuera
  return (
    <div className="absolute inset-0">
      <div
        ref={contenedor}
        className="h-full w-full"
        role="application"
        aria-label="Mapa de Honduras con imagen satelital de NASA. Toca el lugar donde está tu terreno."
      />
    </div>
  );
}
