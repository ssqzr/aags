import { App } from "astal/gtk3"
import "lib/session"
import "style/style"
import init from "lib/init"
import options from "options"
import Bar from "widget/bar/Bar"
import Dock from "widget/dock/Dock"
import Launcher from "widget/launcher/Launcher"
import NotificationPopups from "widget/notifications/NotificationPopups"
import OSD from "widget/osd/OSD"
import Overview from "widget/overview/Overview"
import PowerMenu from "widget/powermenu/PowerMenu"
import ScreenCorners from "widget/bar/ScreenCorners"
import SettingsDialog from "widget/settings/SettingsDialog"
import Verification from "widget/powermenu/Verification"
import { forMonitors } from "lib/utils"
import { setupQuickSettings } from "widget/quicksettings/QuickSettings"
import { setupDateMenu } from "widget/datemenu/DateMenu"

App.start({
    main() {
        App.get_monitors().map(Bar)
        // App.get_monitors().map(Dock)
        // App.get_monitors().map(NotificationPopups)
        // App.get_monitors().map(ScreenCorners)
        // App.get_monitors().map(OSD)
    },
})

// App.config({
//     onConfigParsed: () => {
//         setupQuickSettings()
//         setupDateMenu()
//         init()
//     },
//     closeWindowDelay: {
//         "dock0": options.transition.value,
//         "dock1": options.transition.value,
//         "launcher": options.transition.value,
//         "overview": options.transition.value,
//         "quicksettings": options.transition.value,
//         "datemenu": options.transition.value,
//     },
//     windows: () => [
//         ...forMonitors(Bar),
//         ...forMonitors(Dock),
//         ...forMonitors(NotificationPopups),
//         ...forMonitors(ScreenCorners),
//         ...forMonitors(OSD),
//         Launcher(),
//         Overview(),
//         PowerMenu(),
//         SettingsDialog(),
//         Verification(),
//     ],
// })
