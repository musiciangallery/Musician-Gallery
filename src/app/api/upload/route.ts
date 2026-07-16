import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

// Issues short-lived client tokens so the browser can upload files
// straight to Blob storage, bypassing our serverless functions entirely.
// This matters because Vercel serverless functions reject any request
// body over ~4.5MB (FUNCTION_PAYLOAD_TOO_LARGE) — a real phone photo or
// video easily exceeds that, so those files can never be sent through a
// normal POST route. This route only ever handles a small token exchange,
// never the file bytes themselves.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ["image/*", "video/*"],
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // No server-side action needed on completion — the client
        // receives the resulting URL directly and includes it in the
        // application form submission.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 }
    );
  }
}
