# Requirements Document

## Introduction

The Map Search feature adds a unified search input to the MyMap map page. Users can search for existing pinned locations by typing text (matching title or description), or paste geographic coordinates (e.g. from Google Maps) to navigate the map directly to that position. The search bar sits on top of the map and provides real-time results.

## Glossary

- **Search_Bar**: The unified text input component overlaid on the map page that accepts both text queries and coordinate input
- **Location**: A pinned place stored in Firestore with id, lat, lng, title, description, price, imageUrl, tiktokUrl, status, and createdAt fields
- **Coordinate_Input**: A string containing latitude and longitude values in a recognized format (e.g. `10.8231, 106.6297` or `10.8231,106.6297`)
- **Text_Query**: A non-coordinate string used to filter locations by title or description
- **Results_List**: A dropdown list displayed below the Search_Bar showing matching locations
- **Map_View**: The Leaflet map instance displayed on the map page

## Requirements

### Requirement 1: Unified Search Input

**User Story:** As a user, I want a single search input on the map page, so that I can search locations by text or navigate by coordinates without switching between different inputs.

#### Acceptance Criteria

1. THE Search_Bar SHALL be displayed as a text input overlaid on the Map_View with a fixed position above the map content
2. THE Search_Bar SHALL accept both Text_Query and Coordinate_Input in the same input field
3. WHEN the user types into the Search_Bar, THE Search_Bar SHALL distinguish between Text_Query and Coordinate_Input by detecting whether the input matches a coordinate pattern
4. THE Search_Bar SHALL use a recognizable search icon and placeholder text indicating both search capabilities (e.g. "Search locations or paste coordinates...")

### Requirement 2: Text Search for Existing Locations

**User Story:** As a user, I want to search pinned locations by typing a name or description, so that I can quickly find and navigate to a specific location on the map.

#### Acceptance Criteria

1. WHEN the user enters a Text_Query, THE Search_Bar SHALL filter the loaded locations list by matching the query against Location title and description fields (case-insensitive)
2. WHEN matching locations are found, THE Results_List SHALL display each matching Location showing its title, status, and a truncated description
3. WHEN the user selects a Location from the Results_List, THE Map_View SHALL pan and zoom to center on the selected Location coordinates
4. WHEN the user selects a Location from the Results_List, THE Map_View SHALL open the popup for the selected Location marker
5. WHEN no locations match the Text_Query, THE Results_List SHALL display a "No locations found" message
6. WHEN the Text_Query is fewer than 2 characters, THE Results_List SHALL not be displayed

### Requirement 3: Coordinate-Based Navigation

**User Story:** As a user, I want to paste geographic coordinates copied from Google Maps, so that the map navigates directly to that position.

#### Acceptance Criteria

1. THE Search_Bar SHALL recognize coordinate patterns in the following formats: `lat, lng` and `lat,lng` where lat and lng are decimal numbers (e.g. `10.8231, 106.6297`)
2. WHEN the user enters a valid Coordinate_Input, THE Results_List SHALL display a single option showing the parsed coordinates with a "Go to coordinates" label
3. WHEN the user selects the coordinate option from the Results_List, THE Map_View SHALL pan and zoom to the specified latitude and longitude
4. WHEN the user enters a Coordinate_Input with latitude outside the range -90 to 90 or longitude outside the range -180 to 180, THE Search_Bar SHALL treat the input as a Text_Query instead
5. THE Search_Bar SHALL also recognize the Google Maps URL format containing `@lat,lng` to extract coordinates

### Requirement 4: Search Results Dismissal

**User Story:** As a user, I want the search results to dismiss naturally, so that the search interface does not obstruct my map interaction.

#### Acceptance Criteria

1. WHEN the user clicks outside the Search_Bar and Results_List, THE Results_List SHALL close
2. WHEN the user selects a result from the Results_List, THE Results_List SHALL close and the Search_Bar SHALL clear its input value
3. WHEN the user presses the Escape key while the Search_Bar is focused, THE Results_List SHALL close
4. WHEN the user clears the Search_Bar input, THE Results_List SHALL close
