

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.17.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

---

# 📖 Project Documentation: MemeBazaar

This document explains how the **MemeBazaar** application works, the purpose of each component, and the code logic behind it.

## 1. 🔄 Project Workflow (How it works)

The application follows a simple flow for users to browse, create, and interact with memes.

1.  **Authentication (Entry Point):**
    *   **Login/Register:** Users start by logging in or creating an account.
    *   **Dashboard (Feed):** After login, they are redirected to the main Feed.
2.  **Browsing Content:**
    *   **The Feed:** Displays a list of memes from all users.
    *   **Filtering:** Users can filter memes by **Mood** (e.g., Funny, Sarcastic), **Team** (e.g., Engineering, Sales), or **Sort** by Newest/Oldest.
    *   **Search:** A search bar filters memes by title or content.
3.  **Interacting:**
    *   **Post Detail:** Clicking a meme opens a detailed view where users can read the full content, see spoilers (hidden text), and perform actions.
    *   **Actions:** Users can **Like** ❤️, **Save** 🔖, or **Flag** 🚩 a post (report it to admins).
    *   **Admin Actions:** Admins can **Edit** ✏️, **Soft Delete** 🗑️ (hide), or **Restore** ♻️ posts.
4.  **Creating Content:**
    *   **Composer:** Users click "Compose" to write a new meme. They can add a title, content (with spoiler tags `||spoiler||`), mood, and team.
    *   **Drafts:** If they leave without publishing, their draft is saved automatically.
5.  **User Profile:**
    *   **My Profile:** Users can see their own details and tabs for **Saved Posts** and **Liked Posts**.
    *   **Moderation (Admins Only):** Admins have a special **Moderation** tab in their profile to view flagged or deleted posts and take action.
6.  **Admin Features:**
    *   **Flagging System:** When a user flags a post, it appears in the Admin's Moderation tab. Admins can "Unflag" (dismiss) or Delete the post.
    *   **Soft Delete Visibility:** Deleted posts are hidden from the public feed. Only admins can see them in the Moderation tab (highlighted in red).

---

## 2. 🧩 Component Overview (Why we use them)

In Angular, we split the application into small, reusable blocks called **Components**.

### **Core Components**
*   **`AppComponent`**: The root component. It holds the main layout (Navbar + Router Outlet).
*   **`NavbarComponent`**: The top navigation bar. It shows links (Feed, Compose, Profile) based on whether the user is logged in. It also shows the "Admin" link for admin users.

### **Features**
*   **`FeedComponent`**: The main home page. It handles fetching memes from the server and filtering them based on user input (search, mood, team). It uses `MemeService` to get data.
*   **`PostDetailComponent`**: Displays a single meme. It handles logic for:
    *   **Spoilers:** Hiding/showing text wrapped in `||`.
    *   **Like/Save:** communicating with the service to update user preferences.
    *   **Admin Actions:** logic to delete or edit.
*   **`ComposerComponent`**: A form for creating or editing memes. It handles validation (required fields) and auto-saving drafts to LocalStorage so users don't lose work.
*   **`LoginComponent` & `RegisterComponent`**: Forms for user authentication. They send user data to the `AuthService`.
*   **`ProfileComponent`**: Displays user info (Avatar, Name). It has child routes for showing lists of memes:
    *   **`SavedPostsComponent`**: A list of memes the user has saved.
    *   **`LikedPostsComponent`**: A list of memes the user has liked.
    *   **`AdminModerationComponent` (Admin Only)**: Reused here for seamless moderation experience.
*   **`AdminModerationComponent`**: The dashboard for admins.
    *   **Filters:** "Show Deleted" and "Show Flagged Only".
    *   **Actions:** Soft Delete, Restore, and Unflag.
    *   **Visuals:** Uses distinct colors (Red for deleted, Yellow for flagged) for easy scanning.

### **Shared**
*   **`SharedButtonComponent`**: A reusable button used across all pages to ensure consistent styling (primary, danger, ghost variants).

---

## 3. 💻 Code Explanation (Simple Language)

### **Services ( The "Brain" )**
Services handle data and logic shared across components.
*   **`MemeService`**:
    *   **Fetches Data:** It talks to the backend (or `db.json`) using `HttpClient` to get posts and users.
    *   **State Management:** It uses `BehaviorSubject` (a stream of data) to store the list of memes. When a meme is updated (liked/deleted/flagged), the service updates this stream, and all components listening to it update automatically.
    *   **Flagging Logic:** Methods like `flagMeme` and `unflagMeme` update the `flagged` status of a post and sync it to the backend.
    *   **Preferences:** Manages Saved/Liked IDs locally or on the server.
*   **`AuthService`**:
    *   **Login:** It checks credentials. If using `json-server`, it might just check if a user with that email/password exists.
    *   **Session:** It saves the logged-in user to `localStorage` so they stay logged in when refreshing the page.

### **Guards ( The "Bouncers" )**
Guards protect routes from unauthorized access.
*   **`AuthGuard`**: If you try to go to `/feed` without logging in, it kicks you back to `/login`.
*   **`RoleGuard`**: If you try to go to `/admin` but your role is just "user", it stops you.
*   **`DraftGuard`**: If you try to leave the Composer with unsaved changes, it asks "Are you sure?".

### **Interceptors ( The "Middleman" )**
*   **`AuthInterceptor`**: It sits between the app and the server. Every time the app makes a request (e.g., "Get Memes"), this interceptor secretly adds the **Auth Token** to the header so the server knows who is asking.

### **Key Concepts Used**
*   **Observables (RxJS):** We use `subscribe()` to listen for data. Think of it like a YouTube subscription—whenever new data arrives (a new video), our component (you) gets notified.
*   **Dependency Injection:** We don't create services with `new Service()`. We ask Angular to "inject" them into our components constructor.
*   **Directives:**
    *   `*ngIf`: "Only show this HTML if..." (e.g., only show Admin link if user is admin).
    *   `*ngFor`: "Loop through this list and show HTML for each item" (e.g., displaying the list of memes).

---

### **How to Export this to PDF**
1.  **VS Code:** Install "Markdown PDF" extension -> Right click this file -> "Export (pdf)".
2.  **Browser:** Copy this text to a markdown viewer online (like StackEdit) -> Print to PDF.
