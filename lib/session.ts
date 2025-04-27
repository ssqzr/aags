import GLib from "gi://GLib?version=2.0"
import { ensureDirectory } from "./utils"
import { App } from "astal/gtk3"

declare global {
    const OPTIONS: string
    const TMP: string
    const USER: string
}

Object.assign(globalThis, {
    OPTIONS: `${GLib.get_user_cache_dir()}/ags/options.json`,
    TMP: `${GLib.get_tmp_dir()}/asztal`,
    USER: GLib.get_user_name(),
})

ensureDirectory(TMP)
App.add_icons(`${SRC}/assets`)
