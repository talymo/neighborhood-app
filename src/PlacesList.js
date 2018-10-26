import React, { Component } from 'react';

class PlacesList extends Component {
    render() {
        let { locations, activeMarker, setDefaultState, markerInfo, query, filterMarkers, closeMarker, setActiveMarker } = this.props;
        return(
            <div id="placesList" className="col-12 col-sm-4">
                <h1>Neighborhood Bucket List</h1>
                <input tabIndex="0" type="text" placeholder="Search my favorite places..." value={query} onChange={(event) => filterMarkers(event.target.value)} onClick={setDefaultState}/>
                <ul className="places">
                    {activeMarker && (
                        <span className="activeMarker" data-active-marker={activeMarker} onClick={closeMarker}> X </span>
                    )}
                    {locations.map( (location, i) => (
                        <li className="place" key={location.title} onClick={() => setActiveMarker(location.title, i)}>{location.title}</li>
                    ))}
                    {activeMarker && (
                        <span className="markerInfo">
                            {markerInfo.extract_html && (
                                <span className="extract" dangerouslySetInnerHTML={{__html: markerInfo.extract_html}}></span>
                            )}
                            {!markerInfo.extract_html && (
                                <span className="extract"><p>This location doesn't have any data on Wikipedia. :(</p></span>
                            )}
                            {markerInfo.titles && (
                                <a target="_blank" rel="noopener noreferrer" href={"https://en.wikipedia.org/wiki/" + markerInfo.titles.canonical}>Read More from Wikipedia</a>
                            )}

                        </span>
                    )}
                </ul>
            </div>
        )
    }
}

export default PlacesList