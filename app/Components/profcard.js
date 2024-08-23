"use client";

import { Box, Stack, Link } from "@mui/material";

const purple_light = "#B185A7";
const purple_dark = "#8D6B94";

export default function ProfCard(items) {
  const { name, subject, rating, summary, link } = items;
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
        <Link
          href={link}
          underline="none"
          color="inherit"
          target="_blank" // Open link in a new tab
          rel="noopener noreferrer" // Security best practice
          sx={{
            textDecoration: 'none', // Remove default underline
            '&:hover': {
              textDecoration: 'underline', // Add underline on hover
            },
          }}
        >
          {name}
        </Link>
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
          {rating}
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
  );
}
