// Mobile Performance Testing Script
// Usage: Run in browser console on mobile device or emulator

class MobilePerformanceTester {
  constructor() {
    this.results = {
      touchTargets: [],
      responsiveBreakpoints: [],
      performance: {},
      accessibility: [],
      gestures: [],
    };
  }

  // Test touch target sizes (minimum 44px x 44px for iOS)
  testTouchTargets() {
    console.log("🔍 Testing Touch Targets...");

    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [aria-expanded]',
    );

    interactiveElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const isValid = rect.width >= 44 && rect.height >= 44;

      this.results.touchTargets.push({
        element: element.tagName.toLowerCase(),
        id: element.id || `element-${index}`,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        isValid,
        text: element.textContent?.substring(0, 30) || "No text",
      });

      if (!isValid) {
        console.warn(`❌ Touch target too small:`, element);
        element.style.border = "2px solid red";
      } else {
        console.log(
          `✅ Touch target valid:`,
          element.textContent?.substring(0, 20),
        );
      }
    });

    return this.results.touchTargets;
  }

  // Test responsive breakpoints
  testResponsiveBreakpoints() {
    console.log("📱 Testing Responsive Breakpoints...");

    const breakpoints = {
      mobile: 640,
      tablet: 1024,
      desktop: 1280,
    };

    Object.entries(breakpoints).forEach(([name, width]) => {
      // Simulate viewport width
      const mediaQuery = window.matchMedia(`(max-width: ${width}px)`);

      this.results.responsiveBreakpoints.push({
        name,
        width,
        matches: mediaQuery.matches,
        current: window.innerWidth,
      });

      console.log(
        `📏 ${name} (${width}px): ${mediaQuery.matches ? "✅" : "❌"}`,
      );
    });

    return this.results.responsiveBreakpoints;
  }

  // Test scroll performance
  testScrollPerformance() {
    console.log("⚡ Testing Scroll Performance...");

    const startTime = performance.now();
    let frameCount = 0;
    let totalScrollTime = 0;

    const measureFrame = () => {
      frameCount++;
      if (frameCount < 60) {
        requestAnimationFrame(measureFrame);
      } else {
        const endTime = performance.now();
        totalScrollTime = endTime - startTime;

        this.results.performance.scrollTest = {
          totalTime: Math.round(totalScrollTime),
          averageFPS: Math.round(60000 / totalScrollTime),
          frameCount,
          isSmooth: totalScrollTime < 1000, // Should complete in under 1 second
        };

        console.log(
          `🎯 Scroll Performance:`,
          this.results.performance.scrollTest,
        );
      }
    };

    // Start scroll test
    window.scrollTo({ top: 100, behavior: "smooth" });
    requestAnimationFrame(measureFrame);

    return this.results.performance;
  }

  // Test gesture recognition
  testGestureSupport() {
    console.log("👆 Testing Gesture Support...");

    const gestureTests = [
      "touchstart",
      "touchmove",
      "touchend",
      "gesturestart",
      "gesturechange",
      "gestureend",
    ];

    gestureTests.forEach((eventType) => {
      const isSupported =
        "on" + eventType in window || eventType in document.documentElement;

      this.results.gestures.push({
        event: eventType,
        supported: isSupported,
      });

      console.log(`${eventType}: ${isSupported ? "✅" : "❌"}`);
    });

    return this.results.gestures;
  }

  // Test accessibility features
  testAccessibility() {
    console.log("♿ Testing Accessibility...");

    const tests = [
      {
        name: "Focus visible styles",
        test: () => {
          const focusableElements = document.querySelectorAll(
            "button, a, input, select, textarea, [tabindex]",
          );
          let hasVisibleFocus = 0;

          focusableElements.forEach((element) => {
            const styles = getComputedStyle(element, ":focus-visible");
            if (styles.outline !== "none" || styles.boxShadow !== "none") {
              hasVisibleFocus++;
            }
          });

          return hasVisibleFocus > 0;
        },
      },
      {
        name: "Alt text on images",
        test: () => {
          const images = document.querySelectorAll("img");
          let hasAltText = 0;

          images.forEach((img) => {
            if (img.alt && img.alt.trim() !== "") {
              hasAltText++;
            }
          });

          return images.length === 0 || hasAltText / images.length > 0.8;
        },
      },
      {
        name: "ARIA labels",
        test: () => {
          const interactiveElements = document.querySelectorAll(
            "button, a, input, select",
          );
          let hasLabels = 0;

          interactiveElements.forEach((element) => {
            if (
              element.getAttribute("aria-label") ||
              element.getAttribute("aria-labelledby") ||
              element.textContent?.trim()
            ) {
              hasLabels++;
            }
          });

          return hasLabels / interactiveElements.length > 0.9;
        },
      },
    ];

    tests.forEach(({ name, test }) => {
      const passed = test();
      this.results.accessibility.push({ name, passed });
      console.log(`${name}: ${passed ? "✅" : "❌"}`);
    });

    return this.results.accessibility;
  }

  // Run all tests
  runAllTests() {
    console.log("🚀 Starting Mobile Performance Tests...");
    console.log(`Device: ${navigator.userAgent}`);
    console.log(`Viewport: ${window.innerWidth}x${window.innerHeight}`);

    this.testTouchTargets();
    this.testResponsiveBreakpoints();
    this.testScrollPerformance();
    this.testGestureSupport();
    this.testAccessibility();

    // Generate report
    setTimeout(() => {
      this.generateReport();
    }, 2000);

    return this.results;
  }

  // Generate comprehensive report
  generateReport() {
    console.log("📊 Mobile Optimization Report:");
    console.log("=".repeat(50));

    const touchIssues = this.results.touchTargets.filter((t) => !t.isValid);
    console.log(
      `Touch Targets: ${touchIssues.length > 0 ? "❌" : "✅"} (${touchIssues.length} issues)`,
    );

    const responsiveWorks = this.results.responsiveBreakpoints.some(
      (b) => b.matches,
    );
    console.log(`Responsive Design: ${responsiveWorks ? "✅" : "❌"}`);

    const scrollSmooth = this.results.performance.scrollTest?.isSmooth;
    console.log(`Scroll Performance: ${scrollSmooth ? "✅" : "❌"}`);

    const gesturesWork =
      this.results.gestures.filter((g) => g.supported).length > 3;
    console.log(`Gesture Support: ${gesturesWork ? "✅" : "❌"}`);

    const accessibilityPassed = this.results.accessibility.filter(
      (a) => a.passed,
    ).length;
    console.log(
      `Accessibility: ${accessibilityPassed >= 2 ? "✅" : "❌"} (${accessibilityPassed}/3 tests passed)`,
    );

    console.log("=".repeat(50));

    // Return grade
    const totalTests = 5;
    const passedTests = [
      touchIssues.length === 0,
      responsiveWorks,
      scrollSmooth,
      gesturesWork,
      accessibilityPassed >= 2,
    ].filter(Boolean).length;

    const grade = Math.round((passedTests / totalTests) * 100);
    console.log(`Overall Mobile Score: ${grade}%`);

    if (grade >= 90) {
      console.log("🏆 Excellent mobile optimization!");
    } else if (grade >= 70) {
      console.log("👍 Good mobile optimization, minor improvements needed.");
    } else {
      console.log("⚠️ Mobile optimization needs work.");
    }

    return { grade, passedTests, totalTests, details: this.results };
  }
}

// Auto-run if in browser environment
if (typeof window !== "undefined") {
  // Make available globally for manual testing
  window.MobilePerformanceTester = MobilePerformanceTester;

  console.log("📱 Mobile Performance Tester loaded!");
  console.log(
    "Usage: const tester = new MobilePerformanceTester(); tester.runAllTests();",
  );
}

// Export for Node.js environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = MobilePerformanceTester;
}
