"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Paper,
  Snackbar,
  Divider,
} from "@mui/material";

const defaultSchemaPlaceholder = `{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Your Page Title",
  "url": "https://example.com/your-page"
}`;

const pages = ["home", "about", "blog", "sap", "contact"];

const fields = [
  { name: "Title", label: "Meta Title" },
  { name: "Keywords", label: "Meta Keywords" },
  { name: "Description", label: "Meta Description", textarea: true },

  { name: "OgTitle", label: "OG Title" },
  { name: "OgDescription", label: "OG Description", textarea: true },
  { name: "OgImage", label: "OG Image URL" },
  { name: "OgUrl", label: "OG URL" },

  { name: "TwitterTitle", label: "Twitter Title" },
  { name: "TwitterDescription", label: "Twitter Description", textarea: true },
  { name: "TwitterImage", label: "Twitter Image URL" },
  { name: "TwitterCard", label: "Twitter Card Type" },

  { name: "CanonicalUrl", label: "Canonical URL" },
  { name: "Schema", label: "JSON-LD Schema", textarea: true },
];

export default function SEOMetaInfo() {
  const [activeTab, setActiveTab] = useState("home");
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // ✅ Fetch SEO data when switching tabs
  useEffect(() => {
    const fetchSEO = async () => {
      try {
        const res = await axios.get(`/api/seo/${activeTab}`);
        const data = res.data || {};
        const newValues = {};
        fields.forEach((field) => {
          newValues[`${activeTab}${field.name}`] =
            data[field.name.toLowerCase()] || "";
        });
        setFormValues((prev) => ({ ...prev, ...newValues }));
      } catch (err) {
        console.warn(`No SEO data found for ${activeTab}`);
        const emptyValues = {};
        fields.forEach((field) => {
          emptyValues[`${activeTab}${field.name}`] =
            field.name === "Schema" ? defaultSchemaPlaceholder : "";
        });
        setFormValues((prev) => ({ ...prev, ...emptyValues }));
      }
    };
    fetchSEO();
  }, [activeTab]);

  const handleChange = (name, value) => {
    setFormValues((prev) => ({
      ...prev,
      [`${activeTab}${name}`]: value,
    }));
  };

  // ✅ Save SEO data
  const handleSend = async () => {
    try {
      setLoading(true);

      const formData = {};
      fields.forEach((field) => {
        const key = `${activeTab}${field.name}`;
        formData[field.name.toLowerCase()] = formValues[key] || "";
      });

      await axios.post(`/api/seo/${activeTab}`, formData);

      setSnackbarMsg(`SEO data for ${activeTab} saved successfully!`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error sending SEO data:", error);
      setSnackbarMsg("Failed to send SEO data");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFormatJSON = () => {
    const key = `${activeTab}Schema`;
    try {
      const parsed = JSON.parse(formValues[key] || "{}");
      setFormValues((prev) => ({
        ...prev,
        [key]: JSON.stringify(parsed, null, 2),
      }));
    } catch {
      setSnackbarMsg("Invalid JSON format. Cannot format.");
      setSnackbarOpen(true);
    }
  };

  return (
    <Box sx={{ maxWidth: "900px", mx: "auto", mt: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          SEO Meta Information
        </Typography>

        {/* Tabs for Pages */}
        <Tabs
          value={activeTab}
          onChange={(e, newVal) => setActiveTab(newVal)}
          sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
        >
          {pages.map((page) => (
            <Tab
              key={page}
              value={page}
              label={`${page.charAt(0).toUpperCase() + page.slice(1)} Page`}
            />
          ))}
        </Tabs>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Basic SEO */}
          <Typography variant="h6">Basic SEO</Typography>
          {fields.slice(0, 3).map((field) => (
            <TextField
              key={field.name}
              label={field.label}
              value={formValues[`${activeTab}${field.name}`] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              fullWidth
              multiline={field.textarea}
              rows={field.textarea ? 4 : 1}
            />
          ))}

          <Divider />

          {/* Open Graph */}
          <Typography variant="h6">Open Graph</Typography>
          {fields.slice(3, 7).map((field) => (
            <TextField
              key={field.name}
              label={field.label}
              value={formValues[`${activeTab}${field.name}`] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              fullWidth
              multiline={field.textarea}
              rows={field.textarea ? 3 : 1}
            />
          ))}

          <Divider />

          {/* Twitter */}
          <Typography variant="h6">Twitter Card</Typography>
          {fields.slice(7, 11).map((field) =>
            field.name === "TwitterCard" ? (
              <Select
                key={field.name}
                value={
                  formValues[`${activeTab}${field.name}`] ||
                  "summary_large_image"
                }
                onChange={(e) => handleChange(field.name, e.target.value)}
                fullWidth
              >
                <MenuItem value="summary">Summary</MenuItem>
                <MenuItem value="summary_large_image">
                  Summary Large Image
                </MenuItem>
                <MenuItem value="app">App</MenuItem>
                <MenuItem value="player">Player</MenuItem>
              </Select>
            ) : (
              <TextField
                key={field.name}
                label={field.label}
                value={formValues[`${activeTab}${field.name}`] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                fullWidth
                multiline={field.textarea}
                rows={field.textarea ? 3 : 1}
              />
            )
          )}

          <Divider />

          {/* Additional SEO */}
          <Typography variant="h6">Additional SEO</Typography>
          {fields.slice(11).map((field) => (
            <Box
              key={field.name}
              sx={{ display: "flex", flexDirection: "column", gap: 1 }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography>{field.label}</Typography>
                {field.name === "Schema" && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={handleFormatJSON}
                  >
                    Format JSON
                  </Button>
                )}
              </Box>
              <TextField
                value={
                  formValues[`${activeTab}${field.name}`] ||
                  (field.name === "Schema" ? defaultSchemaPlaceholder : "")
                }
                onChange={(e) => handleChange(field.name, e.target.value)}
                fullWidth
                multiline
                rows={field.name === "Schema" ? 8 : 4}
                sx={{
                  fontFamily: field.name === "Schema" ? "monospace" : "inherit",
                }}
              />
            </Box>
          ))}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? "Sending..." : "Save SEO Info"}
          </Button>
        </Box>
      </Paper>

      {/* Snackbar for success/error */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMsg}
      />
    </Box>
  );
}
