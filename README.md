# GEUEvent Portal 🎓

A centralized web application designed to streamline the discovery and management of events at Graphic Era University. This portal provides a seamless platform for administrators to organize campus events and for students to stay updated on university activities.

## 🚀 Features

* **Secure Authentication:** Dedicated login system for students and administrators.
* **Event Dashboard:** A clean, intuitive interface to browse upcoming campus events and activities.
* **Real-Time Data:** Instant synchronization of event updates and registrations.
* **Responsive UI:** Optimized for both desktop and mobile browsing.

## 🛠️ Tech Stack

* **Frontend Environment:** React / Vite (or Next.js)
* **Backend as a Service:** Supabase 
* **Database:** PostgreSQL
* **Authentication:** Supabase Auth

## ⚙️ Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

* [Node.js](https://nodejs.org/) installed
* Git installed
* A [Supabase](https://supabase.com/) account with an active project

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/shreyaagarwal156/Geu-event-portal.git](https://github.com/shreyaagarwal156/Geu-event-portal.git)
    cd Geu-event-portal
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables Setup:**
    Create a `.env` file in the root directory of your project. Add your Supabase connection details to this file. **Do not upload this file to GitHub.**
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
    *(Note: If you are using Next.js or Create React App, adjust the variable prefixes to `NEXT_PUBLIC_` or `REACT_APP_` respectively).*

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will now be running on your local host.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 

## 📝 License

This project is created for educational and campus utility purposes.
