import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6650a4" },
    secondary: { main: "#625b71" },
    error: { main: "#B3261E" },
    background: {
      default: "#FEF7FF",
      paper: "#FFFBFE",
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#D0BCFF" },
    secondary: { main: "#CCC2DC" },
    error: { main: "#F2B8B5" },
    background: {
      default: "#141218",
      paper: "#1D1B20",
    },
  },
});
