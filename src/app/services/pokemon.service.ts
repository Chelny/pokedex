import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { pluck, tap } from 'rxjs/operators';

const API_URL = 'https://pokeapi.co/api/v2';

export type PokemonInterface = {
  name: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  public pokemonListCache = new Map();
  public pokemonCache = new Map();

  private pokemonList: BehaviorSubject<PokemonInterface[]> = new BehaviorSubject<PokemonInterface[]>([]);
  public pokemonList$: Observable<PokemonInterface[]> = this.pokemonList.asObservable();
  private pokemon: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);
  public pokemon$: Observable<any | null> = this.pokemon.asObservable();

  constructor(private http: HttpClient) {}

  public getPokemonList(offset: number = 0, limit: number = 15): void {
    const URL: string = `${API_URL}/pokemon?offset=${offset}&limit=${limit}`;

    const dataFromCache: any = this.pokemonListCache.get(URL);
    let response: Observable<any>;

    if (dataFromCache) {
      response = of(dataFromCache);
    } else {
      response = this.http.get<any>(URL).pipe(pluck('results'));
    }

    response.pipe(
      tap((items: PokemonInterface[]) => {
        this.pokemonList.next(items);
        this.pokemonListCache.set(URL, items);
      })
    ).subscribe();
  }

  public getPokemon(name: string): void {
    const pokemon = this.http.get<any>(`${API_URL}/pokemon/${name}`);
    const pokemonSpecies = this.http.get<any>(`${API_URL}/pokemon-species/${name}`);
    const URL: string = `${API_URL}/pokemon/${name}`;

    const dataFromCache: any = this.pokemonCache.get(URL);
    let response: Observable<any>;

    if (dataFromCache) {
      response = of(dataFromCache);
    } else {
      response = forkJoin([pokemon, pokemonSpecies]);
    }

    response.pipe(
      tap((response: any[]) => {
        const item: any = Array.isArray(response) ? response.reduce(((r: any, c: any) => Object.assign(r, c)), {}) : response;
        this.pokemon.next(item);
        this.pokemonCache.set(URL, item);
      })
    ).subscribe();
  }
}
