import { GenericDialogProps } from "@components/shared/GenericDialog/GenericDialog.types";
import { useState } from "react";

type ShowDialogParams = Omit<GenericDialogProps, 'open' | 'onClose'>;
interface DialogState extends ShowDialogParams {
    open: boolean;
    children: React.ReactNode;
}

const useDialog = () => {
    const [dialogState, setDialogState] = useState<DialogState>({
        open: false,
        title: '',
        children: null,
        variant: 'empty',
    });

    const showDialog = (params: ShowDialogParams) => {
        setDialogState({ ...params, open: true });
    };

    const closeDialog = () => {
        setDialogState((prev) => ({ ...prev, open: false }));
    };

    const dialogProps = {
        ...dialogState,
        onClose: closeDialog,
    };

    return { dialogProps, showDialog };
};

export default useDialog;