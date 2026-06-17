<!-- resources/views/evacuationcenter/index.blade.php -->
<html>
<body>
    <h1>Evacuation Centers</h1>
    <a href="{{ route('evacuation-centers.create') }}">Create New</a>
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Location</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($centers as $center)
                <tr>
                    <td>{{ $center->name }}</td>
                    <td>{{ $center->description }}</td>
                    <td>
                        <a href="https://www.openstreetmap.org/?mlat={{ $center->latitude }}&mlon={{ $center->longitude }}#map=18/{{ $center->latitude }}/{{ $center->longitude }}" target="_blank">
                            View on map
                        </a>
                    </td>
                    <td>
                        <a href="{{ route('evacuation-centers.edit', $center->id) }}">Edit</a>
                        <form action="{{ route('evacuation-centers.destroy', $center->id) }}" method="POST" onsubmit="return confirm('Are you sure?')">
                            @csrf
                            @method('DELETE')
                            <button type="submit">Delete</button>
                        </form>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
