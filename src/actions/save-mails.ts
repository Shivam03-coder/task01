"use server";

import { db } from "@/server/db";

export async function saveMails(companyId: string, emails: any, info: string) {
  await db.company.update({
    where: { id: companyId },
    data: { email: emails, info },
  });
}
