import Menu from "@components/Menu";
import Spinner from "@components/Spinner";
import { parseISO } from "date-fns";
import { useRouter } from "next/router";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { now } from "src/constants/config";
import { api } from "src/utils/api";

const MenuPage: FC = ({}) => {
  const router = useRouter();



  const [selectedTime, setSelectedTime] = useState<string | null>(null); //as ISO string
  const { isFetchedAfterMount } = api.menu.checkMenuStatus.useQuery(undefined, {
    onError: () => {
      //TODO: handle error
      //Check for validity of selectedTime failed
      //Handle error accordingly (e.g. redirect to home page);
    },
  });

  useEffect(() => {
    const selectedTime = localStorage.getItem("selectedTime");
    if (!selectedTime) {
      router.push("/");
    } else {
      const date = parseISO(selectedTime);

      //If we have date form the past in localstorage
      if (date < now) router.push("/");

      //Date is valid
      setSelectedTime(selectedTime);
    }
  }, []);

  return (
    <>
      {isFetchedAfterMount && selectedTime ? (
        <>
          <button onClick={() => router.push("/")}>
            Back to time selection
          </button>
          <Menu selectedTime={selectedTime} />
        </>
      ) : (
        <div className={"flex h-screen items-center justify-center"}>
          <Spinner />
        </div>
      )}
    </>
  );
};

export default MenuPage;
