import { NextResponse } from "next/server";
import { getRuntimeDiagnostics } from "@/lib/runtime/diagnostics";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getRuntimeDiagnostics());
}
