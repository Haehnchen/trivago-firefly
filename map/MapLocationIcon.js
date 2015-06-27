//"gmap" is an instance of the google map

//creating the class to exntend the google map OverlayView class
function MapLocationIcon(item){
    this.pos = new google.maps.LatLng(item['lat'], item['lng']);
    this.item = item;
}

//make a copy of the OverlayView to extend it
MapLocationIcon.prototype = new google.maps.OverlayView();
MapLocationIcon.prototype.onRemove= function(){}

//prepare the overlay with DOM
MapLocationIcon.prototype.onAdd= function(){
    var div = document.createElement('DIV');

    var img = 'http://placehold.it/50x50';

    if('thumbnail' in this.item) {
        img = this.item['thumbnail'];
    }

    $(div).html('<div class="map-img-box-thumbnail"><img src="' + img + '"></div>');

    if('link' in this.item) {
        var me = this;
        google.maps.event.addDomListener(div, 'click', function() {
            alert(me.item['link'])
        });
    }

    var panes = this.getPanes();
    panes.overlayImage.appendChild(div);
}

//set position
MapLocationIcon.prototype.draw = function(){
    var overlayProjection = this.getProjection();
    var position = overlayProjection.fromLatLngToDivPixel(this.pos);
    var panes = this.getPanes();
    panes.overlayImage.style.left = position.x + 'px';
    panes.overlayImage.style.top = position.y - 30 + 'px';
}
