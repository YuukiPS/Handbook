package com.plugin.handbook

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import androidx.core.content.ContextCompat

fun getStoragePermissionIntent(activity: Activity): Intent? {
    return when {
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.R -> {
            if (!Environment.isExternalStorageManager()) {
                Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION).apply {
                    addCategory("android.intent.category.DEFAULT")
                    data = Uri.parse("package:${activity.packageName}")
                }
            } else {
                null
            }
        }

        Build.VERSION.SDK_INT >= Build.VERSION_CODES.M -> {
            val permissions = arrayOf(
                Manifest.permission.READ_EXTERNAL_STORAGE,
                Manifest.permission.WRITE_EXTERNAL_STORAGE
            )
            if (permissions.any {
                    ContextCompat.checkSelfPermission(activity, it) == PackageManager.PERMISSION_DENIED
                }) {
                null
            } else {
                null
            }
        }

        else -> null
    }
}