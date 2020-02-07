import { registerAppIpc } from "@/main/ipc/app";
import { registerDatabaseIpc } from "@/main/ipc/database";
import { registerFaIpc } from "@/main/ipc/fa";

export function registerIpc() {
  registerAppIpc();
  registerDatabaseIpc();
  registerFaIpc();
}
