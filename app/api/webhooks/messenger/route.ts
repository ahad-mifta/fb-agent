import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { handleIncomingMessengerMessage } from "@/lib/messenger";

type MessengerEvent = {
  sender?: { id?: string };
  message?: { text?: string; is_echo?: boolean };
};

type MessengerEntry = {
  id: string;
  messaging?: MessengerEvent[];
};

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === env.META_WEBHOOK_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { object?: string; entry?: MessengerEntry[] };

  if (body.object !== "page") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const work = body.entry?.flatMap((entry) =>
    (entry.messaging ?? [])
      .filter((event) => event.sender?.id && event.message?.text && !event.message.is_echo)
      .map((event) => handleIncomingMessengerMessage(entry.id, event.sender!.id!, event.message!.text!))
  );

  await Promise.allSettled(work ?? []);
  return NextResponse.json({ ok: true });
}
