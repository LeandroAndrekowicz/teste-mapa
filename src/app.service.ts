import { Injectable, InternalServerErrorException, Logger, UnprocessableEntityException } from '@nestjs/common';
import { ProposalJson } from './shared/jsons/proposal';
import { TrucksJson } from './shared/jsons/trucks';
import { initialLat, initialLong, providerKey } from './shared/constants/environment.const';
import { kmeans } from 'ml-kmeans';
import * as NodeGeocoder from 'node-geocoder';
import { ProposalWithGeoInterface } from './shared/interfaces/proposal.interface';
import { KMeansResult } from 'ml-kmeans/lib/KMeansResult';
import { AvailableTrucksInterface, RoutesWithTrucksInterface } from './shared/interfaces/truck.interface';

@Injectable()
export class AppService {
  private logger: Logger = new Logger();

  async getRoute(): Promise<{ message: string; routes: RoutesWithTrucksInterface[]; }> {
    try {
      const options: NodeGeocoder.GoogleOptions = {
        provider: 'google',
        apiKey: providerKey,
      };
      const geocoder: NodeGeocoder.Geocoder = NodeGeocoder(options);

      const proposalsWithGeo: ProposalWithGeoInterface[] = await Promise.all(
        ProposalJson.map(async (proposal) => {
          const completeAddress: string = `${proposal.address.street}, ${proposal.address.number} - ${proposal.address.neighborhood}, ${proposal.address.city} - ${proposal.address.state}, ${proposal.address.cep}`;
          const response: NodeGeocoder.Entry[] = await geocoder.geocode(completeAddress);
          const totalCubage: number = proposal.products.reduce((sum, p) => sum + p.cubage, 0,);

          return {
            ...proposal,
            totalCubage,
            lat: response[0]?.latitude ?? 0,
            long: response[0]?.longitude ?? 0,
          };
        }),
      );

      const coordinates: number[][] = proposalsWithGeo.map((p) => [p.lat, p.long]);
      const kmeansResult: KMeansResult = kmeans(coordinates, 3, { initialization: 'mostDistant' });

      type ProposalWithGeo = (typeof proposalsWithGeo)[number];
      const groupedRoutes: ProposalWithGeo[][] = [[], [], []];

      kmeansResult.clusters.forEach((clusterIndex, index) => {
        groupedRoutes[clusterIndex].push(proposalsWithGeo[index]);
      });

      const availableTrucks: AvailableTrucksInterface[] = [...TrucksJson].sort((a, b) => b.cubage - a.cubage);
      const routesWithTrucks: RoutesWithTrucksInterface[] = groupedRoutes.map((route, index) => {
        const totalCubage: number = route.reduce((sum, p) => sum + p.totalCubage, 0);
        const suitableTruck = availableTrucks.find((truck) => truck.cubage >= totalCubage);

        if (!suitableTruck) {
          throw new UnprocessableEntityException(`Nenhum caminhão com capacidade suficiente para a rota: ${index + 1}`);
        }

        const truckIndex: number = availableTrucks.indexOf(suitableTruck);
        availableTrucks.splice(truckIndex, 1);

        return {
          truck: suitableTruck,
          totalCubage, 
          startingPoint: {
              lat: initialLat,
              long: initialLong,
          },
          deliveries: route.map((proposal) => ({
            identifier: `${proposal.simpCode} ${proposal.proposal}`,
            clientName: proposal.clientName,
            address: proposal.address,
            coordinates: {
              lat: proposal.lat,
              long: proposal.long,
            },
            cubage: proposal.totalCubage,
          })),
        };
      });

      return {
        message: 'Rotas agrupadas com sucesso.',
        routes: routesWithTrucks,
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Ocorreu um problema ao gerar rotas.');
    }
  }
}
