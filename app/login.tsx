import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const BACKEND_URL = 'https://vozviaje-backend-production.up.railway.app';

type Pantalla = 'registro' | 'verificacion' | 'listo';

export default function Login({ onLogin }: { onLogin: (usuario: any) => void }) {
  const [pantalla, setPantalla] = useState<Pantalla>('registro');
  const [celular, setCelular] = useState('');
  const [nombre, setNombre] = useState('');
  const [codigoRef, setCodigoRef] = useState('');
  const [codigo, setCodigo] = useState('');
  const [cargando, setCargando] = useState(false);

  const registrar = async () => {
    if (!celular || !nombre) {
      Alert.alert('Error', 'Completá tu nombre y número de celular.');
      return;
    }
    setCargando(true);
    try {
      const res = await fetch(`${BACKEND_URL}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          celular: celular.trim(),
          nombre: nombre.trim(),
          codigo_referido: codigoRef.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert(
          'Código enviado',
          `Tu código de verificación es: ${data.codigo_debug}\n\n(En producción llegará por WhatsApp)`,
          [{ text: 'OK', onPress: () => setPantalla('verificacion') }]
        );
      } else {
        Alert.alert('Error', data.detail || 'No se pudo registrar.');
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar al servidor.');
    } finally {
      setCargando(false);
    }
  };

  const verificar = async () => {
    if (!codigo) {
      Alert.alert('Error', 'Ingresá el código de verificación.');
      return;
    }
    setCargando(true);
    try {
      const res = await fetch(`${BACKEND_URL}/verificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ celular: celular.trim(), codigo: codigo.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        await AsyncStorage.setItem('usuario', JSON.stringify(data.usuario));
        await AsyncStorage.setItem('celular', celular.trim());
        onLogin(data.usuario);
      } else {
        Alert.alert('Error', data.detail || 'Código incorrecto.');
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar al servidor.');
    } finally {
      setCargando(false);
    }
  };

  if (pantalla === 'verificacion') {
    return (
      <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.content}>
          <Text style={s.title}>Verificá tu celular</Text>
          <Text style={s.subtitle}>
            Ingresá el código de 6 dígitos que te enviamos al {celular}
          </Text>
          <TextInput
            style={s.input}
            placeholder="000000"
            placeholderTextColor="#888780"
            value={codigo}
            onChangeText={setCodigo}
            keyboardType="numeric"
            maxLength={6}
            textAlign="center"
          />
          <TouchableOpacity style={s.btnPrimario} onPress={verificar} disabled={cargando}>
            <Text style={s.btnPrimarioText}>{cargando ? 'Verificando...' : 'Verificar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPantalla('registro')}>
            <Text style={s.linkText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>VozViaje</Text>
        <Text style={s.subtitle}>Asistente de voz para conductores de Bolt y Uber</Text>

        <View style={s.trialBadge}>
          <Text style={s.trialText}>30 días gratis · Sin tarjeta de crédito</Text>
        </View>

        <Text style={s.label}>Tu nombre</Text>
        <TextInput
          style={s.input}
          placeholder="Ej: Carlos García"
          placeholderTextColor="#888780"
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
        />

        <Text style={s.label}>Número de celular</Text>
        <TextInput
          style={s.input}
          placeholder="Ej: 0981 123 456"
          placeholderTextColor="#888780"
          value={celular}
          onChangeText={setCelular}
          keyboardType="phone-pad"
        />

        <Text style={s.label}>Código de referido (opcional)</Text>
        <TextInput
          style={s.input}
          placeholder="Si alguien te invitó, ingresá su código"
          placeholderTextColor="#888780"
          value={codigoRef}
          onChangeText={setCodigoRef}
          autoCapitalize="characters"
        />

        <TouchableOpacity style={s.btnPrimario} onPress={registrar} disabled={cargando}>
          <Text style={s.btnPrimarioText}>{cargando ? 'Registrando...' : 'Empezar gratis'}</Text>
        </TouchableOpacity>

        <Text style={s.nota}>
          Al registrarte aceptás los Términos de Uso de VozViaje.{'\n'}
          App independiente, no afiliada a Bolt ni Uber.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F6' },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: '500', color: '#1A1A18', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#5F5E5A', marginBottom: 24, lineHeight: 22 },
  trialBadge: { backgroundColor: '#E1F5EE', borderRadius: 8, padding: 12, marginBottom: 28, alignItems: 'center' },
  trialText: { fontSize: 14, color: '#085041', fontWeight: '500' },
  label: { fontSize: 13, color: '#888780', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E0E0DA',
    borderRadius: 10, padding: 14, fontSize: 15, color: '#1A1A18',
  },
  btnPrimario: {
    backgroundColor: '#1D9E75', borderRadius: 12, padding: 18,
    alignItems: 'center', marginTop: 24,
  },
  btnPrimarioText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  linkText: { color: '#185FA5', fontSize: 14, textAlign: 'center', marginTop: 16 },
  nota: { fontSize: 12, color: '#888780', textAlign: 'center', marginTop: 20, lineHeight: 18 },
});
