import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { GenericDialogProps } from "./GenericDialog.types";

const GenericDialog: React.FC<GenericDialogProps> = ({ open, onClose, title, children, variant, onYes, onNo }) => {
    const handleYes = () => {
      if (onYes) onYes();
      onClose();
    };
  
    const handleNo = () => {
      if (onNo) onNo();
      onClose();
    };
  
    return (
      <Dialog open={open} onClose={onClose} aria-labelledby="generic-dialog-title">
        <DialogTitle id="generic-dialog-title">{title}</DialogTitle>
        <DialogContent>{children}</DialogContent>
        <DialogActions>
          {variant === 'yes-no' && (
            <>
              <Button onClick={handleNo}>No</Button>
              <Button onClick={handleYes} autoFocus>
                Yes
              </Button>
            </>
          )}
          {variant === 'empty' && <Button onClick={onClose}>Close</Button>}
        </DialogActions>
      </Dialog>
    );
  };

export default GenericDialog;