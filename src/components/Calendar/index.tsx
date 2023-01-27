import type { FC } from "react";
import ReactCalendar from "react-calendar";
import {
  format,
  formatISO,
  isBefore,
  parse,
} from "date-fns";
import { now, OPENING_HOURS_INTERVAL } from "../../constants/config";
import type { DateTime } from "@types";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {getOpeningTimes, roundToNearestMinutes} from "../../utils/helpers";
import type { Day } from '@prisma/client'


interface CalendarProps {
  days: Day[];
  closedDays: string[]; // ISO string
}

const index: FC<CalendarProps> = ({ days, closedDays }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();

  //Determine if today is closed
  const today = days.find((d) => d.dayOfWeek === now.getDay());
  const rounded = roundToNearestMinutes(now, OPENING_HOURS_INTERVAL);
  const closing = parse(today!.closeTime, "HH:mm", now);
  const tooLate = !isBefore(rounded, closing);

  //if it's past closing time, make today closed
  if (tooLate) closedDays.push(formatISO(new Date().setHours(0, 0, 0, 0)));

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [date, setDate] = useState<DateTime>({
    justDate: null,
    dateTime: null,
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (date.dateTime) {
      localStorage.setItem("selectedTime", date.dateTime.toISOString());
      router.push("/menu");
    }
  }, [date.dateTime]);

  const times = date.justDate && getOpeningTimes(date.justDate, days);

  return (
    <div className={"flex h-screen flex-col items-center justify-center"}>
      {date.justDate ? (
        <div className={"flex gap-4"}>
          {times?.map((time, index) => (
            <div key={`time-${index}`} className={"rounded-sm bg-gray-100 p-2"}>
              <button onClick={() => setDate({ ...date, dateTime: time })}>
                {format(time, "HH:mm")}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <ReactCalendar
          minDate={new Date()}
          className={"REACT-CALENDAR p-2"}
          view={"month"}
          onClickDay={(date: Date) =>
            setDate((prev) => ({ ...prev, justDate: date }))
          }
          locale={"en-GB"}
          tileDisabled={({ date }) => closedDays.includes(formatISO(date))}
        />
      )}
    </div>
  );
};

export default index;
