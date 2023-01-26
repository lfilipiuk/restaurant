import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";
import { getJwtSecretKey } from "../../../lib/auth";
import cookie from "cookie";
import { TRPCError } from "@trpc/server";
import { s3 } from "../../../lib/s3";
import { MAX_FILE_SIZE } from "../../../constants/config";

export const adminRouter = createTRPCRouter({
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { res } = ctx;
      const { email, password } = input;

      if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
      ) {
        //user is authentciated as admin
        const token = await new SignJWT({})
          .setProtectedHeader({ alg: "HS256" })
          .setJti(nanoid())
          .setIssuedAt()
          .setExpirationTime("1h")
          .sign(new TextEncoder().encode(getJwtSecretKey()));

        res.setHeader(
          "Set-Cookie",
          cookie.serialize("user-token", token, {
            httpOnly: true,
            path: "/",
            secure: process.env.NODE_ENV === "production",
          })
        );

        return { success: true };
      }

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }),

  createPresignedUrl: adminProcedure
    .input(z.object({ fileType: z.string() }))
    .mutation(async ({ input }) => {
      const id = nanoid();
      const ex = input.fileType.split("/")[1];
      const key = `${id}.${ex}`;

      const { url, fields } = (await new Promise((resolve, reject) => {
        s3.createPresignedPost(
          {
            Bucket: process.env.AWS_BUCKET_NAME,
            Fields: {
              key,
            },
            Expires: 60,
            Conditions: [
              ["content-length-range", 0, MAX_FILE_SIZE],
              ["starts-with", "$Content-Type", "image/"],
            ],
          },
          (err, data) => {
            if (err) {
              return reject(err);
            } else {
              resolve(data);
            }
          }
        );
      })) as any as { url: string; fields: any };

      return { url, fields, key };
    }),

  addMenuItem: adminProcedure
    .input(
      z.object({
        name: z.string(),
        price: z.number(),
        imageKey: z.string(),
        categories: z.array(
          z.union([
            z.literal("breakfast"),
            z.literal("lunch"),
            z.literal("dinner"),
            z.literal("dessert"),
          ])
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { name, price, imageKey, categories } = input;

      const menuItem = await ctx.prisma.menuItem.create({
        data: {
          name,
          price,
          imageKey,
          categories,
        },
      });
      return menuItem;
    }),

  deleteMenuItem: adminProcedure
    .input(z.object({ imageKey: z.string(), id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id, imageKey } = input;
      const bucketName = process.env.AWS_BUCKET_NAME as string;

      //Delete image from s3
      await s3.deleteObject({Bucket: bucketName, Key: imageKey}).promise();

      //Delete menu item from db
      const menuItem = await ctx.prisma.menuItem.delete({
        where: {
          id,
        },
      });

      return menuItem;
    }),
});
