package com.anonymous.vozviajeapp

import android.content.Intent
import android.provider.Settings
import android.view.accessibility.AccessibilityManager
import android.content.Context
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class AccessibilityModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "VozViajeAccessibility"

    @ReactMethod
    fun isAccessibilityEnabled(promise: Promise) {
        try {
            val enabledServices = Settings.Secure.getString(
                reactContext.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: ""
            val isEnabled = enabledServices.contains("com.anonymous.vozviajeapp/com.anonymous.vozviajeapp.VozViajeAccessibilityService")
            promise.resolve(isEnabled)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactContext.startActivity(intent)
    }

    @ReactMethod
    fun aceptarViaje() {
        VozViajeAccessibilityService.instance?.aceptarViaje()
    }

    @ReactMethod
    fun rechazarViaje() {
        VozViajeAccessibilityService.instance?.rechazarViaje()
    }

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}

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