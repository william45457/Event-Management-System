# Software Requirements Specification (SRS)
## Event Management System (EMS)

### 1. Introduction

#### 1.1 Purpose
This document specifies the software requirements for the Event Management System (EMS). It provides a comprehensive description of the functional and non-functional requirements, constraints, and assumptions to guide the development process.

#### 1.2 Scope
The Event Management System is a web-based SaaS application designed to streamline the creation, management, and booking of events. It targets event organizers seeking centralized control and users looking for a seamless booking experience. The system includes features such as user authentication, role-based dashboards, event CRUD operations, ticket generation with QR codes, and performance analytics.

#### 1.3 Definitions, Acronyms, and Abbreviations
- **EMS**: Event Management System
- **SaaS**: Software as a Service
- **JWT**: JSON Web Token
- **CRUD**: Create, Read, Update, Delete
- **UI/UX**: User Interface / User Experience

#### 1.4 References
- IEEE Std 830-1998, IEEE Recommended Practice for Software Requirements Specifications.

---

### 2. Overall Description

#### 2.1 Product Perspective
The EMS is an independent, responsive web application utilizing a MERN-like stack (MongoDB, Express.js, React.js, Node.js). It interfaces with external services like Cloudinary for image hosting and a simulated payment gateway.

#### 2.2 Product Functions
- **User Management**: Registration, authentication (JWT), and role assignment (Admin, Organizer, User).
- **Event Management**: Organizers and Admins can create, update, delete, and categorize events.
- **Booking & Ticketing**: Users can browse, search, and book events. The system generates unique tickets with QR codes.
- **Analytics & Dashboards**: Role-specific dashboards presenting relevant metrics.

#### 2.3 User Classes and Characteristics
1. **Admin**: Full access to the system. Can manage all users, events, and view platform-wide analytics.
2. **Organizer**: Can manage their own events, view bookings for their events, and access event-specific analytics.
3. **User (Customer)**: Can browse events, search, filter, book tickets, and view their booking history.

#### 2.4 Operating Environment
- **Server-side**: Node.js environment, MongoDB database.
- **Client-side**: Modern web browsers (Chrome, Firefox, Safari, Edge) on desktop and mobile devices.

#### 2.5 Design and Implementation Constraints
- The system depends on reliable internet connectivity.
- Must adhere to modern web security practices (e.g., password hashing, JWT for sessions).

#### 2.6 Assumptions and Dependencies
- Users possess basic internet navigation skills.
- The dummy payment gateway simulates a successful transaction without processing real money.

---

### 3. Specific Requirements

#### 3.1 Functional Requirements

##### 3.1.1 User Authentication
- **FR1**: The system shall allow users to register with an email, name, and password.
- **FR2**: The system shall authenticate users using email and password, issuing a JWT.
- **FR3**: The system shall enforce role-based access control (RBAC).

##### 3.1.2 Event Management
- **FR4**: Organizers shall be able to create events specifying title, description, date, time, location, category, price, and cover image.
- **FR5**: Organizers shall be able to update and delete their own events.

##### 3.1.3 Booking and Ticketing
- **FR6**: Authenticated users shall be able to book tickets for upcoming events.
- **FR7**: The system shall simulate a payment process during booking.
- **FR8**: Upon successful booking, the system shall generate a digital ticket with a unique QR code.

##### 3.1.4 Search and Filtering
- **FR9**: Users shall be able to search for events by keyword.
- **FR10**: Users shall be able to filter events by category and price range.

##### 3.1.5 Dashboards
- **FR11**: The system shall provide an Admin Dashboard displaying total users, total events, and total revenue.
- **FR12**: The system shall provide an Organizer Dashboard displaying their active events and booking statistics.

#### 3.2 Non-Functional Requirements

##### 3.2.1 Performance
- **NFR1**: The application shall load the main dashboard within 2 seconds under normal network conditions.

##### 3.2.2 Security
- **NFR2**: All passwords shall be hashed using bcrypt before storage.
- **NFR3**: API endpoints shall be protected against unauthorized access via JWT verification.

##### 3.2.3 Usability
- **NFR4**: The user interface shall be responsive, supporting both desktop and mobile layouts.
- **NFR5**: The UI shall follow a modern SaaS design language utilizing neumorphism/glassmorphism, adhering to the specified color palette (Purple: #6C5DD3, Teal: #7BCBCF, Orange: #FF8A65).

##### 3.2.4 Scalability
- **NFR6**: The backend architecture shall be RESTful, allowing for easy horizontal scaling.
