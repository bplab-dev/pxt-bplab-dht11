/**
 * DHT11
 */
//% color=#ff7a4b icon="\uf0ad" block="DHT11" weight=1
namespace dht11 {
    export enum DHT11Type {
        //% block="temperature(℃)" enumval=0
        temperatureC,

        //% block="temperature(℉)" enumval=1
        temperatureF,

        //% block="humidity(0~100%)" enumval=2
        humidity,
    }

    let dht11Humidity = 0
    let dht11Temperature = 0

    /**
     * get dht11 temperature and humidity Value
     * @param pin Analog pin connected to sensor
     * @param valueType Select temperature(℃/℉) value or humidity percentage
     */
    //% blockId="readdht11" block="DHT11 pin %pin %valueType"
    //% tooltip="Reads the temperature or humidity from a DHT11 sensor connected to the specified pin."
    export function dht11value(pin: DigitalPin, valueType: DHT11Type): number {
        const DHT11_TIMEOUT = 100
        const buffer = pins.createBuffer(40)
        const data = [0, 0, 0, 0, 0]
        let startTime = control.micros()

        if (control.hardwareVersion().slice(0, 1) !== '1') { // V2
            // V2 bug
            pins.digitalReadPin(DigitalPin.P0);
            pins.digitalReadPin(DigitalPin.P1);
            pins.digitalReadPin(DigitalPin.P2);
            pins.digitalReadPin(DigitalPin.P3);
            pins.digitalReadPin(DigitalPin.P4);
            pins.digitalReadPin(DigitalPin.P10);

            // 1.start signal
            pins.digitalWritePin(pin, 0)
            basic.pause(18)

            // 2.pull up and wait 40us
            pins.setPull(pin, PinPullMode.PullUp)
            pins.digitalReadPin(pin)
            control.waitMicros(40)

            // 3.read data
            startTime = control.micros()
            while (pins.digitalReadPin(pin) === 0) {
                if (control.micros() - startTime > DHT11_TIMEOUT) break
            }
            startTime = control.micros()
            while (pins.digitalReadPin(pin) === 1) {
                if (control.micros() - startTime > DHT11_TIMEOUT) break
            }

            for (let dataBits = 0; dataBits < 40; dataBits++) {
                startTime = control.micros()
                while (pins.digitalReadPin(pin) === 1) {
                    if (control.micros() - startTime > DHT11_TIMEOUT) break
                }
                startTime = control.micros()
                while (pins.digitalReadPin(pin) === 0) {
                    if (control.micros() - startTime > DHT11_TIMEOUT) break
                }
                control.waitMicros(28)
                if (pins.digitalReadPin(pin) === 1) {
                    buffer[dataBits] = 1
                }
            }
        } else { // V1
            // 1.start signal
            pins.digitalWritePin(pin, 0)
            basic.pause(18)

            // 2.pull up and wait 40us
            pins.setPull(pin, PinPullMode.PullUp)
            pins.digitalReadPin(pin)
            control.waitMicros(40)

            // 3.read data
            if (pins.digitalReadPin(pin) === 0) {
                while (pins.digitalReadPin(pin) === 0);
                while (pins.digitalReadPin(pin) === 1);

                for (let dataBits = 0; dataBits < 40; dataBits++) {
                    while (pins.digitalReadPin(pin) === 1);
                    while (pins.digitalReadPin(pin) === 0);
                    control.waitMicros(28)
                    if (pins.digitalReadPin(pin) === 1) {
                        buffer[dataBits] = 1
                    }
                }
            }
        }

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 8; j++) {
                if (buffer[8 * i + j] === 1) {
                    data[i] += 2 ** (7 - j)
                }
            }
        }

        if (((data[0] + data[1] + data[2] + data[3]) & 0xff) === data[4]) {
            dht11Humidity = data[0] + data[1] * 0.1
            dht11Temperature = data[2] + data[3] * 0.1
        }

        switch (valueType) {
            case DHT11Type.temperatureC:
                return dht11Temperature
            case DHT11Type.temperatureF:
                return (dht11Temperature * 1.8) + 32
            case DHT11Type.humidity:
                return dht11Humidity
        }
    }
}
