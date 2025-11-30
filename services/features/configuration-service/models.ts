export interface IItemCategoriesResponse {
  data: [
    {
      id: string;
      name: string;
      imageUrl: string;
      path: string;
      isParent: boolean;
      children: [
        {
          id: string;
          name: string;
          imageUrl: string;
          parentId: string;
          hasChildren: boolean;
          children: [
            {
              id: string;
              name: string;
              imageUrl: string;
              parentId: string;
              hasChildren: boolean;
              categoryTags: [string];
              level: number;
            },
          ];
          categoryTags: [string];
          level: number;
        },
      ];
      level: number;
    },
  ];
  message: string;
  responseCode: string;
}

export interface IItemColorResponse {
  data: [
    {
      code: string;
      colour: string;
      id: string;
      label: string;
      value: string;
    },
  ];
  message: string;
  responseCode: string;
}

export interface ICountrySeasonResponse {
  data: {
    seasons: [
      {
        id: string;
        countryId: string;
        name: string;
        status: string;
        description: string;
        createdOn: string;
      },
    ];
  };
  message: string;
  responseCode: string;
}

export interface IItemMaterialsResponse {
  data: [
    {
      id: string;
      name: string;
    },
  ];
  message: string;
  responseCode: string;
}

export interface IIitemConditionsResponse {
  data: [
    {
      id: string;
      name: string;
    },
  ];
  message: string;
  responseCode: string;
}

export interface IGenderResponse {
  data: [
    {
      id: string;
      name: string;
    },
  ];
  message: string;
  responseCode: string;
}

export interface IitemSizeResponse {
  data: [
    {
      id: string;
      categoryId: string;
      description: string;
      size: string;
    },
  ];
  message: string;
  responseCode: string;
}

export interface IBrandsResponse {
  data: [
    {
      id: string;
      name: string;
      logoImageUrl: string;
      status?: string;
      createdOn?: string;
    },
  ];
  message: string;
  responseCode: string;
}

export interface ILanguagesResponse {
  data: [
    {
      id: string;
      name: string;
      code: string;
    },
  ];
  message: string;
  responseCode: string;
}

export interface IPercelSizeResponse {
  data: [
    {
      id: string;
      name: string;
      description: string;
      minimumSize: number;
      maximumSize: number;
    },
  ];
  message: string;
  responseCode: string;
  status: number;
}

export interface IItemCategorySizeByIdResponse {
  data: {
    id: string;
    size: string;
    description: string;
    categoryId: string;
    status: string;
    createdOn: string;
  };
  message: string;
  responseCode: string;
}

export interface ICountryResponse {
  data: [
    {
      id: string;
      name: string;
      code: string;
      latitude: number;
      longitude: number;
    },
  ];
  message: string;
  responseCode: string;
}

export interface ICountryLocationResponse {
  data: [
    {
      id: string;
      countryName: string;
      location: string;
    },
  ];
  message: string;
  responseCode: string;
}

export interface ISeasonsResponse {
  data: {
    seasons: [
      {
        id: string;
        countryId: string;
        name: string;
        status: string;
        description: string;
        createdOn: string;
      }
    ];
  };
  message: string;
  responseCode: string;
  status: number;
}
