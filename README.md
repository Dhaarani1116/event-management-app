Intelligent Event Management System (EMS) for Sri Eshwar College
<div align="center">

</div>

A smart, AI-powered platform designed to streamline the entire event lifecycle at Sri Eshwar College of Engineering. This system moves beyond simple scheduling to become an intelligent partner for administrators, event coordinators, and students.

✨ Core Features
Our EMS is built with a unique architecture to handle the complexities of a dynamic college environment.

🏛️ Unified Event Architecture:

Standalone Events: Manage single workshops, seminars, or competitions with ease.

Compound Events: A powerful parent-child structure to manage large-scale festivals (e.g., "Navaratri Fest") with multiple sub-events, each with its own schedule, venue, and coordinator.

🎟️ Seamless Registration System:

Supports both individual and team-based registrations with customizable team sizes.

Generates a unique QR Code for each registration, enabling a secure and efficient digital check-in process.

📱 Real-time Attendance Console:

Coordinators can manage check-ins directly from their dashboard, instantly marking attendees as present and eliminating paper-based tracking.

🔐 Role-Based Access Control (RBAC):

Student: Personalized event feed, registration, and QR code access.

Coordinator: Event creation, participant management, and attendance tracking.

Admin: Event approval, resource management, and access to analytics.

🤖 The Power of AI: Our Intelligent Agents
This isn't just a management tool; it's an intelligent partner powered by the Google Gemini API.

Scheduling Agent (The Guardian):

Performs real-time conflict detection during event creation.

Checks for venue clashes, time overlaps, and capacity limits against all other approved events and provides intelligent suggestions to resolve them.

Insight Agent (The Analyst):

Analyzes post-event feedback using Gemini to provide concise, actionable summaries for administrators.

Tracks key metrics like department-wise participation and resource utilization to generate analytics reports.

Engagement Agent (The Concierge):

Delivers a personalized "Available Events" feed for each student by prioritizing events based on their department and declared interests, boosting engagement and participation.

🚀 Technology Stack
Frontend: React.js (v18+) with Hooks & Context API

Styling: Tailwind CSS

AI / LLM: Google Gemini API

Development Server: Vite.js

Database (Prototype): Browser LocalStorage (Designed for easy migration to a backend like Firebase).

⚙️ Setup and Installation
To run this project on your local machine, follow these steps:

1. Prerequisites:

Node.js (LTS version)

Git

2. Clone the Repository:

git clone [https://github.com/YOUR_USERNAME/event-management-app.git](https://github.com/YOUR_USERNAME/event-management-app.git)
cd event-management-app

3. Install Dependencies:

npm install

4. Set Up Environment Variables:

Create a new file in the root of the project named .env.

Add your Google Gemini API key to this file:

VITE_GEMINI_API_KEY="YOUR_ACTUAL_API_KEY_HERE"

5. Run the Development Server:

npm run dev

Open your browser and navigate to http://localhost:5173.

🧑‍💻 Usage & Mock Credentials
The application uses mock data for demonstration. You can log in with the following credentials to test different roles:

Role

Email

Password

Student

adya.s@sri-eshwar.edu

Student@2025

Coordinator

prof.smith@sri-eshwar.edu

Coord@123

Admin

admin@sri-eshwar.edu

Admin#2025

🔮 Future Work
Full-Stack Migration: Transition from LocalStorage to a real-time database like Firebase Firestore.

Real-time Notifications: Implement push notifications for event approvals, reminders, and updates.

Advanced Analytics Dashboard: Build interactive charts and visualizations for the Insight Agent's data.

Integration with Vanaj Platform: Connect with a larger institutional platform for SSO, academic calendar sync, and centralized user profiles.
