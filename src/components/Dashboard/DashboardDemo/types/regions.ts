export interface Region {
  name: string;
  code: string;
}

export interface RegionGroup {
  name: string;
  regions: Region[];
}