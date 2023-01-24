import type { FC } from "react";
import { api } from "../utils/api";

const dashboard: FC = () => {
  const { mutate } = api.admin.sensitive.useMutation();

  return (
    <div>
      <h1>Dashboard</h1>
      <button
        className={"rounded-lg bg-blue-400 p-2"}
        type={"button"}
        onClick={() => mutate()}
      >
        TOP SECRET
      </button>
    </div>
  );
};

export default dashboard;
