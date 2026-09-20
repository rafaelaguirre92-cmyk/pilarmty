import * as migration_20260831_211704_initial_schema from './20260831_211704_initial_schema';
import * as migration_20260901_141500_spotify_audio from './20260901_141500_spotify_audio';
import * as migration_20260903_120000_series_image_formats from './20260903_120000_series_image_formats';
import * as migration_20260920_120000_author_notion_fields from './20260920_120000_author_notion_fields';
import * as migration_20260920_130000_youtube_description from './20260920_130000_youtube_description';

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
  {
    up: migration_20260903_120000_series_image_formats.up,
    down: migration_20260903_120000_series_image_formats.down,
    name: '20260903_120000_series_image_formats'
  },
  {
    up: migration_20260920_120000_author_notion_fields.up,
    down: migration_20260920_120000_author_notion_fields.down,
    name: '20260920_120000_author_notion_fields'
  },
  {
    up: migration_20260920_130000_youtube_description.up,
    down: migration_20260920_130000_youtube_description.down,
    name: '20260920_130000_youtube_description'
  },
];
