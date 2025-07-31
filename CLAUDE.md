# Pokemon Trainer Manager (pmon)

## Project Overview
A React-based web application for managing Pokemon trainers, with Firebase as the backend database. The app will eventually integrate with the Pokemon API for additional functionality.

## Tech Stack
- **Frontend**: React 18.2.0 with TypeScript
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS (Mobile-First Design)
- **Package Manager**: pnpm
- **Language**: TypeScript 5.8.3

## Project Structure
```
src/
├── components/
│   ├── TrainerOverview.tsx   # Main trainer list view
│   ├── TrainerCard.tsx       # Individual trainer display
│   └── AddTrainerForm.tsx    # Form for adding new trainers
├── firebase/
│   ├── config.ts            # Firebase configuration
│   └── trainerService.ts    # Firebase CRUD operations
├── types/
│   └── trainer.ts           # TypeScript type definitions
├── App.tsx                  # Main app component
├── index.tsx                # React entry point
├── App.css                  # App-specific styles
└── index.css               # Global styles
```

## Current Features
- View all trainers in a grid layout
- Add new trainers with form validation
- Delete trainers with confirmation
- Store trainer data: name, age, location, favorite Pokemon type, description
- Full TypeScript support with type safety
- Mobile-first responsive design with Tailwind CSS
- Touch-friendly UI components

## Firebase Setup Required
To connect to Firebase, update `src/firebase/config.ts` with your Firebase project credentials:
- apiKey
- authDomain
- projectId
- storageBucket
- messagingSenderId
- appId

## Trainer Data Model
```javascript
{
  name: string (required),
  age: number (optional),
  location: string (optional),
  favoriteType: string (Pokemon type),
  description: string (optional),
  createdAt: ISO string
}
```

## Available Scripts
- `pnpm start` - Runs the app in development mode
- `pnpm build` - Builds the app for production
- `pnpm test` - Launches the test runner

## Future Features (Planned)
- Integration with Pokemon API
- Trainer Pokemon team management
- Pokemon battle statistics
- Trainer profiles with avatars
- Search and filter functionality

## TypeScript Types
The project includes comprehensive TypeScript types in `src/types/trainer.ts`:
- `Trainer` interface for trainer data structure
- `TrainerFormData` interface for form handling
- Full type safety throughout the application

## Getting Started
1. Install dependencies: `pnpm install`
2. Configure Firebase credentials in `src/firebase/config.ts`
3. Start the development server: `pnpm start`
4. Open http://localhost:3000 to view the app

## Development Notes
- All components are written in TypeScript with proper typing
- Firebase service layer includes full type definitions
- Strict TypeScript configuration for better code quality
- Mobile-first responsive design approach
- Uses Tailwind CSS utility classes for styling
- Touch-friendly UI with 44px minimum button heights
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

## Styling Architecture
- **Mobile-First**: All styles start with mobile and scale up
- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Grid**: Adaptive layout for trainer cards
- **Custom Colors**: Extended Tailwind palette with primary, success, and danger colors
- **Typography Scale**: Responsive text sizes that adapt to screen size
- **Naming**: Components and Component file names should be CamelCase. function pascalCase.

## Package Manager
**Important**: This project uses `pnpm` as the package manager. Always use `pnpm` commands:
- `pnpm install` - Install dependencies
- `pnpm start` - Start development server
- `pnpm build` - Build for production
- `pnpm test` - Run tests