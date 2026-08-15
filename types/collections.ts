export interface CollectionOutfit {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: string; // "Public" or "Private"
  createdOn: string;
}

export interface Collection {
  id: string;
  name: string; // API returns 'name', not 'title'
  description?: string;
  outfitsCount?: number;
  createdOn?: string; // API returns 'createdOn', not 'createdAt'
  recentOutfits?: CollectionOutfit[]; // New field from updated API
}
