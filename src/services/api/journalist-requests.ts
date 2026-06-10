import type { JournalistRequestCreateResponse } from "../types/journalist-requests";
import API from "./api.repository";

const JournalistRequests_APIs = {
  create: async (formData: FormData) => {
    return API.post<JournalistRequestCreateResponse>(
      "/api/journalist-requests",
      formData,
    );
  },
};

export default JournalistRequests_APIs;
