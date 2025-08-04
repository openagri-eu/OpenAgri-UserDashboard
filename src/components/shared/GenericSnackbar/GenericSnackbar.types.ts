type SnackbarType = 'success' | 'error' | 'info';

export interface GenericSnackbarProps {
    type: SnackbarType;
    message: string;
    open: boolean;
    onClose: () => void;
}