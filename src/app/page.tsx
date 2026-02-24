'use client';

import {
  Box,
  Typography,
  Container,
  Button,
  Paper,
  TextField,
  MenuItem,
  Stack,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function Home() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: "url('/rabari_young_couple_marriage.png')", // Ensure this image exists
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.6)",
            zIndex: -1,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 10 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: { xs: '100%', md: '66.66%' }, textAlign: 'center' }}>
              <Typography
                variant="h2"
                component="h1"
                fontWeight={800}
                gutterBottom
                sx={{
                  fontFamily: "var(--font-heading)",
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                }}
              >
                Find Your Perfect <span style={{ color: "#FFD700" }}>Rabari</span>{" "}
                Match
              </Typography>
              <Typography
                variant="h5"
                sx={{ mb: 6, fontWeight: 300, opacity: 0.9 }}
              >
                Join the most trusted matrimony platform for the Rabari community.
              </Typography>

              {/* Quick Search Card */}
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  bgcolor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: 3,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems="center"
                >
                  <TextField
                    select
                    label="I'm looking for"
                    defaultValue="bride"
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="bride">Bride</MenuItem>
                    <MenuItem value="groom">Groom</MenuItem>
                  </TextField>
                  <TextField
                    label="Age From"
                    type="number"
                    defaultValue={21}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="To"
                    type="number"
                    defaultValue={30}
                    fullWidth
                    size="small"
                  />
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{
                      height: "40px",
                      bgcolor: "primary.main",
                      "&:hover": { bgcolor: "primary.dark" },
                    }}
                  >
                    Search
                  </Button>
                </Stack>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Trust Section */}
      <Box sx={{ py: 4, bgcolor: "secondary.main", color: "white" }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 4, textAlign: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                100%
              </Typography>
              <Typography variant="subtitle1">Verified Profiles</Typography>
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                50,000+
              </Typography>
              <Typography variant="subtitle1">Happy Marriages</Typography>
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Safe
              </Typography>
              <Typography variant="subtitle1">Secure & Private</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* How It Works */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h3"
          textAlign="center"
          fontWeight={700}
          gutterBottom
          sx={{ mb: 8, color: "text.primary" }}
        >
          How RabariShaadi Works
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
          {[
            {
              step: "01",
              title: "Sign Up",
              desc: "Create your profile in minutes.",
            },
            {
              step: "02",
              title: "Connect",
              desc: "Browse matches and send requests.",
            },
            {
              step: "03",
              title: "Interact",
              desc: "Chat and meet your life partner.",
            },
          ].map((item, index) => (
            <Box key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: "center",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 4,
                  height: "100%",
                  transition: "transform 0.3s",
                  "&:hover": { transform: "translateY(-5px)", boxShadow: 3 },
                }}
              >
                <Typography
                  variant="h2"
                  fontWeight={800}
                  color="grey.200"
                  sx={{ lineHeight: 1, mb: 2 }}
                >
                  {item.step}
                </Typography>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {item.title}
                </Typography>
                <Typography color="text.secondary">{item.desc}</Typography>
              </Paper>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Trusted by Community */}
      <Box sx={{ bgcolor: "grey.50", py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            textAlign="center"
            fontWeight={700}
            gutterBottom
            sx={{ mb: 6 }}
          >
            Trusted by Community
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
            {[1, 2, 3].map((i) => (
              <Box key={i}>
                <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="body1"
                      sx={{ fontStyle: "italic", mb: 2 }}
                    >
                      "Found my soulmate on RabariShaadi within 2 weeks. The
                      verification process made me feel safe."
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          bgcolor: "primary.light",
                          borderRadius: "50%",
                        }}
                      />
                      <Box>
                        <Typography fontWeight={700}>Ramesh & Geeta</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Married Feb 2024
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* FAQ */}
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Typography
          variant="h3"
          textAlign="center"
          fontWeight={700}
          gutterBottom
          sx={{ mb: 6 }}
        >
          Frequently Asked Questions
        </Typography>
        <Stack spacing={2}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>
                Is profiling free on RabariShaadi?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                Yes, registration and creating a profile is completely free.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>
                How secure is my data?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                We use bank-grade security to protect your data. Your contact
                details are only shared with matches you connect with.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: "text.primary", color: "grey.400", py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 4 }}>
            <Box>
              <Typography variant="h6" color="white" gutterBottom>
                RabariShaadi
              </Typography>
              <Typography variant="body2">
                The No. 1 Matrimony site for the Rabari samaj. Trusted by lakhs.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="white" gutterBottom>
                Company
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">About Us</Typography>
                <Typography variant="body2">Careers</Typography>
                <Typography variant="body2">Contact</Typography>
              </Stack>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="white" gutterBottom>
                Legal
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">Privacy Policy</Typography>
                <Typography variant="body2">Terms of Service</Typography>
              </Stack>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="white" gutterBottom>
                Social
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">Instagram</Typography>
                <Typography variant="body2">Facebook</Typography>
                <Typography variant="body2">Twitter</Typography>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
