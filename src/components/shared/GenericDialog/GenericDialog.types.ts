export interface GenericDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    variant: 'empty' | 'yes-no';
    onYes?: () => void;
    onNo?: () => void;
  }