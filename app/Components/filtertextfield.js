'use client'

import { TextField } from "@mui/material";

//Colors
const linen = "#FFF4E9";
const purple_dark = "#8D6B94";
const purple_mid = "#B185A7";
const purple_light = "#baa4be";

export default function FilterTextField(props) {
  const {children, placeholder, sx} = props
  return (
    <TextField placeholder={placeholder} sx={sx}>
      {children}
    </TextField>
  )
}