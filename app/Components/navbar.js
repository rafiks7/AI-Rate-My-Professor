'use client'

import { Box, AppBar, Toolbar, Button, Dialog, Typography, TextField } from "@mui/material";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useState } from "react";
import Image from "next/image";

import logo from "/public/logo.png";

const linen = "#FFF4E9";
const purple_main = "#8D6B94";
const purple_light = "#B185A7";

export default function NavBar() {
  const [dialog, setDialog] = useState(false);
  const [input, setInput] = useState("");

  const handleSubmit = async () => {
    setDialog(false);
    setInput("");

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: input }),  
    });

      const data = await res.json();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
      <AppBar position="static">
        <Toolbar sx={{ bgcolor: purple_main, boxShadow: "2px 2px 2px black"}}>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <a href="http://localhost:3000/"><Image alt="Logo" src={logo} width={50} height={50}></Image></a>
          </Box>
          <SignedOut>
            <Button
              sx={{
              border: "1px solid black",
              borderRadius: "10px",
              color: "black",
              bgcolor: purple_light,
              mx: 1,
              transition: "200ms",
              "&:hover": {
                bgcolor: linen,
                transform: "scale(1.05)",
              },
              }}
              href="/signin"
            >
              Sign In
            </Button>
            <Button
              sx={{
              border: "1px solid black",
              borderRadius: "10px",
              color: "black",
              bgcolor: purple_light,
              mx: 1,
              transition: "200ms",
              "&:hover": {
                bgcolor: linen,
                transform: "scale(1.05)",
              },
              }}
              href="/create-account"
            >
              Sign Up
            </Button>
          </SignedOut>
          <SignedIn>
            <Button
              sx={{
              border: "1px solid black",
              borderRadius: "10px",
              color: "black",
              bgcolor: purple_light,
              mx: 3,
              transition: "200ms",
              "&:hover": {
                  bgcolor: linen,
                  transform: "scale(1.05)",
              },
              }}
              onClick={() => {setDialog(true)}}
            >
              Add Professor
            </Button>
            <UserButton/>
          </SignedIn>
        </Toolbar>

        <Dialog open={dialog} onClose={() => setDialog(false)}>
          <Box width={"450px"} flexDirection="column"  alignItems={"center"} justifyContent={"center"} flex={"display"} p={2}>
            <Typography align="center" variant="h4">Add Professor</Typography>
            <Box mt={2} width={"100%"}>
              <TextField
                fullWidth
                label="URL (ratemyprofessor.com)"
                variant="outlined"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </Box>
            <Box mt={2} width={"100%"} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Dialog>
      </AppBar>
  )
}