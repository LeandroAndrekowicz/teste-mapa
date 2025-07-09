export interface ProposalWithGeoInterface {
  totalCubage: number;
  lat: number;
  long: number;
  clientName: string;
  proposal: number;
  simpCode: number;
  address: AddressInterface;
  products: ProductsInterface[];
}

export interface ProposalInterface {
  clientName: string;
  proposal: number;
  simpCode: number;
  address: AddressInterface;
  products: ProductsInterface[];
}

export interface ProductsInterface {
  productName: string;
  measure: string;
  local: string;
  cubage: number;
}

export interface AddressInterface {
  city: string;
  state: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
}
