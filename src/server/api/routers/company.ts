import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const companyRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.company.findMany();
  }),
});
