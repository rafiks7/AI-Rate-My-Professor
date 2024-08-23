"use client";

import { Typography, Link, Accordion, AccordionDetails, AccordionSummary, AccordionActions, Button } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

//Colors
const linen = "#FFF4E9";
const purple_dark = "#8D6B94";
const purple_mid = "#B185A7";
const purple_light = "#baa4be";


export default function ProfCard(items) {
  const { name, subject, rating, summary, link } = items;
  return (
    <Accordion sx={{ 
      width: "90vw", 
      maxWidth: "800px", 
      backgroundColor: {purple_dark}, 
      border: '2px solid black',
      borderRadius: '10px',
      mb: 2
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ backgroundColor: `${purple_dark}` }}
      >
        <Typography color={linen} mr={2}>{name}</Typography>
        <Typography color={linen} mr={2}>{subject}</Typography>
        <Typography color={linen}>{rating}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ backgroundColor: `${purple_mid}`, borderTop: '2px solid black' }}>
        <Typography>{summary}</Typography>
      </AccordionDetails>
      <AccordionActions sx={{ backgroundColor: `${purple_mid}` }}>
        <Button><Link
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
            Profile
          </Link></Button>
      </AccordionActions>
    </Accordion>
  );
}
