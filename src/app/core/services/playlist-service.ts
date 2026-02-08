import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Track } from './music-service';

export interface PlaylistItem {
  id: number;
  name: string;
  tracks: Track[];
}

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  private storageKey = 'soundhub_playlists';
  private isBrowser: boolean;

  playlists = signal<PlaylistItem[]>([]);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.loadPlaylists();
    }
  }

  createPlaylist(name: string): PlaylistItem | null {
    const cleanName = name.trim();
    if (!cleanName) return null;

    const newPlaylist: PlaylistItem = {
      id: Date.now(),
      name: cleanName,
      tracks: [],
    };

    this.playlists.update((current) => [...current, newPlaylist]);
    this.savePlaylists();
    return newPlaylist;
  }

  removePlaylist(id: number) {
    this.playlists.update((current) => current.filter((list) => list.id !== id));
    this.savePlaylists();
  }

  addTrackToPlaylist(playlistId: number, track: Track): boolean {
    let added = false;

    this.playlists.update((current) =>
      current.map((list) => {
        if (list.id !== playlistId) return list;

        const exists = list.tracks.some((item) => item.trackId === track.trackId);
        if (exists) return list;

        added = true;
        return {
          ...list,
          tracks: [...list.tracks, track],
        };
      })
    );

    if (added) {
      this.savePlaylists();
    }

    return added;
  }

  removeTrackFromPlaylist(playlistId: number, trackId: number) {
    this.playlists.update((current) =>
      current.map((list) => {
        if (list.id !== playlistId) return list;

        return {
          ...list,
          tracks: list.tracks.filter((track) => track.trackId !== trackId),
        };
      })
    );
    this.savePlaylists();
  }

  private loadPlaylists() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw) as PlaylistItem[];
      if (!Array.isArray(parsed)) return;

      this.playlists.set(parsed);
    } catch {
      this.playlists.set([]);
    }
  }

  private savePlaylists() {
    if (!this.isBrowser) return;
    localStorage.setItem(this.storageKey, JSON.stringify(this.playlists()));
  }
}
