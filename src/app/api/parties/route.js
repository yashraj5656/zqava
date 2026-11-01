import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Party from "@/models/Party";
import { getSession } from "@/lib/auth";

/* =========================================================
   GET /api/parties
   ========================================================= */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const city = searchParams.get("city") || "";
    const category = searchParams.get("category") || "";
    const search = (searchParams.get("search") || "").toLowerCase();
    const sort = searchParams.get("sort") || "soonest";

    // Local-midnight of today (works for any timezone)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Sold-out parties stay visible — we show them with a badge
    const query = {
      status: { $in: ["live", "sold_out"] },
      date: { $gte: startOfToday },
    };

    if (city) query.city = city;
    if (category) query.category = category;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = { date: 1 };
    if (sort === "newest") sortOption = { createdAt: -1 };
    if (sort === "price-low") sortOption = { ticketPrice: 1 };
    if (sort === "price-high") sortOption = { ticketPrice: -1 };

    const parties = await Party.find(query)
      .sort(sortOption)
      .limit(100)
      .populate({ path: "hostId", select: "name profilePhoto" })
      .lean();

    return NextResponse.json({ success: true, parties });
  } catch (err) {
    console.error("GET /api/parties:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load parties." },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST /api/parties
   ========================================================= */
export async function POST(request) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const required = [
      "title",
      "description",
      "city",
      "venue",
      "date",
      "startTime",
      "endTime",
    ];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required.` },
          { status: 400 }
        );
      }
    }

    if (Number(body.ticketPrice) < 0) {
      return NextResponse.json(
        { success: false, message: "Price cannot be negative." },
        { status: 400 }
      );
    }

    if (Number(body.totalTickets) < 1) {
      return NextResponse.json(
        { success: false, message: "At least 1 ticket required." },
        { status: 400 }
      );
    }

    const partyDate = new Date(body.date);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (isNaN(partyDate)) {
      return NextResponse.json(
        { success: false, message: "Invalid date." },
        { status: 400 }
      );
    }

    if (partyDate < startOfToday) {
      return NextResponse.json(
        { success: false, message: "Party date must be today or later." },
        { status: 400 }
      );
    }

    const cleanTags = Array.isArray(body.tags)
      ? body.tags
          .filter((t) => typeof t === "string")
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 8)
      : [];

    const party = await Party.create({
      hostId: session.userId,
      title: body.title,
      description: body.description,
      category: body.category || "House Party",
      city: body.city,
      venue: body.venue,
      coverImage: body.coverImage || "",
      date: partyDate,
      startTime: body.startTime,
      endTime: body.endTime,
      ticketPrice: Number(body.ticketPrice),
      totalTickets: Number(body.totalTickets),
      maxGuestsPerBooking: Math.max(
        1,
        Math.min(10, Number(body.maxGuestsPerBooking || 4))
      ),
      ageLimit: Number(body.ageLimit || 18),
      tags: cleanTags,
      status: "live",
    });

    return NextResponse.json({ success: true, party }, { status: 201 });
  } catch (err) {
    console.error("POST /api/parties:", err);
    return NextResponse.json(
      { success: false, message: "Could not create party." },
      { status: 500 }
    );
  }
}