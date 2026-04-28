package com.anonymous.vozviajeapp

import android.app.Service
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.IBinder
import android.util.Log
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.TextView
import android.widget.LinearLayout
import android.widget.Button
import org.json.JSONObject

class OverlayService : Service() {

    companion object {
        private const val TAG = "VozViajeOverlay"
        const val ACTION_MOSTRAR = "MOSTRAR_OVERLAY"
        const val ACTION_OCULTAR = "OCULTAR_OVERLAY"
        const val EXTRA_DATOS = "datos_viaje"

        var instance: OverlayService? = null
    }

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null

    override fun onCreate() {
        super.onCreate()
        instance = this
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_MOSTRAR -> {
                val datos = intent.getStringExtra(EXTRA_DATOS) ?: return START_STICKY
                mostrarOverlay(datos)
            }
            ACTION_OCULTAR -> ocultarOverlay()
        }
        return START_STICKY
    }

    private fun mostrarOverlay(datosJson: String) {
        ocultarOverlay()

        try {
            val datos = JSONObject(datosJson)
            val app = datos.optString("app", "bolt").uppercase()
            val veredicto = datos.optString("veredicto", "Analizando...")
            val ganancia = datos.optLong("ganancia_neta_gs", 0)
            val gsPorKm = datos.optLong("gs_por_km", 0)
            val combustible = datos.optLong("costo_combustible_gs", 0)
            val conviene = datos.optBoolean("conviene", true)

            // Color según veredicto
            val colorFondo = when {
                conviene && veredicto == "Conveniente" -> Color.parseColor("#1D9E75")
                veredicto == "Regular" -> Color.parseColor("#BA7517")
                else -> Color.parseColor("#E24B4A")
            }

            // Crear vista del overlay
            val layout = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setBackgroundColor(Color.parseColor("#F0000000"))
                setPadding(0, 0, 0, 0)
            }

            val card = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setBackgroundColor(Color.WHITE)
                setPadding(40, 30, 40, 30)
            }

            // Header con app y veredicto
            val header = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
            }

            val tvApp = TextView(this).apply {
                text = app
                textSize = 12f
                setTextColor(Color.WHITE)
                setBackgroundColor(colorFondo)
                setPadding(16, 8, 16, 8)
            }

            val tvVeredicto = TextView(this).apply {
                text = veredicto
                textSize = 16f
                setTextColor(colorFondo)
                setPadding(16, 0, 0, 0)
                setTypeface(null, android.graphics.Typeface.BOLD)
            }

            header.addView(tvApp)
            header.addView(tvVeredicto)
            card.addView(header)

            // Ganancia
            val tvGanancia = TextView(this).apply {
                text = "Ganancia: Gs. ${ganancia.toLocaleString()}"
                textSize = 22f
                setTextColor(colorFondo)
                setTypeface(null, android.graphics.Typeface.BOLD)
                setPadding(0, 16, 0, 4)
            }
            card.addView(tvGanancia)

            // Detalles
            val tvDetalles = TextView(this).apply {
                text = "Gs/km: ${gsPorKm.toLocaleString()} · Combustible: Gs. ${combustible.toLocaleString()}"
                textSize = 12f
                setTextColor(Color.parseColor("#888780"))
                setPadding(0, 0, 0, 16)
            }
            card.addView(tvDetalles)

            // Botones
            val botonesLayout = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.END
            }

            val btnCerrar = Button(this).apply {
                text = "✕ Cerrar"
                textSize = 13f
                setTextColor(Color.parseColor("#888780"))
                setBackgroundColor(Color.TRANSPARENT)
                setOnClickListener { ocultarOverlay() }
            }

            botonesLayout.addView(btnCerrar)
            card.addView(botonesLayout)
            layout.addView(card)

            val params = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT
            ).apply {
                gravity = Gravity.BOTTOM
                y = 200
            }

            overlayView = layout
            windowManager?.addView(layout, params)
            Log.d(TAG, "Overlay mostrado")

        } catch (e: Exception) {
            Log.e(TAG, "Error mostrando overlay: ${e.message}")
        }
    }

    private fun ocultarOverlay() {
        overlayView?.let {
            try {
                windowManager?.removeView(it)
            } catch (e: Exception) {
                Log.e(TAG, "Error ocultando overlay: ${e.message}")
            }
            overlayView = null
        }
    }

    private fun Long.toLocaleString(): String {
        return String.format("%,d", this).replace(",", ".")
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        ocultarOverlay()
        instance = null
        super.onDestroy()
    }
}
