# Firebase Setup & Usage

This project uses Firebase for Authentication, Firestore Database, and Realtime Database.

## Configuration

Firebase configuration is managed via environment variables in `.env`.
**DO NOT COMMIT `.env` TO VERSION CONTROL** if you have real secrets in it.

The following variables are required:
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Services

We have a dedicated service layer in `services/firebase.service.ts`.

### Authentication
```typescript
import { loginWithGoogle, logoutUser } from '../services/firebase.service';

// Login
const user = await loginWithGoogle();

// Logout
await logoutUser();
```

### Database
The app uses both Firestore and Realtime Database.
- **Firestore**: Used for structured data like user profiles (`users/{uid}`).
- **Realtime DB**: Used for high-frequency updates or simple syncing (`history/{uid}`).

## Adding New Features
To add new database features:
1.  Import `db` or `realtimeDb` from `services/firebase.config.ts`.
2.  Add a new helper function in `services/firebase.service.ts`.
3.  Use the helper in your component.
