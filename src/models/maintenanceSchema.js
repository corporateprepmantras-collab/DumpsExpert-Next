import mongoose, { Schema } from "mongoose";

const maintenanceSchema = new Schema(
  {
    maintenanceMode: { type: Boolean, default: false },
    maintenanceText: {
      type: String,
      default: "We are upgrading our site. We will come back soon.\nPlease stay with us.\nThank you.",
    },
    imageUrl: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
  },
  { timestamps: true }
);

const Maintenance =
  mongoose.models.Maintenance || mongoose.model("Maintenance", maintenanceSchema);

export default Maintenance;
