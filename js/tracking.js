/**
 * Shipment was picked up.
 */
export const STATUS_PICKUP = "P";
/**
 * Shipment out for delivery.
 */
export const STATUS_OUT_FOR_DELIVERY = "O";
/**
 * Shipment in transit.
 */
export const STATUS_IN_TRANSIT = "I";
/**
 * Shipment exception.
 */
export const STATUS_EXCEPTION = "X";
/**
 * Shipment delivered.
 */
export const STATUS_DELIVERED = "D";
/**
 * Shipment returned to shipper.
 */
export const STATUS_RETURNED = "RS";
export const TrackingAPI = superclass => class extends superclass {
    /**
     * Gets the tracking information for an existing shipment.
     *
     * @param {String} trackingNumber The tracking number of the shipment/waybill.
     * @param {Object} options An object of options to configure the request.
     * @returns {Object} The HTTP response object.
     * @see https://www.ups.com/upsdeveloperkit?loc=en_US
     */
    async getTrackingDetails(trackingNumber, options = {}) {
        const url = `${this.baseUrl}track/${this.version}/details/${trackingNumber}`;
        const response = await this.get(url, options);
        return response;
    }
    /**
     * Gets the tracking URL given a tracking number.
     *
     * @param {String} trackingNumber The tracking number of the shipment/waybill.
     * @returns {String} The tracking URL.
     * @see https://www.ups.com/upsdeveloperkit?loc=en_US
     */
    getTrackingUrl(trackingNumber) {
        return `https://www.ups.com/track?InquiryNumber1=${trackingNumber}`;
    }
};
