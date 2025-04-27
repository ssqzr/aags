import Variable from "astal/variable"
import { exec, readFile, writeFile, monitorFile } from "astal"
import { ensureDirectory } from "./utils"
import { GObject, register, signal, property } from "astal/gobject"

type OptProps = {
    persistent?: boolean
}

export class Opt<T = unknown> extends Variable<T> {
    // static { Service.register(this) }

    constructor(initial: T, { persistent = false }: OptProps = {}) {
        super(initial)
        this.initial = initial
        this.persistent = persistent
    }

    initial: T
    id = ""
    persistent: boolean
    // toString() { return `${this.get()}` }
    // toJSON() { return `opt:${this.get()}` }

    // getValue = (): T => {
    //     return super.get()
    // }

    init(cacheFile: string) {
        const cacheV = JSON.parse(readFile(cacheFile) || "{}")[this.id]
        if (cacheV !== undefined)
            this.set(cacheV)

        this.subscribe(value => {
            const cache = JSON.parse(readFile(cacheFile) || "{}")
            cache[this.id] = this.get()
            writeFile(JSON.stringify(cache, null, 2), cacheFile)
        })
    }

    reset() {
        if (this.persistent)
            return

        if (JSON.stringify(this.get()) !== JSON.stringify(this.initial)) {
            this.set(this.initial)
            return this.id
        }
    }
}

export const opt = <T>(initial: T, opts?: OptProps) => new Opt(initial, opts)

function getOptions<T extends Record<string, any>>(object: T, path = ""): Opt[] {
    return Object.keys(object).flatMap(key => {
        const obj = object[key]
        const id = path ? path + "." + key : key

        if (obj instanceof Opt) {
            obj.id = id
            return obj
        }

        if (typeof obj === "object")
            return getOptions(obj, id)

        return []
    })
}

export function mkOptions<T extends object>(cacheFile: string, object: T) {
    for (const opt of getOptions(object))
        opt.init(cacheFile)

    ensureDirectory(cacheFile.split("/").slice(0, -1).join("/"))

    const configFile = `${TMP}/config.json`
    const values = getOptions(object).reduce((obj, opt) => ({ [opt.id]: opt.get(), ...obj }), {})
    writeFile(JSON.stringify(values, null, 2), configFile)
    monitorFile(configFile, () => {
        const cache = JSON.parse(readFile(configFile) || "{}")
        for (const opt of getOptions(object)) {
            if (JSON.stringify(cache[opt.id]) !== JSON.stringify(opt.get()))
                opt.set(cache[opt.id])
        }
    })

    function sleep(ms = 0) {
        return new Promise(r => setTimeout(r, ms))
    }

    async function reset(
        [opt, ...list] = getOptions(object),
        id = opt?.reset(),
    ): Promise<Array<string>> {
        if (!opt)
            return sleep().then(() => [])

        return id
            ? [id, ...(await sleep(50).then(() => reset(list)))]
            : await sleep().then(() => reset(list))
    }

    return Object.assign(object, {
        configFile,
        array: () => getOptions(object),
        async reset() {
            return (await reset()).join("\n")
        },
        handler(deps: string[], callback: () => void) {
            for (const opt of getOptions(object)) {
                if (deps.some(i => opt.id.startsWith(i)))
                    opt.subscribe(callback)
            }
        },
    })
}

