(function() {
    const lat = document.querySelector('#lat').value || 10.087061;
    const lng = document.querySelector('#lng').value || -69.269341;
    const mapa = L.map('mapa').setView([lat, lng ], 18);
    let marker

    // utilizando provider y geocode

    const geocodeService = L.esri.Geocoding.geocodeService()
    

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // el pin
    marker = new L.marker([lat, lng], {
        draggable: true, //para poder mover el pin
        autoPan: true  // hace que el mapa se mueva al mover el pin
    })

    .addTo(mapa)

    // detectar el movimiento del pin
    marker.on('moveend', function(e){
        marker= e.target
        console.log(marker)
        const posicion = marker.getLatLng()

        console.log(posicion)

        // centar el mapa a penas se suelta el pin
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng))

        // obtener nombre de la calle al soltar el pin
        geocodeService.reverse().latlng(posicion, 18).run(function(error, resultado) {
            console.log(resultado?.address?.Address)
             // llenar los campos

            document.querySelector('.calle').textContent= resultado?.address?.Address
            // document.querySelector('.calle').textContent = resultado?.address?.Address ?? ''
             document.querySelector('#calle').value = resultado?.address?.Address ?? ''
             document.querySelector('#lat').value = resultado?.latlng?.lat ?? ''
             document.querySelector('#lng').value = resultado?.latlng?.lng ?? ''





        })

     



    })


})()

