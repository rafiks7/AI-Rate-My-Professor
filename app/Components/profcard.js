'use client'

import { Box, Stack } from "@mui/material";
import { useState } from "react";

const purple_light = "#B185A7";
const purple_dark = "#8D6B94";

export default function ProfCard(items) {
  const {name, subject, stars, summary} = items
  return (
    <Box
      width="700px"
      border="2px solid black"
      borderRadius="10px"
      p={3}
      bgcolor={purple_dark}
      flexGrow={1}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        width="90%"
        height="50px"
        bgcolor={purple_light}
        display="flex"
        justifyContent="center"
        alignItems="center"
        border="1px solid black"
        borderRadius="10px"
        boxShadow="1px 1px 1px black"
        fontWeight="bold"
        mb={2}
      >
        {name}
      </Box>
      <Stack
        direction="row"
        width="700px"
        justifyContent="center"
        alignItems="center"
        spacing={3}
        mb={2}
      >
        <Box
          width="40%"
          height="50px"
          bgcolor={purple_light}
          display="flex"
          justifyContent="center"
          alignItems="center"
          border="1px solid black"
          borderRadius="10px"
          boxShadow="1px 1px 1px black"
          fontWeight="bold"
        >
          {subject}
        </Box>
        <Box
          width="40%"
          height="50px"
          bgcolor={purple_light}
          display="flex"
          justifyContent="center"
          alignItems="center"
          border="1px solid black"
          borderRadius="10px"
          boxShadow="1px 1px 1px black"
          fontWeight="bold"
        >
          {stars}
        </Box>
      </Stack>
      <Box
        width="90%"
        minHeight="100px"
        bgcolor={purple_light}
        display="flex"
        justifyContent="center"
        alignItems="center"
        border="1px solid black"
        borderRadius="10px"
        boxShadow="1px 1px 1px black"
        fontWeight="bold"
        flexGrow={1}
        mb={2}
        p={2}
      >
        {summary}
      </Box>
    </Box>
  )
}