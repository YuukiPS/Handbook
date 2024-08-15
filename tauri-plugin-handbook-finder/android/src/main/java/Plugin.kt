package com.plugin.handbook

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.DocumentsContract
import android.provider.MediaStore
import androidx.activity.result.ActivityResult
import androidx.annotation.RequiresApi
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import app.tauri.Logger
import app.tauri.annotation.Command
import app.tauri.annotation.ActivityCallback
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Plugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import java.io.File

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
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
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

    @ActivityCallback
    fun handlePermissionResult(invoke: Invoke, result: ActivityResult) {
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
    fun openFolderPicker(invoke: Invoke) {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply {
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        startActivityForResult(invoke, intent, "openFolderCallback")
    }

    @ActivityCallback
    fun openFolderCallback(invoke: Invoke, result: ActivityResult) {
        when (result.resultCode) {
            Activity.RESULT_OK -> {
                val data = result.data
                if (data == null) {
                    Logger.error("Result data is null")
                    invoke.reject("Result data is null")
                    return
                }

                val uri = data.data
                if (uri == null) {
                    Logger.error("URI is null")
                    invoke.reject("URI is null")
                    return
                }

                try {
                    val takeFlags: Int = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        activity.contentResolver.takePersistableUriPermission(uri, takeFlags)
                    }

                    val uriString = uri.toString()
                    val displayName = getDisplayName(uri)

                    invoke.resolve(JSObject().apply {
                        put("uri", uriString)
                        put("displayName", displayName)
                    })
                } catch (e: Exception) {
                    Logger.error("Error processing URI: ${e.message}")
                    invoke.reject("Error processing URI: ${e.message}")
                }
            }
            Activity.RESULT_CANCELED -> {
                Logger.info("Folder selection cancelled")
                invoke.resolve(null)
            }
            else -> {
                Logger.error("Unexpected result code: ${result.resultCode}")
                invoke.reject("Unexpected result code: ${result.resultCode}")
            }
        }
    }

    private fun getDisplayName(uri: Uri): String {
        return try {
            val docId = DocumentsContract.getTreeDocumentId(uri)
            val split = docId.split(":")
            if (split.size > 1) {
                val type = split[0]
                val path = split[1]
                if ("primary".equals(type, ignoreCase = true)) {
                    "/storage/emulated/0/$path"
                } else {
                    "/$type/$path"
                }
            } else {
                uri.lastPathSegment ?: "Selected Folder"
            }
        } catch (e: Exception) {
            Logger.error("Error getting display name: ${e.message}")
            uri.lastPathSegment ?: "Selected Folder"
        }
    }

    // Remove or comment out the getDisplayNameApi29AndAbove and getDisplayNameLegacy methods

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
