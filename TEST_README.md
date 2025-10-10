# PrisimAI Test Suite

Comprehensive test suite for the JavaScript functionality in `dev/index.html`.

## Overview

**Total Tests**: 80+ test cases across 11 categories
**Framework**: Jest with jsdom environment

## Installation

```bash
npm install
```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Test Categories

### 1. Utility Functions (15+ tests)
- Chat ID generation with timestamp and random suffix
- HTML escaping for XSS prevention
- Input validation and type checking

### 2. Chat Button Management (20+ tests)
- Creating new chat buttons
- Setting active chat states
- Updating chat titles
- Preventing duplicate buttons
- HTML escaping in titles

### 3. Storage Functions (10+ tests)
- Saving chats to localStorage
- Loading and parsing saved chats
- Sorting chats by creation time
- Clearing individual chats
- Error handling for quota exceeded

### 4. Message Rendering (10+ tests)
- User message creation and styling
- Assistant message creation and styling
- Image message handling
- Loading indicators
- Welcome message visibility

### 5. API Integration (8+ tests)
- Model fetching from API
- Network error handling
- Image URL generation
- Empty response handling

### 6. Event Handlers (10+ tests)
- Dark mode toggle
- Textarea auto-resize with cap
- Form submission prevention
- Input validation

### 7. Tutorial Overlay (5+ tests)
- First-time display logic
- Tutorial dismissal
- LocalStorage persistence

### 8. Edge Cases (7+ tests)
- LocalStorage quota exceeded
- Malformed JSON data
- Missing DOM elements
- Very long messages (10k+ chars)
- Unicode character handling
- Concurrent operations

### 9. Security Testing
- XSS prevention (script tags)
- XSS prevention (image onerror)
- XSS prevention (iframes)
- XSS prevention (javascript: protocol)

### 10. Integration Tests (5+ tests)
- Complete chat workflow
- Multiple chat management
- Full XSS prevention workflow

## Key Features

### Security
- All user input properly escaped
- Protection against XSS attacks
- Safe HTML generation

### Error Handling
- Network failure scenarios
- Storage access errors
- Invalid/corrupted data
- Missing dependencies

### Performance
- Long message handling
- Race condition testing
- Scalability with multiple chats

## Contributing

When adding features:
1. Write tests first (TDD)
2. Update existing tests
3. Ensure all tests pass
4. Maintain >90% coverage

See full documentation in test files.