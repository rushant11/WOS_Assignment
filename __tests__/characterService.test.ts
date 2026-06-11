/**
 * Unit tests for the character API service functions.
 * Axios calls are mocked so no real network requests are made.
 */
import {
  fetchCharacters,
  fetchCharacterById,
  fetchCharactersByIds,
} from '../src/features/characters/services/characterService';
import apiClient from '../src/api/axiosInstance';

jest.mock('../src/api/axiosInstance');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const mockCharacter = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth (C-137)', url: '' },
  location: { name: 'Citadel of Ricks', url: '' },
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  episode: [],
  url: '',
  created: '',
};

const mockApiResponse = {
  info: { count: 826, pages: 42, next: 'https://rickandmortyapi.com/api/character?page=2', prev: null },
  results: [mockCharacter],
};

describe('characterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCharacters', () => {
    it('calls /character with the correct page param', async () => {
      mockedApiClient.get = jest.fn().mockResolvedValueOnce({ data: mockApiResponse });

      const result = await fetchCharacters(1);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/character', { params: { page: 1 } });
      expect(result.results).toHaveLength(1);
      expect(result.info.pages).toBe(42);
    });

    it('appends filter params when provided', async () => {
      mockedApiClient.get = jest.fn().mockResolvedValueOnce({ data: mockApiResponse });

      await fetchCharacters(2, { name: 'Rick', status: 'Alive' });

      expect(mockedApiClient.get).toHaveBeenCalledWith('/character', {
        params: { page: 2, name: 'Rick', status: 'Alive' },
      });
    });

    it('does not append empty filter values', async () => {
      mockedApiClient.get = jest.fn().mockResolvedValueOnce({ data: mockApiResponse });

      await fetchCharacters(1, { name: '', status: '', gender: '' });

      const callArgs = (mockedApiClient.get as jest.Mock).mock.calls[0][1].params;
      expect(callArgs).not.toHaveProperty('name');
      expect(callArgs).not.toHaveProperty('status');
    });
  });

  describe('fetchCharacterById', () => {
    it('calls /character/{id} with the correct ID', async () => {
      mockedApiClient.get = jest.fn().mockResolvedValueOnce({ data: mockCharacter });

      const result = await fetchCharacterById(1);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/character/1');
      expect(result.id).toBe(1);
      expect(result.name).toBe('Rick Sanchez');
    });

    it('propagates errors from the API', async () => {
      mockedApiClient.get = jest.fn().mockRejectedValueOnce(new Error('Not found'));

      await expect(fetchCharacterById(9999)).rejects.toThrow('Not found');
    });
  });

  describe('fetchCharactersByIds', () => {
    it('returns empty array for empty ids input', async () => {
      const result = await fetchCharactersByIds([]);
      expect(result).toEqual([]);
      expect(mockedApiClient.get).not.toHaveBeenCalled();
    });

    it('calls single-ID endpoint for one ID', async () => {
      mockedApiClient.get = jest.fn().mockResolvedValueOnce({ data: mockCharacter });

      const result = await fetchCharactersByIds([1]);
      expect(mockedApiClient.get).toHaveBeenCalledWith('/character/1');
      expect(result).toHaveLength(1);
    });

    it('calls batch endpoint for multiple IDs', async () => {
      mockedApiClient.get = jest.fn().mockResolvedValueOnce({ data: [mockCharacter, { ...mockCharacter, id: 2 }] });

      const result = await fetchCharactersByIds([1, 2]);
      expect(mockedApiClient.get).toHaveBeenCalledWith('/character/1,2');
      expect(result).toHaveLength(2);
    });
  });
});
