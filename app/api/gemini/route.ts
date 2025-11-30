import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { apiKeyCache } from "@/lib/keyCache";
import { decrypt } from "@/lib/serverCrypto";
import { allowUser } from "@/lib/serverRateLimiter";
import { logError, logInfo, logWarn } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email || null;
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!allowUser(email)) {
      logWarn("Rate limit exceeded", { email });
      return NextResponse.json({ error: `Too many requests for ${email}, try after 1 minute` }, { status: 429 });
    }

    const { contents } = await req.json();
    if (!contents) {
      return NextResponse.json(
        { error: "Missing contents for Gemini API" },
        { status: 400 }
      );
    }

    // const email = session.user.email;
     
    let entry = apiKeyCache[email];

    if (!entry) {
      const client = await clientPromise;
      const db = client.db("expense_tracker");

        const userData = await db.collection("user_keys").findOne({ email });
        const userKeyDoc = userData?.doc;
        logInfo(`Fetched user key doc`, {email});

      if (!userKeyDoc?.encryptedKey) {
        return NextResponse.json(
          { error: "API key not configured for user" },
          { status: 400 }
        );
      }
       entry = {
        encryptedKey: userKeyDoc.encryptedKey,
        iv: userKeyDoc.iv,
        tag: userKeyDoc.tag,
      };
  
      apiKeyCache[email] = entry;
    }

    let apiKey: string;

    try {
      apiKey = decrypt(entry.encryptedKey, entry.iv, entry.tag);
    } catch (err) {
      logError("Failed to decrypt API key:", {err, email});
      return NextResponse.json(
        { error: "Failed to decrypt API key" },
        { status: 500 }
      );
    }

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({ contents }),
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (err: any) {
    logError("Gemini proxy error:", {err});
    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
