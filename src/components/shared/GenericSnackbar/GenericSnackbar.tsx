import React, { useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { GenericSnackbarProps } from './GenericSnackbar.types';

const GenericSnackbar: React.FC<GenericSnackbarProps> = ({ type, message, open, onClose }) => {
    const autoHideDuration = 6000;

    useEffect(() => {
        if (open) {
            const timer = setTimeout(onClose, autoHideDuration);
            return () => clearTimeout(timer);
        }
    }, [open]);

    return (
        <Snackbar open={open} autoHideDuration={autoHideDuration}
            onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Alert onClose={onClose} severity={type} variant="filled">
                {message? message : "Error message absent"}
            </Alert>
        </Snackbar>
    );
};

export default GenericSnackbar;