import { Component } from '@angular/core';
import { PokemonInterface, PokemonService } from './services/pokemon.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public limit: number = 15;
  public maxItems: number = 150;
  public pokemonList: PokemonInterface[] = [];
  public pokemon: any | null = null;

  constructor(private pokemonService: PokemonService) {
    this.pokemonService.getPokemonList();
  }

  public ngOnInit(): void {
    this.pokemonService.pokemonList$
      .subscribe(list => this.pokemonList = list);
    this.pokemonService.pokemon$
      .subscribe(item => this.pokemon = item);
  }

  public getPokemonDetails(name: string): void {
    this.pokemonService.getPokemon(name);
  }

  public listNavigation(pagination: {length: number, pageIndex: number, pageSize: number, previousPageIndex?: number}): void {
    this.pokemonService.getPokemonList(pagination.pageIndex * this.limit);
  }
}
