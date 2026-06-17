<!DOCTYPE html>
<html>
<head>
    <title>Show Family</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 600px; margin: 0 auto; }
    </style>
</head>
<body>
    <h1>{{ $family->name }}</h1>
    <p>ID: {{ $family->id }}</p>
    
    @if($family->description)
        <h2>Description</h2>
        <p>{{ $family->description }}</p>
    @endif

    <a href="{{ route('families.edit', $family->id) }}" class="btn">Edit</a>
    <form action="{{ route('families.destroy', $family->id) }}" method="POST" style="display:inline;">
        @csrf
        @method('DELETE')
        <button type="submit" class="btn-delete">Delete</button>
    </form>
</body>
</html>
