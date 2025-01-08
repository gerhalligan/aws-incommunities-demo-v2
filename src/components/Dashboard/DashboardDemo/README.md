# Dashboard Demo Integration Guide

## Installation

1. Copy the entire `DashboardDemo` folder into your React project's `src` directory.

2. Add the following dependencies to your project's package.json:

```json
{
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-select": "^2.1.1",
    "@tanstack/react-query": "^5.56.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "framer-motion": "^11.16.0",
    "lucide-react": "^0.462.0",
    "recharts": "^2.12.7",
    "tailwind-merge": "^2.5.2"
  }
}
```

3. Add the following to your tailwind.config.js:

```js
module.exports = {
  content: [
    // ... your existing content
    "./src/DashboardDemo/**/*.{js,ts,jsx,tsx}",
  ],
}
```

## Usage

1. Wrap your app with the DashboardProvider:

```tsx
import { DashboardProvider } from './DashboardDemo';

function App() {
  return (
    <DashboardProvider>
      {/* Your app content */}
    </DashboardProvider>
  );
}
```

2. Add the dashboard routes to your router:

```tsx
import { DashboardRoutes } from './DashboardDemo';

function App() {
  return (
    <Router>
      <Routes>
        {/* Your existing routes */}
        <DashboardRoutes />
      </Routes>
    </Router>
  );
}
```

The dashboard will be available at:
- /dashboard - Main dashboard view
- /dashboard/metrics - Detailed metrics view