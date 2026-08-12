export type CharacterStatus = "ALIVE" | "DEAD" | "UNKNOWN";

export interface Character {
  id: string;
  name: string;
  house: string;
  status: CharacterStatus;
  actor: string;
  biography: string;
  sigilColor: string;
  portraitUrl: string;
}

export interface CharacterPage {
  items: Character[];
  itemsCount: number;
  page: number;
  pageSize: number;
  pagesCount: number;
  links: PageLinks;
}

export interface PageLinks { self: string; next?: string; prev?: string; }

export interface HousesResponse {
  items: House[];
  itemsCount: number;
}

export interface House {
  name: string;
  words: string;
  seat: string;
  region: string;
  sigil: string;
  animal: string;
  rulerEnd: string;
  sigilColor: string;
  charactersCount: number;
}

export interface Relationship {
  id: number;
  relatedCharacterId: string;
  relatedCharacterName: string;
  type: string;
  subtype: string;
  label: string;
}

export interface RelationshipsResponse { items: Relationship[]; itemsCount: number; }

export interface Episode {
  id: string; season: number; episode: number; title: string; airDate: string; runtimeMinutes: number;
  director: string; writers: string[]; summary: string; themes: string[]; characterIds: string[]; eventIds: string[];
}
export interface EpisodePage { items: Episode[]; itemsCount: number; page: number; pageSize: number; pagesCount: number; links: PageLinks; }

export interface Quote { id: string; characterId: string; characterName: string; house: string; text: string; season: number; }
export interface QuotePage { items: Quote[]; itemsCount: number; page: number; pageSize: number; pagesCount: number; links: PageLinks; }

export interface Combatant { side: string; houses: string[]; characters: string[]; }
export interface Battle { id: string; name: string; season: number; location: string; combatants: Combatant[]; outcome: string; casualties: string; linkedCharacterIds: string[]; linkedEventIds: string[]; }
export interface BattlesResponse { items: Battle[]; itemsCount: number; }

export interface StoryEvent { id: string; season: number; title: string; date: string; type: string; houses: string[]; characterIds: string[]; summary: string; }
export interface EventsResponse { items: StoryEvent[]; itemsCount: number; }

export interface Statistics { characters: number; houses: number; relationships: number; episodes: number; quotes: number; battles: number; events: number; database: string; generatedAt: string; }

export interface ApiTrace { method: string; path: string; status?: number; durationMs?: number; database?: string; state: "loading" | "complete" | "error"; at: number; }
