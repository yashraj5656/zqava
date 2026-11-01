import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Party from "@/models/Party";
import { getSession } from "@/lib/auth";

/* =========================================================
   GET /api/parties/[id]
   ========================================================= */
export async function GET(_request, { params }) {
  try {
    await connectDB();

    // 🔑 Next 15: params is a Promise
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Party not found." },
        { status: 404 }
      );
    }

    const party = await Party.findById(id)
      .populate({
        path: "hostId",
        select: "name profilePhoto city",
        options: { strictPopulate: false },
      })
      .lean();

    if (!party) {
      return NextResponse.json(
        { success: false, message: "Party not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, party });
  } catch (err) {
    console.error("GET /api/parties/[id]:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load party." },
      { status: 500 }
    );
  }
}

/* =========================================================
   PATCH /api/parties/[id]
   ========================================================= */
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    // 🔑 Next 15: params is a Promise
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Party not found." },
        { status: 404 }
      );
    }

    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const party = await Party.findById(id);
    if (!party) {
      return NextResponse.json(
        { success: false, message: "Party not found." },
        { status: 404 }
      );
    }

    // hostId is a raw ObjectId here (no populate) — safe to stringify
    if (String(party.hostId) !== String(session.userId)) {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const allowed = [
      "title",
      "description",
      "category",
      "city",
      "venue",
      "coverImage",
      "date",
      "startTime",
      "endTime",
      "ticketPrice",
      "totalTickets",
      "maxGuestsPerBooking",
      "ageLimit",
      "tags",
      "status",
    ];

    for (const key of allowed) {
      if (!(key in body)) continue;

      // Guard: can't drop totalTickets below tickets already sold
      if (key === "totalTickets") {
        const next = Number(body[key]);
        if (next < (party.ticketsSold || 0)) {
          return NextResponse.json(
            {
              success: false,
              message: `Cannot reduce below ${party.ticketsSold} tickets already sold.`,
            },
            { status: 400 }
          );
        }
        party.totalTickets = next;
        continue;
      }

      if (key === "date") {
        const d = new Date(body.date);
        if (isNaN(d)) {
          return NextResponse.json(
            { success: false, message: "Invalid date." },
            { status: 400 }
          );
        }
        party.date = d;
        continue;
      }

      if (
        ["ticketPrice", "maxGuestsPerBooking", "ageLimit"].includes(key)
      ) {
        party[key] = Number(body[key]);
        continue;
      }

      if (key === "tags") {
        party.tags = Array.isArray(body.tags)
          ? body.tags
              .filter((t) => typeof t === "string")
              .map((t) => t.trim())
              .filter(Boolean)
              .slice(0, 8)
          : [];
        continue;
      }

      party[key] = body[key];
    }

    await party.save();
    return NextResponse.json({ success: true, party });
  } catch (err) {
    console.error("PATCH /api/parties/[id]:", err);
    return NextResponse.json(
      { success: false, message: "Update failed." },
      { status: 500 }
    );
  }
}