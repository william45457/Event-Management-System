# UML Diagrams
## Event Management System (EMS)

### 1. Use Case Diagram

```mermaid
usecaseDiagram
    actor User as Customer
    actor Organizer
    actor Admin

    package "Event Management System" {
        usecase "Register/Login" as UC1
        usecase "Browse Events" as UC2
        usecase "Search & Filter" as UC3
        usecase "Book Event" as UC4
        usecase "View Tickets" as UC5
        
        usecase "Create Event" as UC6
        usecase "Manage Own Events" as UC7
        usecase "View Event Analytics" as UC8
        
        usecase "Manage All Users" as UC9
        usecase "Manage All Events" as UC10
        usecase "View Platform Analytics" as UC11
    }

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5

    Organizer --> UC1
    Organizer --> UC6
    Organizer --> UC7
    Organizer --> UC8

    Admin --> UC1
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
```

### 2. Activity Diagram (Booking Flow)

```mermaid
activityDiagram
    start
    :User browses events;
    :Selects an Event;
    if (Is User Logged In?) then (yes)
        :Click "Book Ticket";
        :Redirect to Payment;
        if (Payment Successful?) then (yes)
            :Generate Booking Record;
            :Generate QR Code Ticket;
            :Show Success Page & Ticket;
        else (no)
            :Show Payment Failed Error;
        endif
    else (no)
        :Redirect to Login Page;
        :User Logs In;
        :Return to Event Page;
    endif
    stop
```

*(Note: In Mermaid, activity diagrams are often rendered via stateDiagram or flowchart. Below is the Flowchart equivalent for standard rendering)*

```mermaid
flowchart TD
    A[Start] --> B[User browses events]
    B --> C[Selects an Event]
    C --> D{Is User Logged In?}
    D -- Yes --> E[Click 'Book Ticket']
    D -- No --> F[Redirect to Login]
    F --> G[User Logs In]
    G --> C
    E --> H[Process Payment Simulation]
    H --> I{Payment Successful?}
    I -- Yes --> J[Generate Booking Record]
    J --> K[Generate QR Code Ticket]
    K --> L[Show Success & Ticket]
    I -- No --> M[Show Payment Failed]
    M --> E
    L --> N[End]
```

### 3. State Diagram (Event Lifecycle)

```mermaid
stateDiagram-v2
    [*] --> Draft: Organizer starts creating event
    Draft --> Published: Organizer publishes event
    Published --> Ongoing: Event date arrives
    Ongoing --> Completed: Event finishes
    Published --> Cancelled: Organizer cancels event
    Draft --> Cancelled: Organizer discards
    Completed --> [*]
    Cancelled --> [*]
```

### 4. Class Diagram

```mermaid
classDiagram
    class User {
        +String _id
        +String name
        +String email
        +String password
        +String role
        +register()
        +login()
    }

    class Event {
        +String _id
        +String title
        +String description
        +Date date
        +String location
        +Number price
        +String category
        +String imageUrl
        +String organizerId
        +create()
        +update()
        +delete()
    }

    class Booking {
        +String _id
        +String eventId
        +String userId
        +Date bookingDate
        +String paymentStatus
        +String qrCodeUrl
        +generateTicket()
    }

    User "1" -- "0..*" Booking : makes >
    Event "1" -- "0..*" Booking : has >
    User "1" -- "0..*" Event : organizes >
```

### 5. Sequence Diagram (Booking Process)

```mermaid
sequenceDiagram
    actor U as User
    participant F as Frontend (React)
    participant B as Backend (Express)
    participant DB as Database (MongoDB)

    U->>F: Click 'Book Now'
    F->>B: POST /api/bookings (eventId, token)
    B->>B: Validate Token
    B->>DB: Check Event Availability
    DB-->>B: Event Data
    B->>B: Process Dummy Payment
    B->>DB: Save Booking Record
    DB-->>B: Booking Saved
    B->>B: Generate QR Code
    B-->>F: Return Ticket Info (QR, Status 201)
    F-->>U: Display Success & Ticket
```
