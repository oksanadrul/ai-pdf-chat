import { NextResponse } from "next/server";
import pdf from "@cyber2024/pdf-parse-fixed";
import { createOrReadVectorStoreIndex } from "@/lib/vector-store";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    const fileContent = await file.arrayBuffer();
    const pdfData = await pdf(Buffer.from(fileContent));
    console.log("Extracted text:", pdfData);

    await createOrReadVectorStoreIndex(pdfData.text);

    return NextResponse.json(
      {
        message: "File Uploaded",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error processing file", error: error.message },
      { status: 500 },
    );
  }
}
