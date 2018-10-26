import React, { Component } from 'react';
import './App.css';
import {Map} from 'google-maps-react';
import escapeRegExp from 'escape-string-regexp';
import axios from 'axios';
import PlacesList from './PlacesList';

class App extends Component {

    constructor (props){
        super(props);
        this.state = {
            locations: [],
            query: '',
            activeMarker: '',
            map: [],
            markers: [],
            markerInfo: [],
            error: false,
            markerList: [],
            tilesLoaded: false
        }
        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.closeMarker = this.closeMarker.bind(this);
        this.fetchMarkerWiki = this.fetchMarkerWiki.bind(this);
        this.setDefaultState = this.setDefaultState.bind(this);
        this.scriptError = this.scriptError.bind(this);
        window.tilesLoaded = this.tilesLoaded.bind(this);
        this.setActiveMarker = this.setActiveMarker.bind(this);
    }

    // This gets our default locations that we load on the map initially
    getDefaultLocations() {

        return new Promise( (resolve, reject ) => {
            let locations = [
                {title: 'Kentucky Derby Museum', location: {lat: 38.205462, lng: -85.77107}},
                {title: 'Louisville Mega Cavern', location: {lat: 38.201878, lng: -85.704052}},
                {title: 'Angel\'s Envy Distillery', location: {lat: 38.255001, lng: -85.743401}},
                {title: 'The Big Four Bridge', location: {lat: 38.265275, lng: -85.738867}},
                {title: 'Frazier History Museum', location: {lat: 38.257754, lng: -85.764511}}
            ];

            locations.length > 0 ? resolve(locations) : reject('Error');
        })

    }

    fetchMarkerWiki(markerTitle) {
        if(markerTitle) {
            var urlTitle = markerTitle.replace(' ', '_');
            var self = this;
            axios.get('https://en.wikipedia.org/api/rest_v1/page/summary/' + urlTitle)
                .then(function (response) {
                    // handle success
                    self.setState({
                        markerInfo: response.data
                    })
                })
                .catch(function (error) {
                    // handle error
                    // This is also handled in the component. Notice the span that holds the text, no data found.
                    console.log('No data found in Wikipedia for the marker.');
                });
        }
    }

    setActiveMarker(markerTitle, i) {
        if(this.state.activeMarker !== markerTitle) {
            this.setState( (state) => ({
                locations: state.locations.filter( (location) => location.title === markerTitle ),
                activeMarker: markerTitle,
                query: '',
                markerInfo: ''
            }))

            this.state.markerList.forEach(marker => {
                if(markerTitle === marker.name) {
                    marker.setAnimation(window.google.maps.Animation.BOUNCE);
                }
            });

            this.fetchMarkerWiki(markerTitle);
        }
    }

    // Handle the marker clicks
    onMarkerClick(marker, i) {
        // When a marker is clicked, we want the whole experience to focus on that marker.
        this.setActiveMarker(marker, i);
    }

    renderMap = () => {
        loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyD3du9AbTXAlQQno8PVHAEIZsvQXdtKWXA&callback=initMap');
        window.initMap = this.initMap;
        window.scriptError = this.scriptError;
    }

    tilesLoaded(val) {
        this.setState({
            tilesLoaded: val
        })
    }

    initMap = () => {
        const map = new window.google.maps.Map(document.getElementById('mapContainer'), {
            center: { lat: 38.233114, lng: -85.501392 },
            zoom: 8
        });

        window.google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
            window.tilesLoaded(true);
        });

        this.setState({
            map: map
        })

        this.setDefaultState();

    }

    setMarkers = (existing) => {

        if(!existing) {
            let bounds = new window.google.maps.LatLngBounds();
            const markerList = [];

            this.state.locations.forEach((location, i) => {

                const item = new window.google.maps.Marker({
                    position: location.location,
                    map: this.state.map,
                    name: location.title,
                    animation: window.google.maps.Animation.DROP
                });
                bounds.extend(location.location);
                item.addListener('click', () => this.onMarkerClick(location.title, i));
                markerList.push(item);

            });

            // We have to run this function on map ready because the google-maps-react component has a bug that keeps it from working properly and this is the hack-around.
            this.state.map.fitBounds(bounds);
            this.setState({
                markerList: markerList
            })
        }


    }

    // This sets the default state of the map, great for initial load, marker reset and map reset.
    setDefaultState() {
        this.getDefaultLocations()
            .then( (locations) => {
                this.setState( {
                    locations: locations,
                    activeMarker: '',
                    query: '',
                });

                if(this.state.markerList.length === 0) {
                    this.setMarkers();
                }

            })
            .catch( err => console.log('There was an error: ' + err));
    }

    // Close the open marker
    closeMarker() {
        this.setDefaultState();
        this.state.markerList.forEach(marker => {
            marker.setAnimation(null);
        });
    }

    filterMarkers(query) {
        if(query !== '') {
            const match = new RegExp(escapeRegExp(query), 'i');
            this.setState( (state) => ({
                locations: state.locations.filter( (location) => match.test(location.title) ),
                query: query
            }))

        } else {
            this.setDefaultState();
        }
    }

    // Gracefully handle the map api if it fails
    scriptError() {
        this.setState({
            error: true
        });
    }

    // Do this stuff when the react app component loads
    componentDidMount() {
        this.renderMap();
    }

    render() {

        let { locations, activeMarker, markers, markerInfo, tilesLoaded } = this.state;

        if(window.google) {
            let bounds = new window.google.maps.LatLngBounds();
            for (let i = 0; i < locations.length; i++) {
                bounds.extend(locations[i].location);
            }
            this.state.map.fitBounds(bounds);
        }

        return (
            <div className="container-fluid" id="neighborhood-map">
                <div className="row">
                    <PlacesList
                        locations={this.state.locations}
                        activeMarker={activeMarker}
                        setDefaultState={this.setDefaultState}
                        markerInfo={markerInfo}
                        query={this.state.query}
                        filterMarkers={this.filterMarkers}
                        closeMarker={this.closeMarker}
                        setActiveMarker={this.setActiveMarker}
                    />
                    <div id="mapContainer" role="application" className="col-12 col-sm-8" data-keys={activeMarker}>
                        <Map
                            google={window.google}
                            initialCenter={{
                              lat: 38.233114,
                              lng: -85.501392
                            }}
                            markers={markers}
                        >
                        </Map>
                    </div>
                    {!tilesLoaded && (
                        <div className="col-12 col-sm-8 error">
                            <h2>Google Maps is loading...</h2>
                            <small>If you continue to see this message, there is an issue with the Google Api, please check the console for more details. This error will usually happen if you don't have connection to the internet or have Javascript disabled in your browser.</small>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

function loadScript(src){
    let firstScript = window.document.getElementsByTagName('script')[0];
    let script = window.document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    firstScript.parentNode.insertBefore(script, firstScript);

    script.onerror = function(event) {
        window.scriptError(event);
    }

}

export default App

