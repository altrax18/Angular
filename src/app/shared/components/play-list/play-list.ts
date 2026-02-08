import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../../../core/services/audio-service';
import { Track } from '../../../core/services/music-service';
import { PlaylistService } from '../../../core/services/playlist-service';

@Component({
  selector: 'app-play-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './play-list.html',
  styleUrl: './play-list.css',
})
export class PlayList implements OnInit {
  private playlistService = inject(PlaylistService);
  private audioService = inject(AudioService);

  playlists = this.playlistService.playlists;
  newListName = '';
  selectedListId = signal<number | null>(null);

  selectedList = computed(() => {
    const listId = this.selectedListId();
    if (listId === null) return null;
    return this.playlists().find((list) => list.id === listId) ?? null;
  });

  ngOnInit() {
    const first = this.playlists()[0];
    if (first) {
      this.selectedListId.set(first.id);
    }
  }

  createList() {
    const created = this.playlistService.createPlaylist(this.newListName);
    if (!created) return;

    this.newListName = '';
    this.selectedListId.set(created.id);
  }

  selectList(id: number) {
    this.selectedListId.set(id);
  }

  deleteList(id: number) {
    this.playlistService.removePlaylist(id);

    if (this.selectedListId() === id) {
      const first = this.playlists()[0];
      this.selectedListId.set(first ? first.id : null);
    }
  }

  removeTrack(trackId: number) {
    const listId = this.selectedListId();
    if (listId === null) return;

    this.playlistService.removeTrackFromPlaylist(listId, trackId);
  }

  playTrack(track: Track, queue: Track[]) {
    this.audioService.playTrack(track, queue);
  }
}
