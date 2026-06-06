# Data Flow Diagrams (DFD)
## Event Management System (EMS)

### Level 0 DFD (Context Diagram)

The Context Diagram shows the EMS as a single process interacting with external entities (User, Organizer, Admin, Payment Gateway).

```mermaid
flowchart LR
    U[User] -- User Data & Booking Request --> EMS((Event Management System))
    O[Organizer] -- Event Details & Updates --> EMS
    A[Admin] -- System Config & Management --> EMS
    EMS -- Tickets & Confirmations --> U
    EMS -- Analytics & Dashboard Data --> O
    EMS -- Platform Analytics --> A
```

### Level 1 DFD (Main Modules)

This level breaks down the main system into major processes: Authentication, Event Management, Booking Management, and Reporting.

```mermaid
flowchart TD
    %% Entities
    User[User]
    Organizer[Organizer]
    Admin[Admin]
    
    %% Processes
    P1((1.0 Authentication \n& Authorization))
    P2((2.0 Event \nManagement))
    P3((3.0 Booking \nManagement))
    P4((4.0 Reporting \n& Analytics))
    
    %% Data Stores
    D1[(D1: Users DB)]
    D2[(D2: Events DB)]
    D3[(D3: Bookings DB)]

    %% Flow: Auth
    User -->|Credentials| P1
    Organizer -->|Credentials| P1
    Admin -->|Credentials| P1
    P1 -->|Store/Retrieve| D1
    P1 -->|Tokens| User
    
    %% Flow: Event Management
    Organizer -->|Event Details| P2
    Admin -->|Manage Events| P2
    P2 -->|Store/Retrieve| D2
    
    %% Flow: Booking
    User -->|Booking Request| P3
    P3 -->|Check Availability| D2
    P3 -->|Store Booking| D3
    P3 -->|Ticket/QR Code| User
    
    %% Flow: Reporting
    D1 --> P4
    D2 --> P4
    D3 --> P4
    P4 -->|Event Stats| Organizer
    P4 -->|Platform Stats| Admin
```

### Level 2 DFD (Booking Process Detail - Process 3.0)

This level provides a detailed view of the Booking Management process.

```mermaid
flowchart TD
    %% Entities & Stores
    User[User]
    D2[(D2: Events DB)]
    D3[(D3: Bookings DB)]
    
    %% Processes
    P3_1((3.1 Validate \nEvent Availability))
    P3_2((3.2 Process \nPayment Simulation))
    P3_3((3.3 Generate \nBooking Record))
    P3_4((3.4 Generate \nQR Ticket))
    
    %% Flows
    User -->|Select Event| P3_1
    P3_1 -->|Fetch Event Capacity| D2
    P3_1 -->|Availability Status| P3_2
    
    P3_2 -->|Payment Success| P3_3
    P3_3 -->|Save Booking| D3
    P3_3 -->|Booking ID| P3_4
    
    P3_4 -->|Digital Ticket (QR)| User
```
