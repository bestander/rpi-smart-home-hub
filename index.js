var noble = require('noble');

var BlunoServiceUUID = 'dfb0';
var BlunoServiceSerialCharacteristicUUID = 'dfb1';

noble.on('discover', function(peripheral) {
    if(peripheral.advertisement.localName && peripheral.advertisement.localName.indexOf('Bluno') !== -1) {
        console.log("discovered Bluno");
        noble.stopScanning();
        peripheral.connect(function(error) {
            if(error) {
                console.error("error connecting", error);
                return;
            }
            console.log("connected to ", peripheral.advertisement.localName);
            peripheral.discoverSomeServicesAndCharacteristics([BlunoServiceUUID], [BlunoServiceSerialCharacteristicUUID], function(err, services, characteristics) {
                var serialCharacteristic = characteristics[0];
                //                console.log("sending to serialCharacteristic " + serialCharacteristic.uuid);
                //                serialCharacteristic.write(new Buffer([1]), true);
                console.log("waiting for data from Bluno");
                serialCharacteristic.on('data', function(data, isNotification) {
                    // TODO how about parsing incomplete message
                    /**
                     * Message format:
                     * 5 bytes
                     * 1 - beginning of the message 0xFF
                     * 2 - isRaining: 1 raining / 0 not raining
                     * 3 - buzzerMode: 1 singing / 0 not singing
                     * 4,5 - sensorReading [low, high]
                     */
                    if(data.length === 5 && data[0] === 0xFF) {
                        var isRaining = data[1];
                        var buzzerMode = data[2];
                        var reading = data[3] + (data[4] << 8);
                        console.log("got reading:", isRaining, buzzerMode, reading);
                        peripheral.disconnect(function(){
                            console.log("disconnected from Bluno");
                            setTimeout(function(){
                                noble.startScanning()
                            }, 2000);
                        });

                    } else {
                        console.error("Could not parse data from sensor", data)
                    }
                });

            });

        });
    }
});

noble.startScanning();