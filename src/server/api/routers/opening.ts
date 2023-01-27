import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { formatISO } from "date-fns";

export const openingRouter = createTRPCRouter({
  /**
   * Method for changing opening hours for a specific day
   * @expects an array all days with their new opening hours
   * @returns an array of all updated days
   */

  changeOpeningHours: adminProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          openTime: z.string(),
          closeTime: z.string(),
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      const results = await Promise.all(
        input.map(async (day) => {
          const { id, name, openTime, closeTime } = day;
          const updatedDay = await ctx.prisma.day.update({
            where: {
              id: day.id,
            },
            data: {
              openTime: day.openTime,
              closeTime: day.closeTime,
            },
          });
          return updatedDay;
        })
      );
      return results;
    }),

    /**
     * Method for closing a day, so no appointments can be made
     * @param date Date to close
     */
    closeDay: adminProcedure.input(z.object({date:z.date()})).mutation(async ({input, ctx}) => {
        await ctx.prisma.closedDay.create({
            data: {
                date: input.date,
            },
        });
        }),

    /**
     * Method for opening a previously closed day
     * @param date Date to open
     */
    openDay: adminProcedure.input(z.object({date:z.date()})).mutation(async ({input, ctx}) => {
        await ctx.prisma.closedDay.delete({
            where: {
                date: input.date,
            },
        });
    }),

    /**
     * Method for getting all closed days
     * @returns Array of all closed days in ISO format
     * @example ["2021-01-01T09:00:00.000Z", "2021-01-02T09:00:00.000Z"]
     */
    getClosedDays: adminProcedure.query(async ({ctx}) => {
        const closedDays = await ctx.prisma.closedDay.findMany();
        return closedDays.map((day) => formatISO(day.date));
    }),

});
