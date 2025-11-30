export interface CountrySeasonItemDataType {
  id: string;
  countryId: string;
  name: string;
  status: string;
  description: string;
  createdOn: string;
}

export interface CountrySeasonStoreStateType {
  seasons: Array<CountrySeasonItemDataType> | null;
  activeSeasons: Array<CountrySeasonItemDataType> | null;
}
