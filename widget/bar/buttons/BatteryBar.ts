import icons from "lib/icons"
import options from "options"
import PanelButton from "../PanelButton"
import { Astal, Widget, Gdk, Gtk } from "astal/gtk3"
import Battery from "gi://AstalBattery"
import { bind, Variable } from "astal"

const battery = Battery.get_default()
const { bar, percentage, blocks, width, low } = options.bar.battery
const charging = Variable(battery.charging)

const Indicator = () => new Widget.Icon({
    setup: self => self.hook(charging, () => {
        self.icon = battery.charging
            ? icons.battery.charging
            : battery.icon_name
    }),
})

const PercentLabel = () => new Widget.Revealer({
    transition_type: Gtk.RevealerTransitionType.SLIDE_RIGHT,
    clickThrough: true,
    reveal_child: bind(percentage),
    child: new Widget.Label({
        label: bind(battery, "percentage").as(p => `${p}%`),
    }),
})

const LevelBar = () => {
    const level = new Widget.LevelBar({
        mode: Gtk.LevelBarMode.DISCRETE,
        max_value: bind(blocks),
        visible: bind(bar).as(b => b !== "hidden"),
        value: bind(battery, "percentage").as(p => (p / 100) * blocks.get()),
    })
    const update = () => {
        level.value = (battery.percentage / 100) * blocks.get()
        level.css = `block { min-width: ${width.get() / blocks.get()}pt; }`
    }
    return level
        .hook(width, update)
        .hook(blocks, update)
        .hook(bar, () => {
            level.valign = bar.get() === "whole" ? Gtk.Align.FILL : Gtk.Align.CENTER
            level.halign = bar.get() === "whole" ? Gtk.Align.FILL : Gtk.Align.CENTER
        })
}

const WholeButton = () => new Widget.Overlay({
    vexpand: true,
    child: LevelBar(),
    className: "whole",
    pass_through: true,
    overlay: new Widget.Box({
        halign: Gtk.Align.CENTER,
        children: [
            new Widget.Icon({
                icon: icons.battery.charging,
                visible: bind(battery, "charging"),
            }),
            new Widget.Box({
                halign: Gtk.Align.CENTER,
                valign: Gtk.Align.CENTER,
                child: PercentLabel(),
            }),
        ],
    }),
})

const Regular = () => new Widget.Box({
    className: "regular",
    children: [
        Indicator(),
        PercentLabel(),
        LevelBar(),
    ],
})

export default () => PanelButton({
    class_name: "battery-bar",
    hexpand: false,
    on_clicked: () => { percentage.set(!percentage.get()) },
    visible: bind(battery, "is_battery"),
    child: new Widget.Box({
        expand: true,
        visible: bind(battery, "is_battery"),
        child: bind(bar).as(b => b === "whole" ? WholeButton() : Regular()),
    }),
    setup: self => self
        .hook(bar, w => w.toggleClassName("bar-hidden", bar.get() === "hidden"))
        .hook(battery, w => {
            w.toggleClassName("charging", battery.charging)
            w.toggleClassName("low", battery.percentage < low.get())
        }),
})
