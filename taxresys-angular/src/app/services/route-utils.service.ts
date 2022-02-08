import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class RouteUtilsService {
  private previousUrl: string;
  private currentUrl: string;
  private parentUrl: string;
  private title: string;

  constructor(private _router: Router, private _titleService: Title) {
    // Se almacena la primera ruta navegada
    this.currentUrl = this._router.url;    
    // Se almacena el title inicial de la app
    this.title = this._titleService.getTitle();

    _router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Se almacena la ruta anterior
        this.previousUrl = this.currentUrl;
        // Se actualiza la ruta actual por la nueva
        this.currentUrl = event.url;
        // Se almacena la ruta padre de la actual
        this.parentUrl = event.url.substring(0, event.url.indexOf('/', 1));
        // Se recupera el/los title/s de la url actual y se setea uno nuevo
        let newTitle = this.getNestedRouteTitles().join(' | ');
        this._titleService.setTitle(`${this.title}${newTitle}`);
      }
    });
  }

  /**
   * Retorna la url visitada anteriormente
   */
  public getPreviousUrl() {
    return this.previousUrl;
  }

  /**
   * Retorna la url "padre" de la actual, o un string vacío
   */
  public getParentUrl() {
    return this.parentUrl;
  }

  /**
   * Lee el atributo 'title' dentro de la 'data' de cada ruta
   */
  private getNestedRouteTitles(): string[] {
    let currentRoute = this._router.routerState.root.firstChild;
    const titles: string[] = [];

    while (currentRoute) {
      if (currentRoute.snapshot.routeConfig.data?.title) {
        titles.push(currentRoute.snapshot.routeConfig.data.title);
      }

      currentRoute = currentRoute.firstChild;
    }

    return titles;
  }
}
