package com.plugin.handbook

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.DocumentsContract
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
        if (result.resultCode == Activity.RESULT_OK) {
            val uri: Uri? = result.data?.data

            if (uri != null) {
                val takeFlags: Int = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                activity.contentResolver.takePersistableUriPermission(uri, takeFlags)

                val uriString = uri.toString()

                val displayName = getDisplayName(uri)

                invoke.resolve(JSObject().apply {
                    put("uri", uriString)
                    put("displayName", displayName)
                })
            } else {
                invoke.reject("Failed to get path")
            }
        } else {
            invoke.resolve(null)
        }
    }

    // Source: https://stackoverflow.com/questions/65363269/resolve-content-uri-into-actual-filepath
    private fun getDisplayName(uri: Uri): String {
        val context = activity.applicationContext
        val docUri = DocumentsContract.buildDocumentUriUsingTree(uri, DocumentsContract.getTreeDocumentId(uri))
        val projection = arrayOf(DocumentsContract.Document.COLUMN_DISPLAY_NAME)

        context.contentResolver.query(docUri, projection, null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) {
                return cursor.getString(0)
            }
        }
    
        throw Exception("Failed to get display name for $uri")
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
