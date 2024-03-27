export const PACKAGE_TYPES = {
    Unknown: {
        Code: "00",
        Description: "Unknown"
    },
    UPSLetter: {
        Code: "01",
        Description: "UPS Letter"
    },
    Package: {
        Code: "02",
        Description: "Package"
    },
    Tube: {
        Code: "03",
        Description: "Tube"
    },
    Pak: {
        Code: "04",
        Description: "Pak"
    },
    ExpressBox: {
        Code: "21",
        Description: "Express Box"
    },
    KG25Box: {
        Code: "24",
        Description: "25KG Box"
    },
    KG10Box: {
        Code: "25",
        Description: "10KG Box"
    },
    Pallet: {
        Code: "30",
        Description: "Pallet"
    },
    SmallExpressBox: {
        Code: "2a",
        Description: "Small Express Box"
    },
    MediumExpressBox: {
        Code: "2b",
        Description: "Medium Express Box"
    },
    LargeExpressBox: {
        Code: "2c",
        Description: "Large Express Box"
    }
};

export const DIMENSIONS_UNIT_OF_MEASUREMENTS = {
    Inches: {
        Code: "IN",
        Description: "Inches"
    },
    Centimeters: {
        Code: "CM",
        Description: "Centimeters"
    }
};

export const PACKAGE_WEIGHT_UNIT_OF_MEASUREMENTS = {
    Pounds: {
        Code: "LBS",
        Description: "Pounds"
    },
    Kilograms: {
        Code: "KGS",
        Description: "Kilograms"
    },
    Ounces: {
        Code: "OZS",
        Description: "Ounces"
    }
};

export const RATES_REQUEST_OPTIONS = {
    Rate: "rate",
    Shop: "shop",
    RateTimeInTransit: "ratetimeintransit",
    ShopTimeInTransit: "shoptimeintransit"
};

export const PICKUP_TYPES = {
    DailyPickup: {
        Code: "01",
        Description: "Daily Pickup"
    },
    CustomerCounter: {
        Code: "03",
        Description: "Customer Counter"
    }
};

export const CUSTOMER_CLASSIFICATION = {
    RatesAssociatedWithShipperNumber: {
        Code: "00",
        Description: "Rates Associated with Shipper Number"
    }
};

export const RATES_SERVICES = {
    Ground: {
        Code: "03",
        Description: "Ground"
    },
    WorldwideExpedited: {
        Code: "08",
        Description: "Worldwide Expedited"
    }
};

const NEGOTIATED_RATING_OPTIONS = {
    TPFCNegotiatedRatesIndicator: "Y",
    NegotiatedRatesIndicator: "Y"
};

export const RatingApi = superclass =>
    class extends superclass {
        /**
         * Gets the tracking information for an existing shipment.
         *
         * @param {RATES_REQUEST_OPTIONS} requestoption
         *
         * @param {Object} payload The payload object according to the UPS API standards
         * @param {Object} options An object of options to configure the request.
         * @returns {Object} The HTTP response object.
         * @see https://www.ups.com/upsdeveloperkit?loc=en_US
         */
        async rates(requestoption, payload, options = {}) {
            const url = `${this.baseUrl}rating/${this.version}/${requestoption}`;

            const _payload = this._buildRatesPayload(payload);

            const response = await this.post(url, {
                ...options,
                dataJ: _payload
            });
            return response;
        }

        _buildRatesPayload(payload) {
            const { shipper, shipTo, negotiatedRates, pickupType, service, customerClassification, shipFrom, packageData } = payload;

            const _payload = {
                RateRequest: {
                    PickupType: pickupType,
                    CustomerClassification: customerClassification,
                    Shipment: {
                        Service: service,
                        Shipper: {
                            ...this._buildShipPayload(shipper),
                            ShipperNumber: shipper.number
                        },
                        ShipTo: this._buildShipPayload(shipTo),
                        ShipFrom: this._buildShipPayload(shipFrom),
                        Package: this._buildPackagePayload(packageData),
                        ShipmentRatingOptions: negotiatedRates ? NEGOTIATED_RATING_OPTIONS : undefined
                    }
                }
            };

            return _payload;
        }

        _buildPackagePayload(packageData) {
            const { packagingType, dimensions, packageWeight } = packageData;
            return {
                PackagingType: packagingType,
                Dimensions: {
                    UnitOfMeasurement: dimensions.unitOfMeasurement,
                    Length: dimensions.length.toString(),
                    Width: dimensions.width.toString(),
                    Height: dimensions.height.toString()
                },
                PackageWeight: {
                    UnitOfMeasurement: packageWeight.unitOfMeasurement,
                    Weight: packageWeight.weight.toString()
                }
            };
        }

        _buildShipPayload(ship) {
            if (!ship) {
                return undefined;
            }
            return {
                Name: ship.name,
                AttentionName: ship.attentionName,
                Address: this._buildAddressPayload(ship.address)
            };
        }

        _buildAddressPayload(address) {
            return {
                AddressLine: [
                    address.line1,
                    address.line2
                ],
                City: address.city,
                StateProvinceCode: address.stateOrProvinceCode,
                PostalCode: address.postalCode,
                CountryCode: address.countryCode,
                ResidentialAddressIndicator: address.residential
            };
        }
    };
