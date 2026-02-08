import { Routes } from '@angular/router'; // Importar el tipo para definir las rutas
import { LayoutComponent } from './shared/components/layout/layout';
import { TrackDetailComponent } from './shared/components/track-detail/track-detail';
import { PortadaComponent } from './shared/components/portada/portada';
import { AlbumDetail } from './shared/components/album-detail/album-detail';
import { TrackListComponent } from './shared/components/track-list/track-list';
import { ProfileComponent } from './shared/components/profile/profile';
import { PlayList } from './shared/components/play-list/play-list';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: PortadaComponent },
      { path: 'tracks', component: TrackListComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'playlists', component: PlayList },

      // DENTRO DEL MISMO LAYOUT
      { path: 'trackDetail/:id', component: TrackDetailComponent },
      { path: 'albumDetail/:id', component: AlbumDetail },
    ],
  },
];
