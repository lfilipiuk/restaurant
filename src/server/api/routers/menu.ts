import { createTRPCRouter, publicProcedure } from "../trpc";
import { s3 } from "@lib/s3";

//sleep
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const menuRouter = createTRPCRouter({
  getMenuItems: publicProcedure.query(async ({ ctx }) => {
    const menuItems = await ctx.prisma.menuItem.findMany();

    // Each menu item only contains its AWS key. Extend all items with their actual img url
    const withUrls = await Promise.all(
      menuItems.map(async (item) => ({
        ...item,
        url: await s3.getSignedUrlPromise("getObject", {
          Bucket: process.env.AWS_BUCKET_NAME as string,
          Key: item.imageKey,
        }),
      }))
    );
    return withUrls;
  }),

  checkMenuStatus: publicProcedure.query(async () => {
    //Handle menu checking logic
    await sleep(1000);

    return { success: true };
  }),
});
