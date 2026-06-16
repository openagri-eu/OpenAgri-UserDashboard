import { createTheme, ThemeOptions } from '@mui/material/styles';
import { colors } from './colors';
import './typography'


const themeOptions: ThemeOptions = {
    palette: {
        mode: 'light',
        background: {
            default: colors.background.default,
            paper: colors.background.paper,
        },
        primary: {
            main: colors.primary.main,
        },
        secondary: {
            main: colors.secondary.main,
        },
    },
};

export const theme = createTheme(themeOptions);