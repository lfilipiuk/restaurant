import type {Dispatch, FC, SetStateAction} from "react";
import ReactCalendar from "react-calendar";
import {add, format} from "date-fns";
import {INTERVAL, STORE_CLOSING_TIME, STORE_OPENING_TIME} from "../../constants/config";
import type {DateTime} from "@types"

interface indexProps{
    setDate: Dispatch<SetStateAction<DateTime>>;
    date: DateTime;
}

const index: FC<indexProps> = ({setDate, date}) => {

  const getTimes = () => {
    if(!date.justDate) return;

    const {justDate } = date;

    const beginning = add(justDate, {hours: STORE_OPENING_TIME});
    const end = add(justDate, {hours: STORE_CLOSING_TIME});
    const interval = INTERVAL;

    const times = [];
    for(let i = beginning; i <= end; i = add(i, {minutes: interval})) {
      times.push(i);
    }
    return times;
  }

  const times = getTimes();

  return (
    <div className={"flex h-screen flex-col items-center justify-center"}>
      {date.justDate ? (
        <div className={'flex gap-4'}>{
            times?.map((time, index) => (
                <div key={`time-${index}`} className={'rounded-sm bg-gray-100 p-2'}>
                  <button onClick={() => setDate({...date, dateTime: time})}>
                    {format(time, 'HH:mm')}
                    </button>
                </div>
            ))
        }</div>
      ) : (
        <ReactCalendar
          minDate={new Date()}
          className={"REACT-CALENDAR p-2"}
          view={"month"}
          onClickDay={(date:Date) => setDate((prev) => ({ ...prev, justDate: date }))}
          locale={"en-GB"}
        />
      )}
    </div>
  );
};

export default index;
