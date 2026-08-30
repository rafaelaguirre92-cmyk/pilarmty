import * as migration_20260828_022521_events_content_hub from './20260828_022521_events_content_hub';
import * as migration_20260828_062426_communities_content_hub from './20260828_062426_communities_content_hub';

export const migrations = [
  {
    up: migration_20260828_022521_events_content_hub.up,
    down: migration_20260828_022521_events_content_hub.down,
    name: '20260828_022521_events_content_hub',
  },
  {
    up: migration_20260828_062426_communities_content_hub.up,
    down: migration_20260828_062426_communities_content_hub.down,
    name: '20260828_062426_communities_content_hub'
  },
];
