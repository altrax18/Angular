import { Component, HostBinding, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlaylistService } from '../../../core/services/playlist-service';
@Component({
  selector: 'app-side-bar',
  standalone: true,
  templateUrl: './side-bar.html',
  styleUrls: ['./side-bar.css'],
  imports: [RouterLink, CommonModule],
})
export class SideBarComponent {
  playlistService = inject(PlaylistService);
  expanded = false; //Estado interno , cuando true: Abierto y false: cerrado

  onMouseEnter() {
    console.log('ENTER');
    this.expanded = true; //cambia el estado de expansión
  }

  onMouseLeave() {
    console.log('LEAVE');
    this.expanded = false; // cambie el estado de expansión
  }

  isSearchMenuOpen = false;
  onMouseEnterSearch() {
    this.isSearchMenuOpen = true;
  }
  onMouseLeaveSearch() {
    this.isSearchMenuOpen = false;
  }

  isLibraryMenuOpen = false;

  onMouseEnterLibrary() {
    this.isLibraryMenuOpen = true;
  }

  onMouseLeaveLibrary() {
    this.isLibraryMenuOpen = false;
  }

  @HostBinding('class.expanded')
  get isExpanded() {
    //getter que se evalúa para decidir si se añade la clase
    return this.expanded; // devolvemos valor de expanded.
  }
}
