export const ADDRESS_VALIDATION_REQUEST_OPTIONS = {
    AddressValidation: 1,
    AddressClassification: 2,
    AddressValidationAndClassification: 3
};

export const AddressValidationApi = superclass =>
    class extends superclass {
        /**
         * Gets the tracking information for an existing shipment.
         *
         * @param {ADDRESS_VALIDATION_REQUEST_OPTIONS} requestoption Identifies the optional processing to be performed. If not present or invalid value then an error will be sent back.
         * @param {Object} address Address.
         * @param {String} address.consigneeName Name of business, company or person.
         * @param {String} address.attentionName Name of the building.
         * @param {String} address.addressLine Address line 1.
         * @param {String} address.addressLine2 Address line 2.
         * @param {String} address.city City.
         * @param {String} address.postalCode 5-digit postal code.
         * @param {String} address.stateCode State code.
         * @param {String} address.countryCode Country code.
         *
         * @param {Object} options An object of options to configure the request.
         *
         * @returns {Object} The HTTP response object.
         * @see https://www.ups.com/upsdeveloperkit?loc=en_US
         */
        async addressValidation(requestoption, address, options = {}) {
            const {
                consigneeName,
                attentionName,
                addressLine,
                addressLine2,
                city,
                postalCode,
                stateCode,
                countryCode
            } = address;
            const url = `${this.baseUrl}addressvalidation/${this.version}/${requestoption}`;

            const payload = this._buildAddressValidationPayload(
                consigneeName,
                attentionName,
                addressLine,
                addressLine2,
                city,
                postalCode,
                stateCode,
                countryCode
            );

            const response = await this.post(url, {
                ...options,
                dataJ: payload
            });
            return response;
        }

        _buildAddressValidationPayload(
            consigneeName,
            attentionName,
            addressLine,
            addressLine2,
            city,
            postalCode,
            stateCode,
            countryCode
        ) {
            const payload = {
                XAVRequest: {
                    AddressKeyFormat: {
                        ConsigneeName: consigneeName,
                        AttentionName: attentionName,
                        AddressLine: [addressLine, addressLine2],
                        PoliticalDivision2: city,
                        PoliticalDivision1: stateCode,
                        PostcodePrimaryLow: postalCode,
                        CountryCode: countryCode
                    }
                }
            };

            return payload;
        }
    };
