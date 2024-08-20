import { SignIn, SignedIn, SignedOut } from "@clerk/nextjs";
import { Box, Button, Typography } from "@mui/material";

const linen = "#FFF4E9";
const purple_main = "#8D6B94";
const purple_light = "#B185A7";

export default function SignInPage() {
  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
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
          mb: 3,
          boxShadow: "1px 1px 1px black",
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
              "&:hover": {
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
              "&:hover": {
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
              "&:hover": {
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
      <SignIn />
    </Box>
  );
}
