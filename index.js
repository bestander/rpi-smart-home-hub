var noble = require('noble');

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning();
    } else {
        noble.stopScanning();
    }
});

var BlunoServiceUUID = 'dfb0';
var BlunoServiceSerialCharacteristicUUID = 'dfb1';

noble.on('discover', function(peripheral) {
    if(peripheral.advertisement.localName && peripheral.advertisement.localName.indexOf('Bluno') !== -1) {
        peripheral.connect(function(error) {
            if(error) {
                console.log("error connecting", error)
            }
        });
        peripheral.on('connect', function () {
            console.log("connected to ", peripheral.advertisement.localName);

            peripheral.discoverServices([BlunoServiceUUID], function(err, services) {
                services[0].discoverCharacteristics([BlunoServiceSerialCharacteristicUUID], function(error, characteristics) {
                    var serialCharacteristic = characteristics[0];
                    console.log("sending to serialCharacteristic " + serialCharacteristic.uuid);
                    serialCharacteristic.write(new Buffer([1]), true);
                    serialCharacteristic.on('data', function(data, isNotification){
                        console.log("Data from " + serialCharacteristic.uuid + ": " + data + ": length: " + data.length, data);
                    });
                })
            });
        });
    }
});
