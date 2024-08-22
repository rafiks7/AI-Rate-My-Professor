'use client'

import { TextField } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

//Colors
const linen = "#FFF4E9";
const purple_dark = "#8D6B94";
const purple_light = "#baa4be";

const textfieldTheme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          // declare color root vars to use later
          '--TextField-brandBorderColor': purple_dark,
          '--TextField-brandBorderHoverColor': purple_light,
          '--TextField-brandBorderFocusedColor': purple_light,
          // use color for text color
          '& .MuiInputBase-input': {
            color: linen,
          },
          // color for border, hover, and focus
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
  const {placeholder, sx} = props; // edit these to get more inputs
  return (
    <ThemeProvider theme={textfieldTheme}>
      <TextField placeholder={placeholder} sx={sx} />
    </ThemeProvider>
  )
}