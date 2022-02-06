import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PreviousRouteService {
  private previousUrl: string;
  private currentUrl: string;
  private parentUrl: string

  constructor(private router: Router) {
    // Se almacena la primera ruta navegada
    this.currentUrl = this.router.url;
    
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Se almacena la ruta anterior
        this.previousUrl = this.currentUrl;
        // Se actualiza la ruta actual por la nueva
        this.currentUrl = event.url;
        // Se almacena la ruta padre de la actual
        this.parentUrl = event.url.substring(0, event.url.indexOf('/', 1));        
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
}
