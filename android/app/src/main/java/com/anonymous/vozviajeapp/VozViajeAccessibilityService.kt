package com.anonymous.vozviajeapp

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import org.json.JSONObject

class VozViajeAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "VozViajeAccess"
        private const val PKG_BOLT = "ee.mtakso.driver"
        private const val PKG_UBER = "com.ubercab.driver"
        private const val CHANNEL_ID = "vozviaje_service"
        private const val NOTIF_ID = 1001

        var instance: VozViajeAccessibilityService? = null
        private var ultimoTimestamp = 0L
        private const val DEBOUNCE_MS = 3000L
    }

    override fun onServiceConnected() {
        instance = this
        val info = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                         AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
            packageNames = arrayOf(PKG_BOLT, PKG_UBER)
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or
                    AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
            notificationTimeout = 100
        }
        serviceInfo = info
        iniciarForegroundService()
        Log.d(TAG, "VozViaje Accessibility Service conectado")
    }

    private fun iniciarForegroundService() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "VozViaje Activo",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "VozViaje está escuchando viajes de Bolt y Uber"
        }
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(channel)

        val notification = Notification.Builder(this, CHANNEL_ID)
            .setContentTitle("VozViaje activo")
            .setContentText("Escuchando viajes de Bolt y Uber")
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setOngoing(true)
            .build()

        startForeground(NOTIF_ID, notification)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        val ahora = System.currentTimeMillis()
        if (ahora - ultimoTimestamp < DEBOUNCE_MS) return

        val packageName = event.packageName?.toString() ?: return
        val rootNode = rootInActiveWindow ?: return

        try {
            when (packageName) {
                PKG_BOLT -> procesarPantallaBolt(rootNode, packageName)
                PKG_UBER -> procesarPantallaUber(rootNode, packageName)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error: ${e.message}")
        } finally {
            rootNode.recycle()
        }
    }

    private fun procesarPantallaBolt(rootNode: AccessibilityNodeInfo, packageName: String) {
        encontrarNodoPorTexto(rootNode, "Aceptar") ?: return
        encontrarNodoPorTexto(rootNode, "Rechazar") ?: return

        val textos = mutableListOf<String>()
        extraerTodosLosTextos(rootNode, textos)
        if (textos.isEmpty()) return

        ultimoTimestamp = System.currentTimeMillis()
        Log.d(TAG, "BOLT viaje detectado: $textos")

        val datos = JSONObject().apply {
            put("app", "bolt")
            put("textos", textos.joinToString("|"))
            put("timestamp", System.currentTimeMillis())
        }
        enviarAReactNative(datos.toString())
    }

    private fun procesarPantallaUber(rootNode: AccessibilityNodeInfo, packageName: String) {
        encontrarNodoPorTexto(rootNode, "Aceptar") ?: return

        val textos = mutableListOf<String>()
        extraerTodosLosTextos(rootNode, textos)
        if (textos.isEmpty()) return

        ultimoTimestamp = System.currentTimeMillis()
        Log.d(TAG, "UBER viaje detectado: $textos")

        val datos = JSONObject().apply {
            put("app", "uber")
            put("textos", textos.joinToString("|"))
            put("timestamp", System.currentTimeMillis())
        }
        enviarAReactNative(datos.toString())
    }

    fun aceptarViaje() {
        val rootNode = rootInActiveWindow ?: return
        try {
            val boton = encontrarNodoPorTexto(rootNode, "Aceptar")
            boton?.performAction(AccessibilityNodeInfo.ACTION_CLICK)
            Log.d(TAG, "Viaje aceptado")
        } finally {
            rootNode.recycle()
        }
    }

    fun rechazarViaje() {
        val rootNode = rootInActiveWindow ?: return
        try {
            val boton = encontrarNodoPorTexto(rootNode, "Rechazar")
                ?: encontrarNodoPorDescripcion(rootNode, "Close")
                ?: encontrarNodoPorDescripcion(rootNode, "Cerrar")
            boton?.performAction(AccessibilityNodeInfo.ACTION_CLICK)
            Log.d(TAG, "Viaje rechazado")
        } finally {
            rootNode.recycle()
        }
    }

    private fun enviarAReactNative(datos: String) {
        try {
            // Lanzar overlay
            val intent = Intent(this, OverlayService::class.java).apply {
                action = OverlayService.ACTION_MOSTRAR
                putExtra(OverlayService.EXTRA_DATOS, datos)
            }
            startService(intent)

            // Enviar a React Native
            val app = application as? MainApplication ?: return
            val reactContext = app.reactHost.currentReactContext ?: return
            AccessibilityModule.emitViajeDetectado(
                reactContext as com.facebook.react.bridge.ReactApplicationContext,
                datos
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error enviando a React Native: ${e.message}")
        }
    }

    private fun encontrarNodoPorTexto(node: AccessibilityNodeInfo, texto: String): AccessibilityNodeInfo? {
        if (node.text?.toString()?.contains(texto, ignoreCase = true) == true) return node
        for (i in 0 until node.childCount) {
            val hijo = node.getChild(i) ?: continue
            val resultado = encontrarNodoPorTexto(hijo, texto)
            if (resultado != null) return resultado
            hijo.recycle()
        }
        return null
    }

    private fun encontrarNodoPorDescripcion(node: AccessibilityNodeInfo, desc: String): AccessibilityNodeInfo? {
        if (node.contentDescription?.toString()?.contains(desc, ignoreCase = true) == true) return node
        for (i in 0 until node.childCount) {
            val hijo = node.getChild(i) ?: continue
            val resultado = encontrarNodoPorDescripcion(hijo, desc)
            if (resultado != null) return resultado
            hijo.recycle()
        }
        return null
    }

    private fun extraerTodosLosTextos(node: AccessibilityNodeInfo, lista: MutableList<String>) {
        val texto = node.text?.toString()?.trim()
        if (!texto.isNullOrEmpty() && texto.length > 1) lista.add(texto)
        for (i in 0 until node.childCount) {
            val hijo = node.getChild(i) ?: continue
            extraerTodosLosTextos(hijo, lista)
            hijo.recycle()
        }
    }

    override fun onInterrupt() {
        Log.d(TAG, "VozViaje Accessibility Service interrumpido")
    }

    override fun onDestroy() {
        instance = null
        super.onDestroy()
    }
}