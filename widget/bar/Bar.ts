import { Widget, Astal, } from "astal/gtk3"
import { Gdk, Gtk } from "astal/gtk3"
import { bind } from "astal"
import BatteryBar from "./buttons/BatteryBar"
import ColorPicker from "./buttons/ColorPicker"
import Date from "./buttons/Date"
import Launcher from "./buttons/Launcher"
import Media from "./buttons/Media"
import PowerMenu from "./buttons/PowerMenu"
import SysTray from "./buttons/SysTray"
import SystemIndicators from "./buttons/SystemIndicators"
import Taskbar from "./buttons/Taskbar"
import Workspaces from "./buttons/Workspaces"
import ScreenRecord from "./buttons/ScreenRecord"
import Messages from "./buttons/Messages"
import options from "options"

const { start, center, end } = options.bar.layout
const pos = bind(options.bar.position)

export type BarWidget = keyof typeof widget

const widget = {
    battery: BatteryBar,
    colorpicker: ColorPicker,
    date: Date,
    launcher: Launcher,
    media: Media,
    powermenu: PowerMenu,
    systray: SysTray,
    system: SystemIndicators,
    taskbar: Taskbar,
    workspaces: Workspaces,
    screenrecord: ScreenRecord,
    messages: Messages,
    expander: () => new Widget.Box({ hexpand: true }),
}

export default (gdkmonitor: Gdk.Monitor) => new Widget.Window({
    gdkmonitor: gdkmonitor,
    className: "bar",
    name: `bar-${gdkmonitor.model}`,
    exclusivity: Astal.Exclusivity.EXCLUSIVE,
    anchor: pos.as(pos => {
        if (pos === "top") { return Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT }
        return Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT;
    }),
    child: new Widget.CenterBox({
        css: "min-width: 2px; min-height: 2px;",
        startWidget: new Widget.Box({
            hexpand: true,
            children: bind(start).as(s => s.map(w => widget[w](gdkmonitor))),
        }),
        centerWidget: new Widget.Box({
            halign: Gtk.Align.CENTER,
            children: bind(center).as(c => c.map(w => widget[w](gdkmonitor))),
        }),
        endWidget: new Widget.Box({
            hexpand: true,
            children: bind(end).as(e => e.map(w => widget[w](gdkmonitor))),
        }),
    }),
})
