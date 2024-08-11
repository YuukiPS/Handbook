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
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import app.tauri.plugin.Invoke

@TauriPlugin
class Plugin(private val activity: Activity) : Plugin(activity) {
    companion object {
        private const val STORAGE_PERMISSION_CODE = 100
        private const val MANAGE_EXTERNAL_STORAGE_PERMISSION_CODE = 101
    }

    @Command
    fun requestStoragePermission(invoke: Invoke) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // For Android 11 (API 30) and above
            if (!Environment.isExternalStorageManager()) {
                try {
                    val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION)
                    intent.addCategory("android.intent.category.DEFAULT")
                    intent.data = Uri.parse("package:${activity.packageName}")
                    activity.startActivityForResult(intent, MANAGE_EXTERNAL_STORAGE_PERMISSION_CODE)
                } catch (e: Exception) {
                    val intent = Intent()
                    intent.action = Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION
                    activity.startActivityForResult(
                        intent,
                        MANAGE_EXTERNAL_STORAGE_PERMISSION_CODE
                    )
                } finally {
                    startActivityForResult(invoke, intent, "handlePermissionResult")
                }
            }
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // For Android 6.0 (API 23) to Android 10 (API 29)
            if (ContextCompat.checkSelfPermission(
                    activity,
                    Manifest.permission.READ_EXTERNAL_STORAGE
                ) == PackageManager.PERMISSION_DENIED ||
                ContextCompat.checkSelfPermission(
                    activity,
                    Manifest.permission.WRITE_EXTERNAL_STORAGE
                ) == PackageManager.PERMISSION_DENIED
            ) {
                ActivityCompat.requestPermissions(
                    activity,
                    arrayOf(
                        Manifest.permission.READ_EXTERNAL_STORAGE,
                        Manifest.permission.WRITE_EXTERNAL_STORAGE
                    ),
                    STORAGE_PERMISSION_CODE
                )
            }
        }
    }

    @ActivityCallback
    fun handlePermissionResult(invoke: Invoke, result: ActivityResult) {
        try {
            when (result.resultCode) {
                Activity.RESULT_OK -> {
                    Logger.info(result.data.toString())
                    invoke.resolve()
                }

                Activity.RESULT_CANCELED -> {
                    invoke.reject("Cancelled")
                }

                else -> invoke.reject("Failed to request storage permissions")
            }
        } catch (e: Exception) {
            Logger.error(e.message ?: "Failed to request storage permissions")
        }
    }
}
