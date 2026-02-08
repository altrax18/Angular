import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Track } from '../../../core/services/music-service';
import { RouterLink } from '@angular/router';
import { AudioService } from '../../../core/services/audio-service';
import { PlaylistService } from '../../../core/services/playlist-service';

@Component({
  selector: 'app-track-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './track-card.html',
  styleUrls: ['./track-card.css'],
})
export class TrackCardComponent {
  track = input.required<Track>();
  private audioService = inject(AudioService);
  private playlistService = inject(PlaylistService);

  isPlaying = false;

  togglePlay(event: Event) {
    event.stopPropagation();

    if (this.isPlaying) {
      this.audioService.pause();
    } else {
      this.audioService.playTrack(this.track());
    }

    this.isPlaying = !this.isPlaying;
  }

  addToPlaylist(event: Event) {
    event.stopPropagation();

    const lists = this.playlistService.playlists();
    if (lists.length === 0) {
      alert('Primero crea una lista en "Mis listas".');
      return;
    }

    const options = lists
      .map((list, index) => `${index + 1}. ${list.name}`)
      .join('\n');

    const value = prompt(`Elige el numero de la lista:\n${options}`);
    if (value === null) return;

    const selectedIndex = Number(value) - 1;
    if (
      Number.isNaN(selectedIndex) ||
      selectedIndex < 0 ||
      selectedIndex >= lists.length
    ) {
      alert('Numero no valido.');
      return;
    }

    const added = this.playlistService.addTrackToPlaylist(
      lists[selectedIndex].id,
      this.track()
    );

    alert(added ? 'Cancion guardada en la lista.' : 'La cancion ya estaba en esa lista.');
  }
}
