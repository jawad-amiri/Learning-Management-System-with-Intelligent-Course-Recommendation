# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```





//=====================================================================
File Structure of frontend
//=====================================================================


src/
│
├── app/
│   ├── router/
│   │   ├── AppRouter.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── RoleRedirect.tsx
│   │
│   ├── providers/
│   │   ├── AuthProvider.tsx
│
├── features/
│
│   ├── auth/
│   │   ├── pages/
│   │   │   └── LoginPage.tsx
│   │   ├── api/
│   │   │   └── auth.api.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── types.ts
│
│   ├── dashboard/
│   │   ├── pages/
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── TeacherDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   ├── components/
│
│   ├── courses/
│   │   ├── pages/
│   │   │   ├── CoursesPage.tsx
│   │   │   └── CourseDetailPage.tsx
│   │   ├── api/
│   │   │   └── course.api.ts
│   │   ├── components/
│
│   ├── videos/
│   │   ├── pages/
│   │   │   └── VideoPlayerPage.tsx
│   │   ├── components/
│   │   │   └── VideoPlayer.tsx
│   │   ├── api/
│   │   │   └── video.api.ts
│
│   ├── enrollment/
│   │   ├── api/
│   │   ├── components/
│
│   ├── comments/
│   │   ├── api/
│   │   ├── components/
│
│
├── components/
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │
│   ├── ui/   ← shadcn
│
├── services/
│   ├── api.ts
│   ├── response.ts   🔥 مهم برای تو
│
├── hooks/
│
├── types/
│   ├── user.ts
│   ├── course.ts
│   ├── video.ts
│
├── lib/
│   └── utils.ts


//=====================================================================
File Structure of frontend
//=====================================================================
