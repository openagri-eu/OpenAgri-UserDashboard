import { useState } from 'react';

type SnackbarType = 'success' | 'error' | 'info';

interface SnackbarState {
    type: SnackbarType;
    message: string;
    open: boolean;
}

const useSnackbar = () => {
    const [snackbarState, setSnackbarState] = useState<SnackbarState>({
        open: false,
        type: 'info',
        message: '',
    });

    const showSnackbar = (type: SnackbarType, message: string) => {
        setSnackbarState({ open: true, type, message });
    };

    const closeSnackbar = () => {
        setSnackbarState((prev) => ({ ...prev, open: false }));
    };

    return { snackbarState, showSnackbar, closeSnackbar };
};

export default useSnackbar;