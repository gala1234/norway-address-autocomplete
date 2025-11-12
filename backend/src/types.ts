
export interface Address {
  street: string;
  postNumber: number;
  city: string;
  county: string;
  district: string;
  municipality: string;
  municipalityNumber: number;
  type: string;
  typeCode: number;
}

export interface SearchPayload {
  items: Address[];
  total: number;
  limit: number;
}
