# PrisimAI Bug List

A comprehensive list of bugs, security vulnerabilities, and code issues found in the PrisimAI codebase.

---

## 🔴 Critical Security Issues

### 1. **Hardcoded API Keys Exposed in Source Code**
- **File**: `src/lib/pollinations-api.ts` (lines 5-8)
- **Description**: Four API keys are hardcoded directly in the source code:
  ```typescript
  const API_KEY_1 = 'plln_sk_niDbx9acZfiWE3tdVmrXKyk0wh5GnGdM'
  const API_KEY_2 = 'plln_sk_gQKCYN1GNHUb0b5OGbasEx2dXqyXO364'
  const API_KEY_3 = 'plln_sk_fnpi8FteeCwCDgmXF2A1vciVI73sFxA7'
  const API_KEY_4 = 'plln_sk_wfjz4KCVFGQn4izP4AuYEZajHUkS51Hh'
  ```
- **Impact**: Anyone who views the source code can access these API keys, potentially leading to abuse, unauthorized usage, and billing issues.
- **Recommendation**: Use environment variables and a backend proxy to handle API requests securely.

### 2. **Hardcoded Firebase Configuration in Source Code**
- **File**: `src/lib/firebase.ts` (lines 6-14)
- **Description**: Firebase configuration including API key and project details are hardcoded:
  ```typescript
  const firebaseConfig = {
    apiKey: "AIzaSyCU5oNtSXp8VZYn_ow1cChrWPgXg9ccfyA",
    authDomain: "prisimai-9a06c.firebaseapp.com",
    ...
  }
  ```
- **Impact**: While Firebase API keys in frontend are semi-public, the configuration should use environment variables for easier rotation and security hygiene.
- **Recommendation**: Move to environment variables.

### 3. **Hardcoded Premium User Email List**
- **File**: `src/lib/pollinations-api.ts` (lines 120-130)
- **Description**: Premium user emails are hardcoded in the source code:
  ```typescript
  export const PREMIUM_ACCESS_EMAILS: string[] = [
    'example@example.com',
    'christopherhauser1234@gmail.com',
    // ...more emails
  ]
  ```
- **Impact**: User emails are exposed, and anyone can see who has premium access. Users could also potentially manipulate their email to match the list.
- **Recommendation**: Store premium status in a secure database with proper authentication.

### 4. **Unsafe Code Evaluation in AI Tools**
- **File**: `src/lib/ai-tools.ts` (lines 86-91)
- **Description**: The `calculate` function uses `Function()` constructor for evaluating mathematical expressions:
  ```typescript
  const expression = args.expression.replace(/[^0-9+\-*/().\s]/g, '')
  const result = Function(`'use strict'; return (${expression})`)()
  ```
- **Impact**: While there's a regex filter, this approach is still vulnerable to code injection attacks. The regex doesn't prevent all forms of malicious code.
- **Recommendation**: Use a proper math expression parser library (e.g., `mathjs`) instead of `eval`/`Function`.

---

## 🟠 High Priority Bugs

### 5. **Memory Leak: Object URLs Not Always Revoked**
- **File**: `src/components/ChatInput.tsx` (lines 74-80)
- **Description**: When files are processed, `URL.createObjectURL(file)` is called but if the message is sent successfully, these object URLs may not be revoked.
- **Impact**: Memory leaks over time, especially with multiple file uploads.
- **Recommendation**: Ensure all object URLs are revoked after the message is sent or component unmounts.

### 6. **Race Condition in Conversation State Management**
- **File**: `src/App.tsx` (lines 193-206)
- **Description**: The code reads conversation state inside a `setConversations` callback in a way that could lead to stale data:
  ```typescript
  setConversations((current = []) => {
    const conversation = current.find((c) => c.id === currentConversationId)
    if (conversation) {
      conversationMessages = conversation.messages
      conversationExists = true
    }
    return current  // Returns unchanged state but uses side effects
  })
  ```
- **Impact**: Side effects in state setters is an anti-pattern and could cause race conditions.
- **Recommendation**: Use a ref or separate state query instead of misusing the state setter.

### 7. **Missing Error Handling in Firebase Sign Out**
- **File**: `src/contexts/AuthContext.tsx` (lines 119-122)
- **Description**: `signOut` doesn't handle potential errors from `firebaseSignOut`:
  ```typescript
  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
  }
  ```
- **Impact**: If sign out fails, user state becomes inconsistent.
- **Recommendation**: Add try-catch and proper error handling.

### 8. **TypeScript Types Missing for ErrorFallback Props**
- **File**: `src/ErrorFallback.tsx` (line 6)
- **Description**: Component props are not typed:
  ```typescript
  export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  ```
- **Impact**: No type safety for error boundary props.
- **Recommendation**: Add proper TypeScript interface.

### 9. **ESLint Configuration Missing**
- **File**: Project root
- **Description**: The project has `eslint` in devDependencies but no `eslint.config.js` file, causing `npm run lint` to fail.
- **Impact**: No linting enforcement, potential code quality issues.
- **Recommendation**: Add proper ESLint configuration.

---

## 🟡 Medium Priority Bugs

### 10. **Unused Variable `editingId` in MemoryManager**
- **File**: `src/components/MemoryManager.tsx` (line 45)
- **Description**: `editingId` state is declared and `setEditingId` is called, but `editingId` is never used in rendering logic.
- **Impact**: Dead code, unused edit functionality.
- **Recommendation**: Implement the editing feature or remove unused state.

### 11. **Unused Variable `editingId` in PersonaManager**
- **File**: `src/components/PersonaManager.tsx` (line 71)
- **Description**: Same issue as above - `editingId` is set but never used.
- **Impact**: Dead code, incomplete edit functionality.
- **Recommendation**: Implement or remove.

### 12. **Potential Null Reference in Group Chat Persona Lookup**
- **File**: `src/components/CreateGroupChatDialog.tsx` (line 69)
- **Description**: Uses non-null assertion on `personas.find()`:
  ```typescript
  const persona = personas.find(p => p.id === personaId)!
  ```
- **Impact**: Could throw runtime error if persona not found.
- **Recommendation**: Add null check.

### 13. **Settings Not Persisted**
- **File**: `src/components/SettingsDialog.tsx`
- **Description**: Settings like `streamingEnabled`, `toolsEnabled`, `systemMessage`, temperature, max tokens, and context window are stored in local component state but never saved or applied anywhere.
- **Impact**: Settings changes don't persist or affect the application.
- **Recommendation**: Connect settings to localStorage or context and apply to API calls.

### 14. **Profile Statistics Always Show Zero**
- **File**: `src/components/ProfileDialog.tsx` (lines 103-112)
- **Description**: Account statistics are hardcoded to 0:
  ```typescript
  <div className="text-2xl font-semibold">0</div>
  // ...
  <div className="text-2xl font-semibold">0</div>
  ```
- **Impact**: Users see incorrect/useless statistics.
- **Recommendation**: Calculate actual statistics from conversations.

### 15. **Temperature Slider Display Not Updated**
- **File**: `src/components/SettingsDialog.tsx` (line 130)
- **Description**: Temperature slider shows hardcoded "1.0" instead of actual value:
  ```typescript
  <span className="text-sm font-medium w-12 text-right">1.0</span>
  ```
- **Impact**: UI doesn't reflect actual slider value.
- **Recommendation**: Use state to track and display actual value.

### 16. **hasPremiumAccess Case Sensitivity Issue**
- **File**: `src/lib/pollinations-api.ts` (lines 133-136)
- **Description**: Premium email comparison uses `toLowerCase()` but the hardcoded list has mixed case emails:
  ```typescript
  return PREMIUM_ACCESS_EMAILS.includes(email.toLowerCase())
  ```
- **Impact**: Would work correctly, but the email list should also be normalized for clarity.
- **Recommendation**: Normalize the email list to lowercase.

### 17. **Missing Dependency in useKeyboardShortcuts Effect**
- **File**: `src/hooks/use-keyboard-shortcuts.ts` (line 38)
- **Description**: The `shortcuts` array dependency could cause unnecessary re-registrations if not memoized by the caller.
- **Impact**: Potential performance issues, shortcuts may re-register on every render.
- **Recommendation**: Document that `shortcuts` should be memoized, or add internal memoization.

### 18. **Incomplete useLocalStorage SSR Safety**
- **File**: `src/hooks/use-local-storage.ts` (line 10)
- **Description**: Direct access to `window.localStorage` in initial state can fail during SSR:
  ```typescript
  const item = window.localStorage.getItem(key)
  ```
- **Impact**: Would crash in SSR environments.
- **Recommendation**: Add `typeof window !== 'undefined'` check.

### 19. **Feedback Popup Timing Issues**
- **File**: `src/components/ProfileDialog.tsx` (lines 33-40)
- **Description**: Feedback popup check is inside a useEffect that depends on `open` and `user?.uid`, but `showFeedbackPopup` state isn't reset when dialog closes.
- **Impact**: Popup may not show correctly if dialog is reopened.
- **Recommendation**: Reset state when dialog closes.

---

## 🔵 Low Priority Bugs / Code Quality Issues

### 20. **CSS Build Warnings**
- **Location**: Build output
- **Description**: CSS contains invalid media query syntax causing warnings:
  ```
  @media (width >= (display-mode: standalone))
  ```
- **Impact**: CSS warnings in build, potential styling issues.
- **Recommendation**: Fix CSS syntax.

### 21. **Unused Import in RoleplayChat**
- **File**: `src/components/RoleplayChat.tsx` (line 33)
- **Description**: `messagesEndRef` is created but the scroll implementation uses `scrollAreaRef` with a different approach.
- **Impact**: Dead code.
- **Recommendation**: Remove unused ref or implement its intended use.

### 22. **Missing Persona in Group Chat Check**
- **File**: `src/components/GroupChatRoleplay.tsx` (lines 71-76)
- **Description**: The `getPersonaForMessage` function assumes personas exist and cycles through them, but doesn't handle the case when no personas exist.
- **Impact**: Could return undefined leading to UI issues.
- **Recommendation**: Add defensive check.

### 23. **Inconsistent Persona ID Generation**
- **Files**: `src/App.tsx`, `src/components/RoleplayPage.tsx`
- **Description**: Persona IDs are generated using index-based strings like `premade_${idx}` which could change if the order of PREMADE_PERSONAS changes.
- **Impact**: Could break existing conversations referencing old IDs.
- **Recommendation**: Use stable, content-based IDs.

### 24. **Missing Type for formatMessage Return**
- **File**: `src/components/RoleplayChat.tsx` (lines 62-68)
- **Description**: `formatMessage` function returns different types (string or parsed HTML).
- **Impact**: Potential type confusion.
- **Recommendation**: Add proper return type annotation.

### 25. **Potential XSS in Character Card Dialog**
- **File**: `src/components/CharacterCardDialog.tsx`
- **Description**: While `systemPrompt` is displayed in a `<p>` tag (safe), if the rendering approach changes to use `dangerouslySetInnerHTML` without sanitization, it could be vulnerable.
- **Impact**: Currently safe, but code could become vulnerable with changes.
- **Recommendation**: Consider sanitizing all user-provided content.

### 26. **Missing Loading State for Model Lists**
- **File**: `src/components/ModelSelector.tsx` (lines 81-83)
- **Description**: When models array is empty, `currentModel` will be undefined but there's no indication to the user.
- **Impact**: Confusing UX when no models available.
- **Recommendation**: Show "No models available" message.

### 27. **Console Warnings for Development Mock User**
- **File**: `src/contexts/AuthContext.tsx` (lines 38-64)
- **Description**: Development mock user feature includes a 3-second timeout which fires in production if Firebase is slow.
- **Impact**: Could incorrectly trigger mock user in production.
- **Recommendation**: Only enable mock user in development mode explicitly.

### 28. **Missing Return Type Annotations**
- **Multiple Files**
- **Description**: Many functions lack explicit return type annotations.
- **Impact**: Reduced type safety.
- **Recommendation**: Add return types to all exported functions.

### 29. **Hardcoded User ID in RoleplayPage**
- **File**: `src/components/RoleplayPage.tsx` (line 387)
- **Description**: `currentUserId` is hardcoded as `"user_1"`:
  ```typescript
  currentUserId="user_1"
  ```
- **Impact**: All users share the same ID which could cause issues in multi-user scenarios.
- **Recommendation**: Use actual user ID from auth context.

### 30. **Empty Catch Block in File Reading**
- **File**: `src/components/ChatInput.tsx` (lines 84-87)
- **Description**: Errors during file processing are logged but the error message is generic.
- **Impact**: Users don't know why specific files failed.
- **Recommendation**: Provide more specific error messages.

### 31. **Missing alt Text for Persona Avatars**
- **File**: `src/components/RoleplayPage.tsx` (line 29)
- **Description**: Avatar images have `alt={persona.name}` which is good, but fallback states don't provide proper accessibility.
- **Impact**: Accessibility issues.
- **Recommendation**: Ensure all image states have proper alt text.

### 32. **Potential Memory Leak in WebLLM Service**
- **File**: `src/lib/webllm-service.ts` (lines 232-243)
- **Description**: The `unload` method sets the engine to null but doesn't properly await cleanup or handle errors robustly.
- **Impact**: Potential memory leaks with WebGPU resources.
- **Recommendation**: Implement proper cleanup with await and error handling.

### 33. **Missing Input Validation for File Uploads**
- **File**: `src/components/ChatInput.tsx`
- **Description**: While file size is checked, there's no validation for file content or malicious file types beyond the accept attribute.
- **Impact**: Potential security risk with malicious files.
- **Recommendation**: Add server-side validation when files are processed.

### 34. **Deprecated React Pattern in main.tsx**
- **File**: `src/main.tsx` (line 26)
- **Description**: Uses non-null assertion on `document.getElementById('root')!` which could cause runtime error if element doesn't exist.
- **Impact**: Potential crash if HTML is malformed.
- **Recommendation**: Add null check or proper error handling.

### 35. **Missing Error Boundary Around Router/Main Content**
- **File**: `src/main.tsx`
- **Description**: Error boundary only wraps the entire app. More granular error boundaries would improve UX.
- **Impact**: Single error could crash entire app.
- **Recommendation**: Add error boundaries around critical sections.

---

## 📋 Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 4 |
| 🟠 High | 5 |
| 🟡 Medium | 10 |
| 🔵 Low | 16 |
| **Total** | **35** |

---

## Recommendations for Immediate Action

1. **URGENT**: Remove all hardcoded API keys and implement a proper backend proxy
2. **URGENT**: Move premium user management to a secure database
3. **HIGH**: Replace `Function()` evaluation with a proper math library
4. **HIGH**: Add proper ESLint configuration
5. **MEDIUM**: Fix memory leaks with Object URLs
6. **MEDIUM**: Implement settings persistence
7. **LOW**: Address TypeScript type issues and code quality problems
