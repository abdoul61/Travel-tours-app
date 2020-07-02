/* eslint-disable */

export const displayMap = (locations)=>{
    mapboxgl.accessToken = 'pk.eyJ1IjoiYXppejYxIiwiYSI6ImNrYmJudnI4azAzNGwzMXJ1eXBjMHN3M2oifQ.qfPbE9WkUkfONGstYbgt8A';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/aziz61/ckbboq8lq0gcr1inx9131ioqz',
        scrollZoom:false
        // center: [-118.113491, 34.111745],
        // zoom: 10,
        // interactive: false
    });
    const bounds = new mapboxgl.LngLatBounds();
    
    locations.forEach(loc => {
        // HERE I CREATE THE MARKER
        const el = document.createElement('div');
        el.className = 'marker';
        // ADD the marker 
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);
        // ADD the Popup
    
        new mapboxgl.Popup({
            offset:30
        }).setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map);
    
        // extend the map bounds to include current location
        bounds.extend(loc.coordinates);
    });
    
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
               }
    }); 
    
}



