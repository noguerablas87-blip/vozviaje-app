package com.anonymous.vozviajeapp

import android.content.Intent
import android.provider.Settings
import android.accessibilityservice.AccessibilityServiceInfo
import android.view.accessibility.AccessibilityManager
import android.content.Context
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class AccessibilityModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "VozViajeAccessibility"

    // Verificar si el Accessibility Service está activado
    @ReactMethod
    fun isAccessibilityEnabled(promise: Promise) {
        try {
            val am = reactContext.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
            val enabledServices = Settings.Secure.getString(
                reactContext.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: ""
            val isEnabled = enabledServices.contains("vozviajeapp/com.anonymous.vozviajeapp.VozViajeAccessibilityService")
            promise.resolve(isEnabled)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    // Abrir la pantalla de configuración de Accesibilidad
    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactContext.startActivity(intent)
    }

    // Aceptar el viaje actual
    @ReactMethod
    fun aceptarViaje() {
        VozViajeAccessibilityService.onViajeDetectado?.let {
            // Buscar instancia activa del servicio
        }
        // Emitir evento para que el servicio lo maneje
        sendEvent("AcceptTrip", null)
    }

    // Rechazar el viaje actual
    @ReactMethod
    fun rechazarViaje() {
        sendEvent("RejectTrip", null)
    }

    // Registrar listener para recibir eventos del servicio
    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    companion object {
        fun emitViajeDetectado(context: ReactApplicationContext, datos: String) {
            val params = Arguments.createMap()
            params.putString("datos", datos)
            context
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("ViajeDetectado", params)
        }
    }
}