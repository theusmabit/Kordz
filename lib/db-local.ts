import Dexie, { type Table } from "dexie";

export interface Song {
  id?: number;
  title: string;
  artist: string;
  content: string;
  key: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  isFavorite?: boolean;
}

export interface Setlist {
  id?: number;
  name: string;
  description?: string;
  songIds: number[];
  createdAt: Date;
}

export class KordzDatabase extends Dexie {
  songs!: Table<Song, number>;
  setlists!: Table<Setlist, number>;

  constructor() {
    super("KordzDB");
    this.version(1).stores({
      songs: "++id, title, artist, slug, createdAt, updatedAt",
    });
    this.version(2).stores({
      songs: "++id, title, artist, slug, createdAt, updatedAt",
      setlists: "++id, name, createdAt",
    });
  }
}

export const db = new KordzDatabase();

