"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { validateEmail } from "@/lib/validation";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("savedEmail");
    if (saved) setEmail(saved);
  }, []);

  const handleSave = () => {
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    localStorage.setItem("savedEmail", email);
    router.push("/");
  };

  return (
    <Box>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6">Settings</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Enter your email to use when creating proposals and upvoting.
        </Typography>

        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          error={!!emailError}
          helperText={emailError}
        />

        <Button variant="contained" size="large" fullWidth onClick={handleSave}>
          Save
        </Button>
      </Box>
    </Box>
  );
}
