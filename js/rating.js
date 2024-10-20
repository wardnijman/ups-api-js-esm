export const RATES_REQUEST_OPTIONS = {
    Rate: "rate",
    Shop: "shop",
    RateTimeInTransit: "ratetimeintransit",
    ShopTimeInTransit: "shoptimeintransit"
};
const NEGOTIATED_RATING_OPTIONS = {
    TPFCNegotiatedRatesIndicator: "Y",
    NegotiatedRatesIndicator: "Y"
};
export const RatingApi = superclass => class extends superclass {
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
                    ShipmentRatingOptions: negotiatedRates
                        ? NEGOTIATED_RATING_OPTIONS
                        : undefined
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
            AddressLine: [address.line1, address.line2],
            City: address.city,
            StateProvinceCode: address.stateOrProvinceCode,
            PostalCode: address.postalCode,
            CountryCode: address.countryCode,
            ResidentialAddressIndicator: address.residential ? "" : undefined
        };
    }
};
