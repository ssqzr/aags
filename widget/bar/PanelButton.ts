import { Widget, App } from "astal/gtk3"
import options from "options"
import { ButtonProps } from "types/widgets/button"

type PanelButtonProps = ButtonProps & {
    window?: string,
    flat?: boolean
}

export default ({
    window = "",
    flat,
    child,
    setup,
    ...rest
}: PanelButtonProps) => new Widget.Button({
    child: new Widget.Box({ child }),
    setup: self => {
        let open = false

        self.toggleClassName("panel-button")
        self.toggleClassName(window)

        self.hook(options.bar.flatButtons, () => {
            self.toggleClassName("flat", flat ?? options.bar.flatButtons.get())
        })

        self.hook(App, (_, win, visible) => {
            if (win !== window)
                return

            if (open && !visible) {
                open = false
                self.toggleClassName("active", false)
            }

            if (visible) {
                open = true
                self.toggleClassName("active")
            }
        })

        if (setup)
            setup(self)
    },
    ...rest,
})
