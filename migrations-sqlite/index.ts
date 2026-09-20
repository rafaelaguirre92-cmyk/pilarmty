import * as migration_20260828_022521_events_content_hub from './20260828_022521_events_content_hub';
import * as migration_20260828_062426_communities_content_hub from './20260828_062426_communities_content_hub';
import * as migration_20260831_014500_topic_page_publication from './20260831_014500_topic_page_publication';
import * as migration_20260831_021500_topic_page_unpublication from './20260831_021500_topic_page_unpublication';
import * as migration_20260920_120000_author_notion_fields from './20260920_120000_author_notion_fields';
import * as migration_20260920_130000_youtube_description from './20260920_130000_youtube_description';
import * as migration_20260920_140000_archive_legacy_teaching_duplicates from './20260920_140000_archive_legacy_teaching_duplicates';

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
  {
    up: migration_20260831_014500_topic_page_publication.up,
    down: migration_20260831_014500_topic_page_publication.down,
    name: '20260831_014500_topic_page_publication'
  },
  {
    up: migration_20260831_021500_topic_page_unpublication.up,
    down: migration_20260831_021500_topic_page_unpublication.down,
    name: '20260831_021500_topic_page_unpublication'
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
  {
    up: migration_20260920_140000_archive_legacy_teaching_duplicates.up,
    down: migration_20260920_140000_archive_legacy_teaching_duplicates.down,
    name: '20260920_140000_archive_legacy_teaching_duplicates'
  },
];
