import { Injectable } from '@angular/core';
import {Headers, Http, Response, ResponseOptions} from '@angular/http';
import {Observable} from 'rxjs';
import {DigitalPart} from '../../model/digital-part';
import {HttpClientService} from '../http/http-client.service';
import {HttpClient} from '../http/http.client';

@Injectable()
export class DigitalPartService {
  private endpoint: string = HttpClient.digitalPartUrl;

  constructor(private http: Http, private client: HttpClientService) {}

  getDigitalPart(id: number): Observable<DigitalPart> {
    return this.client.get(this.endpoint + '/' + id)
      .map((data) => {
        return DigitalPart.create(data);
      });
  }

  getDigitalParts(): Observable<DigitalPart[]> {
    return this.client.get(this.endpoint)
      .map((data) => {
        const customers: DigitalPart[] = [];
        for (let i = 0; i < data.length; i++) {
          customers[i] = DigitalPart.create(data[i]);
        }
        return customers;

      });
  }

  createDigitalPart(customer: DigitalPart): Observable<DigitalPart> {
    return this.client.post(this.endpoint, customer)
      .map((data) => {
          return data;
      });
  }
  updateDigitalPart(customer: DigitalPart): Observable<DigitalPart> {
    return this.client.put(this.endpoint + '/' + customer.id, JSON.stringify(customer))
      .map((data) => {
        return data;
      });
  }

  deleteDigitalPart(id: number): Observable<boolean> {
    return this.client.delete(this.endpoint + '/' + id)
      .map((data) => {
        return true;
      });
  }
}
