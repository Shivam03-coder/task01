import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { companyRouter } from "./routers/company";


export const appRouter = createTRPCRouter({
  company: companyRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
