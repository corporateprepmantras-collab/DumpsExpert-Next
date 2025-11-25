// Update student profile
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.put("/api/student/profile", {
      id: "507f1f77bcf86cd799439011", // Student ID
      firstName: "John",
      lastName: "Doe",
      phone: "9876543210",
      bio: "Computer Science student",
      skills: ["React", "Node.js", "MongoDB"],
      cgpa: 8.5,
    });

    console.log("✅ Success:", response.data);
  } catch (error) {
    console.error("❌ Error:", error.response?.data);
  }
};
