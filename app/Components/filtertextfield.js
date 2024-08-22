'use client'

import { TextField } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

//Colors
const linen = "#FFF4E9";
const purple_dark = "#8D6B94";
const purple_mid = "#B185A7";
const purple_light = "#baa4be";

const textfieldTheme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '--TextField-brandBorderColor': purple_dark,
          '--TextField-brandBorderHoverColor': purple_light,
          '--TextField-brandBorderFocusedColor': purple_light,
          '& .MuiInputBase-input': {
            color: linen,
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'var(--TextField-brandBorderColor)',
            },
            '&:hover fieldset': {
              borderColor: 'var(--TextField-brandBorderHoverColor)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'var(--TextField-brandBorderFocusedColor)',
            },
          },
        },
      },
    },
  },
});

export default function FilterTextField(props) {
  const {placeholder, sx} = props;
  return (
    <ThemeProvider theme={textfieldTheme}>
      <TextField placeholder={placeholder} />
    </ThemeProvider>
  )
}