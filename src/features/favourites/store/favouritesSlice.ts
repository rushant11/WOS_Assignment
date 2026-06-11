import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  addFavourite as dbAdd,
  getFavourites as dbGetAll,
  removeFavourite as dbRemove,
} from '../../../database/sqliteService';
import { Character } from '../../../types/character';

interface FavouritesState {
  items: Character[];
  loadingIds: number[];
  isLoading: boolean;
}

const initialState: FavouritesState = {
  items: [],
  loadingIds: [],
  isLoading: false,
};

export const loadFavourites = createAsyncThunk<Character[]>(
  'favourites/load',
  async () => {
    return await dbGetAll();
  },
);

export const addFavourite = createAsyncThunk<Character, Character>(
  'favourites/add',
  async (character: Character) => {
    await dbAdd(character);
    return character;
  },
);

export const removeFavourite = createAsyncThunk<number, number>(
  'favourites/remove',
  async (id: number) => {
    await dbRemove(id);
    return id;
  },
);

const favouritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadFavourites.pending, state => {
        state.isLoading = true;
      })
      .addCase(loadFavourites.fulfilled, (state, action: PayloadAction<Character[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(loadFavourites.rejected, state => {
        state.isLoading = false;
      });

    builder
      .addCase(addFavourite.pending, (state, action) => {
        state.loadingIds.push(action.meta.arg.id);
      })
      .addCase(addFavourite.fulfilled, (state, action: PayloadAction<Character>) => {
        state.loadingIds = state.loadingIds.filter(id => id !== action.payload.id);
        const exists = state.items.some(c => c.id === action.payload.id);
        if (!exists) {
          state.items.push(action.payload);
        }
      })
      .addCase(addFavourite.rejected, (state, action) => {
        state.loadingIds = state.loadingIds.filter(id => id !== action.meta.arg.id);
      });

    builder
      .addCase(removeFavourite.pending, (state, action) => {
        state.loadingIds.push(action.meta.arg);
      })
      .addCase(removeFavourite.fulfilled, (state, action: PayloadAction<number>) => {
        state.loadingIds = state.loadingIds.filter(id => id !== action.payload);
        state.items = state.items.filter(c => c.id !== action.payload);
      })
      .addCase(removeFavourite.rejected, (state, action) => {
        state.loadingIds = state.loadingIds.filter(id => id !== action.meta.arg);
      });
  },
});

export default favouritesSlice.reducer;
