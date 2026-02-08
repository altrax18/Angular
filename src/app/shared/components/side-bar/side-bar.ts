import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostBinding, HostListener, PLATFORM_ID, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Track } from '../../../core/services/music-service';
import { PlaylistService } from '../../../core/services/playlist-service';
import { AudioService } from '../../../core/services/audio-service';
@Component({
  selector: 'app-side-bar',
  standalone: true,
  templateUrl: './side-bar.html',
  styleUrls: ['./side-bar.css'],
  imports: [RouterLink, CommonModule],
})
export class SideBarComponent {
  private libraryStorageKey = 'soundhub_library_tracks';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  playlistService = inject(PlaylistService);
  audioService = inject(AudioService);
  libraryTracks = signal<Track[]>([]);
  expanded = false; //Estado interno , cuando true: Abierto y false: cerrado

  constructor() {
    this.loadLibraryTracks();
  }

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

  playFromLibrary(event: Event, track: Track) {
    event.stopPropagation();
    this.audioService.playTrack(track, this.libraryTracks());
  }

  isTrackPlaying(track: Track): boolean {
    return this.audioService.isPlaying() && this.audioService.currentTrack()?.trackId === track.trackId;
  }

  @HostListener('window:soundhub-library-updated')
  onLibraryUpdated() {
    this.loadLibraryTracks();
  }

  @HostListener('window:storage', ['$event'])
  onStorageUpdate(event: StorageEvent) {
    if (event.key === this.libraryStorageKey) {
      this.loadLibraryTracks();
    }
  }

  private loadLibraryTracks() {
    if (!this.isBrowser) {
      this.libraryTracks.set([]);
      return;
    }

    try {
      const raw = localStorage.getItem(this.libraryStorageKey);
      if (!raw) {
        this.libraryTracks.set([]);
        return;
      }

      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        this.libraryTracks.set([]);
        return;
      }

      this.libraryTracks.set(parsed as Track[]);
    } catch {
      this.libraryTracks.set([]);
    }
  }

  @HostBinding('class.expanded')
  get isExpanded() {
    //getter que se evalúa para decidir si se añade la clase
    return this.expanded; // devolvemos valor de expanded.
  }
}
