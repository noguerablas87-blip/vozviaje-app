import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

const ZONAS = [
  // Asunción - Zona Centro/Histórica
  { id: 'encarnacion', nombre: 'La Encarnación', lat: -25.2850, lng: -57.6470, grupo: 'Asunción Centro' },
  { id: 'catedral', nombre: 'Catedral', lat: -25.2867, lng: -57.6453, grupo: 'Asunción Centro' },
  { id: 'san_roque', nombre: 'San Roque', lat: -25.2930, lng: -57.6400, grupo: 'Asunción Centro' },
  { id: 'general_diaz', nombre: 'General Díaz', lat: -25.2910, lng: -57.6380, grupo: 'Asunción Centro' },
  { id: 'pettirossi', nombre: 'Pettirossi', lat: -25.2950, lng: -57.6350, grupo: 'Asunción Centro' },
  { id: 'ciudad_nueva', nombre: 'Ciudad Nueva', lat: -25.2880, lng: -57.6420, grupo: 'Asunción Centro' },
  { id: 'dr_francia', nombre: 'Dr. Francia', lat: -25.2920, lng: -57.6440, grupo: 'Asunción Centro' },
  // Asunción - Zona Residencial/Comercial
  { id: 'villa_morra', nombre: 'Villa Morra', lat: -25.2867, lng: -57.5756, grupo: 'Asunción Residencial' },
  { id: 'recoleta', nombre: 'Recoleta', lat: -25.2800, lng: -57.5900, grupo: 'Asunción Residencial' },
  { id: 'carmelitas', nombre: 'Carmelitas', lat: -25.2820, lng: -57.5980, grupo: 'Asunción Residencial' },
  { id: 'los_laureles', nombre: 'Los Laureles', lat: -25.2780, lng: -57.5850, grupo: 'Asunción Residencial' },
  { id: 'manora', nombre: 'Manorá', lat: -25.2750, lng: -57.5800, grupo: 'Asunción Residencial' },
  { id: 'mariscal', nombre: 'Mariscal Estigarribia', lat: -25.2830, lng: -57.5700, grupo: 'Asunción Residencial' },
  { id: 'san_cristobal', nombre: 'San Cristóbal', lat: -25.2900, lng: -57.5650, grupo: 'Asunción Residencial' },
  { id: 'santisima_trinidad', nombre: 'Santísima Trinidad', lat: -25.2700, lng: -57.5950, grupo: 'Asunción Residencial' },
  // Asunción - Otras zonas
  { id: 'sajonia', nombre: 'Sajonia', lat: -25.2750, lng: -57.6200, grupo: 'Asunción Norte' },
  { id: 'salvador', nombre: 'Salvador del Mundo', lat: -25.2680, lng: -57.6100, grupo: 'Asunción Norte' },
  { id: 'san_antonio_asu', nombre: 'San Antonio (Asu)', lat: -25.2620, lng: -57.6050, grupo: 'Asunción Norte' },
  { id: 'san_blas', nombre: 'San Blas', lat: -25.2580, lng: -57.6150, grupo: 'Asunción Norte' },
  { id: 'san_cayetano', nombre: 'San Cayetano', lat: -25.2540, lng: -57.6200, grupo: 'Asunción Norte' },
  { id: 'mbocayaty', nombre: 'Mbocayaty', lat: -25.2500, lng: -57.6100, grupo: 'Asunción Norte' },
  { id: 'madame_lynch', nombre: 'Madame Lynch', lat: -25.2600, lng: -57.5950, grupo: 'Asunción Norte' },
  { id: 'canada_ybyray', nombre: 'Cañada del Ybyray', lat: -25.2650, lng: -57.5880, grupo: 'Asunción Norte' },
  // Gran Asunción / Dpto. Central
  { id: 'lambere', nombre: 'Lambaré', lat: -25.3400, lng: -57.6100, grupo: 'Gran Asunción' },
  { id: 'san_lorenzo', nombre: 'San Lorenzo', lat: -25.3400, lng: -57.5100, grupo: 'Gran Asunción' },
  { id: 'luque', nombre: 'Luque', lat: -25.2700, lng: -57.4800, grupo: 'Gran Asunción' },
  { id: 'capiata', nombre: 'Capiatá', lat: -25.3500, lng: -57.4500, grupo: 'Gran Asunción' },
  { id: 'fdo_mora', nombre: 'Fernando de la Mora', lat: -25.3300, lng: -57.5200, grupo: 'Gran Asunción' },
  { id: 'mariano', nombre: 'Mariano R. Alonso', lat: -25.2100, lng: -57.5400, grupo: 'Gran Asunción' },
  { id: 'limpio', nombre: 'Limpio', lat: -25.1700, lng: -57.4900, grupo: 'Gran Asunción' },
  { id: 'nemby', nombre: 'Ñemby', lat: -25.3900, lng: -57.5700, grupo: 'Gran Asunción' },
  { id: 'villa_elisa', nombre: 'Villa Elisa', lat: -25.3800, lng: -57.5200, grupo: 'Gran Asunción' },
  { id: 'san_antonio', nombre: 'San Antonio', lat: -25.3600, lng: -57.5900, grupo: 'Gran Asunción' },
  // Otros distritos Central
  { id: 'areguá', nombre: 'Areguá', lat: -25.2900, lng: -57.4100, grupo: 'Dpto. Central' },
  { id: 'guarambare', nombre: 'Guarambaré', lat: -25.4700, lng: -57.4500, grupo: 'Dpto. Central' },
  { id: 'ita', nombre: 'Itá', lat: -25.4900, lng: -57.3600, grupo: 'Dpto. Central' },
  { id: 'itaugua', nombre: 'Itauguá', lat: -25.3800, lng: -57.3600, grupo: 'Dpto. Central' },
  { id: 'nueva_italia', nombre: 'Nueva Italia', lat: -25.5500, lng: -57.4200, grupo: 'Dpto. Central' },
  { id: 'villeta', nombre: 'Villeta', lat: -25.5100, lng: -57.5700, grupo: 'Dpto. Central' },
  { id: 'ypacarai', nombre: 'Ypacaraí', lat: -25.3800, lng: -57.2800, grupo: 'Dpto. Central' },
  { id: 'ypane', nombre: 'Ypané', lat: -25.1200, lng: -57.5100, grupo: 'Dpto. Central' },
  { id: 'saldívar', nombre: 'J. A. Saldívar', lat: -25.1000, lng: -57.4700, grupo: 'Dpto. Central' },
];

const GRUPOS = ['Asunción Centro', 'Asunción Residencial', 'Asunción Norte', 'Gran Asunción', 'Dpto. Central'];

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
  const [grupoActivo, setGrupoActivo] = useState('Gran Asunción');

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

  const mapHtml = () => {
    const lat = config.centro_lat;
    const lng = config.centro_lng;
    const radio = config.radio_km * 1000;
    return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{margin:0;padding:0;height:100%;width:100%}</style>
</head>
<body>
<div id="map"></div>
<script>
var map = L.map('map').setView([${lat}, ${lng}], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
L.marker([${lat}, ${lng}]).addTo(map).bindPopup('Centro de tu zona').openPopup();
L.circle([${lat}, ${lng}], {radius: ${radio}, color: '#1D9E75', fillColor: '#1D9E75', fillOpacity: 0.15}).addTo(map);
</script>
</body>
</html>`;
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

        {/* Toggle principal */}
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

        {/* Reglas */}
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

        {/* Modo */}
        <Text style={s.seccionTitle}>Tipo de zona</Text>
        <View style={s.modoRow}>
          <TouchableOpacity
            style={[s.modoBtn, config.modo === 'predefinidas' && s.modoBtnActivo]}
            onPress={() => actualizar('modo', 'predefinidas')}
          >
            <Text style={[s.modoBtnText, config.modo === 'predefinidas' && s.modoBtnTextActivo]}>Barrios</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.modoBtn, config.modo === 'radio' && s.modoBtnActivo]}
            onPress={() => actualizar('modo', 'radio')}
          >
            <Text style={[s.modoBtnText, config.modo === 'radio' && s.modoBtnTextActivo]}>Radio circular</Text>
          </TouchableOpacity>
        </View>

        {/* Barrios predefinidos */}
        {config.modo === 'predefinidas' && (
          <>
            {/* Tabs de grupos */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.gruposScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
              {GRUPOS.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[s.grupoTab, grupoActivo === g && s.grupoTabActivo]}
                  onPress={() => setGrupoActivo(g)}
                >
                  <Text style={[s.grupoTabText, grupoActivo === g && s.grupoTabTextActivo]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={s.zonasGrid}>
              {ZONAS.filter(z => z.grupo === grupoActivo).map(zona => {
                const activa = config.zonas_seleccionadas.includes(zona.id);
                return (
                  <TouchableOpacity
                    key={zona.id}
                    style={[s.zonaBadge, activa && s.zonaBadgeActiva]}
                    onPress={() => toggleZona(zona.id)}
                  >
                    <Text style={[s.zonaBadgeText, activa && s.zonaBadgeTextActiva]}>{zona.nombre}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {config.zonas_seleccionadas.length > 0 && (
              <View style={s.infoCard}>
                <Text style={s.infoLabel}>{config.zonas_seleccionadas.length} zona(s) seleccionada(s)</Text>
                <TouchableOpacity onPress={() => actualizar('zonas_seleccionadas', [])}>
                  <Text style={s.linkText}>Limpiar</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Radio circular con mapa */}
        {config.modo === 'radio' && (
          <>
            <Text style={s.seccionTitle}>Centro de tu zona</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.gruposScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
              {GRUPOS.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[s.grupoTab, grupoActivo === g && s.grupoTabActivo]}
                  onPress={() => setGrupoActivo(g)}
                >
                  <Text style={[s.grupoTabText, grupoActivo === g && s.grupoTabTextActivo]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={s.zonasGrid}>
              {ZONAS.filter(z => z.grupo === grupoActivo).map(zona => {
                const esCentro = config.centro_lat === zona.lat && config.centro_lng === zona.lng;
                return (
                  <TouchableOpacity
                    key={zona.id}
                    style={[s.zonaBadge, esCentro && s.zonaBadgeActiva]}
                    onPress={() => { actualizar('centro_lat', zona.lat); actualizar('centro_lng', zona.lng); }}
                  >
                    <Text style={[s.zonaBadgeText, esCentro && s.zonaBadgeTextActiva]}>{zona.nombre}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Radio */}
            <View style={s.card}>
              <View style={s.campoRow}>
                <Text style={s.campoLabel}>Radio de la zona</Text>
                <View style={s.inputRow}>
                  <TouchableOpacity style={s.btnMenos} onPress={() => actualizar('radio_km', Math.max(1, config.radio_km - 1))}>
                    <Text style={s.btnMenosText}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.radioVal}>{config.radio_km} km</Text>
                  <TouchableOpacity style={s.btnMas} onPress={() => actualizar('radio_km', Math.min(50, config.radio_km + 1))}>
                    <Text style={s.btnMasText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Mapa con Leaflet/OpenStreetMap */}
            <Text style={s.seccionTitle}>Vista del área</Text>
            <View style={s.mapContainer}>
              <WebView
                source={{ html: mapHtml() }}
                style={s.map}
                scrollEnabled={false}
                javaScriptEnabled={true}
              />
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
  gruposScroll: { marginBottom: 8 },
  grupoTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E0E0DA' },
  grupoTabActivo: { backgroundColor: '#1D9E75', borderColor: '#1D9E75' },
  grupoTabText: { fontSize: 13, color: '#5F5E5A', fontWeight: '500' },
  grupoTabTextActivo: { color: '#fff' },
  zonasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 16, marginBottom: 8 },
  zonaBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E0E0DA' },
  zonaBadgeActiva: { backgroundColor: '#E1F5EE', borderColor: '#1D9E75' },
  zonaBadgeText: { fontSize: 13, color: '#5F5E5A' },
  zonaBadgeTextActiva: { color: '#1D9E75', fontWeight: '500' },
  infoCard: { marginHorizontal: 16, backgroundColor: '#E1F5EE', borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  infoLabel: { fontSize: 13, color: '#085041' },
  mapContainer: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden', height: 280, marginBottom: 8 },
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
