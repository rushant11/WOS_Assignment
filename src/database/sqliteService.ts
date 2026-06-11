import { open, type DB } from '@op-engineering/op-sqlite';
import { Character } from '../types/character';

const DB_NAME = 'rickmorty.db';
const TABLE_NAME = 'favourites';

let db: DB | null = null;

export async function initDatabase(): Promise<void> {
  if (db) { return; }
  db = open({ name: DB_NAME });
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id          INTEGER PRIMARY KEY,
      name        TEXT    NOT NULL,
      status      TEXT    NOT NULL,
      species     TEXT    NOT NULL,
      type        TEXT    NOT NULL,
      gender      TEXT    NOT NULL,
      origin_name TEXT    NOT NULL,
      origin_url  TEXT    NOT NULL,
      location_name TEXT  NOT NULL,
      location_url  TEXT  NOT NULL,
      image       TEXT    NOT NULL,
      episode     TEXT    NOT NULL,
      url         TEXT    NOT NULL,
      created     TEXT    NOT NULL
    );
  `);
}

async function ensureInit(): Promise<void> {
  if (!db) { await initDatabase(); }
}

export async function addFavourite(character: Character): Promise<void> {
  await ensureInit();
  await db!.execute(
    `INSERT OR REPLACE INTO ${TABLE_NAME}
      (id, name, status, species, type, gender,
       origin_name, origin_url, location_name, location_url,
       image, episode, url, created)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      character.id,
      character.name,
      character.status,
      character.species,
      character.type,
      character.gender,
      character.origin.name,
      character.origin.url,
      character.location.name,
      character.location.url,
      character.image,
      JSON.stringify(character.episode),
      character.url,
      character.created,
    ],
  );
}

export async function removeFavourite(id: number): Promise<void> {
  await ensureInit();
  await db!.execute(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
}

export async function getFavourites(): Promise<Character[]> {
  await ensureInit();
  const result = await db!.execute(
    `SELECT * FROM ${TABLE_NAME} ORDER BY name ASC`,
  );
  const rows = result.rows ?? [];
  return rows.map(row => ({
    id: row.id as number,
    name: row.name as string,
    status: row.status as Character['status'],
    species: row.species as string,
    type: row.type as string,
    gender: row.gender as Character['gender'],
    origin: { name: row.origin_name as string, url: row.origin_url as string },
    location: { name: row.location_name as string, url: row.location_url as string },
    image: row.image as string,
    episode: JSON.parse(row.episode as string) as string[],
    url: row.url as string,
    created: row.created as string,
  }));
}
