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
  Grid,
  Item,
  Autocomplete,
} from "@mui/material";
import { useEffect, useState } from "react";
import ProfCard from "./Components/profcard.js";
import FilterTextField from "./Components/filtertextfield.js";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonSearchIcon from '@mui/icons-material/PersonSearch';


//Colors
const linen = "#FFF4E9";
const dark_blue = "#6d92b4";
const sky_blue = "#94c5f2";
const purple_light = "#baa4be";

export default function Home() {
  const [message, setMessage] = useState("");
  const [professorsJSON, setProfessorsJSON] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schoolFilter, setSchoolFilter] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState(null);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [numberFilter, setNumberFilter] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [schools, setSchools] = useState([]);

  const updateFields = async () => {
    try {
      const response = await fetch("/api/pinecone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "hello" }),
      }).then(async (response) => {
        console.log("response from client side:", response);
        const data = await response.json();
        console.log("client metaData:", data);
        setSchools(data.schools);
        setSubjects(data.subjects);
      });
    } catch (error) {
      console.error("error in fetching data: ", error);
    }
  };

  useEffect(() => {
    updateFields();
  }, []);

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
          filters: {
            ...(schoolFilter && { school: schoolFilter }),
            ...(subjectFilter && { subject: subjectFilter }),
            ...(ratingFilter && { rating: parseFloat(ratingFilter) }),
            ...(numberFilter && { number: parseInt(numberFilter) }),
          },
        }),
      }).then(async (response) => {
        const data = await response.json();
        await setProfessorsJSON(data.professors); // get array of professors from json data
        console.log("professors:", professorsJSON);
      });
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
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      bgcolor={linen}
      sx={{
        backgroundImage: 'url(https://wallpaperset.com/w/full/0/6/c/517269.jpg)',
        backgroundSize: 'contain'
      }}
    >
      {/* <Container
        width="100xw"
      > */}
        <Box
          width="100vw"
          height="100vh"
          display="flex"
          flexDirection="column"
          alignItems="center"
          // justifyContent="center"
          py={25}
        >

          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
            <Typography
              variant="h1"
              textAlign="center"
              sx={{
                fontFamily: 'BlinkMacSystemFont',
                mb: 3,
                color: "white",
                textShadow: "1px 1px black"
              }}
            >
              The Professor Finder
            </Typography>
          </Stack>
        </Box>
        <Box
          width="100vw"
          height="100vh"
          bgcolor="black"
          display="flex"
          flexDirection="column"
          alignItems="center"
          p={5}
        >
          <Typography
            variant="h2"
            textAlign="center"
            sx={{
              fontFamily: 'BlinkMacSystemFont',
              mt: 8,
              mb: 4,
              color: "white",
            }}
          >
            Find The <u>Perfect</u> Professor For You
          </Typography>
          <Stack
            direction="column"
            width="700px"
            border="none"
            borderRadius="10px"
            p={3}
            // spacing={3}
            bgcolor={sky_blue}
            mb={8}
            boxShadow="10px 10px gray"
          >
            <Stack direction="row" alignItems="center" spacing={3} mb={2}>
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
                  bgcolor: dark_blue,
                  px: 3,
                  border: "1px solid black",
                  borderRadius: "100px",
                  boxShadow: "1px 1px 1px black",
                  fontWeight: "bold",
                  "&:hover": {
                    bgcolor: linen,
                    transform: "scale(1.1)",
                  },
                }}
                onClick={sendMessage}
                onChange={(e) => setMessage(e.target.value)}
              >
                Search
              </Button>
            </Stack>
            <Typography
              mb={0}
              textAlign="center"
              sx={{
                textDecoration: "underline",
                fontWeight: "bold"
              }}
            >
              Filters
            </Typography>
            <Grid container>
              <Grid item xs={7} mr={1} mb={1}>
                <Typography>School</Typography>
                <Autocomplete
                  freeSolo
                  options={schools}
                  value={schoolFilter || ""}
                  onInputChange={(event, newValue) => setSchoolFilter(newValue)}
                  renderInput={(params) => (
                    <Box bgcolor="white" border="1px solid black" borderRadius="5px">
                      <TextField
                        {...params}
                        sx={{'& input::placeholder': {
                          color: 'black', // Set your desired color here
                        }}}
                        placeholder="Ex. Stanford"
                        inputMode="text"
                      />
                    </Box>
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <Typography>Subject</Typography>
                <Autocomplete
                  freeSolo
                  options={subjects}
                  value={subjectFilter || ""}
                  onInputChange={(event, newValue) =>
                    setSubjectFilter(newValue)
                  }
                  renderInput={(params) => (
                    <Box bgcolor="white" border="1px solid black" borderRadius="5px">
                      <TextField
                        {...params}
                        sx={{'& input::placeholder': {
                          color: 'black', // Set your desired color here
                        }}}
                        placeholder="Ex. Math"
                        inputMode="text"
                      />
                    </Box>
                  )}
                />
              </Grid>
              <Grid item xs={5} mr={1}>
                <Typography>Minimum Rating (1-5)</Typography>
                <Autocomplete
                    freeSolo
                    value={ratingFilter || ""}
                    onInputChange={(event, newValue) =>
                      setRatingFilter(newValue)
                    }
                    renderInput={(params) => (
                      <Box bgcolor="white" border="1px solid black" borderRadius="5px">
                        <TextField
                          {...params}
                          sx={{'& input::placeholder': {
                            color: 'black', // Set your desired color here
                          }}}
                          placeholder="Ex. 3.6"
                          inputMode="decimal"
                        />
                      </Box>
                    )}
                  />
                {/* <Typography>Minimum Rating (1-5)</Typography>
                <Box bgcolor="white" border="1px solid black" borderRadius="5px">
                  <FilterTextField
                  sx={{'& input::placeholder': {
                    color: 'black', // Set your desired color here
                  }}}
                    placeholder="Ex. 3.6"
                    value={ratingFilter || ""}
                    inputMode={"decimal"}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    
                  />
                </Box> */}
              </Grid>
              <Grid item xs={5}>
                <Typography># of Results</Typography>
                <Autocomplete
                  freeSolo
                  value={numberFilter || ""}
                  onInputChange={(event, newValue) =>
                    setNumberFilter(newValue)
                  }
                  renderInput={(params) => (
                    <Box bgcolor="white" border="1px solid black" borderRadius="5px">
                      <TextField
                        {...params}
                        sx={{'& input::placeholder': {
                          color: 'black', // Set your desired color here
                        }}}
                        placeholder="Ex. 3"
                        inputMode="numeric"
                      />
                    </Box>
                  )}
                />
                {/* <FilterTextField
                  sx={{
                    "& input::placeholder": {
                      color: "white", // Set your desired color here
                    },
                  }}
                  placeholder="4"
                  value={numberFilter || ""}
                  inputMode={"numeric"}
                  onChange={(e) => setNumberFilter(e.target.value)}
                  
                /> */}
              </Grid>
            </Grid>
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
              <CircularProgress size={45} sx={{ color: dark_blue }} />
            </Box>
          )}
          {professorsJSON.map((professor) => (
            <ProfCard
              key={professor.professor}
              link={professor.link}
              name={professor.professor}
              subject={professor.subject}
              rating={professor.rating}
              summary={professor.summary}
            />
          ))}
        </Box>
      {/* </Container> */}
    </Box>
  );
}