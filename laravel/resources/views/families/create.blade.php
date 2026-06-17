<!DOCTYPE html>
<html>
<head>
    <title>Create Family</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .form-container { max-width: 500px; margin: 0 auto; }
        input, textarea { width: 100%; padding: 8px; margin: 10px 0; }
        button { background-color: #007bff; color: white; padding: 10px 20px; border: none; cursor: pointer; }
        button:hover { background-color: #0056b3; }
    </style>
</head>
<body>
    <h1>Create New Family</h1>
    
    <form action="{{ route('families.store') }}" method="POST">
        @csrf
        <div>
            <label for="name">Family Name:</label>
            <input type="text" id="name" name="name" required>
        </div>
        
        <div>
            <label for="description">Description:</label>
            <textarea id="description" name="description"></textarea>
        </div>
        
        <button type="submit">Create Family</button>
    </form>
</body>
</html>
