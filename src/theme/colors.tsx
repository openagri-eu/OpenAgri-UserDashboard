import { lighten } from "@mui/material";

const env = import.meta.env;

const PRIMARY = env.VITE_PRIMARY_COLOR || '#558bc9';
const SECONDARY = env.VITE_SECONDARY_COLOR || '#c8cc27';
const BG_DEFAULT = env.VITE_BACKGROUND_DEFAULT || '#fffdf5';
const BG_PAPER = env.VITE_BACKGROUND_PAPER || '#fffbeb';

export const colors = {
    primary: {
        main: PRIMARY,
        background: lighten(PRIMARY, 0.9)
    },
    secondary: {
        main: SECONDARY,
    },
    background: {
        default: BG_DEFAULT,
        paper: BG_PAPER,
    },
    other: {
        lightgrey: "#fafbfb",
    },
};
