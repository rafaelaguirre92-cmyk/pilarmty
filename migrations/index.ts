import * as migration_20260831_211704_initial_schema from './20260831_211704_initial_schema';
import * as migration_20260901_141500_spotify_audio from './20260901_141500_spotify_audio';

export const migrations = [
  {
    up: migration_20260831_211704_initial_schema.up,
    down: migration_20260831_211704_initial_schema.down,
    name: '20260831_211704_initial_schema'
  },
  {
    up: migration_20260901_141500_spotify_audio.up,
    down: migration_20260901_141500_spotify_audio.down,
    name: '20260901_141500_spotify_audio'
  },
];
