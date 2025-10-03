import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema(
  {
    active: { type: Boolean, default: false },
    delay: { type: Number, default: 2.0 },
    imageUrl: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
  },
  { timestamps: true }
);

const Announcement =
  mongoose.models.Announcement ||
  mongoose.model("Announcement", AnnouncementSchema);

export default Announcement;
