import definePlugin, { OptionType } from "@utils/types";
import { definePluginSettings } from "@api/Settings";
import { makeRange } from "@components/PluginSettings/components";

let settings = definePluginSettings({
    font: {
        type: OptionType.SELECT,
        description: "Which font to use for Manchu text",
        options: [
            {
                label: "Default system font",
                value: "default",
                default: true,
            },
            {
                label: "Noto Sans Mongolian",
                value: "noto",
            },
        ],
        onChange: () => updateStyles()
    },
    size: {
        type: OptionType.SLIDER,
        description: "Font size in pt",
        markers: makeRange(12, 40, 1),
        default: 16,
        stickToMarkers: true,
        onChange: () => updateStyles()
    }
});

let styles: HTMLStyleElement;
const updateStyles = () => {
    const size = Vencord.Settings.plugins.ManchuRenderer.size;
    const font = Vencord.Settings.plugins.ManchuRenderer.font === "noto" ? "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Mongolian&display=swap');" : "";
    styles.textContent = `
${font}
div:lang(mnc) {
    font-family: "Noto Sans Mongolian";
    writing-mode: vertical-lr;
    font-size: ${size}pt;
}`
};


function isManchu(s: string) {
    return s.match(/((\p{Script=Mongolian}+\p{Script=Common}*)+)/gu);
}

export default definePlugin({
    name: "ManchuRenderer",
    authors: [{
        id: 328701311736479755n,
        name: "azazo",
    }],
    description: "Renders Manchu text vertically.",
    settings,

    patches: [
        {
            find: ".VOICE_HANGOUT_INVITE?",
            replacement: {
                match: /(contentRef:\i}=(\i).+?)\(0,(.+]}\)]}\))/,
                replace: "$1 $self.modify($2, (0, $3)"
            }
        }
    ],

    modify(e, c) {
        
        if (isManchu(e.message.content)) {
            // console.log(e.message.content);
            return <div lang="mnc">{c}</div>
        } else {
            return c;
        }
    },

    start: () => {
        styles = document.createElement("style");
        styles.id = "ManchuText";
        document.head.appendChild(styles);

        updateStyles();
    },

    stop: () => styles.remove()
});