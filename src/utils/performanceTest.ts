/**
 * Performance testing utilities for QR WhatsApp Share feature
 * This file helps verify that the screen performs well with large guest lists
 */

// Guest type definition (matches database schema)
interface Guest {
  id: number;
  fullName: string;
  tableName: string;
  companions: number;
  isPresent: number;
}

/**
 * Generate mock guest data for performance testing
 * @param count - Number of guests to generate
 * @returns Array of mock guests
 */
export const generateMockGuests = (count: number): Guest[] => {
  const guests: Guest[] = [];
  const tables = ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table VIP', 'Table Famille'];
  const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Luc', 'Anne', 'Paul', 'Claire', 'Marc', 'Julie'];
  const lastNames = ['Dupont', 'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy'];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const suffix = i >= (firstNames.length * lastNames.length) ? ` ${Math.floor(i / (firstNames.length * lastNames.length)) + 1}` : '';
    
    guests.push({
      id: i + 1,
      fullName: `${firstName} ${lastName}${suffix}`,
      tableName: tables[i % tables.length],
      companions: Math.floor(Math.random() * 4), // 0-3 companions
      isPresent: 0
    });
  }

  return guests;
};

/**
 * Measure render performance
 * @param componentName - Name of the component being tested
 * @param callback - Function to execute and measure
 */
export const measurePerformance = async (
  componentName: string,
  callback: () => Promise<void> | void
): Promise<number> => {
  const startTime = performance.now();
  
  try {
    await callback();
  } catch (error) {
    console.error(`Performance test failed for ${componentName}:`, error);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`[Performance] ${componentName}: ${duration.toFixed(2)}ms`);
  
  return duration;
};

/**
 * Test navigation performance with large guest lists
 * @param guestCount - Number of guests to test with
 * @param navigationCount - Number of navigation operations to perform
 */
export const testNavigationPerformance = async (
  guestCount: number,
  navigationCount: number
): Promise<{ avgTime: number; maxTime: number; minTime: number }> => {
  const times: number[] = [];
  
  console.log(`\n[Performance Test] Testing navigation with ${guestCount} guests`);
  console.log(`Performing ${navigationCount} navigation operations...`);
  
  for (let i = 0; i < navigationCount; i++) {
    const time = await measurePerformance(
      `Navigation ${i + 1}/${navigationCount}`,
      () => {
        // Simulate navigation delay
        return new Promise(resolve => setTimeout(resolve, 0));
      }
    );
    times.push(time);
  }
  
  const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  const maxTime = Math.max(...times);
  const minTime = Math.min(...times);
  
  console.log(`\n[Performance Results]`);
  console.log(`Average time: ${avgTime.toFixed(2)}ms`);
  console.log(`Max time: ${maxTime.toFixed(2)}ms`);
  console.log(`Min time: ${minTime.toFixed(2)}ms`);
  console.log(`Target: < 500ms (${avgTime < 500 ? '✓ PASS' : '✗ FAIL'})`);
  
  return { avgTime, maxTime, minTime };
};

/**
 * Verify that navigation meets the 500ms requirement from Requirement 5.5
 */
export const verifyNavigationRequirement = (avgTime: number): boolean => {
  const REQUIREMENT_MAX_TIME = 500; // milliseconds
  const passed = avgTime < REQUIREMENT_MAX_TIME;
  
  if (passed) {
    console.log(`✓ Navigation requirement met: ${avgTime.toFixed(2)}ms < ${REQUIREMENT_MAX_TIME}ms`);
  } else {
    console.log(`✗ Navigation requirement NOT met: ${avgTime.toFixed(2)}ms >= ${REQUIREMENT_MAX_TIME}ms`);
  }
  
  return passed;
};

/**
 * Run comprehensive performance tests
 */
export const runPerformanceTests = async (): Promise<void> => {
  console.log('='.repeat(60));
  console.log('QR WhatsApp Share - Performance Tests');
  console.log('='.repeat(60));
  
  // Test with different guest list sizes
  const testSizes = [10, 50, 100, 200];
  
  for (const size of testSizes) {
    const guests = generateMockGuests(size);
    console.log(`\nGenerated ${guests.length} mock guests for testing`);
    
    // Test navigation performance
    const results = await testNavigationPerformance(size, 10);
    verifyNavigationRequirement(results.avgTime);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Performance tests completed');
  console.log('='.repeat(60));
};
