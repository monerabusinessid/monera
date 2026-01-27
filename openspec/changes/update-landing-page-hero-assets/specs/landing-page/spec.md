## ADDED Requirements
### Requirement: Full-Viewport Header
The landing page header/hero section SHALL occupy the full viewport height on initial load across supported breakpoints.

#### Scenario: Desktop full-height hero
- **WHEN** a user loads the landing page on a desktop viewport
- **THEN** the header/hero section fills the visible viewport height without vertical clipping

#### Scenario: Mobile full-height hero
- **WHEN** a user loads the landing page on a mobile viewport
- **THEN** the header/hero section fills the visible viewport height without forcing immediate scroll

### Requirement: Calendar CTA in Header
The header/hero section SHALL include a primary button that links to the calendar app.

#### Scenario: CTA navigates to calendar
- **WHEN** a user clicks the header CTA button
- **THEN** the browser navigates to the configured calendar app URL

### Requirement: Flaticon Assets Replace Emoji
The landing page SHALL use Flaticon assets instead of emoji graphics for visual accents.

#### Scenario: Emoji replaced with Flaticon assets
- **WHEN** a user views the landing page content sections
- **THEN** emoji graphics are replaced with Flaticon assets that match the intended meaning

### Requirement: Office Location Copy Update
The "Our Office" section SHALL display the location as Jakarta Selatan.

#### Scenario: Office location text
- **WHEN** a user views the "Our Office" section
- **THEN** the location text reads "Jakarta Selatan"

### Requirement: Optimized Landing Page Loading
The landing page SHALL optimize initial loading by prioritizing critical content and deferring non-critical assets.

#### Scenario: Critical content loads first
- **WHEN** a user loads the landing page on a typical network
- **THEN** critical above-the-fold content renders before non-critical assets finish loading

### Requirement: Clean and User-Friendly Theme
The landing page SHALL present a clean, uncluttered visual theme with consistent spacing and typography.

#### Scenario: Consistent visual hierarchy
- **WHEN** a user scans the landing page sections
- **THEN** typography, spacing, and visual hierarchy appear consistent and easy to follow

### Requirement: Responsive and Usable Layout
The landing page SHALL remain fully usable and visually coherent across desktop, tablet, and mobile viewports.

#### Scenario: Responsive usability
- **WHEN** a user views the landing page on common breakpoints
- **THEN** content and controls remain readable, tappable, and properly aligned
