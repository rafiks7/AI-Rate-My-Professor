"use client";
import { Box, Stack, TextField, Typography, Button } from "@mui/material";
import { useState } from "react";

//Colors
const linen = "#FFF4E9";
const purple_main = "#8D6B94";
const purple_light = "#B185A7";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I am here to help you find a suitable professor. What kind of professor are you looking for?",
    },
  ]);
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    setMessage("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let result = "";

      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }

        const text = decoder.decode(value || new Uint8Array(), {
          stream: true,
        });

        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);

          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });

        return reader.read().then(processText);
      });
    });
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor={linen}
    >
      <Box
        width="100vw"
        height="10vh"
        border="none"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={2}
        bgcolor={purple_main}
        sx={{
          mb:3,
          boxShadow: "1px 1px 1px black"
        }}
      >
        <Box
          width="100vw"
          display="flex"
          alignItems="center"
          justifyContent="left"
        >
          <Typography>*Logo*</Typography>
          <Button
            sx={{
              border: "1px solid black",
              borderRadius: "10px",
              color: "black",
              bgcolor: purple_light,
              mx: 3,
              '&:hover': {
                bgcolor: purple_light,
                transform: "scale(1.1)",
              },
            }}
            href="http://localhost:3000/"
          >
            Dashboard
          </Button>
        </Box>
        <Box
          width="30vw"
          display="flex"
          alignItems="center"
          justifyContent="right"
        >
          <Button
            sx={{
              border: "1px solid black",
              borderRadius: "10px",
              color: "black",
              bgcolor: purple_light,
              mx: 1,
              '&:hover': {
                bgcolor: purple_light,
                transform: "scale(1.1)",
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
              '&:hover': {
                bgcolor: purple_light,
                transform: "scale(1.1)",
              },
            }}
            href="/create-account"
          >
            Create Account
          </Button>
        </Box>    
      </Box>

      <Typography variant="h3" sx={{ fontWeight: "bold", mb:3 }}>
        The Professor Finder
      </Typography>


      <Stack
        direction="column"
        width="500px"
        height="650px"
        border="2px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  message.role === "assistant"
                    ? "primary.main"
                    : "secondary.main"
                }
                color="white"
                p={3}
                borderRadius="40px"
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            fullWidth
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
