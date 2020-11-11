import { registerAppIpc } from "./app";
import { registerFaIpc } from "./fa";

export function registerIpc() {
  registerAppIpc();
  registerFaIpc();
}
