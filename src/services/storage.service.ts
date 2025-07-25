import { withResolvers } from "$/utils";
import { type DBSchema, type IDBPDatabase, type IDBPTransaction, type StoreKey, type StoreNames, type StoreValue, deleteDB, openDB } from "idb";
import { type StorageValue, defineDriver } from "unstorage";

export interface IDBOptions<S extends DBSchema> {
	/** The database name. */
	name: string;
	/** The database version. Cannot be downgraded. */
	version?: number;
	/** Will be called when the database is upgraded to a new version. Use this to handle all migrations. */
	upgrade?: (instance: IDB<S>, oldVersion: number, newVersion: number | null, transaction: IDBPTransaction<S, StoreNames<S>[], "versionchange">) => void | Promise<void>;
}

type IDBPReadableTransaction<S extends DBSchema> = IDBPTransaction<S, ArrayLike<StoreNames<S>>, "readonly" | "readwrite" | "versionchange">;
type IDBPWritableTransaction<S extends DBSchema> = IDBPTransaction<S, ArrayLike<StoreNames<S>>, "readwrite" | "versionchange">;

// a lightweight wrapper over `idb` which remaps transactions into more composable methods
// this is more feature-rich than the `idb-keyval` implementation used for the built-in unstorage driver, since it offers support for improved table namespacing and controlled migrations,
// the latter of which is more of a necessity for properly maintaining updates to persistable state and files in future app updates

export class IDB<S extends DBSchema> {
	processing: boolean;
	instance: Promise<IDBPDatabase<S>>;

	constructor({ name, version, upgrade }: IDBOptions<S>) {
		this.processing = false;
		const migration = withResolvers<void>();
		this.instance = openDB<S>(name, version, {
			upgrade: async (_, oldVersion, newVersion, transaction) => {
				this.processing = true;
				if (upgrade) await upgrade(this, oldVersion, newVersion, transaction);
				console.log(`Migrated ${transaction.db.name} from version ${oldVersion} to ${newVersion}.`);
				migration.resolve();
			},
		}).then(async (db) => {
			if (this.processing) {
				await migration.promise;
				this.processing = false;
			}
			return db;
		});
	}

	async hasStore(name: StoreNames<S>, transaction?: IDBPReadableTransaction<S>) {
		const db = transaction?.db ?? (await this.instance);
		return db.objectStoreNames.contains(name);
	}
	async createStore(name: StoreNames<S>, transaction?: IDBPWritableTransaction<S>) {
		const db = transaction?.db ?? (await this.instance);
		if (db.objectStoreNames.contains(name)) return;
		return db.createObjectStore(name);
	}
	async removeStore(name: StoreNames<S>, transaction?: IDBPWritableTransaction<S>) {
		const db = transaction?.db ?? (await this.instance);
		if (!db.objectStoreNames.contains(name)) return;
		return db.deleteObjectStore(name);
	}
	async dispose() {
		const db = await this.instance;
		return deleteDB(db.name);
	}

	async keys(store: StoreNames<S>, transaction?: IDBPReadableTransaction<S>) {
		if (!(await this.hasStore(store, transaction))) return [];
		const tx = transaction?.objectStore(store) ?? (await this.instance).transaction(store, "readonly").objectStore(store);
		return tx.getAllKeys();
	}
	async has(store: StoreNames<S>, key: StoreKey<S, StoreNames<S>>, transaction?: IDBPReadableTransaction<S>) {
		if (!(await this.hasStore(store, transaction))) return false;
		const tx = transaction?.objectStore(store) ?? (await this.instance).transaction(store, "readonly").objectStore(store);
		const exists = await tx.getKey(key);
		return !!exists;
	}
	async get(store: StoreNames<S>, key: StoreKey<S, StoreNames<S>>, transaction?: IDBPReadableTransaction<S>) {
		if (!(await this.hasStore(store, transaction))) return;
		const tx = transaction?.objectStore(store) ?? (await this.instance).transaction(store, "readonly").objectStore(store);
		return tx.get(key);
	}
	async set(store: StoreNames<S>, key: StoreKey<S, StoreNames<S>>, value: StoreValue<S, StoreNames<S>>, transaction?: IDBPWritableTransaction<S>) {
		const tx = transaction?.objectStore(store) ?? (await this.instance).transaction(store, "readwrite").objectStore(store);
		return tx.put(value, key);
	}
	async delete(store: StoreNames<S>, key: StoreKey<S, StoreNames<S>>, transaction?: IDBPWritableTransaction<S>) {
		const tx = transaction?.objectStore(store) ?? (await this.instance).transaction(store, "readwrite").objectStore(store);
		return tx.delete(key);
	}
	async clear(store: StoreNames<S>, transaction?: IDBPWritableTransaction<S>) {
		const tx = transaction?.objectStore(store) ?? (await this.instance).transaction(store, "readwrite").objectStore(store);
		return tx.clear();
	}

	async update<T extends StoreValue<S, StoreNames<S>>, R extends StoreValue<S, StoreNames<S>> = StoreValue<S, StoreNames<S>>>(store: StoreNames<S>, key: StoreKey<S, StoreNames<S>>, updater: (value: T) => R, transaction?: IDBPWritableTransaction<S>) {
		const tx = transaction?.objectStore(store) ?? (await this.instance).transaction(store, "readwrite").objectStore(store);
		const current = await tx.get(key);
		if (!current) return undefined;
		const updated = updater(current);
		await tx.put(updated, key);
		return updated;
	}
}

export interface DriverOptions<S extends DBSchema> {
	name: StoreNames<S>;
}
export function createDriver<S extends DBSchema>(options: IDBOptions<S>) {
	const idb = new IDB(options);
	return defineDriver<DriverOptions<S>, InstanceType<typeof IDB<S>>>((store) => {
		return {
			name: `idb-${options.name}`,
			options: store,
			getInstance: () => idb,
			getKeys: async () => {
				const value = await idb.keys(store.name);
				return value as string[];
			},
			hasItem: async (key) => {
				return idb.has(store.name, key as StoreKey<S, StoreNames<S>>);
			},
			getItem: async (key) => {
				const value = await idb.get(store.name, key as StoreKey<S, StoreNames<S>>);
				return value as StorageValue;
			},
			getItems: async (items) => {
				const result = [];
				for (const item of items) {
					const value = await idb.get(store.name, item.key as StoreKey<S, StoreNames<S>>);
					if (!value) break;
					result.push({ key: item.key, value });
				}
				return result;
			},
			getItemRaw: async <T>(key: string) => {
				const value = await idb.get(store.name, key as StoreKey<S, StoreNames<S>>);
				return value as T;
			},
			setItem: async (key, value) => {
				await idb.set(store.name, key as StoreKey<S, StoreNames<S>>, value as StoreValue<S, StoreNames<S>>);
			},
			setItems: async (items) => {
				for (const item of items) {
					await idb.set(store.name, item.key as StoreKey<S, StoreNames<S>>, item.value as StoreValue<S, StoreNames<S>>);
				}
			},
			setItemRaw: async <T>(key: string, value: T) => {
				await idb.set(store.name, key as StoreKey<S, StoreNames<S>>, value as StoreValue<S, StoreNames<S>>);
			},
			removeItem: async (key) => {
				await idb.delete(store.name, key as StoreKey<S, StoreNames<S>>);
			},
			dispose: () => idb.dispose(),
		};
	});
}

// the old localforage schema. used to validate tables on migrations
export type LegacyStorageSchema = { keyvaluepairs: { key: string; value: unknown }; "local-forage-detect-blob-support": { key: "key"; value: Blob } };
