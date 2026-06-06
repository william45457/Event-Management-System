# Event Management System (EMS)

A full-stack Event Management System built with the MERN stack (MongoDB, Express, React, Node.js). 

## Features

- **User Authentication**: Secure login and registration.
- **Dashboard**: A beautiful, modern dashboard to view event statistics.
- **Dark/Light Mode**: Full support for dark and light themes using Tailwind CSS v4.
- **Event Management**: Create, view, and manage events.
- **Responsive UI**: Built with Tailwind CSS for mobile and desktop compatibility.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS v4, Lucide React
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB installed and running locally

### Backend Setup
1. Navigate to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Configure environment variables in `.env` (PORT, MONGO_URI, JWT_SECRET).
4. Start the server: `npm start` (Runs on `http://localhost:5000`)

### Frontend Setup
1. Navigate to the `client` directory: `cd client`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev` (Runs on `http://localhost:5173`)

## Recent Updates
- Added Light/Dark mode toggle in the dashboard sidebar.
- Implemented functional sidebar tabs for Dashboard, Events, Bookings, and Analytics.
- Added a functional modal for creating new events (`+ Add New Event`).
- Integrated Tailwind CSS v4 with native `@theme` configuration.
