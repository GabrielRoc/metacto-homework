"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Fab from "@mui/material/Fab";
import CircularProgress from "@mui/material/CircularProgress";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import FeatureCard from "@/components/FeatureCard";
import AppSnackbar from "@/components/AppSnackbar";
import { fetchFeatures, upvoteFeature } from "@/lib/api";
import { FeatureProposal } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [features, setFeatures] = useState<FeatureProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error" as "error" | "success",
  });
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const email = localStorage.getItem("savedEmail");
    if (!email) {
      router.replace("/settings");
      return;
    }
    setSavedEmail(email);
  }, [router]);

  const loadFeatures = useCallback(
    async (page: number, reset: boolean = false) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setIsLoading(true);
      try {
        const response = await fetchFeatures(page, 10, sortBy, sortOrder);
        setFeatures((prev) => (reset ? response.data : [...prev, ...response.data]));
        setCurrentPage(response.meta.page);
        setTotalPages(response.meta.totalPages);
      } catch (err) {
        setSnackbar({
          open: true,
          message: err instanceof Error ? err.message : "Failed to load features",
          severity: "error",
        });
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    },
    [sortBy, sortOrder]
  );

  useEffect(() => {
    if (savedEmail) {
      loadFeatures(1, true);
    }
  }, [loadFeatures, savedEmail]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loadingRef.current &&
          currentPage < totalPages
        ) {
          loadFeatures(currentPage + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [currentPage, totalPages, loadFeatures]);

  const handleRefresh = () => {
    const email = localStorage.getItem("savedEmail") || "";
    setSavedEmail(email);
    setFeatures([]);
    setCurrentPage(1);
    setTotalPages(1);
    loadFeatures(1, true);
  };

  const handleUpvote = async (id: string) => {
    if (!savedEmail) return;
    try {
      await upvoteFeature(id, savedEmail);
      setSnackbar({ open: true, message: "Vote recorded!", severity: "success" });
      handleRefresh();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : "Failed to upvote",
        severity: "error",
      });
    }
  };

  if (!savedEmail) return null;

  return (
    <Box sx={{ pb: 10 }}>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Feature Proposals
          </Typography>
          <IconButton color="inherit" onClick={() => router.push("/settings")}>
            <SettingsIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 2, pt: 2, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        <Typography variant="body2" color="text.secondary">Sort by:</Typography>
        <ToggleButtonGroup
          value={sortBy}
          exclusive
          onChange={(_, val) => { if (val) setSortBy(val); }}
          size="small"
        >
          <ToggleButton value="createdAt">Date</ToggleButton>
          <ToggleButton value="upvoteCount">Upvotes</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          value={sortOrder}
          exclusive
          onChange={(_, val) => { if (val) setSortOrder(val); }}
          size="small"
        >
          <ToggleButton value="desc">Desc</ToggleButton>
          <ToggleButton value="asc">Asc</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Stack spacing={2} sx={{ p: 2 }}>
        {features.map((feature) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            onUpvote={handleUpvote}
          />
        ))}
      </Stack>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && features.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">No feature proposals yet</Typography>
        </Box>
      )}

      <div ref={sentinelRef} style={{ height: 1 }} />

      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        onClick={() => router.push("/create")}
      >
        <AddIcon />
      </Fab>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Box>
  );
}
