import { AsyncLocalStorage } from "node:async_hooks";
import type { Database } from "./index";

const transactionStorage = new AsyncLocalStorage<Database>();

export function runWithDatabaseTransaction<T>(
  transaction: Database,
  operation: () => Promise<T>,
): Promise<T> {
  return transactionStorage.run(transaction, operation);
}

export function getActiveDatabaseTransaction(): Database | undefined {
  return transactionStorage.getStore();
}
