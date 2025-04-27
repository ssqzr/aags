/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Application } from "types/service/applications"
import icons, { substitutes } from "./icons"
import { Astal, Widget, Gdk, Gtk } from "astal/gtk3"
import Notifd from "gi://AstalNotifd"

import GLib from "gi://GLib?version=2.0"
import Gio from 'gi://Gio';
import { exec, execAsync } from "astal"

const notifd = Notifd.get_default()

export const USER = GLib.get_user_name();
export const HOME = GLib.get_home_dir();
// export const CACHE_DIR = `${GLib.get_user_cache_dir()}/${pkg.name.split('.').pop()}`;


export type Binding<T> = import("types/service").Binding<any, any, T>

/**
  * @returns substitute icon || name || fallback icon
  */
export function icon(name: string | null, fallback = icons.missing) {
    if (!name)
        return fallback || ""

    if (GLib.file_test(name, GLib.FileTest.EXISTS))
        return name

    let processedName = name
    let hasSymbolicSuffix = name.endsWith("-symbolic")

    if (hasSymbolicSuffix)
        processedName = processedName.slice(0, -"-symbolic".length)

    for (const pattern in substitutes) {
        const regex = new RegExp(pattern, "i")
        if (regex.test(processedName)) {
            if (Object.keys(substitutes).includes(pattern)) {
                processedName = substitutes[pattern as keyof typeof substitutes]
                break
            }
            // processedName = substitutes[pattern]
            // break
        }
    }

    if (hasSymbolicSuffix)
        processedName += "-symbolic"

    if (Astal.Icon.lookup_icon(processedName))
        return processedName

    print(`no icon substitute "${processedName}" for "${name}", fallback: "${fallback}"`)
    return fallback
}


/**
 * @returns execAsync(["bash", "-c", cmd])
 */
export async function bash(strings: TemplateStringsArray | string, ...values: unknown[]) {
    const cmd = typeof strings === "string" ? strings : strings
        .flatMap((str, i) => str + `${values[i] ?? ""}`)
        .join("")

    return execAsync(["bash", "-c", cmd]).catch(err => {
        console.error(cmd, err)
        return ""
    })
}

/**
 * @returns execAsync(cmd)
 */
export async function sh(cmd: string | string[]) {
    return execAsync(cmd).catch(err => {
        console.error(typeof cmd === "string" ? cmd : cmd.join(" "), err)
        return ""
    })
}

export function forMonitors(widget: (monitor: number) => Gtk.Window) {
    const n = Gdk.Display.get_default()?.get_n_monitors() || 1
    return range(n, 0).map(widget).flat(1)
}

/**
 * @returns [start...length]
 */
export function range(length: number, start = 1) {
    return Array.from({ length }, (_, i) => i + start)
}

/**
 * @returns true if all of the `bins` are found
 */
export function dependencies(...bins: string[]) {
    const missing = bins.filter(bin => {
        return !exec(`which ${bin}`)
    })

    if (missing.length > 0) {
        console.warn("missing dependencies:", missing.join(", "))
        // FIXME: 发送通知提示错误
        // Utils.notify(`missing dependencies: ${missing.join(", ")}`)
        // notifd.connect("notified", (_, id) => {
        //     const n = notifd.get_notification(id)
        //     print(n.summary, n.body)
        // })
    }

    return missing.length === 0
}

/**
 * run app detached
 */
export function launchApp(app: Application) {
    const exe = app.executable
        .split(/\s+/)
        .filter((str: string) => !str.startsWith("%") && !str.startsWith("@"))
        .join(" ")

    bash(`${exe} &`)
    app.frequency += 1
}

/**
 * to use with drag and drop
 */
export function createSurfaceFromWidget(widget: Gtk.Widget) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cairo = imports.cairo as any
    const alloc = widget.get_allocation()
    const surface = new cairo.ImageSurface(
        cairo.Format.ARGB32,
        alloc.width,
        alloc.height,
    )
    const cr = new cairo.Context(surface)
    cr.setSourceRGBA(255, 255, 255, 0)
    cr.rectangle(0, 0, alloc.width, alloc.height)
    cr.fill()
    widget.draw(cr)
    return surface
}

export function ensureDirectory(path: string) {
    if (!GLib.file_test(path, GLib.FileTest.EXISTS))
        Gio.File.new_for_path(path).make_directory_with_parents(null);
}
