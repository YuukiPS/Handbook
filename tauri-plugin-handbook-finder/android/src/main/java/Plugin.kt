package com.plugin.handbook

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import androidx.activity.result.ActivityResult
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import app.tauri.Logger
import app.tauri.annotation.Command
import app.tauri.annotation.ActivityCallback
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Plugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject

@TauriPlugin
class Plugin(private val activity: Activity) : Plugin(activity) {
    companion object {
        private const val STORAGE_PERMISSION_CODE = 100
    }

    @Command
    fun requestStoragePermission(invoke: Invoke) {
        val intent = getStoragePermissionIntent(activity)

        if (intent != null) {
            startActivityForResult(invoke, intent, "handlePermissionResult")
        } else {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val permissions = arrayOf(
                    Manifest.permission.READ_EXTERNAL_STORAGE,
                    Manifest.permission.WRITE_EXTERNAL_STORAGE
                )
                ActivityCompat.requestPermissions(
                    activity,
                    permissions,
                    STORAGE_PERMISSION_CODE
                )
            }
        }
//        when {
//            Build.VERSION.SDK_INT >= Build.VERSION_CODES.R -> {
//                if (!Environment.isExternalStorageManager()) {
//                    val intent =
//                        Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION).apply {
//                            addCategory("android.intent.category.DEFAULT")
//                            data = Uri.parse("package:${activity.packageName}")
//                        }
//                    startActivityForResult(invoke, intent, "handlePermissionResult")
//                }
//            }
//
//            Build.VERSION.SDK_INT >= Build.VERSION_CODES.M -> {
//                val permissions = arrayOf(
//                    Manifest.permission.READ_EXTERNAL_STORAGE,
//                    Manifest.permission.WRITE_EXTERNAL_STORAGE
//                )
//                if (permissions.any {
//                        ContextCompat.checkSelfPermission(
//                            activity,
//                            it
//                        ) == PackageManager.PERMISSION_DENIED
//                    }) {
//                    ActivityCompat.requestPermissions(
//                        activity,
//                        permissions,
//                        STORAGE_PERMISSION_CODE
//                    )
//                }
//            }
//        }
    }

    @ActivityCallback
    fun handlePermissionResult(invoke: Invoke, result: ActivityResult) {
        val resultCodeString = result.resultCode.toString()
        Logger.info("ActivityResult resultCode: $resultCodeString")
        android.util.Log.d("PermissionResult", "ActivityResult resultCode: $resultCodeString")

        val status = when (result.resultCode) {
            Activity.RESULT_OK -> {
                "Granted"
            }

            Activity.RESULT_CANCELED -> "Cancelled"
            else -> throw Exception("Failed to request storage permissions")
        }

        try {
            invoke.resolve(JSObject().apply { put("status", status) })
        } catch (e: Exception) {
            Logger.error(e.message ?: "Failed to request storage permissions")
            invoke.reject(e.message ?: "Failed to request storage permissions")
        }
    }

    @Command
    override fun checkPermissions(invoke: Invoke) {
        val status = when {
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.R -> {
                if (Environment.isExternalStorageManager()) "Granted" else "Denied"
            }

            Build.VERSION.SDK_INT >= Build.VERSION_CODES.M -> {
                if (ContextCompat.checkSelfPermission(
                        activity,
                        Manifest.permission.READ_EXTERNAL_STORAGE
                    ) == PackageManager.PERMISSION_GRANTED &&
                    ContextCompat.checkSelfPermission(
                        activity,
                        Manifest.permission.WRITE_EXTERNAL_STORAGE
                    ) == PackageManager.PERMISSION_GRANTED
                ) "Granted" else "Denied"
            }

            else -> "Granted"
        }
        invoke.resolve(JSObject().apply {
            put("status", status)
        })
    }
}
