import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, PLATFORM_ID, inject, input, signal } from '@angular/core';
import { Track } from '../../../core/services/music-service';
import { RouterLink } from '@angular/router';
import { AudioService } from '../../../core/services/audio-service';
import { PlaylistService } from '../../../core/services/playlist-service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-track-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './track-card.html',
  styleUrls: ['./track-card.css'],
})
export class TrackCardComponent {
  private static nextOptionsMenuId = 1;
  private libraryStorageKey = 'soundhub_library_tracks';
  private optionsMenuOpenEvent = 'soundhub-track-options-opened';
  private platformId = inject(PLATFORM_ID);
  private elementRef = inject(ElementRef<HTMLElement>);
  private isBrowser = isPlatformBrowser(this.platformId);
  private optionsMenuId = TrackCardComponent.nextOptionsMenuId++;

  track = input.required<Track>();
  private audioService = inject(AudioService);
  private snackBar = inject(MatSnackBar);
  playlistService = inject(PlaylistService);
  libraryTrackIds = signal<number[]>([]);

  isPlaying = false;
  isMenuOpen = false;

  constructor() {
    this.refreshLibraryTrackIds();
  }

  togglePlay(event: Event) {
    event.stopPropagation();

    if (this.isPlaying) {
      this.audioService.pause();
    } else {
      this.audioService.playTrack(this.track());
    }

    this.isPlaying = !this.isPlaying;
  }

  toggleOptionsMenu(event: Event) {
    event.stopPropagation();
    const shouldOpen = !this.isMenuOpen;

    if (!shouldOpen) {
      this.isMenuOpen = false;
      return;
    }

    if (this.isBrowser) {
      window.dispatchEvent(
        new CustomEvent<number>(this.optionsMenuOpenEvent, {
          detail: this.optionsMenuId,
        })
      );
    }

    this.isMenuOpen = true;
  }

  stopCardNavigation(event: Event) {
    event.stopPropagation();
  }

  addToPlaylist(event: Event, listId: number) {
    event.stopPropagation();

    const added = this.playlistService.addTrackToPlaylist(listId, this.track());
    this.isMenuOpen = false;

    this.showNotice(
      added ? 'Cancion guardada en la lista.' : 'La cancion ya estaba en esa lista.',
      added ? 'success' : 'info'
    );
  }

  addToLibrary(event: Event) {
    event.stopPropagation();

    if (!this.isBrowser) return;

    const tracks = this.readLibraryTracks();
    const exists = tracks.some((item) => item.trackId === this.track().trackId);

    if (exists) {
      this.isMenuOpen = false;
      this.showNotice('La cancion ya esta en tu biblioteca.', 'info');
      return;
    }

    tracks.push(this.track());
    localStorage.setItem(this.libraryStorageKey, JSON.stringify(tracks));
    this.refreshLibraryTrackIds();
    this.isMenuOpen = false;
    window.dispatchEvent(new Event('soundhub-library-updated'));
    this.showNotice('Cancion guardada en tu biblioteca.', 'success');
  }

  removeFromLibrary(event: Event) {
    event.stopPropagation();

    if (!this.isBrowser) return;

    const updatedTracks = this.readLibraryTracks().filter(
      (item) => item.trackId !== this.track().trackId
    );

    localStorage.setItem(this.libraryStorageKey, JSON.stringify(updatedTracks));
    this.refreshLibraryTrackIds();
    this.isMenuOpen = false;
    window.dispatchEvent(new Event('soundhub-library-updated'));
    this.showNotice('Cancion eliminada de tu biblioteca.', 'info');
  }

  createPlaylistAndAddTrack(event: Event) {
    event.stopPropagation();

    const listName = prompt('Nombre de la nueva lista');
    if (listName === null) {
      this.isMenuOpen = false;
      return;
    }

    const created = this.playlistService.createPlaylist(listName);
    if (!created) {
      this.isMenuOpen = false;
      this.showNotice('Escribe un nombre valido para crear la lista.', 'error');
      return;
    }

    this.playlistService.addTrackToPlaylist(created.id, this.track());
    this.isMenuOpen = false;
    this.showNotice('Lista creada y cancion guardada.', 'success');
  }

  isTrackInLibrary(): boolean {
    return this.libraryTrackIds().includes(this.track().trackId);
  }

  isTrackInPlaylist(listId: number): boolean {
    const list = this.playlistService.playlists().find((item) => item.id === listId);
    if (!list) return false;

    return list.tracks.some((item) => item.trackId === this.track().trackId);
  }

  @HostListener('window:soundhub-library-updated')
  onLibraryUpdated() {
    this.refreshLibraryTrackIds();
  }

  @HostListener('window:soundhub-track-options-opened', ['$event'])
  onAnyOptionsMenuOpened(event: Event) {
    const detail = (event as CustomEvent<number>).detail;
    if (detail !== this.optionsMenuId) {
      this.isMenuOpen = false;
    }
  }

  @HostListener('window:storage', ['$event'])
  onStorageUpdate(event: StorageEvent) {
    if (event.key === this.libraryStorageKey) {
      this.refreshLibraryTrackIds();
    }
  }

  @HostListener('document:focusin', ['$event'])
  closeOptionsMenuOnFocusOut(event: FocusEvent) {
    const target = event.target;
    if (!(target instanceof Node)) return;

    if (!this.elementRef.nativeElement.contains(target)) {
      this.isMenuOpen = false;
    }
  }

  @HostListener('document:click')
  closeOptionsMenu() {
    this.isMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  closeOptionsMenuOnEscape() {
    this.isMenuOpen = false;
  }

  private refreshLibraryTrackIds() {
    this.libraryTrackIds.set(this.readLibraryTracks().map((track) => track.trackId));
  }

  private readLibraryTracks(): Track[] {
    if (!this.isBrowser) return [];

    try {
      const raw = localStorage.getItem(this.libraryStorageKey);
      if (!raw) return [];

      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];

      return parsed as Track[];
    } catch {
      return [];
    }
  }

  private showNotice(message: string, type: 'success' | 'info' | 'error') {
    this.snackBar.open(message, 'Cerrar', {
      duration: type === 'error' ? 3600 : 2600,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['app-snackbar', `app-snackbar--${type}`],
    });
  }
}
