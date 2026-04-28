import AsyncStorage from '@react-native-async-storage/async-storage';

export type FiltrosConductor = {
  // Vehículo
  precio_combustible_gs: number;   // Gs por litro
  rendimiento_km_litro: number;    // km por litro
  comision_plataforma_pct: number; // % comisión Bolt/Uber (ej: 25)

  // Filtros de viaje
  ganancia_minima_km_gs: number;   // Gs mínimo por km
  ganancia_minima_total_gs: number; // Gs mínimo por viaje
  nota_minima_pasajero: number;    // Nota mínima (ej: 4.0)
  distancia_maxima_pasajero_km: number; // Distancia máxima al pasajero
  distancia_maxima_viaje_km: number;    // Distancia máxima del viaje

  // Filtros activos
  filtros_activos: boolean;
};

export const FILTROS_DEFAULT: FiltrosConductor = {
  precio_combustible_gs: 8500,
  rendimiento_km_litro: 12,
  comision_plataforma_pct: 25,
  ganancia_minima_km_gs: 1500,
  ganancia_minima_total_gs: 15000,
  nota_minima_pasajero: 4.0,
  distancia_maxima_pasajero_km: 5,
  distancia_maxima_viaje_km: 50,
  filtros_activos: false,
};

const KEY = 'filtros_conductor';

export async function guardarFiltros(filtros: FiltrosConductor): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(filtros));
}

export async function cargarFiltros(): Promise<FiltrosConductor> {
  try {
    const data = await AsyncStorage.getItem(KEY);
    if (data) return { ...FILTROS_DEFAULT, ...JSON.parse(data) };
  } catch {}
  return FILTROS_DEFAULT;
}

export function calcularGanancia(
  tarifa_gs: number,
  distancia_km: number,
  filtros: FiltrosConductor
): {
  ganancia_neta: number;
  costo_combustible: number;
  costo_comision: number;
  gs_por_km: number;
} {
  const costo_combustible = (distancia_km / filtros.rendimiento_km_litro) * filtros.precio_combustible_gs;
  const costo_comision = tarifa_gs * (filtros.comision_plataforma_pct / 100);
  const ganancia_neta = tarifa_gs - costo_combustible - costo_comision;
  const gs_por_km = distancia_km > 0 ? ganancia_neta / distancia_km : 0;

  return { ganancia_neta, costo_combustible, costo_comision, gs_por_km };
}

export function evaluarViaje(
  tarifa_gs: number,
  distancia_km: number,
  nota_pasajero: number,
  distancia_pasajero_km: number,
  filtros: FiltrosConductor
): {
  conviene: boolean;
  motivo_rechazo?: string;
  calculo: ReturnType<typeof calcularGanancia>;
} {
  const calculo = calcularGanancia(tarifa_gs, distancia_km, filtros);

  if (!filtros.filtros_activos) {
    return { conviene: true, calculo };
  }

  if (nota_pasajero < filtros.nota_minima_pasajero) {
    return {
      conviene: false,
      motivo_rechazo: `Nota del pasajero ${nota_pasajero} menor al mínimo ${filtros.nota_minima_pasajero}`,
      calculo,
    };
  }

  if (distancia_pasajero_km > filtros.distancia_maxima_pasajero_km) {
    return {
      conviene: false,
      motivo_rechazo: `Pasajero a ${distancia_pasajero_km}km, máximo configurado ${filtros.distancia_maxima_pasajero_km}km`,
      calculo,
    };
  }

  if (distancia_km > filtros.distancia_maxima_viaje_km) {
    return {
      conviene: false,
      motivo_rechazo: `Viaje de ${distancia_km}km supera el máximo de ${filtros.distancia_maxima_viaje_km}km`,
      calculo,
    };
  }

  if (calculo.ganancia_neta < filtros.ganancia_minima_total_gs) {
    return {
      conviene: false,
      motivo_rechazo: `Ganancia Gs. ${calculo.ganancia_neta.toLocaleString()} menor al mínimo Gs. ${filtros.ganancia_minima_total_gs.toLocaleString()}`,
      calculo,
    };
  }

  if (calculo.gs_por_km < filtros.ganancia_minima_km_gs) {
    return {
      conviene: false,
      motivo_rechazo: `Gs/km ${Math.round(calculo.gs_por_km).toLocaleString()} menor al mínimo ${filtros.ganancia_minima_km_gs.toLocaleString()}`,
      calculo,
    };
  }

  return { conviene: true, calculo };
}