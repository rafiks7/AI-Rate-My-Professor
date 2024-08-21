'use client'

import { Box, AppBar, Toolbar, Button } from "@mui/material"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image"

import logo from "/public/logo.png"

const linen = "#FFF4E9";
const purple_main = "#8D6B94";
const purple_light = "#B185A7";

export default function NavBar() {
  return (
      <AppBar position="static">
        <Toolbar sx={{ bgcolor: purple_main, boxShadow: "2px 2px 2px black"}}>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <a href="http://localhost:3000/"><Image src={logo} width={50} height={50}></Image></a>
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
      </AppBar>
  )
}