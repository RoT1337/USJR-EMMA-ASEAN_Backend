<!DOCTYPE html>
<html>
<head>
    <title>Families List</title>
    <style>
        body { font-family: Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Families List</h1>

    <a href="{{ route('families.create') }}" class="btn">Add New Family</a>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach($families as $family)
                <tr>
                    <td>{{ $family->id }}</td>
                    <td>{{ $family->name }}</td>
                    <td>{{ $family->description }}</td>
                    <td>
                        <a href="{{ route('families.show', $family->id) }}" class="btn">Show</a>
                        <a href="{{ route('families.qr', $family->id) }}" target="_blank">
                            <img src="{{ route('families.qr', $family->id) }}" style="width: 20px; height: 20px;" alt="QR Code">
                        </a>
                        <form action="{{ route('families.destroy', $family->id) }}" method="POST" style="display:inline;">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="btn-delete">Delete</button>
                        </form>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
