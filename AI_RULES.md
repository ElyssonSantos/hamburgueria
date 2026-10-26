# AI Rules for BigBig Burguer Application

This document outlines the technical stack and specific library usage guidelines for developing and modifying the BigBig Burguer application. Adhering to these rules ensures consistency, maintainability, and leverages the strengths of the chosen technologies.

## Tech Stack Overview

*   **Frontend Framework**: React.js
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS
*   **UI Component Library**: shadcn/ui (built on Radix UI)
*   **Routing**: React Router DOM
*   **State Management / Data Fetching**: React Query for server state, React Context for global client state.
*   **Database / Backend**: Supabase (for authentication, database, and storage).
*   **Form Management**: React Hook Form with Zod for validation.
*   **Icons**: Lucide React.
*   **Date Utilities**: date-fns.

## Library Usage Guidelines

To maintain a consistent and efficient codebase, please follow these guidelines when implementing new features or modifying existing ones:

*   **UI Components**: Always prioritize using components from `shadcn/ui`. If a required component is not available in `shadcn/ui` or needs significant customization, create a new component in `src/components/` and style it using Tailwind CSS. **Do not modify `shadcn/ui` component files directly.**
*   **Styling**: All styling must be done using **Tailwind CSS** classes. Avoid writing custom CSS files or inline styles unless absolutely necessary for dynamic, computed styles.
*   **Routing**: Use `react-router-dom` for all client-side navigation. All main application routes should be defined within `src/App.tsx`.
*   **Data Fetching & Server State**: For managing data fetched from Supabase or any other API, use `@tanstack/react-query`. This includes fetching, caching, and updating server data.
*   **Client State Management**: For application-wide client state (e.g., shopping cart), use React Context (as demonstrated by `CartContext`). For local component state, use React's `useState` and `useReducer` hooks.
*   **Database Interactions**: All interactions with the Supabase backend (authentication, database queries, storage operations) must use the `@supabase/supabase-js` client, imported from `src/integrations/supabase/client.ts`.
*   **Forms**: Implement forms using `react-hook-form` for robust form state management and validation. Use `zod` for defining form schemas and validation rules.
*   **Icons**: For all icons, use components from the `lucide-react` library.
*   **Notifications**: For displaying toast notifications to the user, use the `useToast` hook provided by `shadcn/ui` (which is already integrated and used in `src/contexts/CartContext.tsx`).
*   **Date Manipulation**: When working with dates (formatting, calculations, etc.), use functions from the `date-fns` library.