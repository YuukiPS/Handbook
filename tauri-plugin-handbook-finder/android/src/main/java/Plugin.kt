package com.plugin.handbook

import android.app.Activity
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import app.tauri.plugin.Invoke

@InvokeArg
class PingArgs {
  var value: String? = null
}

@InvokeArg
class PermissionResultArgs {
    var requestCode: Int = 0
    var grantResults: IntArray = intArrayOf()
}

@TauriPlugin
class Plugin(private val activity: Activity): Plugin(activity) {
    private val implementation = Storage(activity)


    @Command
    fun requestStoragePermission(invoke: Invoke) {
        implementation.requestStoragePermission(activity)
        invoke.resolve(null)
    }

    @Command
    fun handlePermissionResult(invoke: Invoke) {
        val args = invoke.parseArgs(PermissionResultArgs::class.java)
        implementation.handlePermissionResult(args.requestCode, args.grantResults)
        invoke.resolve(null)
    }
}
