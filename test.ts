/**
 * DHT11 Sensor Tests
 *
 * Test Methods:
 * 1. Basic functionality test in simulator
 * 2. Value range test on actual hardware
 *
 * Expected Results:
 * - Temperature(℃): Values within 0~50℃ range
 * - Temperature(℉): Values within 32~122℉ range
 * - Humidity: Values within 20~90% range
 *
 * Pass Criteria:
 * 1. Runs without errors in simulator
 * 2. All values are within valid ranges
 * 3. Works on both hardware versions (V1/V2)
 */

// Tests for simulator
namespace dht11test {
  // DHT11 pin configuration
  const DHT11_PIN = DigitalPin.P0;

  // Validate temperature range (Celsius)
  function testTemperatureC(): boolean {
      const temp = dht11.dht11value(DHT11_PIN, dht11.DHT11Type.temperatureC);
      return temp >= 0 && temp <= 50;
  }

  // Validate temperature range (Fahrenheit)
  function testTemperatureF(): boolean {
      const temp = dht11.dht11value(DHT11_PIN, dht11.DHT11Type.temperatureF);
      return temp >= 32 && temp <= 122;
  }

  // Validate humidity range
  function testHumidity(): boolean {
      const humidity = dht11.dht11value(DHT11_PIN, dht11.DHT11Type.humidity);
      return humidity >= 20 && humidity <= 90;
  }

  // Test continuous reading stability
  function testContinuousReading(): boolean {
      for (let i = 0; i < 5; i++) {
          if (!testTemperatureC() || !testHumidity()) {
              return false;
          }
          basic.pause(1000);
      }
      return true;
  }

  // Execute main test suite
  export function runTests(): void {
      // Display test start indicator
      basic.showIcon(IconNames.Heart);
      basic.pause(1000);

      let allTestsPassed = true;

      // Run individual tests
      if (!testTemperatureC()) {
          basic.showString("TC");  // Temperature Celsius test failed
          allTestsPassed = false;
      }
      if (!testTemperatureF()) {
          basic.showString("TF");  // Temperature Fahrenheit test failed
          allTestsPassed = false;
      }
      if (!testHumidity()) {
          basic.showString("H");   // Humidity test failed
          allTestsPassed = false;
      }
      if (!testContinuousReading()) {
          basic.showString("CR");  // Continuous Reading test failed
          allTestsPassed = false;
      }

      // Show final test results
      if (allTestsPassed) {
          basic.showIcon(IconNames.Yes);
      } else {
          basic.showIcon(IconNames.No);
      }
  }
}

// Run tests in simulator
dht11test.runTests();

// Display real-time temperature and humidity on LED matrix
basic.forever(function() {
    // Show temperature(℃)
    basic.showNumber(dht11.dht11value(DigitalPin.P0, dht11.DHT11Type.temperatureC));
    basic.pause(1000);
    // Show humidity
    basic.showNumber(dht11.dht11value(DigitalPin.P0, dht11.DHT11Type.humidity));
    basic.pause(1000);
});