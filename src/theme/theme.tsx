import { createTheme, ThemeOptions } from '@mui/material/styles';
import { colors } from './colors';
import './typography'


const themeOptions: ThemeOptions = {
    palette: {
        mode: 'light',
        // background: {
        //     default: '#fffdf5',
        //     paper: '#fffbeb'
        // },
        primary: {
            main: colors.primary.main,
        },
        secondary: {
            main: colors.secondary.main,
        },
    },
};

export const theme = createTheme(themeOptions);