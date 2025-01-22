import axios from "axios";

export const getAuthToken = async () => {
  const { data: { token } } = await axios.get("/api/get-token");
  return token;
}