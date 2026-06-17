<!-- resources/views/evacuationcenter/create.blade.php -->
<html>
<head>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <h1>Create Evacuation Center</h1>
    <form action="{{ route('evacuation-centers.store') }}" method="POST">
        @csrf

        <label for="name">Name:</label><br>
        <input type="text" name="name" id="name" required><br>

        <label for="description">Description:</label><br>
        <textarea name="description" id="description"></textarea><br>

        <label for="address">Address:</label><br>
        <input type="text" id="address" name="address" placeholder="Enter address to geocode or click on the map below"><br>
        <button type="button" onclick="geocodeAddress()">Geocode Address</button><br>

        <label for="latitude">Latitude:</label><br>
        <input type="text" name="latitude" id="latitude" required><br>

        <label for="longitude">Longitude:</label><br>
        <input type="text" name="longitude" id="longitude" required><br>

        <div id="map" style="height: 400px; width: 100%; margin-top: 10px;"></div>

        <button type="submit">Save</button>
    </form>

    <script>
        var map = L.map('map').setView([14.55027, 121.03269], 13);
        var marker;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.on('click', function(e) {
            if (marker) {
                marker.remove();
            }
            marker = L.marker(e.latlng).addTo(map);
            $('#latitude').val(e.latlng.lat);
            $('#longitude').val(e.latlng.lng);

            // Reverse geocode to get address
            $.ajax({
                url: '{{ route("reverseGeocode") }}',
                method: 'GET',
                data: { lat: e.latlng.lat, lng: e.latlng.lng },
                success: function(data) {
                    if (data.display_name) {
                        $('#address').val(data.display_name);
                    } else {
                        $('#address').val("Address not available");
                    }
                },
                error: function() {
                    alert('Reverse geocoding failed.');
                }
            });
        });

        function geocodeAddress() {
            var address = $('#address').val();
            if (!address) {
                alert('Please enter an address.');
                return;
            }

            $.ajax({
                url: '{{ route("geocode") }}',
                method: 'GET',
                data: { address: address },
                success: function(data) {
                    if (data.error) {
                        alert(data.error + ': ' + data.message);
                    } else if (data.length > 0) {
                        var lat = parseFloat(data[0].lat);
                        var lon = parseFloat(data[0].lon);

                        if (marker) {
                            marker.remove();
                        }
                        marker = L.marker([lat, lon]).addTo(map);
                        map.setView([lat, lon], 13);

                        $('#latitude').val(lat);
                        $('#longitude').val(lon);
                    } else {
                        alert('No results found for this address.');
                    }
                },
                error: function() {
                    alert('Geocoding failed.');
                }
            });
        }
    </script>
</body>
</html>
