"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AppSnackbar from "@/components/AppSnackbar";
import { createFeature } from "@/lib/api";
import { validateText } from "@/lib/validation";

export default function CreateFeaturePage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [textError, setTextError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const handleSubmit = async () => {
    const tErr = validateText(text);
    setTextError(tErr);
    if (tErr) return;

    const email = localStorage.getItem("savedEmail") || "";
    if (!email) {
      router.push("/settings");
      return;
    }

    setIsSubmitting(true);
    try {
      await createFeature({ text, authorEmail: email });
      router.push("/");
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : "Failed to create feature",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.back()}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">New Feature Proposal</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField
          label="Feature proposal"
          variant="outlined"
          fullWidth
          multiline
          minRows={3}
          maxRows={6}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (textError) setTextError(null);
          }}
          error={!!textError}
          helperText={textError || `${text.length}/500`}
          slotProps={{ htmlInput: { maxLength: 500 } }}
        />

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isSubmitting ? "Submitting..." : "Submit Proposal"}
        </Button>
      </Box>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Box>
  );
}
