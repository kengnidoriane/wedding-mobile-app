# Implementation Plan - WhatsApp QR Code Sharing

- [x] 1. Create QR Sharing Service Module





  - Create `src/services/qrSharingService.ts` with core sharing functionality
  - Implement `captureQRCode()` function using ViewShot API
  - Implement `shareViaWhatsApp()` function using expo-sharing
  - Implement `saveToGallery()` function with permission handling using expo-media-library
  - Implement `shareViaSystem()` fallback function for native share menu
  - Implement `generateShareMessage()` for WhatsApp message formatting
  - Add error handling with typed error enums and user-friendly messages in French
  - _Requirements: 1.1, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 2. Enhance QR Utils Module





  - Add `generateWhatsAppShareMessage()` function to `src/utils/qrUtils.ts`
  - Format message with emojis, bold text (WhatsApp markdown), and clear sections
  - Include guest name, table, companions, and usage instructions
  - Ensure message is professional and warm in tone
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 3. Create QRWhatsAppShareScreen Component





  - Create `src/screens/QRWhatsAppShareScreen.tsx` with TypeScript
  - Set up component state for guests array, currentIndex, loading, and ViewShot ref
  - Implement `useEffect` hook to load guests from database on mount
  - Create `loadGuests()` function using `getAllGuests()` from database module
  - Handle empty state when no guests are available
  - _Requirements: 1.1, 7.1, 7.2, 7.3, 7.4_

- [x] 4. Implement QR Code Display with Capture Capability





  - Wrap QR code component in ViewShot component with ref
  - Configure ViewShot with white background and high quality (0.9)
  - Display QRCode component with 250x250 size for optimal scanning
  - Use guest data with `generateQRData()` for QR content
  - Add guest name label below QR code
  - Style QR container with white background and black code for maximum contrast
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.2, 2.3, 6.1, 6.4_

- [x] 5. Implement Guest Information Display





  - Display current guest's full name as heading
  - Display table name with location icon (📍)
  - Display number of companions with group icon (👥)
  - Apply clear typography hierarchy using theme styles
  - Center-align all guest information
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 6. Implement Navigation Controls





  - Add counter display showing "X / Y" format for current position and total guests
  - Create "Précédent" button that calls `prevGuest()` function
  - Create "Suivant" button that calls `nextGuest()` function
  - Disable "Précédent" button when currentIndex is 0
  - Disable "Suivant" button when currentIndex is guests.length - 1
  - Implement `nextGuest()` to increment currentIndex
  - Implement `prevGuest()` to decrement currentIndex
  - Ensure QR code regenerates within 500ms when guest changes
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Implement Share via WhatsApp Action





  - Create "Partager via WhatsApp" button with WhatsApp icon (📱)
  - Implement `handleShareWhatsApp()` async function
  - Show loading indicator during capture and share operations
  - Call `qrSharingService.captureQRCode()` with ViewShot ref
  - Call `qrSharingService.shareViaWhatsApp()` with captured image URI and guest data
  - Handle success case with confirmation feedback
  - Handle errors with user-friendly Alert messages in French
  - Disable button during operation to prevent double-clicks
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. Implement Save to Gallery Action





  - Create "Sauvegarder dans galerie" button with save icon (💾)
  - Implement `handleSaveToGallery()` async function
  - Show loading indicator during save operation
  - Call `qrSharingService.captureQRCode()` with ViewShot ref
  - Call `qrSharingService.saveToGallery()` with captured image URI and guest data
  - Display success notification with confirmation message
  - Handle permission denied case with helpful guidance message
  - Handle other errors with appropriate error messages
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 9. Implement Alternative Share Action





  - Create "Partager autrement" button with share icon (📤)
  - Implement `handleShareOther()` async function
  - Call `qrSharingService.captureQRCode()` with ViewShot ref
  - Call `qrSharingService.shareViaSystem()` to open native share menu
  - Allow user to choose any sharing method (email, SMS, other apps)
  - Handle errors gracefully
  - _Requirements: 4.5_

- [x] 10. Add Screen to Navigation





  - Open `src/navigation/AppNavigator.tsx`
  - Import `QRWhatsAppShareScreen` component
  - Add new Stack.Screen with name "QRWhatsAppShare"
  - Set appropriate screen title in French
  - Ensure screen is accessible from relevant navigation flows
  - _Requirements: All (enables access to feature)_

- [x] 11. Style the Screen with Theme





  - Apply existing theme colors, spacing, and typography
  - Create StyleSheet with container, header, card, button, and navigation styles
  - Ensure responsive layout that works on different screen sizes
  - Add proper padding and margins using theme.spacing values
  - Use SafeAreaView for proper safe area handling on iOS
  - Apply shadows and border radius from theme for visual polish
  - _Requirements: 6.4_

- [x] 12. Implement Error Handling and Edge Cases





  - Add try-catch blocks around all async operations
  - Display user-friendly error messages in French using Alert.alert
  - Handle case when ViewShot ref is not available
  - Handle case when image capture fails
  - Handle case when permissions are denied
  - Handle case when WhatsApp is not installed (fallback to system share)
  - Handle case when no guests exist (show empty state)
  - Log errors to console for debugging purposes
  - _Requirements: 2.4, 3.5, 4.5, 7.1, 7.2, 7.3_

- [x] 13. Add Loading States and User Feedback






  - Add loading state variable to component state
  - Show loading spinner during async operations (capture, share, save)
  - Disable all buttons during loading to prevent race conditions
  - Show success toast/alert after successful save to gallery
  - Show success feedback after successful share
  - Add subtle animations for state transitions
  - _Requirements: 3.4, 5.5_


- [x] 14. Optimize Performance






  - Implement cleanup for temporary image URIs after sharing
  - Use React.memo for child components if needed
  - Optimize re-renders by using useCallback for event handlers
  - Ensure ViewShot capture is efficient (use captureMode: 'mount')
  - Test with large guest lists (100+ guests) to ensure smooth navigation
  - _Requirements: 5.5_




- [x] 15. Add Integration with Existing Screens






  - Update HomeScreen to add navigation button to QRWhatsAppShareScreen
  - Update GuestListScreen to allow direct navigation to specific guest
  - Pass guest ID as navigation parameter when navigating from guest detail
  - Set currentIndex based on passed guest ID if available
  - Ensure smooth navigation flow throughout the app
  - _Requirements: All (improves user experience)_
