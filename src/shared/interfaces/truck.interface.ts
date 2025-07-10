import { AddressInterface } from './proposal.interface';

export interface TrucksInterface {
    truck: string;
    cubage: number;
    plate: string;
}

export interface AvailableTrucksInterface {
  truck: string;
  cubage: number;
  plate: string;
}

export interface RoutesWithTrucksInterface {
  truck: AvailableTrucksInterface;
  totalCubage: number;
  deliveries: DeliveriesInterface[];
}

export interface DeliveriesInterface {
  identifier: string;
  clientName: string;
  address: AddressInterface;
  coordinates: CoordinatesInterface;
  cubage: number;
}

export interface CoordinatesInterface {
  lat: number;
  long: number;
}
