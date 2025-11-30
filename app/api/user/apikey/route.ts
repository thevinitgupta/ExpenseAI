import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";
import { apiKeyCache } from "@/lib/keyCache";
import { encrypt } from "@/lib/serverCrypto";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { apiKey } = await req.json();
  if (!apiKey) return NextResponse.json({ error: "Missing key" }, { status: 400 });

 
  const encrypted = encrypt(apiKey);

  // Update cache
    apiKeyCache[session.user.email] = {
        iv: encrypted.iv,
        tag: encrypted.tag,
        encryptedKey: encrypted.encrypted,
    };

  // Save to DB
  const client = await clientPromise;
    const db = client.db("expense_tracker");
    const doc = {
        encryptedKey: encrypted.encrypted,
        iv: encrypted.iv,
        tag: encrypted.tag,
        updatedAt: new Date(),
      };

  await db.collection("user_keys").updateOne(
    { email: session.user.email },
      { $set: { doc }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}


export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
    const email = session.user.email;
  
    // 1. Try cache
    if (apiKeyCache[email]) {
      return NextResponse.json({ exists: true });
    }
  
    // 2. Fallback DB
    const client = await clientPromise;
    const db = client.db("expense_tracker");
    const userDoc = await db.collection("user_keys").findOne({ email });
    const doc = userDoc?.doc;
    if (doc?.encryptedKey) {
      apiKeyCache[email] = doc.encryptedKey;
      return NextResponse.json({ exists: true });
    }
  
    return NextResponse.json({ exists: false });
  }
  