# Testing Plan
## Event Management System (EMS)

### 1. Introduction
This document outlines the testing strategy for the EMS, detailing specific test cases to validate the functional requirements defined in the SRS document.

### 2. Test Cases

#### 2.1 Authentication Module

| Test Case ID | Requirement | Test Scenario | Input Data | Expected Output | Status |
|---|---|---|---|---|---|
| TC-AUTH-01 | FR1 | Register a new user with valid details | Name: John, Email: j@test.com, Pass: 123456 | User created successfully, DB updated | Pending |
| TC-AUTH-02 | FR1 | Register with an existing email | Email: existing@test.com | Error: Email already in use | Pending |
| TC-AUTH-03 | FR2 | Login with valid credentials | Email: j@test.com, Pass: 123456 | Login successful, JWT token returned | Pending |
| TC-AUTH-04 | FR2 | Login with invalid password | Email: j@test.com, Pass: wrongpass | Error: Invalid credentials | Pending |

#### 2.2 Event Management Module (Organizer/Admin)

| Test Case ID | Requirement | Test Scenario | Input Data | Expected Output | Status |
|---|---|---|---|---|---|
| TC-EVT-01 | FR4 | Create a new event with all required fields | Title: Tech Meetup, Date: 2026-06-01, Price: $10 | Event created, returned with event ID | Pending |
| TC-EVT-02 | FR4 | Create event missing required title | Date: 2026-06-01, Price: $10 | Validation Error: Title is required | Pending |
| TC-EVT-03 | FR5 | Update an existing event | Event ID, New Title: Tech Summit | Event updated successfully | Pending |
| TC-EVT-04 | FR5 | Delete an existing event | Event ID | Event removed from DB | Pending |

#### 2.3 Booking & Ticketing Module

| Test Case ID | Requirement | Test Scenario | Input Data | Expected Output | Status |
|---|---|---|---|---|---|
| TC-BKG-01 | FR6 | Authenticated user books an available event | User Token, Event ID | Payment simulated, Booking record created | Pending |
| TC-BKG-02 | FR6 | User attempts to book without auth token | Event ID | Error: Unauthorized access | Pending |
| TC-BKG-03 | FR8 | QR Code generation upon successful booking | Successful Booking ID | QR code string/URL returned | Pending |

#### 2.4 Search & Filters Module

| Test Case ID | Requirement | Test Scenario | Input Data | Expected Output | Status |
|---|---|---|---|---|---|
| TC-SRCH-01 | FR9 | Search events by valid keyword | Keyword: "Tech" | List of events containing "Tech" | Pending |
| TC-SRCH-02 | FR10 | Filter events by Category | Category: "Music" | List of events in "Music" category | Pending |

#### 2.5 UI/UX & Roles (Manual Testing)

| Test Case ID | Requirement | Test Scenario | Conditions | Expected Output | Status |
|---|---|---|---|---|---|
| TC-UI-01 | FR11, FR12 | Verify dashboard access based on role | Login as User, then Organizer, then Admin | Each sees their respective dashboard layout | Pending |
| TC-UI-02 | NFR4, NFR5 | Verify responsive design & color palette | Open in Desktop and Mobile views | Proper scaling, #6C5DD3 primary color applied | Pending |

### 3. Execution Strategy
- **Unit Testing**: Conducted during backend development for models and controllers (Jest/Supertest can be used).
- **Integration Testing**: Testing API routes with Postman/Insomnia.
- **End-to-End Testing**: Manual walkthrough of the deployed React application to ensure the user flow (Registration -> Booking -> Ticket) works flawlessly.
