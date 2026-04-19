import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const { uid, name, email, photoURL, provider } = await request.json();

    if (!uid || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await User.findOne({ uid });

    if (!user) {
      // Create new user
      user = new User({
        uid,
        name: name || email.split("@")[0],
        email,
        photoURL: photoURL || "",
        provider,
        listings: 0,
        totalJobs: 0,
        lastLogin: new Date()
      });
      await user.save();
      console.log("New user created in MongoDB:", email);
    } else {
      // Update existing user
      user.lastLogin = new Date();
      if (photoURL && !user.photoURL) {
        user.photoURL = photoURL;
      }
      await user.save();
      console.log("User updated in MongoDB:", email);
    }

    // Return user data (exclude sensitive info)
    const userData = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      role: user.role,
      phone: user.phone,
      address: user.address,
      city: user.city,
      listings: user.listings,
      totalJobs: user.totalJobs,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    return NextResponse.json({ success: true, user: userData });
    
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}