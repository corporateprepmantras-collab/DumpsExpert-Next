"use client";

import { useState, useEffect } from "react";
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
  Snackbar,
} from "@mui/material";
import {
  FaEdit,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaExpandArrowsAlt,
  FaCheck,
  FaPlus,
  FaSyncAlt,
} from "react-icons/fa";

export default function MenuBuilder() {
  const [mainMenu, setMainMenu] = useState([]);
  const [premadeMenu, setPremadeMenu] = useState([]);
  const [newItem, setNewItem] = useState({ text: "", url: "", target: "_self" });
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Fetch menu data on load
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await axios.get("http://${process.env.NEXT_PUBLIC_BASE_URL}/api/menu-builder");
        setMainMenu(res.data.mainMenu || []);
        setPremadeMenu(res.data.premadeMenu || []);
      } catch (err) {
        console.error("Error fetching menu:", err);
      }
    };
    fetchMenus();
  }, []);

  const handleAddMenu = async () => {
    if (!newItem.text || !newItem.url) {
      setMessage("Text and URL are required");
      setOpenSnackbar(true);
      return;
    }

    const userId = localStorage.getItem("userId");
    try {
      const res = await axios.post("http://${process.env.NEXT_PUBLIC_BASE_URL}/api/menu-builder/add", {
        type: "mainMenu",
        item: newItem,
        userId,
      });
      setMainMenu(res.data.data.mainMenu);
      setNewItem({ text: "", url: "", target: "_self" });
      setMessage("Menu item added!");
      setOpenSnackbar(true);
    } catch (err) {
      console.error(err);
      setMessage("Failed to add menu item");
      setOpenSnackbar(true);
    }
  };

  const handleUpdateMenu = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setMessage("Missing userId in localStorage.");
      setOpenSnackbar(true);
      return;
    }

    try {
      await axios.put("http://${process.env.NEXT_PUBLIC_BASE_URL}/api/menu-builder", {
        mainMenu,
        premadeMenu,
        userId,
      });
      setMessage("Menu updated!");
      setOpenSnackbar(true);
    } catch (err) {
      console.error(err);
      setMessage("Failed to update menu");
      setOpenSnackbar(true);
    }
  };

  const handleDeleteItem = (index) => {
    const updated = [...mainMenu];
    updated.splice(index, 1);
    setMainMenu(updated);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          borderBottom: "1px solid #ddd",
          pb: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Menu Builder
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateMenu}
          >
            Update Main Menu
          </Button>
          <Select size="small" defaultValue="English">
            <MenuItem value="English">English</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {/* Add/Edit Form */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add/Edit/Update Area
              </Typography>

              <TextField
                label="Text"
                fullWidth
                value={newItem.text}
                onChange={(e) => setNewItem({ ...newItem, text: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                label="URL"
                fullWidth
                value={newItem.url}
                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Select
                fullWidth
                value={newItem.target}
                onChange={(e) => setNewItem({ ...newItem, target: e.target.value })}
                sx={{ mb: 2 }}
              >
                <MenuItem value="_self">_self</MenuItem>
                <MenuItem value="_blank">_blank</MenuItem>
              </Select>

              <Box display="flex" gap={2} mt={2}>
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<FaSyncAlt />}
                  onClick={handleUpdateMenu}
                >
                  Update Menu
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FaPlus />}
                  onClick={handleAddMenu}
                >
                  Add Menu
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Menu */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Main Menu Area
              </Typography>
              {mainMenu.map((item, idx) => (
                <Box
                  key={idx}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={1}
                  mb={1}
                  sx={{ border: "1px solid #ddd", borderRadius: 1 }}
                >
                  <Typography>{item.text}</Typography>
                  <Box display="flex" gap={1}>
                    <IconButton size="small" color="default">
                      <FaArrowUp />
                    </IconButton>
                    <IconButton size="small" color="default">
                      <FaArrowDown />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <FaExpandArrowsAlt />
                    </IconButton>
                    <IconButton size="small" color="success">
                      <FaCheck />
                    </IconButton>
                    <IconButton size="small" color="secondary">
                      <FaEdit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteItem(idx)}
                    >
                      <FaTrash />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Pre-Made Menu */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pre-Made Menu Area
              </Typography>
              {premadeMenu.map((item, idx) => (
                <Box
                  key={idx}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={1}
                  mb={1}
                  sx={{ border: "1px solid #ddd", borderRadius: 1 }}
                >
                  <Typography>{item.text}</Typography>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<FaPlus />}
                    onClick={() => setMainMenu([...mainMenu, item])}
                  >
                    Add
                  </Button>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar for messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={message}
      />
    </Box>
  );
}
