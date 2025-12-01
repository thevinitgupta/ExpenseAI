import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { type Expense } from "@/lib/storage";
import { logError, logInfo } from "@/lib/logger";

/**
 * GET /api/expenses?year=YYYY&month=M
 * - Authenticated: returns array of expenses for the logged-in user filtered by year/month (if provided).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email as string;

    const url = new URL(req.url);
    const year = url.searchParams.get("year");
    const month = url.searchParams.get("month"); // 1-12 expected (string)
    const db = (await clientPromise).db("expense_tracker");
    const coll = db.collection("expenses");

    const filter: any = { email };

    // If year+month provided, filter by dateSpent prefix "YYYY-MM"
    if (year && month) {
      const mm = String(Number(month)).padStart(2, "0");
      const prefix = `${year}-${mm}`;
      // assume dateSpent like "2025-11-30"
      filter.dateSpent = { $regex: `^${prefix}` };
    }

    const docs = await coll.find(filter).sort({ createdAt: 1 }).toArray();

    // Remove internal Mongo fields if any and return the raw expense objects
    const expenses = docs.map((d: any) => {
      const { _id, email: e, ...rest } = d;
      return { ...rest } as Expense;
    });

    return NextResponse.json(expenses);
  } catch (err) {
    logError("GET /api/expenses error:", {error : err});
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

/**
 * POST /api/expenses
 * Body: { expense: Expense }
 * Authenticated: inserts or upserts the expense document for the user
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email as string;

    const body = await req.json();
    const expense: Expense | undefined = body?.expense;
    if (!expense || !expense.id) {
      return NextResponse.json({ error: "Missing expense or expense.id" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("expense_tracker");
    const coll = db.collection<{ _id: string }>("expenses");

    const { createdAt, ...rest } = expense;

    // Document for updates
    const doc = { ...rest, email };

    await coll.updateOne(
    { _id: expense.id, email },
    {
        $set: doc,
        $setOnInsert: {
        createdAt: createdAt ?? new Date().toISOString()
        },
    },
    { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    logError("POST /api/expenses error:", {error : err});
    return NextResponse.json({ error: "Failed to save expense" }, { status: 500 });
  }
}

/**
 * DELETE /api/expenses
 * Body: { id: string }
 * Authenticated: deletes the expense doc with this id for this user
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email as string;

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("expense_tracker");
    const coll = db.collection("expenses");

    console.log("Attempting to delete expense", {id, email});

    const res = await coll.deleteOne({ _id: id, email });

    if (res.deletedCount === 0) {
      return NextResponse.json({ error: "Not found or not authorized", email: email, id }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logError("DELETE /api/expenses error:", {error : err});
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
