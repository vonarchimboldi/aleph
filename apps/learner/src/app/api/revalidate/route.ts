import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tag, path, secret } = body ?? {};

    if (!secret || secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (tag) {
      revalidateTag(tag, "default");
    }

    if (path) {
      revalidatePath(path);
    }

    return NextResponse.json({ revalidated: true, tag, path });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request", details: String(error) },
      { status: 400 }
    );
  }
}
