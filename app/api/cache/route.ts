// app/api/cache/route.ts

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { logError } from "@/lib/logger";

/**
 * POST /api/cache
 * Body: { expense: Expense, email: string }
 */
export async function POST(req: Request) {
  try {
    const { expense, email } = await req.json();

    if (!expense || !expense.id || !email) {
      return NextResponse.json(
        { error: "Missing expense or email" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("expense_tracker");

    await db.collection("failed_cache").updateOne(
      { _id: expense.id },
      {
        $set: {
          _id: expense.id,
          email,
          expense,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    logError("Failed cache save:", {error : err});
    return NextResponse.json({ error: "Failed to save to cache" }, { status: 500 });
  }
}


/**
 * DELETE /api/cache
 * Body: { id: string }
 */
export async function DELETE(req: Request) {
    try {
      const { id } = await req.json();
  
      if (!id) {
        return NextResponse.json(
          { error: "Missing id" },
          { status: 400 }
        );
      }
  
      const client = await clientPromise;
      const db = client.db("expense_tracker");
  
      await db.collection("failed_cache").deleteOne({ _id: id });
  
      return NextResponse.json({ success: true });
    } catch (err) {
      logError("Failed to remove cached entry:", {error : err});
      return NextResponse.json(
        { error: "Failed to delete cache entry" },
        { status: 500 }
      );
    }
  }
  