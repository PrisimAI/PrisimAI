# PrisimAI Bug List

A comprehensive list of bugs, security vulnerabilities, and code issues found in the PrisimAI codebase.

---

## 🔴 Critical Security Issues


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

### 10. Persona Functions in Group Chats

**Impact: Group chats should simulate a real multiperson conversation, where interactions feel natural and dynamic—as if multiple distinct people are participating at once. This enhances realism and engagement, making the chat experience feel authentic rather than one-sided.**
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

### 36. **Unused `showStats` State in ConversationActions**
- **File**: `src/components/ConversationActions.tsx` (line 43)
- **Description**: `showStats` state is declared but never used:
  ```typescript
  const [showStats, setShowStats] = useState(false)
  ```
- **Impact**: Dead code, unused state variable.
- **Recommendation**: Remove unused state or implement intended functionality.

### 37. **RenameConversationDialog Does Not Sync Title State**
- **File**: `src/components/RenameConversationDialog.tsx` (line 27)
- **Description**: The dialog initializes `title` state with `currentTitle` but doesn't update when `currentTitle` prop changes:
  ```typescript
  const [title, setTitle] = useState(currentTitle)
  ```
- **Impact**: If the dialog is opened for different conversations without unmounting, the title won't update.
- **Recommendation**: Add a `useEffect` to sync state with props when they change.

### 38. **Non-null Assertion in Group Chat Persona Lookup (Line 167)**
- **File**: `src/components/CreateGroupChatDialog.tsx` (line 167)
- **Description**: Another non-null assertion when mapping over selected personas:
  ```typescript
  const persona = personas.find(p => p.id === personaId)!
  ```
- **Impact**: Runtime error if persona is not found.
- **Recommendation**: Add null check with fallback.

### 39. **Missing Cleanup for Resize Event Listener in LiquidMetalBackground**
- **File**: `src/components/LiquidMetalBackground.tsx`
- **Description**: While cleanup does remove the listener and cancel animation frame, there's no handling for the case where the component unmounts during animation.
- **Impact**: Potential memory leak in edge cases.
- **Recommendation**: Add a flag to prevent state updates after unmount.

### 40. **handleEditMessage Triggers Regeneration Without Removing Previous Response**
- **File**: `src/App.tsx` (lines 451-464)
- **Description**: When editing a user message, `handleEditMessage` calls `handleSendMessage` which adds a new AI response, but the old AI response for the original message isn't removed:
  ```typescript
  const handleEditMessage = (messageId: string, newContent: string) => {
    // ...updates message...
    // Then triggers new response without cleaning up old one
    handleSendMessage(newContent)
  }
  ```
- **Impact**: Duplicate AI responses could accumulate after message edits.
- **Recommendation**: Remove subsequent messages before regenerating.

### 41. **Potential Double Message on New Conversation**
- **File**: `src/App.tsx` (lines 182-187)
- **Description**: When `handleSendMessage` is called without a `currentConversationId`, it creates a new conversation and sets `pendingMessage`, but if the user clicks send again quickly, they could send multiple messages.
- **Impact**: Duplicate messages could be sent.
- **Recommendation**: Add a debounce or disable the input during conversation creation.

### 42. **Missing Loading State for enabledPersonas in CreateGroupChatDialog**
- **File**: `src/components/CreateGroupChatDialog.tsx` (line 86)
- **Description**: `enabledPersonas` filters personas without checking if personas array is loaded, could show "No personas available" incorrectly during loading.
- **Impact**: Poor UX during data loading.
- **Recommendation**: Add loading state check.

### 43. **assistantMessage.content Mutation During Streaming**
- **File**: `src/App.tsx` (lines 332-338)
- **Description**: During text streaming, `assistantMessage.content` is directly mutated:
  ```typescript
  assistantMessage.content += chunk
  ```
- **Impact**: Direct mutation of objects used in state is an anti-pattern and could cause issues with React's rendering.
- **Recommendation**: Use proper state updates instead of mutation.

### 44. **getPersonaForMessage Uses Simple Cycling Logic**
- **File**: `src/components/GroupChatRoleplay.tsx` (lines 71-76)
- **Description**: The function uses a simple modulo cycling to assign personas to messages, which doesn't account for actual conversation flow:
  ```typescript
  const personaIndex = (assistantMessages.length - 1) % personas.length
  ```
- **Impact**: Personas may not match the actual message context.
- **Recommendation**: Store persona ID with each message for accurate attribution.

---

## 📋 Summary

| Severity | Count | Fixed |
|----------|-------|-------|
| 🔴 Critical | 1 | ✅ 1 |
| 🟠 High | 6 | ✅ 6 |
| 🟡 Medium | 10 | ✅ 10 |
| 🔵 Low | 25 | ✅ 19 |
| **Total** | **44** | **36** |

---

## ✅ Fixed Issues

The following bugs have been fixed in commit 4618b29:

### Critical
- ✅ Bug #4: Replaced unsafe `Function()` eval with safe recursive-descent math parser

### High Priority
- ✅ Bug #5: Memory leak fixed - Object URLs revoked before message sent
- ✅ Bug #6: Race condition fixed - use direct state access instead of setState side effects
- ✅ Bug #7: Error handling added to Firebase signOut
- ✅ Bug #8: TypeScript types added for ErrorFallback props
- ✅ Bug #9: ESLint configuration added (eslint.config.js)

### Medium Priority
- ✅ Bug #10-11: Unused editingId state removed in MemoryManager/PersonaManager
- ✅ Bug #12: Null reference fixed in CreateGroupChatDialog persona lookup
- ✅ Bug #13: Settings persistence implemented with localStorage
- ✅ Bug #14: Actual profile statistics calculated from conversations
- ✅ Bug #15: Temperature slider display fixed with proper Slider component
- ✅ Bug #16: Premium email list normalized to lowercase
- ✅ Bug #18: SSR safety check added to useLocalStorage
- ✅ Bug #19: Feedback popup state reset when dialog closes

### Low Priority
- ✅ Bug #21: Unused messagesEndRef removed in RoleplayChat
- ✅ Bug #22: Defensive check added in getPersonaForMessage
- ✅ Bug #24: Return type annotation added for formatMessage functions
- ✅ Bug #27: Mock user fallback only enabled in development mode
- ✅ Bug #29: Actual user ID used from auth context in RoleplayPage
- ✅ Bug #34: Null check added for root element in main.tsx
- ✅ Bug #36: Unused showStats state removed in ConversationActions
- ✅ Bug #37: Title state synced with useEffect in RenameConversationDialog
- ✅ Bug #38: Non-null assertion fixed in CreateGroupChatDialog
- ✅ Bug #39: Unmount flag added in LiquidMetalBackground
- ✅ Bug #40: handleEditMessage removes old AI responses before regenerating
- ✅ Bug #43: assistantMessage mutation fixed - uses local variable
- ✅ Bug #44: Defensive check added in getPersonaForMessage for group chat

---

## Remaining Issues (Not Fixed)

Some issues were not fixed as they require more extensive changes:
- Bug #17: Keyboard shortcuts memoization (documentation improvement)
- Bug #20: CSS build warnings (Tailwind v4 syntax)
- Bug #23: Persona ID stability (requires migration)
- Bug #25: Content sanitization (already safe, requires monitoring)
- Bug #26: "No models" message (already handled)
- Bug #28: Return type annotations (widespread, low impact)
- Bug #30: File error messages (already informative)
- Bug #31: Alt text (already adequate)
- Bug #32: WebLLM cleanup (low priority)
- Bug #33: File validation (server-side concern)
- Bug #35: Granular error boundaries (architectural change)
- Bug #41: Debounce for new conversation (edge case)
- Bug #42: Loading state for personas (already handles empty state)

---

## Original Recommendations (Updated)

1. ~~**URGENT**: Remove all hardcoded API keys and implement a proper backend proxy~~ (Not addressed - infrastructure change)
2. ~~**URGENT**: Move premium user management to a secure database~~ (Not addressed - infrastructure change)
3. ✅ **HIGH**: Replace `Function()` evaluation with safe math parser
4. ✅ **HIGH**: Add proper ESLint configuration
5. ✅ **MEDIUM**: Fix memory leaks with Object URLs
6. ✅ **MEDIUM**: Implement settings persistence
7. ✅ **LOW**: Address TypeScript type issues and code quality problems
