"use client";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

interface AppSnackbarProps {
  open: boolean;
  message: string;
  severity?: "error" | "success" | "info" | "warning";
  onClose: () => void;
}

export default function AppSnackbar({
  open,
  message,
  severity = "error",
  onClose,
}: AppSnackbarProps) {
  return (
    <Snackbar open={open} autoHideDuration={4000} onClose={onClose}>
      <Alert onClose={onClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
}
