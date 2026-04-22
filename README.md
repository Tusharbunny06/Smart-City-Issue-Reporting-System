# Smart City Issue Reporting System

A comprehensive full-stack solution for reporting, tracking, and resolving urban civic issues. This platform connects citizens, field workers, and city administrators to streamline municipal problem-solving.

## 🚀 Features

- **Role-Based Access Control**: Separate, secure dashboards for Citizens, Admins, and Field Workers.
- **Issue Reporting**: Citizens can easily report issues (e.g., potholes, broken streetlights) with location data and image attachments.
- **Automated Assignment Logic**: Intelligently assigns tasks to available field workers based on their shifts.
- **Live Tracking & Updates**: Real-time status updates on issue progress from 'Pending' to 'Resolved'.
- **Interactive Dashboards**: Modern, responsive interfaces built with React and TailwindCSS.
- **Secure Authentication**: JWT-based authentication to protect user data and endpoints.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JSON Web Tokens (JWT), bcryptjs

## 📂 Project Structure

- `/frontend` - React application (Vite setup)
- `/backend` - Node.js Express API server

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tusharbunny06/Smart-City-Issue-Reporting-System.git
   cd Smart-City-Issue-Reporting-System
   ```

2. **Install dependencies**
   Run the following commands to install dependencies for the root, frontend, and backend:
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   cd ..
   ```

3. **Environment Variables**
   Create a `.env` file in the `backend` directory and add your variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the Application**
   The project uses `concurrently` to run both the frontend and backend simultaneously. From the root directory, simply run:
   ```bash
   npm start
   ```
   - **Frontend** will be available at `http://localhost:5173`
   - **Backend** will be running on `http://localhost:5000`

## 🤝 Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request if you have any improvements or bug fixes.
