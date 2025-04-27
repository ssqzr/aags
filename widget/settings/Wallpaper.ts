import { bind } from "astal"
import { Gtk, Widget } from "astal/gtk3"
import wallpaper from "service/wallpaper"

export default () => new Widget.Box(
    { className: "row wallpaper" },
    new Widget.Box(
        { vertical: true },
        new Widget.Label({
            xalign: 0,
            className: "row-title",
            label: "Wallpaper",
            valign: Gtk.Align.START,
        }),
        new Widget.Button({
            on_clicked: wallpaper.random,
            label: "Random",
        }),
        new Widget.FileChooserButton({
            on_file_set: ({ uri }) => wallpaper.set(uri!.replace("file://", "")),
        }),
    ),
    new Widget.Box({ hexpand: true }),
    new Widget.Box({
        className: "preview",
        css: wallpaper.bind("wallpaper").as(wp => `
            min-height: 120px;
            min-width: 200px;
            background-image: url('${wp}');
            background-size: cover;
        `),
    }),
)
