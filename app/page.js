"use client";
import {
  Container,
  Box,
  Stack,
  Dialog,
  TextField,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import ProfCard from "./Components/profcard.js"

//Colors
const linen = "#FFF4E9";
const purple_dark = "#8D6B94";
const purple_mid = "#B185A7";
const purple_light = "#baa4be";

export default function Home() {
  const [message, setMessage] = useState("");
  const [professorsJSON, setProfessorsJSON] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: { role: "user", content: message },
          // These are the filters for the query. They are hardcoded for now but they should be rendered from the user input.
          filters: {},
        }),
      }).then(async (response) => {
        const data = await response.json();
        await setProfessorsJSON(data.professors) // get array of professors from json data
      }) 
    } catch (er) {
      console.error("error in fetching data: " + er);
    } finally {
      setLoading(false);
    }
  };
    
      // const reader = response.body.getReader();
      // const decoder = new TextDecoder();

      // let result = "";

      // return reader.read().then(function processText({ done, value }) {
      //   if (done) {
      //     return result;
      //   }

      //   const text = decoder.decode(value || new Uint8Array(), {
      //     stream: true,
      //   });

      //   setMessages((messages) => {
      //     let lastMessage = messages[messages.length - 1];
      //     let otherMessages = messages.slice(0, messages.length - 1);

      //     console.log("lastMessage: " + lastMessage)
      //     console.log("otherMessages: " + otherMessages)

      //     return [
      //       ...otherMessages,
      //       {
      //         ...lastMessage,
      //         content: lastMessage.content + text,
      //       },
      //     ];
      //   });

      //   return reader.read().then(processText);
      // });

  return (
    <Box minHeight="100vh" display="flex" bgcolor={linen}>
      <Container width="100xw">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          mt={5}
          mb={15}
        >
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 3 }}>
            The Professor Finder
          </Typography>

          <Stack
            direction="column"
            width="700px"
            border="2px solid black"
            borderRadius="10px"
            p={3}
            spacing={3}
            bgcolor={purple_mid}
            mb={8}
          >
            <Stack direction="row" alignItems="center" spacing={3}>
              <Box bgcolor="white" display="flex" flexGrow={1}>
                <TextField
                  multiline
                  rows={3}
                  placeholder="Please describe the type of professor you are looking for."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  variant="filled"
                  color="secondary"
                  fullWidth
                />
              </Box>
              <Button
                sx={{
                  height: "50px",
                  color: "black",
                  bgcolor: purple_dark,
                  px: 3,
                  border: "1px solid black",
                  borderRadius: "100px",
                  boxShadow: "1px 1px 1px black",
                  '&:hover': {
                    bgcolor: linen,
                    transform: "scale(1.1)"
                  }
                }}
                onClick={sendMessage}
                onChange={(e) => setMessage(e.target.value)}
              >
                Search
              </Button>
            </Stack>
          </Stack>
          {loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: 6,
              }}
            >
              <CircularProgress
                size={45}
                color={purple_dark}
              />
            </Box>
          )}
          {professorsJSON.map((professor) => (
            <ProfCard name={professor.professor} subject={professor.subject} stars={professor.rating} summary={professor.summary} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
