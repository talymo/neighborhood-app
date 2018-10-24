import React, { Component } from 'react';
import './App.css';
import {Map, GoogleApiWrapper} from 'google-maps-react';
import escapeRegExp from 'escape-string-regexp';

class App extends Component {

    constructor (props){
        super(props);
        this.state = {
            locations: [],
            query: '',
            activeMarker: '',
            map: [],
            markers: []
        }
        this.onReady = this.onReady.bind(this);
        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.closeMarker = this.closeMarker.bind(this);
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

    // Stuff to run when the map is ready
    onReady(mapProps, map) {

        const markerList = [];

        this.state.locations.forEach((location, i) => {

            const item = new window.google.maps.Marker({
                position: location.location,
                map: map,
                name: location.title,
                animation: window.google.maps.Animation.DROP
            });
            item.addListener('click', () => this.onMarkerClick(location.title, i));
            markerList.push(item);

        });

        // We have to run this function on map ready because the google-maps-react component has a bug that keeps it from working properly and this is the hack-around.
        map.fitBounds(mapProps.bounds);
        this.setState({
            map: map,
            markerList: markerList
        })


    }

    fetchMarkerWiki(markerTitle) {
        if(markerTitle) {
            fetch('http://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvsection=0&titles=pizza')
                .then((results) => {
                    console.log(results);
            })
        }
    }

    setActiveMarker(markerTitle, i) {
        if(this.state.activeMarker !== markerTitle) {
            this.setState( (state) => ({
                locations: state.locations.filter( (location) => location.title === markerTitle ),
                activeMarker: markerTitle,
                query: ''
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

    // This sets the default state of the map, great for initial load, marker reset and map reset.
    setDefaultState() {
        this.getDefaultLocations()
            .then( (locations) => {
                this.setState( {
                    locations: locations,
                    activeMarker: '',
                    query: ''
                });
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

    // Do this stuff when the react app component loads
    componentDidMount() {
        this.setDefaultState();
    }

    render() {

        let { locations, activeMarker, markers } = this.state;

        let bounds = new this.props.google.maps.LatLngBounds();
        for (let i = 0; i < locations.length; i++) {
            bounds.extend(locations[i].location);
        }

        return (
            <div className="container-fluid" id="neighborhood-map">
                <div className="row">
                    <div id="placesList" className="col-12 col-sm-4">
                        <h1>Neighborhood Bucket List</h1>
                        <input type="text" placeholder="Search my favorite places..." value={this.state.query} onChange={(event) => this.filterMarkers(event.target.value)}/>
                        <ul className="places">
                            {activeMarker && (
                                <span className="activeMarker" data-active-marker={activeMarker} onClick={this.closeMarker}> X </span>
                            )}
                            {locations.map( (location, i) => (
                                <li className="place" key={location.title} onClick={() => this.setActiveMarker(location.title, i)}>{location.title}</li>
                            ))}
                        </ul>
                    </div>
                    <div id="mapContainer" className="col-12 col-sm-8" data-keys={activeMarker}>
                        <Map
                            google={this.props.google}
                            initialCenter={{
                              lat: 38.233114,
                              lng: -85.501392
                            }}
                            onReady={this.onReady}
                            bounds={bounds}
                            markers={markers}
                        >
                        </Map>
                    </div>
                </div>
            </div>
        );
    }
}

export default GoogleApiWrapper({
    apiKey: 'AIzaSyD3du9AbTXAlQQno8PVHAEIZsvQXdtKWXA'
})(App);