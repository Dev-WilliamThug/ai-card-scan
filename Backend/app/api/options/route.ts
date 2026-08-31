import { NextResponse } from "next/server";

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
