import { faLogin, faUser } from "@/renderer/api";

export const getUserByCookies = async (a: string, b: string) => {
  await faLogin(a, b);
  return await faUser();
};
