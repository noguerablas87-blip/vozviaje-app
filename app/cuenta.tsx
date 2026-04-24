import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const BACKEND_URL = 'https://vozviaje-backend-production.up.railway.app';

type CuentaProps = {
  onCerrarSesion: () => void;
  onVolver: () => void;
};

export default function Cuenta({ onCerrarSesion, onVolver }: CuentaProps) {
  const [cuenta, setCuenta] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCuenta();
  }, []);

  const cargarCuenta = async () => {
    try {
      const celular = await AsyncStorage.getItem('celular');
      if (!celular) return;
      const res = await fetch(`${BACKEND_URL}/estado-cuenta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ celular }),
      });
      const data = await res.json();
      if (res.ok) setCuenta(data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar la información de tu cuenta.');
    } finally {
      setCargando(false);
    }
  };

  const compartir = async () => {
    if (!cuenta?.link_referido) return;
    try {
      await Share.share({
        message: `¡Probá VozViaje! Una app que te lee los viajes de Bolt y Uber en voz alta y te dice si conviene aceptarlos. 30 días gratis. Registrate con mi código y tenés el primer mes con descuento: ${cuenta.link_referido}`,
        title: 'VozViaje — Asistente para conductores',
      });
    } catch {}
  };

  const cerrarSesion = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que querés cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('usuario');
            await AsyncStorage.removeItem('celular');
            onCerrarSesion();
          },
        },
      ]
    );
  };

  const colorEstado = (estado: string) => {
    if (estado === 'activo') return '#1D9E75';
    if (estado === 'trial') return '#185FA5';
    return '#E24B4A';
  };

  const textoEstado = (estado: string) => {
    if (estado === 'activo') return 'Activo';
    if (estado === 'trial') return 'Período de prueba';
    return 'Vencido';
  };

  if (cargando) {
    return (
      <View style={s.container}>
        <Text style={s.cargandoText}>Cargando tu cuenta...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Mi cuenta</Text>
        <TouchableOpacity onPress={onVolver}>
          <Text style={s.linkText}>Volver</Text>
        </TouchableOpacity>
      </View>

      {cuenta && (
        <>
          <View style={s.card}>
            <Text style={s.nombre}>{cuenta.nombre}</Text>
            <Text style={s.celular}>{cuenta.celular}</Text>
            <View style={s.estadoRow}>
              <View style={[s.estadoBadge, { backgroundColor: colorEstado(cuenta.estado) + '20' }]}>
                <Text style={[s.estadoText, { color: colorEstado(cuenta.estado) }]}>
                  {textoEstado(cuenta.estado)}
                </Text>
              </View>
              <Text style={s.diasText}>{cuenta.dias_restantes} días restantes</Text>
            </View>
          </View>

          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={s.statVal}>{cuenta.stats?.total_viajes || 0}</Text>
              <Text style={s.statLabel}>Viajes analizados</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statVal}>{cuenta.stats?.aceptados || 0}</Text>
              <Text style={s.statLabel}>Aceptados</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statVal}>
                Gs. {((cuenta.precio_mes_gs || 30000) / 1000).toFixed(0)}K
              </Text>
              <Text style={s.statLabel}>Próximo mes</Text>
            </View>
          </View>

          {cuenta.descuento_proximo_mes && (
            <View style={s.descuentoBox}>
              <Text style={s.descuentoText}>
                🎉 Tenés 50% de descuento en tu próximo mes por referir un conductor
              </Text>
            </View>
          )}

          <View style={s.referidoCard}>
            <Text style={s.referidoTitle}>Compartí y ganás descuento</Text>
            <Text style={s.referidoDesc}>
              Cuando alguien se registra con tu código y paga su primer mes, vos pagás la mitad el mes siguiente.
            </Text>
            <View style={s.codigoBox}>
              <Text style={s.codigoLabel}>Tu código</Text>
              <Text style={s.codigo}>{cuenta.codigo_referido}</Text>
            </View>
            <TouchableOpacity style={s.btnCompartir} onPress={compartir}>
              <Text style={s.btnCompartirText}>Compartir con conductores</Text>
            </TouchableOpacity>
          </View>

          {cuenta.estado !== 'activo' && (
            <View style={s.pagoCard}>
              <Text style={s.pagoTitle}>Renovar suscripción</Text>
              <Text style={s.pagoDesc}>
                Precio mensual: Gs. {(cuenta.precio_mes_gs || 30000).toLocaleString()}
                {cuenta.descuento_proximo_mes ? ' (50% descuento aplicado)' : ''}
              </Text>
              <Text style={s.pagoInstrucciones}>
                Transferí a la cuenta de VozViaje y envianos el comprobante por WhatsApp para activar tu cuenta.
              </Text>
              <TouchableOpacity
                style={s.btnWsp}
                onPress={() => Linking.openURL('https://wa.me/595981000000?text=Hola%2C+quiero+renovar+mi+suscripcion+VozViaje')}
              >
                <Text style={s.btnWspText}>Contactar por WhatsApp</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={s.btnCerrar} onPress={cerrarSesion}>
            <Text style={s.btnCerrarText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F6', paddingTop: 55 },
  cargandoText: { textAlign: 'center', color: '#888780', marginTop: 100, fontSize: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '500', color: '#1A1A18' },
  linkText: { fontSize: 14, color: '#185FA5' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: '#E0E0DA', marginBottom: 12 },
  nombre: { fontSize: 18, fontWeight: '500', color: '#1A1A18', marginBottom: 2 },
  celular: { fontSize: 14, color: '#888780', marginBottom: 12 },
  estadoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  estadoText: { fontSize: 13, fontWeight: '500' },
  diasText: { fontSize: 13, color: '#5F5E5A' },
  statsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#F1EFE8', borderRadius: 8, padding: 12, alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '500', color: '#1A1A18' },
  statLabel: { fontSize: 11, color: '#888780', marginTop: 2, textAlign: 'center' },
  descuentoBox: { backgroundColor: '#E1F5EE', marginHorizontal: 16, borderRadius: 8, padding: 12, marginBottom: 12 },
  descuentoText: { fontSize: 13, color: '#085041', lineHeight: 20 },
  referidoCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: '#E0E0DA', marginBottom: 12 },
  referidoTitle: { fontSize: 16, fontWeight: '500', color: '#1A1A18', marginBottom: 6 },
  referidoDesc: { fontSize: 13, color: '#5F5E5A', lineHeight: 20, marginBottom: 14 },
  codigoBox: { backgroundColor: '#F1EFE8', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 12 },
  codigoLabel: { fontSize: 11, color: '#888780', marginBottom: 4 },
  codigo: { fontSize: 22, fontWeight: '500', color: '#1A1A18', letterSpacing: 2 },
  btnCompartir: { backgroundColor: '#1D9E75', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnCompartirText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  pagoCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: '#E0E0DA', marginBottom: 12 },
  pagoTitle: { fontSize: 16, fontWeight: '500', color: '#1A1A18', marginBottom: 6 },
  pagoDesc: { fontSize: 14, color: '#1D9E75', fontWeight: '500', marginBottom: 8 },
  pagoInstrucciones: { fontSize: 13, color: '#5F5E5A', lineHeight: 20, marginBottom: 14 },
  btnWsp: { backgroundColor: '#25D366', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnWspText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  btnCerrar: { marginHorizontal: 16, borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: '#E0E0DA', marginTop: 4 },
  btnCerrarText: { color: '#E24B4A', fontSize: 15 },
});
