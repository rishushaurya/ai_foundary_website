import { NextResponse } from "next/server";
import { saveUploadedFile } from "@/lib/local-db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const subfolder = (formData.get("subfolder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicPath = saveUploadedFile(buffer, file.name, subfolder);

    if (!publicPath) {
      return NextResponse.json(
        { error: "Failed to store uploaded file on filesystem" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: publicPath,
      name: file.name,
      size: file.size,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
