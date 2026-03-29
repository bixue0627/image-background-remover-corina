import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!["image/png", "image/jpeg", "image/jpg"].includes(image.type)) {
      return NextResponse.json(
        { error: "Only PNG and JPG images are supported" },
        { status: 400 }
      );
    }

    // Validate file size (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (image.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Convert image to buffer for Remove.bg API
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call Remove.bg API
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: (() => {
        const formData = new FormData();
        formData.append("image_file", new Blob([buffer]), image.name);
        formData.append("size", "auto");
        formData.append("format", "png");
        return formData;
      })(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Remove.bg API error:", errorText);

      if (response.status === 402) {
        return NextResponse.json(
          { error: "API quota exceeded" },
          { status: 402 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          { error: "Invalid API key" },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: "Failed to remove background" },
        { status: response.status }
      );
    }

    // Get the processed image as base64
    const resultBuffer = await response.arrayBuffer();
    const resultBase64 = Buffer.from(resultBuffer).toString("base64");
    const resultUrl = `data:image/png;base64,${resultBase64}`;

    return NextResponse.json({ resultUrl });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the image" },
      { status: 500 }
    );
  }
}
