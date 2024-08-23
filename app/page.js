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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { createTheme, ThemeProvider } from "@mui/material/styles";

//Colors
const linen = "#FFF4E9";
const dark_blue = "#6d92b4";
const sky_blue = "#94c5f2";
const purple_light = "#baa4be";

const textfieldTheme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          // declare color root vars to use later
          "--TextField-brandBorderColor": purple_light,
          "--TextField-brandBorderHoverColor": purple_light,
          "--TextField-brandBorderFocusedColor": purple_light,
          // use color for text color
          "& .MuiInputBase-input": {
            color: linen,
          },
          // color for border, hover, and focus
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "var(--TextField-brandBorderColor)",
            },
            "&:hover fieldset": {
              borderColor: "var(--TextField-brandBorderHoverColor)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "var(--TextField-brandBorderFocusedColor)",
            },
          },
        },
      },
    },
  },
});

export default function Home() {
  const [message, setMessage] = useState("");
  const [professorsJSON, setProfessorsJSON] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schoolFilter, setSchoolFilter] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState(null);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [ratingError, setRatingError] = useState(false);
  const [numberFilter, setNumberFilter] = useState(null);
  const [numberError, setNumberError] = useState(false);
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
        //console.log("response from client side:", response);
        const data = await response.json();
        //console.log("client metaData:", data);
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
        //console.log("professors:", professorsJSON);
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

  const handleRatingFilter = (e) => {
    const value = e.target.value;

    const numericPattern = /^[0-9]*\.?[0-9]*$/;
    // Check if the value is a valid number and between 1 and 5
    if (
      numericPattern.test(value) &&
      (value === "" || (Number(value) >= 1 && Number(value) <= 5))
    ) {
      // Set the value and remove any error styling
      setRatingFilter(value);
      setRatingError(false);
    } else {
      // Set the error styling if the value is out of range
      setRatingError(true);
    }
  };

  const handleNumberFilter = (e) => {
    const value = e.target.value;

    console.log("value:", value);

    const integerPattern = /^\d+$/; // Matches only whole numbers
    const numericValue = parseInt(value, 10); // Convert to integer

    // Check if the value is a valid number
    if (
      (integerPattern.test(value) && numericValue >= 1 && numericValue <= 10) ||
      value === ""
    ) {
      // Set the value and remove any error styling
      setNumberFilter(value);
      setNumberError(false);
    } else {
      // Set the error styling if the value is out of range
      setNumberError(true);
    }
  };

  const handleSchoolFilter = (event, newValue) => {
    // Only update the state if the newValue is valid
    if (schools.includes(newValue)) {
      setSchoolFilter(newValue);
    } else {
      setSchoolFilter(""); // Optionally clear the input if invalid
    }
  };

  const handleSubjectFilter = (event, newValue) => {
    // Only update the state if the newValue is valid
    if (subjects.includes(newValue)) {
      setSubjectFilter(newValue);
    } else {
      setSubjectFilter(""); // Optionally clear the input if invalid
    }
  };

  return (
    <Box
      width="100vw"
      height="auto"
      display="flex"
      flexDirection="column"
      alignItems="center"
      py={2}
      px={1}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="center"
        mb={2}
      >
        <Typography
          variant="h4"
          textAlign="center"
          sx={{
            fontFamily: "BlinkMacSystemFont",
            color: "white",
            textShadow: "1px 1px black",
            fontSize: "1.5rem",
          }}
        >
          The Professor Finder
        </Typography>
      </Stack>

      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        p={2}
      >
        <Typography
          variant="h5"
          textAlign="center"
          sx={{
            fontFamily: "BlinkMacSystemFont",
            color: "white",
            fontSize: "1.25rem",
            mb: 2,
          }}
        >
          Find The <u>Perfect</u> Professor For You
        </Typography>
        <Stack
          direction="column"
          width="90%"
          maxWidth="600px"
          border="none"
          borderRadius="10px"
          p={2}
          bgcolor={sky_blue}
          mb={4}
          boxShadow="2px 2px gray"
        >
          <Stack direction="column" spacing={2}>
            <Box
              bgcolor="white"
              display="flex"
              flexDirection="column"
              p={1}
              borderRadius="5px"
            >
              <TextField
                multiline
                rows={3}
                placeholder="Please describe the type of professor you are looking for."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                variant="filled"
                color="secondary"
                fullWidth
                sx={{ mb: 1 }}
              />
              <Button
                sx={{
                  height: "40px",
                  color: "black",
                  bgcolor: dark_blue,
                  px: 2,
                  border: "1px solid black",
                  borderRadius: "100px",
                  boxShadow: "1px 1px 1px black",
                  fontWeight: "bold",
                  "&:hover": {
                    bgcolor: linen,
                    transform: "scale(1.05)",
                  },
                }}
                onClick={sendMessage}
              >
                Search
              </Button>
            </Box>

            <Typography
              textAlign="center"
              sx={{
                textDecoration: "underline",
                fontWeight: "bold",
                mb: 1,
              }}
            >
              Filters
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography>School</Typography>
                <Autocomplete
                  options={schools}
                  value={schoolFilter || ""}
                  onInputChange={handleSchoolFilter}
                  renderInput={(params) => (
                    <Box
                      bgcolor="white"
                      border="1px solid black"
                      borderRadius="5px"
                    >
                      <ThemeProvider theme={textfieldTheme}>
                        <TextField
                          {...params}
                          placeholder="Ex. Choose a school from the list"
                          inputMode="text"
                          sx={{ "& input::placeholder": { color: "black" } }}
                        />
                      </ThemeProvider>
                    </Box>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>Subject</Typography>
                <Autocomplete
                  options={subjects}
                  value={subjectFilter || ""}
                  onInputChange={handleSubjectFilter}
                  renderInput={(params) => (
                    <Box
                      bgcolor="white"
                      border="1px solid black"
                      borderRadius="5px"
                    >
                      <ThemeProvider theme={textfieldTheme}>
                        <TextField
                          {...params}
                          placeholder="Ex. Choose a subject from the list"
                          inputMode="text"
                          sx={{ "& input::placeholder": { color: "black" } }}
                        />
                      </ThemeProvider>
                    </Box>
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography>Minimum Rating (1-5)</Typography>
                <ThemeProvider theme={textfieldTheme}>
                  <Box
                    bgcolor="white"
                    border="1px solid black"
                    borderRadius="5px"
                  >
                    <TextField
                      error={ratingError}
                      helperText={
                        ratingError
                          ? "Invalid rating. Please enter a number between 1 and 5."
                          : ""
                      }
                      placeholder="Ex: 3.6"
                      value={ratingFilter || ""}
                      inputMode="decimal"
                      onChange={handleRatingFilter}
                      sx={{ "& input::placeholder": { color: "black" } }}
                    />
                  </Box>
                </ThemeProvider>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography># of results</Typography>
                <ThemeProvider theme={textfieldTheme}>
                  <Box
                    bgcolor="white"
                    border="1px solid black"
                    borderRadius="5px"
                  >
                    <TextField
                      error={numberError}
                      helperText={
                        numberError
                          ? "Invalid number. Please enter a number between 1 and 10."
                          : ""
                      }
                      placeholder="Ex: 3"
                      value={numberFilter || ""}
                      inputMode="numeric"
                      onChange={handleNumberFilter}
                      sx={{ "& input::placeholder": { color: "black" } }}
                    />
                  </Box>
                </ThemeProvider>
              </Grid>
            </Grid>
          </Stack>
        </Stack>

        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 3,
            }}
          >
            <CircularProgress size={35} sx={{ color: dark_blue }} />
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
    </Box>
  );
}
