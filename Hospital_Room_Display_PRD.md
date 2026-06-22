# Hospital Room Display Management System (PRD)

## Project Overview

A web-based hospital room display system built with **Next.js** and
**Firebase Firestore**.

Each hospital room has a dedicated tablet that displays:

-   Room Number
-   Room Name
-   Occupancy Status (Occupied / Vacant)
-   Patient Gender (Male / Female)
-   Current Date & Time
-   Hospital Logo

The system consists of:

1.  Admin Panel
2.  Room Display Screen (Tablet)

All changes are synchronized in real time using Firebase Firestore.

------------------------------------------------------------------------

# Technology Stack

  Component   Technology
  ----------- -----------------------------
  Frontend    Next.js
  Styling     Tailwind CSS
  Database    Firebase Firestore
  Storage     Firebase Storage
  Realtime    Firestore Snapshot Listener

**Authentication:** None (UI Login Only)

------------------------------------------------------------------------

# Login Page

The application contains a login page for presentation purposes only.

### Components

-   Hospital Logo
-   Email Input
-   Password Input
-   Login Button

### Behaviour

-   No authentication
-   No Firebase Auth
-   No backend validation
-   Clicking Login redirects directly to the Admin Dashboard

------------------------------------------------------------------------

# User Roles

Only one role exists:

**Admin**

Capabilities:

-   Create Rooms
-   Edit Rooms
-   Delete Rooms
-   Update Room Status
-   Update Patient Gender
-   Upload Branding
-   View Audit Logs
-   Generate Display URLs

------------------------------------------------------------------------

# Room Data Structure

Each room stores:

-   Room Number
-   Room Name
-   Department
-   Floor
-   Building
-   Display URL
-   Status (Occupied / Vacant)
-   Patient Gender (Male / Female)
-   Created At
-   Updated At

------------------------------------------------------------------------

# Admin Dashboard

## Dashboard Cards

-   Total Rooms
-   Occupied Rooms
-   Vacant Rooms
-   Male Rooms
-   Female Rooms

## Room Management

Columns:

-   Room Number
-   Room Name
-   Department
-   Floor
-   Building
-   Status
-   Gender
-   Display URL

Actions:

-   Add
-   Edit
-   Delete
-   Copy Display URL

------------------------------------------------------------------------

# Display URL

Each room automatically generates a unique public URL.

Example:

    /display/501

No login is required.

------------------------------------------------------------------------

# Tablet Display

Displays:

-   Hospital Logo
-   Room Number
-   Room Name
-   Occupied / Vacant
-   Male / Female
-   Current Time
-   Current Date

## Vacant State

-   Green Theme
-   Available Icon
-   No Gender Display
-   Green LED Side Glow

## Occupied State

-   Red Status Header
-   Male (Blue Card) or Female (Pink Card)
-   Red LED Side Glow

------------------------------------------------------------------------

# Local Tablet Controls

By default the tablet is locked.

Hidden side button:

    Hidden Button
          ↓
    Pattern Lock
          ↓
    Settings Panel

Settings:

-   Occupied
-   Vacant
-   Male
-   Female
-   Save & Close

After Save:

-   Update Firestore
-   Update Admin Dashboard
-   Update All Displays
-   Auto Lock

Auto lock after 60 seconds of inactivity.

------------------------------------------------------------------------

# Branding

Admin can configure:

-   Hospital Logo
-   Primary Color
-   Secondary Color

All displays update automatically.

------------------------------------------------------------------------

# Audit Logs

Every change is recorded.

Stored fields:

-   Timestamp
-   Room
-   Previous Status
-   New Status
-   Previous Gender
-   New Gender
-   Source (Admin / Tablet)

------------------------------------------------------------------------

# Firebase Collections

## rooms

    rooms/
      roomId/
        roomNumber
        roomName
        department
        floor
        building
        status
        gender
        displayUrl
        createdAt
        updatedAt

## branding

    branding/
        logo
        primaryColor
        secondaryColor

## auditLogs

    auditLogs/
        logId/
            roomId
            previousStatus
            newStatus
            previousGender
            newGender
            source
            timestamp

------------------------------------------------------------------------

# Real-Time Flow

    Admin Update
          ↓
    Firebase Firestore
          ↓
    All Tablets Update

    Tablet Update
          ↓
    Firebase Firestore
          ↓
    Admin Dashboard Updates

------------------------------------------------------------------------

# MVP Scope

-   UI Login Page
-   Admin Dashboard
-   Room CRUD
-   Public Display URLs
-   Branding Management
-   Tablet Pattern Lock
-   Occupied / Vacant Status
-   Male / Female Status
-   Real-time Firebase Sync
-   Audit Logs

------------------------------------------------------------------------

# Future Enhancements

-   Multi Hospital Support
-   Arabic / English
-   Emergency Broadcast
-   Device Monitoring
-   QR Codes
-   Dark Mode
-   Analytics Dashboard
-   Kiosk Health Monitoring
