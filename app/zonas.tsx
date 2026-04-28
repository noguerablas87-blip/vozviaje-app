import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

const ZONAS_ASUNCION = [
  { id: 'villa_morra', nombre: 'Villa Morra', lat: -25.2867, lng: -57.5756 },
  { id: 'recoleta', nombre: 'Recoleta', lat: -25.2800, lng: -57.5900 },
  { id: 'centro', nombre: 'Centro', lat: -25.2900, lng: -57.6450 },
  { id: 'lambere', nombre: 'Lambaré', lat: -25.3400, lng: -57.6100 },
  { id: 'san_lorenzo', nombre: 'San Lorenzo', lat: -25.3400, lng: -57.5100 },
  { id: 'luque', nombre: 'Luque', lat: -25.2700, lng: -57.4800 },
  { id: 'capiata', nombre: 'Capiatá', lat: -25.3500, lng: -57.4500 },
  { id: 'fdo_mora', nombre: 'Fernando de la Mora', lat: -25.3300, lng: -57.5200 },
  { id: 'mariano', nombre: 'Mariano R. Alonso', lat: -25.2100, lng: -57.5400 },
  { id: 'limpio', nombre: 'Limpio', lat: -25.1700, lng: -57.4900 },
  { id: 'nemby', nombre: 'Ñemby', lat: -25.3900, lng: -57.5700 },
  { id: 'itaugua', nombre: 'Itauguá', lat: -25.3800, lng: -57.3600 },
];

export type ConfigZonas = {
  modo: 'radio' | 'predefinidas';
  radio_km: number;
  centro_lat: number;
  centro_lng: number;
  zonas_seleccionadas: string[];
  rechazar_origen_fuera: boolean;
  rechazar_destino_fuera: boolean;
  zonas_activas: boolean;
};

const CONFIG_DEFAULT: ConfigZonas = {
  modo: 'predefinidas',
  radio_km: 10,
  centro_lat: -25.2867,
  centro_lng: -57.5756,
  zonas_seleccionadas: [],
  rechazar_origen_fuera: false,
  rechazar_destino_fuera: true,
  zonas_activas: false,
};

const KEY = 'config_zonas';

export async function cargarZonas(): Promise<ConfigZonas> {
  try {
    const data = await AsyncStorage.getItem(KEY);
    if (data) return { ...CONFIG_DEFAULT, ...JSON.parse(data) };
  } catch {}
  return CONFIG_DEFAULT;
}

export async function guardarZonas(config: ConfigZonas): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(config));
}

type Props = { onVolver: () => void };

export default function Zonas({ onVolver }: Props) {
  const [config, setConfig] = useState<ConfigZonas>(CONFIG_DEFAULT);
  const [cargando, setCargando] = useState(true);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    cargarZonas().then(c => { setConfig(c); setCargando(false); });
  }, []);

  const actualizar = (key: keyof ConfigZonas, valor: any) => {
    setConfig(prev => ({ ...prev, [key]: valor }));
  };

  const toggleZona = (id: string) => {
    const actual = config.zonas_seleccionadas;
    const nuevo = actual.includes(id)
      ? actual.filter(z => z !== id)
      : [...actual, id];
    actualizar('zonas_seleccionadas', nuevo);
  };

  const guardar = async () => {
    try {
      await guardarZonas(config);
      Alert.alert('✓ Guardado', 'Tu configuración de zonas fue guardada.');
    } catch {
      Alert.alert('Error', 'No se pudo guardar.');
    }
  };

  const onMapPress = (e: any) => {
    if (config.modo !== 'radio') return;
    const { latitude, longitude } = e.nativeEvent.coordinate;
    actualizar('centro_lat', latitude);
    actualizar('centro_lng', longitude);
  };

  if (cargando) {
    return (
      <View style={s.container}>
        <Text style={s.cargandoText}>Cargando zonas...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Mis zonas</Text>
        <TouchableOpacity onPress={onVolver}>
          <Text style={s.linkText}>Volver</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={s.card}>
          <View style={s.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.toggleLabel}>Zonas activas</Text>
              <Text style={s.toggleDesc}>Filtra viajes según tu zona de trabajo</Text>
            </View>
            <Switch
              value={config.zonas_activas}
              onValueChange={v => actualizar('zonas_activas', v)}
              trackColor={{ true: '#1D9E75' }}
            />
          </View>
        </View>

        <Text style={s.seccionTitle}>Reglas de rechazo</Text>
        <View style={s.card}>
          <View style={s.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.toggleLabel}>Rechazar si pasajero está fuera</Text>
              <Text style={s.toggleDesc}>No recoger pasajeros fuera de tu zona</Text>
            </View>
            <Switch
              value={config.rechazar_origen_fuera}
              onValueChange={v => actualizar('rechazar_origen_fuera', v)}
              trackColor={{ true: '#1D9E75' }}
            />
          </View>
          <View style={s.divider} />
          <View style={s.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.toggleLabel}>Rechazar si destino está fuera</Text>
              <Text style={s.toggleDesc}>No ir a destinos fuera de tu zona</Text>
            </View>
            <Switch
              value={config.rechazar_destino_fuera}
              onValueChange={v => actualizar('rechazar_destino_fuera', v)}
              trackColor={{ true: '#1D9E75' }}
            />
          </View>
        </View>

        <Text style={s.seccionTitle}>Tipo de zona</Text>
        <View style={s.modoRow}>
          <TouchableOpacity
            style={[s.modoBtn, config.modo === 'predefinidas' && s.modoBtnActivo]}
            onPress={() => actualizar('modo', 'predefinidas')}
          >
            <Text style={[s.modoBtnText, config.modo === 'predefinidas' && s.modoBtnTextActivo]}>
              Barrios
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.modoBtn, config.modo === 'radio' && s.modoBtnActivo]}
            onPress={() => actualizar('modo', 'radio')}
          >
            <Text style={[s.modoBtnText, config.modo === 'radio' && s.modoBtnTextActivo]}>
              Radio circular
            </Text>
          </TouchableOpacity>
        </View>

        {config.modo === 'predefinidas' && (
          <>
            <Text style={s.seccionTitle}>Seleccioná tus barrios</Text>
            <View style={s.zonasGrid}>
              {ZONAS_ASUNCION.map(zona => {
                const activa = config.zonas_seleccionadas.includes(zona.id);
                return (
                  <TouchableOpacity
                    key={zona.id}
                    style={[s.zonaBadge, activa && s.zonaBadgeActiva]}
                    onPress={() => toggleZona(zona.id)}
                  >
                    <Text style={[s.zonaBadgeText, activa && s.zonaBadgeTextActiva]}>
                      {zona.nombre}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {config.modo === 'radio' && (
          <>
            <Text style={s.seccionTitle}>Tocá el mapa para definir tu zona</Text>
            <View style={s.mapContainer}>
              <MapView
                ref={mapRef}
                style={s.map}
                initialRegion={{
                  latitude: config.centro_lat,
                  longitude: config.centro_lng,
                  latitudeDelta: 0.3,
                  longitudeDelta: 0.3,
                }}
                onPress={onMapPress}
              >
                <Marker
                  coordinate={{ latitude: config.centro_lat, longitude: config.centro_lng }}
                  title="Centro de tu zona"
                />
                <Circle
                  center={{ latitude: config.centro_lat, longitude: config.centro_lng }}
                  radius={config.radio_km * 1000}
                  fillColor="rgba(29,158,117,0.15)"
                  strokeColor="#1D9E75"
                  strokeWidth={2}
                />
              </MapView>
            </View>

            <View style={s.card}>
              <View style={s.campoRow}>
                <Text style={s.campoLabel}>Radio de la zona</Text>
                <View style={s.inputRow}>
                  <TouchableOpacity
                    style={s.btnMenos}
                    onPress={() => actualizar('radio_km', Math.max(1, config.radio_km - 1))}
                  >
                    <Text style={s.btnMenosText}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.radioVal}>{config.radio_km} km</Text>
                  <TouchableOpacity
                    style={s.btnMas}
                    onPress={() => actualizar('radio_km', Math.min(50, config.radio_km + 1))}
                  >
                    <Text style={s.btnMasText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}

        <TouchableOpacity style={s.btnGuardar} onPress={guardar}>
          <Text style={s.btnGuardarText}>Guardar zonas</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
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
  modoRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 8 },
  modoBtn: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E0E0DA' },
  modoBtnActivo: { backgroundColor: '#E1F5EE', borderColor: '#1D9E75' },
  modoBtnText: { fontSize: 14, color: '#5F5E5A', fontWeight: '500' },
  modoBtnTextActivo: { color: '#1D9E75' },
  zonasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 16, marginBottom: 8 },
  zonaBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E0E0DA' },
  zonaBadgeActiva: { backgroundColor: '#E1F5EE', borderColor: '#1D9E75' },
  zonaBadgeText: { fontSize: 13, color: '#5F5E5A' },
  zonaBadgeTextActiva: { color: '#1D9E75', fontWeight: '500' },
  mapContainer: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden', marginBottom: 8, height: 280 },
  map: { flex: 1 },
  campoRow: { paddingVertical: 12 },
  campoLabel: { fontSize: 13, color: '#5F5E5A', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 16, justifyContent: 'center' },
  btnMenos: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F1EFE8', alignItems: 'center', justifyContent: 'center' },
  btnMenosText: { fontSize: 20, color: '#1A1A18' },
  btnMas: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#E1F5EE', alignItems: 'center', justifyContent: 'center' },
  btnMasText: { fontSize: 20, color: '#1D9E75' },
  radioVal: { fontSize: 22, fontWeight: '500', color: '#1A1A18', minWidth: 80, textAlign: 'center' },
  btnGuardar: { marginHorizontal: 16, backgroundColor: '#1D9E75', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 16 },
  btnGuardarText: { color: '#fff', fontSize: 16, fontWeight: '500' },
});
