# Tab Components

This directory contains tab components for the CreateBanca form.
Each tab is a self-contained module that manages its own logic and presentation.

## Structure

```
tabs/
└── GastosAutomaticosTab.jsx - Automatic expenses management tab
```

## Component Architecture

### GastosAutomaticosTab

**Purpose:** Manage automatic recurring expenses for branches

**Dependencies:**
- `useExpenses` custom hook (business logic)
- `ExpenseRow` component (individual expense display)
- `Pagination` component (table navigation)
- `expenseConfig.js` (configuration constants)

**Features:**
- Add/remove expenses
- Filter/search functionality
- Pagination support
- Data validation
- Responsive design
- Accessibility compliant

**Props:**
- `formData` (object) - Parent form state
- `onChange` (function) - Callback to update parent state
- `error` (string) - Error message to display
- `success` (string) - Success message to display

**State Management:**
- All expense operations handled by `useExpenses` hook
- Syncs with parent form via `onChange` callback
- No local state leakage - single source of truth

## Best Practices Followed

1. **Single Responsibility:** Each component does one thing well
2. **Separation of Concerns:** Logic in hooks, presentation in components
3. **React.memo:** Performance optimization where needed
4. **PropTypes:** Type checking for all props
5. **Accessibility:** ARIA labels, keyboard navigation
6. **No Magic Numbers:** All configs in separate files
7. **Semantic HTML:** Proper tags for better SEO and a11y

## Adding New Tabs

To add a new tab:

1. Create new component in this directory: `[TabName]Tab.jsx`
2. Create custom hook if needed: `src/hooks/use[Feature].js`
3. Create config file if needed: `src/config/[feature]Config.js`
4. Create CSS file: `src/assets/css/[TabName].css`
5. Import and use in `CreateBanca.jsx`

Example:
```jsx
import NewTab from './tabs/NewTab';

// In renderTabContent():
} else if (activeTab === 'New Tab') {
  return (
    <NewTab
      formData={formData}
      onChange={handleInputChange}
      error={error}
      success={success}
    />
  );
}
```

## Performance Considerations

- Components wrapped in `React.memo()` to prevent unnecessary re-renders
- Callbacks wrapped in `useCallback()` when passed as props
- Expensive calculations wrapped in `useMemo()`
- Pagination to handle large datasets efficiently

## Testing

(To be implemented)

Each tab should have:
- Unit tests for business logic (hooks)
- Component tests for UI
- Integration tests for full flow
- Accessibility tests

## Future Improvements

- [ ] Add TypeScript for better type safety
- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Add Storybook stories
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Add optimistic updates
