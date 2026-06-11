import favouritesReducer, {
  loadFavourites,
  addFavourite,
  removeFavourite,
} from '../src/features/favourites/store/favouritesSlice';
import { Character } from '../src/types/character';

jest.mock('../src/database/sqliteService', () => ({
  getFavourites: jest.fn().mockResolvedValue([]),
  addFavourite: jest.fn().mockResolvedValue(undefined),
  removeFavourite: jest.fn().mockResolvedValue(undefined),
  initDatabase: jest.fn().mockResolvedValue(undefined),
}));

const mockCharacter: Character = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth (C-137)', url: 'https://rickandmortyapi.com/api/location/1' },
  location: { name: 'Citadel of Ricks', url: 'https://rickandmortyapi.com/api/location/3' },
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  episode: ['https://rickandmortyapi.com/api/episode/1'],
  url: 'https://rickandmortyapi.com/api/character/1',
  created: '2017-11-04T18:48:46.250Z',
};

const initialState = {
  items: [],
  loadingIds: [],
  isLoading: false,
};

describe('favouritesSlice reducer', () => {
  it('returns the initial state for unknown actions', () => {
    const state = favouritesReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialState);
  });

  it('sets isLoading=true on loadFavourites.pending', () => {
    const action = loadFavourites.pending('', undefined);
    const state = favouritesReducer(initialState, action);
    expect(state.isLoading).toBe(true);
  });

  it('populates items on loadFavourites.fulfilled', () => {
    const action = loadFavourites.fulfilled([mockCharacter], '', undefined);
    const state = favouritesReducer(initialState, action);
    expect(state.isLoading).toBe(false);
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe(1);
  });

  it('sets isLoading=false on loadFavourites.rejected', () => {
    const action = loadFavourites.rejected(new Error('DB error'), '', undefined);
    const state = favouritesReducer(initialState, action);
    expect(state.isLoading).toBe(false);
  });

  it('appends to loadingIds on addFavourite.pending', () => {
    const action = addFavourite.pending('', mockCharacter);
    const state = favouritesReducer(initialState, action);
    expect(state.loadingIds).toContain(1);
  });

  it('adds a character on addFavourite.fulfilled', () => {
    const action = addFavourite.fulfilled(mockCharacter, '', mockCharacter);
    const state = favouritesReducer(initialState, action);
    expect(state.items).toHaveLength(1);
    expect(state.loadingIds).not.toContain(1);
  });

  it('does not duplicate on addFavourite.fulfilled when already present', () => {
    const stateWithChar = {
      ...initialState,
      items: [mockCharacter],
    };
    const action = addFavourite.fulfilled(mockCharacter, '', mockCharacter);
    const state = favouritesReducer(stateWithChar, action);
    expect(state.items).toHaveLength(1);
  });

  it('removes a character on removeFavourite.fulfilled', () => {
    const stateWithChar = {
      ...initialState,
      items: [mockCharacter],
    };
    const action = removeFavourite.fulfilled(1, '', 1);
    const state = favouritesReducer(stateWithChar, action);
    expect(state.items).toHaveLength(0);
    expect(state.loadingIds).not.toContain(1);
  });
});
