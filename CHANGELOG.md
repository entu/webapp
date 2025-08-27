## 2025-08-27
- **Improved toolbar design**: Made the entity toolbar responsive and adaptive to screen width
- **New debug shortcut**: Removed the debug button and added Alt+click on entity names to access debug info
- **Changelog**: Added changelog component that displays latest changes with expandable full history drawer
- **Print functionality**: Fixed print issues where content beyond the first page was not visible
- **Better component structure**: Refactored property values into reusable components for cleaner code

## 2025-08-26
- **Advanced search feature**: Added a powerful search modal with property filters, custom operators, and robust date parsing that handles various date formats
- **Table view option**: Introduced a new table view for entity lists alongside the existing list view with fine-tuned styling

## 2025-08-25
- **Enhanced search capabilities**: Added support for 'in' operator in entity filtering for more precise searches

## 2025-08-22
- **Property visibility improvements**: Enhanced sharing indicators to show which properties are visible to whom with restricted domain-level access

## 2025-08-21
- **Property sharing overhaul**: Replaced 'public' property system with more flexible 'sharing' system and added visual indicators to show property visibility levels (private/domain/public)
- **API documentation improvements**: Better OpenAPI path filtering and configuration

## 2025-08-19
- **Form improvements**: Enhanced property editing with better empty field handling and validation
- **Smarter search**: Improved word splitting and search term processing

## 2025-08-18
- **Search optimization**: Limited search terms to 20 characters to improve performance
- **Multilingual fixes**: Resolved issues with multilingual property selection and validation

## 2025-07-31
- **Analytics integration**: Added Entu Analytics for better usage insights

## 2025-07-21
- **API documentation polish**: Added proper tags, improved organization, cleaned up OpenAPI docs, and hid unnecessary model details

## 2025-07-18
- **API structure improvements**: Renamed API paths for better organization and changed 'account' to 'db' parameter for clarity
- **Documentation creation**: Added comprehensive API.md documentation file

## 2025-07-16
- **OpenAPI documentation**: Enabled full API documentation with metadata, examples, and disabled Swagger in favor of cleaner OpenAPI docs
- **Icon system upgrade**: Replaced nuxt-icons with modern @nuxt/icon package
- **Number input fixes**: Resolved decimal precision issues in number editing

## 2025-07-03
- **Entity duplication feature**: Added ability to duplicate entities with smart filtering that automatically excludes sensitive and file properties

## 2025-05-12
- **Statistics improvements**: Fixed properties stats calculation and display

## 2025-05-02
- **Navigation fixes**: Fixed menu handling with empty queries and resolved parent entity errors

## 2025-04-25
- **OpenSearch integration**: Implemented direct request logging to OpenSearch with improved path handling and empty path filtering

## 2025-04-23
- **System optimization**: Enhanced logging capabilities and improved reference property handling to preserve entity_type and property_type information

## 2025-04-21
- **Entity comparison system**: Added entity hashing and comparison before aggregation of formula changes, implemented isDeepStrictEqual for better data integrity

## 2025-04-17
- **Reference system improvements**: Enhanced reference finding by name, rights and formula changes with optimized aggregation limits

## 2025-04-16
- **Background processing**: Introduced background entity aggregation system for improved performance
- **Optimization**: Improved deletion of reference properties and enhanced queue management for non-aggregated entities

## 2025-02-19
- **UI improvements**: Updated entity page layout and fixed filtering functionality
- **System cleanup**: Removed system properties grouping for cleaner property display

## 2025-02-17
- **Third-party removal**: Removed Intercom integration to simplify the codebase
