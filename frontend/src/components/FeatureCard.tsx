"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import { FeatureProposal } from "@/lib/types";

interface FeatureCardProps {
  feature: FeatureProposal;
  onUpvote: (id: string) => void;
}

export default function FeatureCard({ feature, onUpvote }: FeatureCardProps) {
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {feature.text}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          by {feature.authorEmail}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 2,
          }}
        >
          <Typography variant="body2" color="primary">
            {feature.upvoteCount} {feature.upvoteCount === 1 ? "vote" : "votes"}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ThumbUpOutlinedIcon />}
            onClick={() => onUpvote(feature.id)}
          >
            Upvote
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
