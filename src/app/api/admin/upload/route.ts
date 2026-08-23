import { NextResponse } from "next/server";
import { saveUploadedFile } from "@/lib/local-db";
import { logAdminAction, getAdminEmailFromRequest } from "@/lib/audit-logger";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const subfolder = (formData.get("subfolder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Enforce 10MB max upload size
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds maximum allowable limit (10MB)." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicPath = saveUploadedFile(buffer, file.name, subfolder);

    if (!publicPath) {
      return NextResponse.json(
        { error: "Failed to store uploaded file on filesystem" },
        { status: 500 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const adminEmail = await getAdminEmailFromRequest(request);
    await logAdminAction({
      adminEmail,
      ip,
      action: "Uploaded Media File",
      target: file.name,
      details: `${subfolder} (${(file.size / 1024).toFixed(1)} KB) -> ${publicPath}`,
      status: "success",
    });

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
