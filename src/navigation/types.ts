import { NavigatorScreenParams } from '@react-navigation/native';
import { Character } from '../types/character';

export type RootTabParamList = {
  Characters: NavigatorScreenParams<CharactersStackParamList>;
  Episodes: undefined;
  Locations: undefined;
  Favourites: NavigatorScreenParams<FavouritesStackParamList>;
};

export type CharactersStackParamList = {
  CharacterList: undefined;
  CharacterDetail: { id: number; name: string; character?: Character };
};

export type FavouritesStackParamList = {
  FavouritesList: undefined;
  CharacterDetail: { id: number; name: string; character?: Character };
};
