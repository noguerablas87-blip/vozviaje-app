package com.anonymous.vozviajeapp

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule

class NotificationService : NotificationListenerService() {

    companion object {
        private const val TAG = "VozViajeNotif"
        private val APPS_OBJETIVO = listOf(
            "com.bolt.driver",
            "com.ubercab.driver",
            "com.cabify.driver"
        )
        var reactContext: ReactApplicationContext? = null
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val packageName = sbn.packageName
        if (!APPS_OBJETIVO.contains(packageName)) return

        val extras = sbn.notification.extras
        val titulo = extras.getString("android.title") ?: ""
        val texto = extras.getCharSequence("android.text")?.toString() ?: ""

        Log.d(TAG, "Notificación de $packageName: $titulo - $texto")

        val datos = mapOf(
            "app" to packageName,
            "titulo" to titulo,
            "texto" to texto,
            "timestamp" to System.currentTimeMillis()
        )

        reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit("NuevaNotificacionViaje", datos.toString())
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {}
}