import { API as BaseAPI, OperationalError, mix, load, conf } from "yonius";
import { LocatorAPI } from "./locator";
import { PaperlessAPI } from "./paperless";
import { PickupAPI } from "./pickup";
import { ShipmentAPI } from "./shipment";
import { TrackingAPI } from "./tracking";
import { AddressValidationApi } from "./addressValidation";
import { RatingApi } from "./rating";
/**
 * The base auth URL used for the OAuth token request.
 */
const AUTH_URL = "https://onlinetools.ups.com/";
const TEST_AUTH_URL = "https://wwwcie.ups.com/";
/**
 * The base URL used for API requests.
 */
const BASE_URL = "https://onlinetools.ups.com/api/";
const TEST_BASE_URL = "https://wwwcie.ups.com/api/";
/**
 * The version of the API to use.
 */
const API_VERSION = "v1";
/**
 * The application grant type to obtain the token.
 */
const GRANT_TYPE = "client_credentials";
/**
 * The environment
 */
const PRODUCTION_ENVIRONMENT = "production";
export class API extends mix(BaseAPI).with(LocatorAPI, PaperlessAPI, PickupAPI, ShipmentAPI, TrackingAPI, AddressValidationApi, RatingApi) {
    constructor(kwargs = {}) {
        super(kwargs);
        const environment = kwargs.environment === undefined ? PRODUCTION_ENVIRONMENT : kwargs.environment;
        this.environment = conf("UPS_ENVIRONMENT", environment);
        this.authUrl = conf("UPS_AUTH_URL", environment === PRODUCTION_ENVIRONMENT ? AUTH_URL : TEST_AUTH_URL);
        this.baseUrl = conf("UPS_BASE_URL", environment === PRODUCTION_ENVIRONMENT ? BASE_URL : TEST_BASE_URL);
        this.version = conf("UPS_API_VERSION", API_VERSION);
        this.clientId = conf("UPS_CLIENT_ID", null);
        this.clientSecret = conf("UPS_CLIENT_SECRET", null);
        this.grantType = conf("UPS_GRANT_TYPE", GRANT_TYPE);
        this.token = conf("UPS_TOKEN", null);
        this.transactionSrc = conf("UPS_TRANSACTION_SRC", null);
        this.authUrl = kwargs.authUrl === undefined ? this.authUrl : kwargs.authUrl;
        this.baseUrl = kwargs.baseUrl === undefined ? this.baseUrl : kwargs.baseUrl;
        this.version = kwargs.version === undefined ? this.version : kwargs.version;
        this.clientId = kwargs.clientId === undefined ? this.clientId : kwargs.clientId;
        this.clientSecret =
            kwargs.clientSecret === undefined ? this.clientSecret : kwargs.clientSecret;
        this.token = kwargs.token === undefined ? this.token : kwargs.token;
        this.transactionSrc =
            kwargs.transactionSrc === undefined ? this.transactionSrc : kwargs.transactionSrc;
    }
    static async load() {
        await load();
    }
    async build(method, url, options = {}) {
        await super.build(method, url, options);
        if (this.token)
            options.headers.Authorization = this._bearerAuth();
        const transactionSrc = options.headers.transactionSrc || this.transactionSrc;
        if (transactionSrc)
            options.headers.transactionSrc = transactionSrc;
    }
    async authCallback(params, headers) {
        // forces the refetch of the authorization
        // token from the auth API
        this.token = null;
        await this.getToken();
    }
    async getToken() {
        if (this.token)
            return this.token;
        const url = `${this.authUrl}security/${this.version}/oauth/token`;
        const data = `grant_type=${this.grantType}`;
        const options = {
            headers: {
                Authorization: this._basicAuth()
            },
            data: data,
            mime: "application/x-www-form-urlencoded"
        };
        const contents = await this.post(url, options);
        this.token = contents.access_token;
        return this.token;
    }
    async _handleResponse(response, errorMessage = "Problem in request") {
        const result = await this._getResult(response);
        if (!response.ok) {
            let error = null;
            try {
                error = JSON.stringify(result);
            }
            catch {
                error = errorMessage;
            }
            throw new OperationalError(error, response.status || 500);
        }
        return result;
    }
    /**
     * Obtains the response object from the provided response making sure that the
     * content type is respected when doing so.
     *
     * @param {Response} response The HTTP response resulting from the request
     * made by the API client
     * @returns {Object|String|Blob} The parsed result value for the provided
     * response object taking into account the content type of it.
     */
    async _getResult(response) {
        let result = null;
        if (response.headers.get("content-type") &&
            response.headers.get("content-type").toLowerCase().startsWith("application/json")) {
            result = await response.json();
        }
        else if (response.headers.get("content-type") &&
            response.headers.get("content-type").toLowerCase().startsWith("text/")) {
            result = await response.text();
        }
        else {
            result = await response.blob();
        }
        return result;
    }
    _basicAuth() {
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
        return `Basic ${auth}`;
    }
    _bearerAuth() {
        return `Bearer ${this.token}`;
    }
}
