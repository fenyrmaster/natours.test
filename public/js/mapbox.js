export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZmVueXJtYXN0ZXIiLCJhIjoiY2ttZTB4ZzNvMm9vbDJyb2NsZ3ltOTBjaCJ9.iOtP5s-UTL4gTnRc49KUNw';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/fenyrmaster/ckme19392c17717lfnlf3aaeu',
        scrollZoom: false
    });
    
    const bound = new mapboxgl.LngLatBounds();
    
    locations.forEach(loc => {
        const el = document.createElement("div");
        el.className = "marker";
    
        new mapboxgl.Marker({
            element: el,
            anchor: "bottom"
        }).setLngLat(loc.coordinates).addTo(map);
    
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map);
    
        bound.extend(loc.coordinates);
    });
    
    map.fitBounds(bound,{
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}

