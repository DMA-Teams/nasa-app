// Ejemplo de route handler para Next.js (App Router).
// Copia este archivo a: app/api/nasa/route.ts
// Uso: GET /api/nasa?lat=15.50&lon=-88.03&start=20261001&end=20261031

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat") ?? "15.50";
  const lon = searchParams.get("lon") ?? "-88.03";
  const start = searchParams.get("start") ?? "20261001";
  const end = searchParams.get("end") ?? "20261031";

  const url =
    "https://power.larc.nasa.gov/api/temporal/daily/point" +
    `?parameters=PRECTOTCORR,T2M&community=AG` +
    `&latitude=${lat}&longitude=${lon}&start=${start}&end=${end}&format=JSON`;

  try {
    // Cache de 1 hora: protege el demo si el wifi del evento falla.
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`NASA POWER respondió ${res.status}`);
    const data = await res.json();

    const rain = data.properties.parameter.PRECTOTCORR as Record<string, number>;
    const temp = data.properties.parameter.T2M as Record<string, number>;

    // Convierte a una lista fácil de graficar y descarta valores sin dato (-999).
    const series = Object.keys(rain)
      .map((day) => ({ day, rainMm: rain[day], tempC: temp[day] }))
      .filter((d) => d.rainMm !== -999 && d.tempC !== -999);

    return NextResponse.json({
      source: "NASA POWER (power.larc.nasa.gov)",
      lat,
      lon,
      series,
      fallback: false,
    });
  } catch (err) {
    // Respaldo: guarda una respuesta real en public/fallback/power.json antes del demo.
    return NextResponse.json(
      { source: "NASA POWER (datos de respaldo)", series: [], fallback: true, error: String(err) },
      { status: 200 },
    );
  }
}
