'use strict';

const axios = require('axios').default;

module.exports = class GeniusHubClient {

    constructor(token) {
        this._wholeHouseZoneId = 0;
        this.client =  axios.create({
            baseURL: "https://my.geniushub.co.uk/v1",
            timeout: 10000,
            headers: 
                {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            });
    }

    async _getWholeHouseZoneId() {
        if (!this._wholeHouseZoneId) {
            let wholeHouseZones = await this.getZones("manager");
            if (!wholeHouseZones){
                throw "Could not find the WholeHouse zone";
            }

            this._wholeHouseZoneId = wholeHouseZones[0].id;
        }

        return this._wholeHouseZoneId;
    }

    async _callGeniusHub(url, method, data) {
        let options = {
            url: url,
            method: method,
            data: data
        }

        try {
            let response = await this.client.request(options);
            return response.data;
        }
        catch(e) {
            if (e.response) {
                if (e.response.status == 401) throw "The token is not valid.";
            }
            throw e;
        }
    }

    async getZones(type) {
        let zones = await this._callGeniusHub("zones");
        
        if (type) {
            zones = zones.filter(z => z.type === type);
        }

        return zones;
    }

    async getZonesSummary(type) {
        let zones = await this._callGeniusHub("zones/summary");

        if (type) {
            zones = zones.filter(z => z.type === type);
        }

        return zones;
    }

    async override(zoneId, setpoint, duration) {
        await this._callGeniusHub(`zones/${zoneId}/override`, "post", 
            {
                setpoint: setpoint,
                duration: duration
            });
    }

    async changeOverride(zoneId, setpoint, duration) {
        await this._callGeniusHub(`zones/${zoneId}/override`, "patch", 
            {
                setpoint: setpoint,
                duration: duration
            });
    }

    async setMode(zoneId, mode) {
        //mode = off, timer, footprint, override
        await this._callGeniusHub(`zones/${zoneId}/mode`, "put", `"${mode}"`); 
    }

    async getZone(zoneId) {
        let zone = await this._callGeniusHub(`zones/${zoneId}`, "get");
        return zone;
    }

    async getZoneSetpoint(zoneId) {
        let zone = await this._callGeniusHub(`zones/${zoneId}/setpoint`, "get");
        return zone;
    }

    async getWholeHouseTemperature() {
        let zoneId = await this._getWholeHouseZoneId();
        let temperature = await this._callGeniusHub(`zones/${zoneId}/temperature`, "get");
        return temperature;
    }

    async getZoneTemperature(zoneId) {
        let zone = await this._callGeniusHub(`zones/${zoneId}/temperature`, "get");
        return zone;
    }

    async getZoneOverride(zoneId) {
        let zone = await this._callGeniusHub(`zones/${zoneId}/override`, "get");
        return zone;
    }

    async getZoneMode(zoneId) {
        let zone = await this._callGeniusHub(`zones/${zoneId}/mode`, "get");
        return zone;
    }

    async getZoneOccupied(zoneId) {
        let zone = await this._callGeniusHub(`zones/${zoneId}/occupied`, "get");
        return zone;
    }

    async getZoneTimerSchedule(zoneId) {
        let zone = await this._callGeniusHub(`zones/${zoneId}/schedule/timer/weekly`, "get");
        return zone;
    }

    async getZoneFootprintSchedule(zoneId) {
        let zone = await this._callGeniusHub(`zones/${zoneId}/schedule/footprint/weekly`, "get");
        return zone;
    }
}