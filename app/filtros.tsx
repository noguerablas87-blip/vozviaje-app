import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  FILTROS_DEFAULT,
  FiltrosConductor,
  cargarFiltros,
  guardarFiltros,
} from './constants/filtros';

type Props = {
  onVolver: () => void;
};

type Campo = {
  label: string;
  key: keyof FiltrosConductor;
  suffix: string;
  decimales?: boolean;
  min: number;
  max: number;
};

const VEHICULO: Campo[] = [
  { label: 'Precio combustible', key: 'precio_combustible_gs', suffix: 'Gs/litro', min: 1000, max: 50000 },
  { label: 'Rendimiento', key: 'rendimiento_km_litro', suffix: 'km/litro', decimales: true, min: 1, max: 30 },
  { label: 'Comisión plataforma', key: 'comision_plataforma_pct', suffix: '%', decimales: true, min: 0, max: 50 },
];

const VIAJE: Campo[] = [
  { label: 'Ganancia mínima por km', key: 'ganancia_minima_km_gs', suffix: 'Gs/km', min: 0, max: 20000 },
  { label: 'Ganancia mínima por viaje', key: 'ganancia_minima_total_gs', suffix: 'Gs', min: 0, max: 500000 },
  { label: 'Nota mínima del pasajero', key: 'nota_minima_pasajero', suffix: '★', decimales: true, min: 1, max: 5 },
  { label: 'Distancia máxima al pasajero', key: 'distancia_maxima_pasajero_km', suffix: 'km', decimales: true, min: 0.5, max: 30 },
  { label: 'Distancia máxima del viaje', key: 'distancia_maxima_viaje_km', suffix: 'km', min: 1, max: 200 },
];

export default function Filtros({ onVolver }: Props) {
  const [filtros, setFiltros] = useState<FiltrosConductor>(FILTROS_DEFAULT);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarFiltros().then(f => {
      setFiltros(f);
      setCargando(false);
    });
  }, []);

  const actualizar = (key: keyof FiltrosConductor, valor: any) => {
    setFiltros(prev => ({ ...prev, [key]: valor }));
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      await guardarFiltros(filtros);
      Alert.alert('✓ Guardado', 'Tus filtros fueron guardados correctamente.');
    } catch {
      Alert.alert('Error', 'No se pudieron guardar los filtros.');
    } finally {
      setGuardando(false);
    }
  };

  const resetear = () => {
    Alert.alert(
      'Resetear filtros',
      '¿Querés volver a los valores por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Resetear', style: 'destructive', onPress: () => setFiltros(FILTROS_DEFAULT) },
      ]
    );
  };

  if (cargando) {
    return (
      <View style={s.container}>
        <Text style={s.cargandoText}>Cargando configuración...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Mis filtros</Text>
        <TouchableOpacity onPress={onVolver}>
          <Text style={s.linkText}>Volver</Text>
        </TouchableOpacity>
      </View>

      {/* Toggle principal */}
      <View style={s.card}>
        <View style={s.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.toggleLabel}>Filtros activos</Text>
            <Text style={s.toggleDesc}>
              {filtros.filtros_activos
                ? 'VozViaje rechaza automáticamente viajes que no cumplen tus criterios'
                : 'VozViaje analiza pero no rechaza automáticamente'}
            </Text>
          </View>
          <Switch
            value={filtros.filtros_activos}
            onValueChange={v => actualizar('filtros_activos', v)}
            trackColor={{ true: '#1D9E75' }}
          />
        </View>
      </View>

      {/* Mi vehículo */}
      <Text style={s.seccionTitle}>Mi vehículo</Text>
      <View style={s.card}>
        {VEHICULO.map((campo, i) => (
          <View key={campo.key}>
            {i > 0 && <View style={s.divider} />}
            <View style={s.campoRow}>
              <Text style={s.campoLabel}>{campo.label}</Text>
              <View style={s.inputRow}>
                <TouchableOpacity
                  style={s.btnMenos}
                  onPress={() => {
                    const val = Number(filtros[campo.key]);
                    const paso = campo.decimales ? 0.5 : (campo.key === 'precio_combustible_gs' ? 500 : 1000);
                    actualizar(campo.key, Math.max(campo.min, val - paso));
                  }}
                >
                  <Text style={s.btnMenosText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={s.input}
                  value={String(filtros[campo.key])}
                  onChangeText={t => {
                    const n = campo.decimales ? parseFloat(t) : parseInt(t);
                    if (!isNaN(n)) actualizar(campo.key, n);
                  }}
                  keyboardType="numeric"
                />
                <Text style={s.suffix}>{campo.suffix}</Text>
                <TouchableOpacity
                  style={s.btnMas}
                  onPress={() => {
                    const val = Number(filtros[campo.key]);
                    const paso = campo.decimales ? 0.5 : (campo.key === 'precio_combustible_gs' ? 500 : 1000);
                    actualizar(campo.key, Math.min(campo.max, val + paso));
                  }}
                >
                  <Text style={s.btnMasText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Costo por km calculado */}
      <View style={s.infoCard}>
        <Text style={s.infoLabel}>Costo de combustible por km</Text>
        <Text style={s.infoVal}>
          Gs. {Math.round(filtros.precio_combustible_gs / filtros.rendimiento_km_litro).toLocaleString()}/km
        </Text>
      </View>

      {/* Filtros de viaje */}
      <Text style={s.seccionTitle}>Filtros de viaje</Text>
      <View style={s.card}>
        {VIAJE.map((campo, i) => (
          <View key={campo.key}>
            {i > 0 && <View style={s.divider} />}
            <View style={s.campoRow}>
              <Text style={s.campoLabel}>{campo.label}</Text>
              <View style={s.inputRow}>
                <TouchableOpacity
                  style={s.btnMenos}
                  onPress={() => {
                    const val = Number(filtros[campo.key]);
                    const paso = campo.decimales ? 0.5 : (campo.key === 'ganancia_minima_total_gs' || campo.key === 'ganancia_minima_km_gs' ? 1000 : 1);
                    actualizar(campo.key, Math.max(campo.min, val - paso));
                  }}
                >
                  <Text style={s.btnMenosText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={s.input}
                  value={String(filtros[campo.key])}
                  onChangeText={t => {
                    const n = campo.decimales ? parseFloat(t) : parseInt(t);
                    if (!isNaN(n)) actualizar(campo.key, n);
                  }}
                  keyboardType="numeric"
                />
                <Text style={s.suffix}>{campo.suffix}</Text>
                <TouchableOpacity
                  style={s.btnMas}
                  onPress={() => {
                    const val = Number(filtros[campo.key]);
                    const paso = campo.decimales ? 0.5 : (campo.key === 'ganancia_minima_total_gs' || campo.key === 'ganancia_minima_km_gs' ? 1000 : 1);
                    actualizar(campo.key, Math.min(campo.max, val + paso));
                  }}
                >
                  <Text style={s.btnMasText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Botones */}
      <TouchableOpacity style={s.btnGuardar} onPress={guardar} disabled={guardando}>
        <Text style={s.btnGuardarText}>{guardando ? 'Guardando...' : 'Guardar configuración'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.btnReset} onPress={resetear}>
        <Text style={s.btnResetText}>Resetear a valores por defecto</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F6', paddingTop: 55 },
  cargandoText: { textAlign: 'center', color: '#888780', marginTop: 100, fontSize: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '500', color: '#1A1A18' },
  linkText: { fontSize: 14, color: '#185FA5' },
  seccionTitle: { fontSize: 12, fontWeight: '500', color: '#888780', textTransform: 'uppercase', letterSpacing: 0.08, marginHorizontal: 16, marginBottom: 8, marginTop: 16 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 16, borderWidth: 0.5, borderColor: '#E0E0DA', marginBottom: 8 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  toggleLabel: { fontSize: 15, fontWeight: '500', color: '#1A1A18', marginBottom: 3 },
  toggleDesc: { fontSize: 12, color: '#888780', lineHeight: 17 },
  divider: { height: 0.5, backgroundColor: '#E0E0DA' },
  campoRow: { paddingVertical: 12 },
  campoLabel: { fontSize: 13, color: '#5F5E5A', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnMenos: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F1EFE8', alignItems: 'center', justifyContent: 'center' },
  btnMenosText: { fontSize: 18, color: '#1A1A18', fontWeight: '300' },
  btnMas: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#E1F5EE', alignItems: 'center', justifyContent: 'center' },
  btnMasText: { fontSize: 18, color: '#1D9E75', fontWeight: '300' },
  input: { flex: 1, backgroundColor: '#F8F8F6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 15, fontWeight: '500', color: '#1A1A18', textAlign: 'center', borderWidth: 0.5, borderColor: '#E0E0DA' },
  suffix: { fontSize: 12, color: '#888780', minWidth: 45 },
  infoCard: { marginHorizontal: 16, backgroundColor: '#E1F5EE', borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  infoLabel: { fontSize: 13, color: '#085041' },
  infoVal: { fontSize: 14, fontWeight: '500', color: '#085041' },
  btnGuardar: { marginHorizontal: 16, backgroundColor: '#1D9E75', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 16 },
  btnGuardarText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  btnReset: { marginHorizontal: 16, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  btnResetText: { color: '#888780', fontSize: 14 },
});
