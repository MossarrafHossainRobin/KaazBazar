import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  uid: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  photoURL: { 
    type: String, 
    default: "" 
  },
  provider: { 
    type: String, 
    enum: ["google", "facebook", "email"], 
    required: true 
  },
  role: { 
    type: String, 
    enum: ["user", "provider", "admin"], 
    default: "user" 
  },
  phone: { 
    type: String, 
    default: "" 
  },
  address: { 
    type: String, 
    default: "" 
  },
  city: { 
    type: String, 
    default: "" 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  listings: { 
    type: Number, 
    default: 0 
  },
  totalJobs: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLogin: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.models.User || mongoose.model("User", UserSchema);