# DigitizeApp App - Development Checklist

This checklist ensures all code changes adhere to the [Coding Guide](./Coding.md) standards. Use this before submitting any pull request or committing code.

## 📋 Pre-Development Checklist

### Understanding & Planning
- [ ] **Read the Coding Guide**: Familiarize yourself with `/Users/oluwafemiadekunle/Documents/flex/digitize-app/Coding.md`
- [ ] **Understand the Architecture**: Review the directory structure and separation of concerns
- [ ] **Plan the Implementation**: Identify which layers (components, hooks, services) will be affected
- [ ] **Check Existing Code**: Review similar implementations in the codebase for consistency

### Branch & Setup
- [ ] **Create Feature Branch**: Use `feature/T-XXX-short-description` format
- [ ] **Update Dependencies**: Run `npm install` if package.json changed
- [ ] **Environment Setup**: Ensure all environment variables are configured

## 🏗️ Architecture & Structure

### Directory Structure Compliance
- [ ] **Correct Directory**: Files are placed in the right directory according to their purpose
  - [ ] `/app/` - Only routing and screens
  - [ ] `/components/` - Reusable, stateless UI components
  - [ ] `/hooks/` - Business logic and stateful logic
  - [ ] `/services/` - API clients and external interactions
  - [ ] `/stores/` - Zustand global state management
  - [ ] `/utils/` - Helper functions

### File Naming Conventions
- [ ] **Components**: `PascalCase.tsx` (e.g., `PrimaryButton.tsx`)
- [ ] **Hooks**: `kebab-case.ts` (e.g., `use-auth.ts`)
- [ ] **Services**: `camelCase.ts` (e.g., `authService.ts`)
- [ ] **Types/Interfaces**: `PascalCase.ts` (e.g., `UserTypes.ts`)

## 💻 Code Quality Standards

### TypeScript Compliance
- [ ] **No `any` Types**: All variables have proper types (except with explicit `// TODO:` comments)
- [ ] **Interface Definitions**: All props have well-defined TypeScript interfaces
- [ ] **Type Safety**: All function parameters and return types are typed
- [ ] **Generic Types**: Use generics where appropriate for reusability

### React Component Standards
- [ ] **Functional Components Only**: No class components
- [ ] **Stateless Components**: Components receive data via props, not internal state
- [ ] **Props Interface**: Clear, well-documented prop interfaces
- [ ] **Separation of Concerns**: UI components are separate from business logic

### Performance Optimization
- [ ] **React.memo**: All non-trivial components wrapped in `React.memo`
- [ ] **useCallback**: All callback props are memoized with `useCallback`
- [ ] **useMemo**: All non-primitive data passed as props is memoized
- [ ] **FlatList Optimization**: 
  - [ ] `keyExtractor` implemented
  - [ ] `renderItem` is a memoized callback
  - [ ] `getItemLayout` used for fixed-height items
- [ ] **No Anonymous Functions**: No inline functions in JSX props

### Styling Standards
- [ ] **StyleSheet.create**: All styles use `StyleSheet.create()`
- [ ] **No Inline Styles**: Except for highly dynamic, one-off cases
- [ ] **Constants Usage**: Colors, fonts, and spacing from `/constants`
- [ ] **No Magic Numbers**: All hardcoded values replaced with constants

## 🔄 Asynchronous Operations

### API & Services
- [ ] **Service Layer**: All API calls go through `/services` layer
- [ ] **No Direct API Calls**: Components don't make direct network requests
- [ ] **async/await**: All asynchronous operations use `async/await`
- [ ] **Error Handling**: All API calls wrapped in `try/catch` blocks
- [ ] **Loading States**: All async operations have loading state management

### Error Handling
- [ ] **Structured Errors**: Services throw classified, structured errors
- [ ] **User Feedback**: Users receive appropriate feedback for all operations
- [ ] **Graceful Degradation**: App handles errors without crashing

## 🔒 Security & Data Handling

### Data Security
- [ ] **No Hardcoded Secrets**: No API keys or tokens in source code
- [ ] **Environment Variables**: All secrets loaded from environment variables
- [ ] **Secure Storage**: Sensitive data uses `expo-secure-store`
- [ ] **HTTPS Only**: All network communications use HTTPS
- [ ] **Input Validation**: All user inputs are validated

### Storage Strategy
- [ ] **AsyncStorage**: Only for non-sensitive, public data
- [ ] **Secure Store**: For authentication tokens and PII
- [ ] **Proper Cleanup**: Memory leaks prevented with proper cleanup

## ♿ Accessibility (a11y)

### Accessibility Standards
- [ ] **Accessibility Labels**: All interactive elements have `accessibilityLabel`
- [ ] **Accessibility Roles**: All interactive elements have `accessibilityRole`
- [ ] **Accessibility States**: Current state described with `accessibilityState`
- [ ] **Color Contrast**: Meets WCAG AA standards (4.5:1 for normal text)
- [ ] **Touch Targets**: Minimum 44x44 points for all interactive elements
- [ ] **Screen Reader Testing**: Tested with VoiceOver (iOS) and TalkBack (Android)

## 📱 React Native Best Practices

### Performance
- [ ] **Bundle Size**: New dependencies analyzed for size impact
- [ ] **Memory Management**: Proper cleanup in `useEffect` hooks
- [ ] **Image Optimization**: Proper image sizing and loading strategies
- [ ] **List Performance**: Optimized list rendering with proper props

### Platform Considerations
- [ ] **iOS Testing**: Tested on physical iOS device
- [ ] **Android Testing**: Tested on physical Android device
- [ ] **Platform-Specific Code**: Uses `Platform.select()` where needed
- [ ] **Responsive Design**: Works across different screen sizes

## 🧪 Testing & Quality Assurance

### Code Quality
- [ ] **Linting**: Code passes `npm run lint` without errors
- [ ] **Type Checking**: Code passes `npm run type-check`
- [ ] **No Console Logs**: No `console.log` statements in production code
- [ ] **Code Comments**: Only necessary comments (explain why, not what)

### Manual Testing
- [ ] **Feature Testing**: All new features work as expected
- [ ] **Regression Testing**: Existing features still work
- [ ] **Error Scenarios**: App handles error cases gracefully
- [ ] **Performance Testing**: No noticeable performance degradation

## 📝 Documentation & Git

### Code Documentation
- [ ] **Self-Documenting Code**: Code is clear and readable without excessive comments
- [ ] **JSDoc**: Only for public APIs or complex functions
- [ ] **README Updates**: Update relevant documentation if needed

### Git Standards
- [ ] **Conventional Commits**: Commit messages follow conventional commit format
- [ ] **Branch Naming**: Feature branch follows `feature/T-XXX-description` format
- [ ] **Clean History**: No unnecessary commits or merge commits
- [ ] **PR Description**: Clear explanation of changes and reasoning

## 🚀 Pre-Commit Checklist

### Final Verification
- [ ] **Run Quality Checks**: `npm run code-quality`
- [ ] **Run Tests**: `npm run test`
- [ ] **Check Bundle Size**: Verify no unexpected size increases
- [ ] **Review Changes**: Self-review all changes before committing
- [ ] **Coding Guide Compliance**: All changes align with coding guide principles

### Deployment Readiness
- [ ] **Environment Variables**: All required env vars documented
- [ ] **Build Success**: App builds successfully for both platforms
- [ ] **No Breaking Changes**: Changes don't break existing functionality
- [ ] **Performance Impact**: No negative performance impact

## 🎯 Definition of Done

A task is considered complete when:
- [ ] All checklist items above are checked
- [ ] Code has been reviewed by another team member
- [ ] All tests pass
- [ ] App works correctly on both iOS and Android devices
- [ ] Accessibility standards are met
- [ ] Performance requirements are satisfied
- [ ] Security standards are followed
- [ ] Documentation is updated if necessary

---

## 📞 Quick Reference Commands

```bash
# View coding guide
npm run coding-guide

# View this checklist
npm run dev-checklist

# Run all quality checks
npm run code-quality

# Run pre-commit checks
npm run pre-commit

# View all standards
npm run standards
```

**Remember**: This checklist is based on the comprehensive [Coding Guide](./Coding.md). When in doubt, refer to the full guide for detailed explanations and examples.
