# Implementation Plan - WhatsApp Group Messaging with Customization

- [ ] 1. Extend Firebase Schema and Services
  - Add phoneNumber field to existing Guest interface in `src/types/guest.ts`
  - Create new interfaces for MessageHistory, MessageTemplate, and BatchResult
  - Extend firebaseService.ts with phone number validation and update methods
  - Add new Firebase collections constants (message_history, message_templates)
  - Update Firestore security rules to support new collections and phoneNumber field
  - _Requirements: 1.1, 10.1, 11.1, 12.1_

- [ ] 1.1 Write property test for phone number validation
  - **Property 1: Phone number validation consistency**
  - **Validates: Requirements 1.2, 1.3, 1.4**

- [ ] 2. Create WhatsApp Group Messaging Service
  - Create `src/services/whatsappGroupService.ts` with core messaging functionality
  - Implement phone number validation using libphonenumber-js
  - Implement message template management (save, load, delete custom templates)
  - Implement message personalization with variable substitution
  - Implement batch send processing with progress tracking
  - Add message history management (create, read, update records)
  - Add retry mechanism for failed messages
  - _Requirements: 1.2, 1.3, 2.4, 5.1, 5.2, 7.1, 7.3, 8.1, 8.2, 8.3, 8.4, 10.2, 12.2_

- [ ] 2.1 Write property test for message personalization
  - **Property 3: Message personalization accuracy**
  - **Validates: Requirements 2.4, 5.1, 5.2**

- [ ] 2.2 Write property test for template management
  - **Property 6: Template management integrity**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

- [ ] 3. Create Message Template System
  - Create `src/utils/messageTemplates.ts` for template utilities
  - Implement default message template with required variables
  - Add template validation and variable extraction functions
  - Implement template storage using AsyncStorage for custom templates
  - Add template usage tracking and limit enforcement (max 10)
  - Create template preview functionality with variable substitution
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 8.5_

- [ ] 3.1 Write property test for message length validation
  - **Property 7: Message length validation**
  - **Validates: Requirements 6.3**

- [ ] 4. Create MessageComposer Component
  - Create `src/components/MessageComposer.tsx` with TypeScript
  - Implement multiline text input with syntax highlighting for variables
  - Add real-time preview with variable substitution
  - Implement guest selector for preview testing
  - Add character counter with warning for messages >1000 characters
  - Create template management buttons (save, load, reset)
  - Add QR code preview that updates with selected guest
  - _Requirements: 2.1, 2.2, 2.4, 2.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 5. Create GuestSelection Component
  - Create `src/components/GuestSelection.tsx` with TypeScript
  - Implement tab system (All, With Phone, Without Phone) with badges
  - Add guest list with checkboxes and selection state management
  - Implement "Select All" functionality that respects current tab filter
  - Add real-time selection counter display
  - Implement status icons for message history (✅ ❌ ⏳)
  - Add inline phone number editing capability
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 9.1, 9.2, 9.3, 9.4, 9.5, 10.3_

- [ ] 5.1 Write property test for guest filtering
  - **Property 4: Guest filtering consistency**
  - **Validates: Requirements 4.2, 9.2, 9.4**

- [ ] 5.2 Write property test for selection state management
  - **Property 5: Selection state management**
  - **Validates: Requirements 4.3, 4.4, 4.5, 9.3**

- [ ] 6. Create BatchProgress Component
  - Create `src/components/BatchProgress.tsx` with TypeScript
  - Implement progress bar with current/total display
  - Add current guest information display
  - Show sent/failed counters in real-time
  - Add pause/resume functionality for batch processing
  - Implement batch summary display with retry options
  - _Requirements: 5.5, 7.1, 7.2, 7.3_

- [ ] 6.1 Write property test for batch progress tracking
  - **Property 8: Batch processing progress tracking**
  - **Validates: Requirements 5.5, 7.1, 7.2**

- [ ] 7. Create WhatsAppGroupMessagingScreen
  - Create `src/screens/WhatsAppGroupMessagingScreen.tsx` with TypeScript
  - Set up component state for guests, selections, templates, and batch progress
  - Implement Firebase real-time listeners for guests and message history
  - Integrate MessageComposer, GuestSelection, and BatchProgress components
  - Add screen navigation and parameter handling
  - Implement error handling with user-friendly messages in French
  - _Requirements: All UI requirements_

- [ ] 8. Implement Batch Send Processing
  - Add batch send logic to WhatsAppGroupMessagingScreen
  - Implement sequential processing with user confirmation for each send
  - Integrate with existing QR code generation and ViewShot capture
  - Add WhatsApp sharing integration using expo-sharing
  - Implement progress tracking and status updates
  - Add error handling and retry mechanism
  - Create batch summary with detailed results
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 7.4_

- [ ] 8.1 Write property test for retry mechanism
  - **Property 13: Retry mechanism accuracy**
  - **Validates: Requirements 7.3**

- [ ] 9. Extend Guest Management with Phone Numbers
  - Update `src/screens/GuestDetailScreen.tsx` to include phone number field
  - Add phone number input with validation to guest creation/editing forms
  - Update CSV import functionality to support optional phoneNumber column
  - Extend guest list displays to show phone number status
  - Add phone number formatting and validation throughout the app
  - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [ ] 9.1 Write property test for CSV import phone handling
  - **Property 2: CSV import phone number handling**
  - **Validates: Requirements 1.5**

- [ ] 10. Implement Message History System
  - Create message history collection management in Firebase
  - Add message history tracking for all send attempts
  - Implement history display in guest detail screens
  - Add filtering and search capabilities for message history
  - Create organizer attribution and timestamp tracking
  - Implement duplicate message prevention (same day rule)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 12.1, 12.2, 12.3, 12.4_

- [ ] 10.1 Write property test for message history persistence
  - **Property 9: Message history persistence**
  - **Validates: Requirements 10.2, 12.2**

- [ ] 10.2 Write property test for duplicate prevention
  - **Property 10: Duplicate message prevention**
  - **Validates: Requirements 12.4**

- [ ] 11. Implement Real-time Synchronization
  - Add Firebase real-time listeners for phone number changes
  - Implement automatic UI updates when data changes from other clients
  - Add conflict resolution for concurrent modifications using timestamps
  - Implement offline mode with automatic sync on reconnection
  - Add connection status monitoring and user feedback
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 12.5_

- [ ] 11.1 Write property test for Firebase synchronization
  - **Property 11: Firebase synchronization consistency**
  - **Validates: Requirements 11.1, 11.2, 11.3**

- [ ] 11.2 Write property test for offline synchronization
  - **Property 12: Offline synchronization reliability**
  - **Validates: Requirements 11.5**

- [ ] 12. Add Error Handling and Fallbacks
  - Implement comprehensive error handling for all async operations
  - Add WhatsApp availability detection with fallback to native sharing
  - Create user-friendly error messages in French
  - Add error logging with sufficient detail for debugging
  - Implement graceful degradation for offline scenarios
  - Add retry mechanisms with exponential backoff
  - _Requirements: 7.4, 7.5_

- [ ] 12.1 Write property test for error logging
  - **Property 14: Error logging completeness**
  - **Validates: Requirements 7.4**

- [ ] 12.2 Write property test for WhatsApp fallback
  - **Property 15: WhatsApp fallback behavior**
  - **Validates: Requirements 7.5**

- [ ] 13. Add Navigation Integration
  - Update `src/navigation/AppNavigator.tsx` to include new screen
  - Add navigation from HomeScreen with "Envoi Groupé" button
  - Add navigation from GuestListScreen with bulk action
  - Implement parameter passing for pre-selected guests
  - Add deep linking support for direct access to messaging screen
  - _Requirements: All (enables access to feature)_

- [ ] 14. Style and Polish UI
  - Apply existing theme colors, spacing, and typography throughout
  - Create comprehensive StyleSheet for all new components
  - Implement responsive design for tablets and different screen sizes
  - Add proper accessibility labels and hints for screen readers
  - Implement smooth animations for state transitions
  - Add loading states and skeleton screens for better UX
  - _Requirements: All UI/UX requirements_

- [ ] 15. Add Phone Number Dependencies
  - Install react-native-phone-number-input for formatted input
  - Install libphonenumber-js for international validation
  - Configure phone number input component with country selection
  - Add phone number formatting utilities
  - Test phone number validation across different locales
  - _Requirements: 1.2, 1.3_

- [ ] 16. Update Firebase Security Rules
  - Update Firestore security rules to support phoneNumber field in guests collection
  - Add security rules for message_history collection with organizer-based access
  - Add security rules for message_templates collection with creator-based access
  - Implement phone number validation in security rules
  - Test security rules with Firebase emulator
  - Deploy updated rules to production
  - _Requirements: 1.1, 10.1, 12.1_

- [ ] 17. Checkpoint - Core Functionality Testing
  - Ensure all tests pass, ask the user if questions arise.
  - Test phone number addition and validation
  - Test message composition with variable substitution
  - Test guest selection and filtering
  - Test basic batch send flow (without actual WhatsApp sending)
  - Verify Firebase synchronization works correctly

- [ ] 18. Implement Advanced Features
  - Add template sharing between organizers
  - Implement message scheduling for future sending
  - Add bulk phone number import from contacts
  - Create message analytics and delivery tracking
  - Add message templates export/import functionality
  - _Requirements: Advanced features for future enhancement_

- [ ] 18.1 Write integration tests for complete workflow
  - Test end-to-end flow from composition to sending
  - Test error scenarios and recovery
  - Test multi-user collaboration scenarios
  - Test offline/online synchronization

- [ ] 19. Performance Optimization
  - Implement virtualization for large guest lists (100+ guests)
  - Add pagination for message history
  - Optimize Firebase queries with proper indexing
  - Implement image caching for QR codes
  - Add memory management for batch processing
  - Test performance with large datasets
  - _Requirements: Performance and scalability_

- [ ] 20. Final Checkpoint - Complete System Testing
  - Ensure all tests pass, ask the user if questions arise.
  - Test complete workflow with real WhatsApp integration
  - Verify all error scenarios are handled gracefully
  - Test multi-device synchronization
  - Verify security rules work correctly
  - Test with various phone number formats and locales
  - Perform accessibility testing
  - Test on both Android and iOS devices