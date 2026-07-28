import mongoose from "mongoose";
import * as Sentry from "@sentry/nextjs";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Clear the broken promise so the next call retries the connection
    // instead of awaiting a permanently-failed promise.
    cached.promise = null;
    Sentry.captureException(err, {
      tags: { layer: "database", operation: "mongoose.connect" },
    });
    throw err;
  }

  return cached.conn;
}

export default dbConnect;

