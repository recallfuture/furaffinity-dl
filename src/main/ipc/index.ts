import { registerAppIpc } from "./app";
import { registerFaIpc } from "./fa";

export const registerIpc = (): void => {
  registerAppIpc();
  registerFaIpc();
};
