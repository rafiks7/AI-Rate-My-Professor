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
import { createTheme, ThemeProvider } from "@mui/material/styles";

//Colors
const linen = "#FFF4E9";
const purple_dark = "#8D6B94";
const purple_mid = "#B185A7";
const purple_light = "#baa4be";

const textfieldTheme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          // declare color root vars to use later
          "--TextField-brandBorderColor": purple_dark,
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
            <Grid container>
              <Grid item xs={7} mr={1} mb={1}>
                <Typography>School</Typography>
                <Autocomplete
                  options={schools}
                  value={schoolFilter || ""}
                  onInputChange={handleSchoolFilter}
                  renderInput={(params) => (
                    <ThemeProvider theme={textfieldTheme}>
                      <TextField
                        {...params}
                        sx={{
                          "& input::placeholder": {
                            color: "white", // Set your desired color here
                          },
                        }}
                        placeholder="Choose a school from the list"
                        inputMode="text"
                      />
                    </ThemeProvider>
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <Typography>Subject</Typography>
                <Autocomplete
                  options={subjects}
                  value={subjectFilter || ""}
                  onInputChange={handleSubjectFilter}
                  renderInput={(params) => (
                    <ThemeProvider theme={textfieldTheme}>
                      <TextField
                        {...params}
                        sx={{
                          "& input::placeholder": {
                            color: "white", // Set your desired color here
                          },
                        }}
                        placeholder="Choose a subject from the list"
                        inputMode="text"
                      />
                    </ThemeProvider>
                  )}
                />
              </Grid>
              <Grid item xs={5}>
                <Typography>Rating (1-5)</Typography>
                <ThemeProvider theme={textfieldTheme}>
                  <TextField
                    error={ratingError}
                    helperText={
                      ratingError
                        ? "Invalid rating. Please enter a number between 1 and 5."
                        : ""
                    } // Optional helper text
                    sx={{
                      "& input::placeholder": {
                        color: "white",
                      },
                    }}
                    placeholder="3.6"
                    value={ratingFilter || ""}
                    inputMode={"decimal"}
                    onChange={handleRatingFilter}
                  />
                </ThemeProvider>
              </Grid>
              <Grid item xs={5}>
                <Typography># of results</Typography>
                <ThemeProvider theme={textfieldTheme}>
                  <TextField
                    error={numberError}
                    helperText={
                      numberError
                        ? "Invalid number. Please enter a number between 1 and 10."
                        : ""
                    } // Optional helper text
                    sx={{
                      "& input::placeholder": {
                        color: "white", // Set your desired color here
                      },
                    }}
                    placeholder="3"
                    value={numberFilter || ""}
                    inputMode={"numeric"}
                    onChange={(e) => handleNumberFilter(e)}
                  />
                </ThemeProvider>
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
              <CircularProgress size={45} sx={{ color: purple_dark }} />
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
      </Container>
    </Box>
  );
}
