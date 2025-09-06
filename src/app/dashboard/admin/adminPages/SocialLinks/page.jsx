"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
} from "@mui/material";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

const iconMap = {
  facebook: <FaFacebookF />,
  twitter: <FaTwitter />,
  instagram: <FaInstagram />,
  linkedin: <FaLinkedinIn />,
  youtube: <FaYoutube />,
};

export default function SocialLinks() {
  const [socialLinks, setSocialLinks] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState("facebook");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const api = "http://${process.env.NEXT_PUBLIC_BASE_URL}/api/social-links";

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(api);
      setSocialLinks(res.data);
    } catch (err) {
      console.error("Error fetching links:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setMessage("URL cannot be empty!");
      setSnackbarOpen(true);
      return;
    }

    try {
      const res = await axios.post(api, {
        icon: selectedIcon,
        url: url.trim(),
      });
      setSocialLinks([...socialLinks, res.data]);
      setUrl("");
      setMessage("Link added!");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error adding link:", err.response?.data || err.message);
      setMessage("Failed to add link.");
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this link?")) return;

    try {
      await axios.delete(`${api}/${id}`);
      setSocialLinks(socialLinks.filter((link) => link._id !== id));
      setMessage("Link deleted!");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error deleting link:", err);
      setMessage("Failed to delete link.");
      setSnackbarOpen(true);
    }
  };

  return (
    <Box sx={{ maxWidth: "1000px", mx: "auto", p: 4 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Social Links Manager
          </Typography>

          {/* Add Form */}
          <Box
            component="form"
            onSubmit={handleAdd}
            sx={{ display: "flex", gap: 2, alignItems: "center", mt: 2 }}
          >
            <Select
              value={selectedIcon}
              onChange={(e) => setSelectedIcon(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              {Object.keys(iconMap).map((key) => (
                <MenuItem key={key} value={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </MenuItem>
              ))}
            </Select>

            <TextField
              label="Enter social link URL"
              variant="outlined"
              fullWidth
              size="small"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <Button type="submit" variant="contained" color="primary">
              Add
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : socialLinks.length === 0 ? (
            <Typography>No links added.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Icon</TableCell>
                    <TableCell>URL</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {socialLinks.map((link, index) => (
                    <TableRow key={link._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{iconMap[link.icon]}</TableCell>
                      <TableCell sx={{ wordBreak: "break-word" }}>
                        {link.url}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(link._id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={message}
      />
    </Box>
  );
}
